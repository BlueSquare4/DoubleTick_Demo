const express = require('express');
const initSchema = require('./schema');
const rateLimiter = require('./limiter');

const app = express();

// Apply rate limiter middleware specifically to this route
app.get('/api/resource', rateLimiter, (req, res) => {
    res.json({ 
        status: "success", 
        message: "You have accessed the protected resource!" 
    });
});

app.listen(3000, async () => {
    await initSchema(); // Ensure DB is ready before accepting traffic
    console.log("🚀 Server running on port 3000");
});