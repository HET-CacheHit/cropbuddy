require('dotenv').config();
const express = require('express');
const path = require('path');
const chatHandler = require('./api/chat.js');
const asrHandler = require('./api/asr.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing for API requests (increased limit to support base64 audio uploads)
app.use(express.json({ limit: '10mb' }));

// Serve static files from the root directory
app.use(express.static(__dirname));

// Mount the serverless chat function locally for development
app.post('/api/chat', chatHandler);
app.post('/api/asr', asrHandler);

// Route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`  🚀 Crop Buddy Static Server running locally!`);
    console.log(`  💻 Access the web app at: http://localhost:${PORT}`);
    console.log(`==================================================`);
});