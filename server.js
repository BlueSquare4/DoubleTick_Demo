const express = require('express');
const initSchema = require('./schema');
const rateLimiter = require('./limiter');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy to get correct client IP behind load balancers
app.set('trust proxy', true);

// Apply rate limiter middleware specifically to this route
app.get('/api/resource', rateLimiter, (req, res) => {
    res.json({ 
        status: "success", 
        message: "You have accessed the protected resource!" 
    });
});

// Initialize database schema before starting server
const startServer = async () => {
    try {
        await initSchema(); // Ensure DB is ready before accepting traffic
        
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        // Graceful shutdown handler
        const shutdown = async (signal) => {
            console.log(`\n${signal} received, shutting down gracefully...`);
            
            server.close(async () => {
                console.log('HTTP server closed');
                await db.shutdown();
                console.log('Database connections closed');
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();