// Web Worker for offloading TensorFlow.js model execution from the main UI thread

importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js");

let model = null;

onmessage = async function(e) {
    const { action, payload } = e.data;
    
    if (action === "load") {
        try {
            const { modelUrl } = payload;
            
            // Dispose existing model to free GPU memory
            if (model) {
                model.dispose();
                model = null;
            }
            
            // Wait for TFJS backend initialization
            await tf.ready();
            console.log("Worker TFJS backend ready:", tf.getBackend());
            
            // Load LayersModel from local path
            model = await tf.loadLayersModel(modelUrl);
            
            postMessage({ status: "success", type: "load" });
        } catch (err) {
            console.error("Worker failed to load model:", err);
            postMessage({ status: "error", type: "load", error: err.message });
        }
    }
    
    else if (action === "predict") {
        try {
            if (!model) {
                throw new Error("Model is not loaded in worker yet.");
            }
            
            const { rgbValues, shape } = payload;
            
            // Run inference inside tf.tidy to automatically clean up intermediate tensors
            const prediction = tf.tidy(() => {
                const inputTensor = tf.tensor(rgbValues, [1, shape[0], shape[1], 3]);
                return model.predict(inputTensor);
            });
            
            const predictionData = await prediction.data();
            prediction.dispose();
            
            // Return predictions to the main thread
            postMessage({ 
                status: "success", 
                type: "predict", 
                prediction: Array.from(predictionData) 
            });
        } catch (err) {
            console.error("Worker prediction error:", err);
            postMessage({ status: "error", type: "predict", error: err.message });
        }
    }
};
