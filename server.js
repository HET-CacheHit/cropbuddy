require('dotenv').config();
const express = require('express');
const path = require('path');
const chatHandler = require('./api/chat.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing for API requests
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Mount the serverless chat function locally for development
app.post('/api/chat', chatHandler);

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