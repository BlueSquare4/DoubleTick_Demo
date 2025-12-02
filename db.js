const { Pool } = require('pg');

// Best Practice: Use a Pool, not a single Client, for scalability
const pool = new Pool({
    connectionString: 'postgresql://user:password@localhost:5432/interview_db'
});

// Exposing a wrapper allows us to log queries globally if needed later
module.exports = {
    query: (text, params) => pool.query(text, params)
};