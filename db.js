require('dotenv').config();
const { Pool } = require('pg');

// Best Practice: Use a Pool, not a single Client, for scalability
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Handle pool errors to prevent unhandled rejections
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

// Graceful shutdown handler
const shutdown = async () => {
    console.log('Closing database connection pool...');
    await pool.end();
};

// Exposing a wrapper allows us to log queries globally if needed later
module.exports = {
    query: (text, params) => pool.query(text, params),
    shutdown
};