const express = require('express');
const path = require('path');
const app = express();

// Set the port from environment variable or default to 3000
const port = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static('.'));

// Handle all routes by serving index.html (for SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`🏈 College Football Simulator running on port ${port}`);
    console.log(`🌐 Access your game at: http://localhost:${port}`);
});

module.exports = app;