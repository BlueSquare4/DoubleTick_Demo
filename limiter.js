const db = require('./db');
const WINDOW = 60 * 1000; // 1 Minute window
const LIMIT = 5;          // Max 5 requests

module.exports = async (req, res, next) => {
    const ip = req.ip || '127.0.0.1';
    const now = Date.now();

    // Check existing record
    const { rows } = await db.query('SELECT * FROM ratelimit WHERE ip = $1', [ip]);
    const record = rows[0];

    // If no record OR window expired: Reset/Create Count
    if (!record || (now - record.window_start > WINDOW)) {
        await db.query(`INSERT INTO ratelimit (ip, count, window_start) VALUES ($1, 1, $2) 
                        ON CONFLICT (ip) DO UPDATE SET count = 1, window_start = $2`, [ip, now]);
        return next();
    }

    // If limit exceeded: Block
    if (record.count >= LIMIT) return res.status(429).json({ error: "Too many requests" });

    // Otherwise: Increment
    await db.query('UPDATE ratelimit SET count = count + 1 WHERE ip = $1', [ip]);
    next();
};