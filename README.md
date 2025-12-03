## DoubleTick Backend Interview Demonstration Repository

A minimal rate limiter implementation using Node.js and PostgreSQL with industry best practices including atomic operations, graceful shutdown, and proper error handling.

## Features

- **DB-backed rate limiting**: Persistent rate limits using PostgreSQL
- **Atomic operations**: Race-condition-free rate limit enforcement
- **Graceful shutdown**: Proper cleanup of database connections and server
- **Error handling**: Comprehensive try-catch blocks with fail-open strategy
- **Environment-based configuration**: No hardcoded credentials
- **Proxy support**: Correctly handles client IPs behind load balancers
- **Docker support**: Easy setup with Docker Compose

## Prerequisites

- Node.js 16+ 
- PostgreSQL 13+ (or use Docker Compose)
- npm or yarn

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DoubleTick_Demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials if needed.

4. **Start PostgreSQL** (using Docker)
   ```bash
   docker-compose up -d
   ```

5. **Run the server**
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Testing the Rate Limiter

Once the server is running, test the rate limiter:

```bash
# First 5 requests succeed
curl http://localhost:3000/api/resource

# 6th request within 1 minute gets rate limited
curl http://localhost:3000/api/resource
# Response: {"error":"Too many requests"}
```

## Configuration

Environment variables in `.env`:

- `DATABASE_URL`: PostgreSQL connection string (default: `postgresql://user:password@localhost:5432/interview_db`)
- `PORT`: Server port (default: `3000`)
- `RATE_LIMIT_WINDOW_MS`: Time window in milliseconds (default: `60000` = 1 minute)
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window (default: `5`)

## Architecture

- **`server.js`**: Express server with graceful startup/shutdown
- **`db.js`**: PostgreSQL connection pool with error handling
- **`schema.js`**: Database schema initialization
- **`limiter.js`**: Atomic rate limiting middleware using single SQL upsert
- **`docker-compose.yml`**: PostgreSQL container with persistent volume

## Key Implementation Details

### Atomic Rate Limiting
The rate limiter uses a single SQL statement with `INSERT ... ON CONFLICT` to atomically:
- Create new rate limit records
- Reset expired windows
- Increment counters
- Return the current count

This prevents race conditions that occur with SELECT-then-UPDATE patterns.

### Graceful Shutdown
Handles `SIGTERM` and `SIGINT` signals to:
1. Stop accepting new connections
2. Complete in-flight requests
3. Close database pool
4. Exit cleanly

### Error Handling Strategy
- Database errors are caught and logged
- Rate limiter fails open (allows requests) on DB errors to prevent cascading failures
- Schema initialization failures prevent server startup

## Interview Discussion Points

1. **Why PostgreSQL for rate limiting?**
   - Persistent across restarts
   - ACID guarantees
   - Trade-off: Higher latency than Redis, but acceptable for demo/moderate load

2. **Race conditions and atomicity**
   - Single atomic SQL operation vs multiple queries
   - `ON CONFLICT` with CASE expressions for conditional logic

3. **Scalability considerations**
   - Connection pooling for concurrent requests
   - Could migrate to Redis for higher throughput
   - Could add indexes if querying by additional fields

4. **Production readiness**
   - Environment-based configuration
   - Proper error handling and logging
   - Graceful shutdown for zero-downtime deployments
   - Proxy support for correct IP detection