require('dotenv').config();

module.exports = async function (req, res) {
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
        const { audio } = req.body;
        if (!audio) {
            return res.status(400).json({ error: "Missing audio data in request body." });
        }

        const hfToken = process.env.HF_API_TOKEN;
        if (!hfToken) {
            return res.status(500).json({ error: "HF_API_TOKEN is not configured on the server." });
        }

        // Decode base64 audio data to a binary buffer
        const audioBuffer = Buffer.from(audio, 'base64');

        console.log("Sending audio to Hugging Face Inference API (openai/whisper-tiny)...");

        // Call Hugging Face Serverless Inference API for Speech Recognition
        const response = await fetch(
            "https://api-inference.huggingface.co/models/openai/whisper-tiny",
            {
                headers: {
                    "Authorization": `Bearer ${hfToken}`,
                    "Content-Type": "audio/webm"
                },
                method: "POST",
                body: audioBuffer
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Hugging Face API returned error: ${response.status} - ${errText}`);
        }

        const result = await response.json();
        console.log("ASR Transcription result:", result.text);
        return res.status(200).json({ text: result.text || "" });

    } catch (err) {
        console.error("ASR Error:", err);
        return res.status(500).json({ error: err.message });
    }
};
