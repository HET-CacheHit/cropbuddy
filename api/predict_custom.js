const tf = require('@tensorflow/tfjs');
const jpeg = require('jpeg-js');
const path = require('path');

let model = null;

// Load LayersModel from local file path
async function loadModel() {
    if (!model) {
        const modelPath = path.join(process.cwd(), 'model_custom', 'model.json');
        console.log("Loading custom model from path:", modelPath);
        model = await tf.loadLayersModel(`file://${modelPath}`);
        console.log("Custom model loaded successfully in Node.js!");
    }
    return model;
}

module.exports = async (req, res) => {
    // CORS Headers Setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: "Missing base64 image payload." });
        }

        // Clean up base64 metadata header
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // Decode JPEG image buffer to raw pixels
        let decoded;
        try {
            decoded = jpeg.decode(buffer, { useTrainedPostresssors: true });
        } catch (decErr) {
            return res.status(400).json({ error: "Failed to decode image buffer. Make sure format is JPEG: " + decErr.message });
        }

        const { width, height, data } = decoded;

        // Convert Uint8Array (RGBA) to Float32Array (RGB)
        const rgbValues = new Float32Array(width * height * 3);
        for (let i = 0; i < width * height; i++) {
            rgbValues[i * 3] = data[i * 4];       // R
            rgbValues[i * 3 + 1] = data[i * 4 + 1];   // G
            rgbValues[i * 3 + 2] = data[i * 4 + 2];   // B
        }

        // Initialize TensorFlow and load custom model
        await tf.ready();
        const loadedModel = await loadModel();

        // Run inference inside tf.tidy to automatically manage memory
        const predictions = tf.tidy(() => {
            let tensor = tf.tensor3d(rgbValues, [height, width, 3]);
            // Resize to 128x128 matching custom model input shape
            tensor = tf.image.resizeBilinear(tensor, [128, 128]);
            // Normalize to [-1.0, 1.0] matching (pixel - 127.5) / 127.5
            tensor = tensor.sub(127.5).div(127.5);
            const inputTensor = tensor.expandDims(0);
            
            return loadedModel.predict(inputTensor);
        });

        const predictionData = await predictions.data();
        predictions.dispose();

        return res.json({ predictions: Array.from(predictionData) });

    } catch (err) {
        console.error("Predict endpoint handler crashed:", err);
        return res.status(500).json({ error: "Endpoint error: " + err.message });
    }
};
