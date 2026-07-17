const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

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
        
        // Strip out metadata header from base64 string if present
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Create a unique temporary filename in the writable /tmp directory
        const tempFilename = `temp_predict_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
        const tempPath = path.join(os.tmpdir(), tempFilename);
        
        // Write the temporary file
        fs.writeFileSync(tempPath, buffer);
        
        // Execute python script
        const pythonPath = 'python'; 
        const scriptPath = path.join(process.cwd(), 'predict_custom.py');
        
        execFile(pythonPath, [scriptPath, tempPath], (error, stdout, stderr) => {
            // Clean up temporary image file
            try {
                if (fs.existsSync(tempPath)) {
                    fs.unlinkSync(tempPath);
                }
            } catch (unlinkErr) {
                console.error("Failed to delete temporary prediction file:", unlinkErr);
            }
            
            if (error) {
                console.error("Python custom prediction execution failed:", error, stderr);
                return res.status(500).json({ error: "Prediction execution failed: " + stderr });
            }
            
            try {
                // Find the JSON block in stdout (ignoring TF/oneDNN warnings)
                const jsonStart = stdout.indexOf('{"status"');
                if (jsonStart === -1) {
                    throw new Error("Invalid output format from prediction script: " + stdout);
                }
                const resultJson = JSON.parse(stdout.substring(jsonStart).trim());
                if (resultJson.status === 'success') {
                    return res.json({ predictions: resultJson.predictions });
                } else {
                    return res.status(500).json({ error: resultJson.error });
                }
            } catch (parseErr) {
                console.error("Failed to parse prediction result stdout:", stdout, parseErr);
                return res.status(500).json({ error: "Parser failure: " + parseErr.message });
            }
        });
    } catch (err) {
        console.error("Predict endpoint handler crashed:", err);
        return res.status(500).json({ error: "Endpoint error: " + err.message });
    }
};
