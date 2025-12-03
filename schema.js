const db = require('./db');

const initSchema = async () => {
    try {
        // Storing IP, the count of hits, and when the 'window' started
        const query = `
            CREATE TABLE IF NOT EXISTS ratelimit (
                ip VARCHAR(50) PRIMARY KEY,
                count INT DEFAULT 1,
                window_start BIGINT
            );
        `;
        await db.query(query);
        console.log("Database Schema Synced");
    } catch (error) {
        console.error('Failed to initialize database schema:', error);
        throw error;
    }
};

module.exports = initSchema;