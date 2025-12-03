const db = require('./db');
const WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000; // 1 Minute window
const LIMIT = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5;       // Max 5 requests

module.exports = async (req, res, next) => {
    try {
        const ip = req.ip || '127.0.0.1';
        const now = Date.now();

        // Atomic upsert: Insert new record or update existing based on window expiry
        // Uses CASE to reset count if window expired, otherwise increment
        const result = await db.query(`
            INSERT INTO ratelimit (ip, count, window_start)
            VALUES ($1, 1, $2)
            ON CONFLICT (ip) DO UPDATE
            SET
                count = CASE
                    WHEN ($2 - ratelimit.window_start) > $3 THEN 1
                    ELSE ratelimit.count + 1
                END,
                window_start = CASE
                    WHEN ($2 - ratelimit.window_start) > $3 THEN $2
                    ELSE ratelimit.window_start
                END
            RETURNING count, window_start
        `, [ip, now, WINDOW]);

        const { count } = result.rows[0];

        // If limit exceeded: Block
        if (count > LIMIT) {
            return res.status(429).json({ error: "Too many requests" });
        }

        next();
    } catch (error) {
        console.error('Rate limiter error:', error);
        // Fail open: allow request on error to prevent blocking all traffic
        next();
    }
};