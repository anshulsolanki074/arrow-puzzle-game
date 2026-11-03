/**
 * Arrow Escape Puzzle Game - Backend Server & API
 * Provides static asset serving, health/connectivity pinging,
 * level data serving, and remote player progress synchronization.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');
const LEVELS_FILE = path.join(DATA_DIR, 'levels.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure progress file exists
if (!fs.existsSync(PROGRESS_FILE)) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({}, null, 2), 'utf-8');
}

// MIME types lookup
const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

function readProgressData() {
    try {
        if (!fs.existsSync(PROGRESS_FILE)) return {};
        const content = fs.readFileSync(PROGRESS_FILE, 'utf-8');
        return JSON.parse(content || '{}');
    } catch (err) {
        console.error('Error reading progress data:', err);
        return {};
    }
}

function writeProgressData(data) {
    try {
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (err) {
        console.error('Error writing progress data:', err);
        return false;
    }
}

const server = http.createServer((req, res) => {
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // --- API ROUTES ---

    // 1. Health / Connectivity check endpoint
    if (pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'online',
            service: 'Arrow Escape Game API',
            timestamp: Date.now(),
            serverTime: new Date().toISOString()
        }));
        return;
    }

    // 2. Fetch all levels
    if (pathname === '/api/levels') {
        try {
            if (fs.existsSync(LEVELS_FILE)) {
                const data = fs.readFileSync(LEVELS_FILE, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Levels file not found' }));
            }
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to read levels' }));
        }
        return;
    }

    // 3. User progress: GET /api/progress/:userId
    if (req.method === 'GET' && pathname.startsWith('/api/progress/')) {
        const userId = decodeURIComponent(pathname.replace('/api/progress/', ''));
        if (!userId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User ID is required' }));
            return;
        }

        const progressStore = readProgressData();
        const userProgress = progressStore[userId] || {
            unlockedLevel: 1,
            completedLevels: [],
            stars: {},
            bestScores: {},
            bestTimes: {},
            lastPlayedLevel: 1,
            totalHints: 3,
            updatedAt: Date.now()
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            userId,
            progress: userProgress
        }));
        return;
    }

    // 4. User progress: POST /api/progress/:userId
    if (req.method === 'POST' && pathname.startsWith('/api/progress/')) {
        const userId = decodeURIComponent(pathname.replace('/api/progress/', ''));
        if (!userId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User ID is required' }));
            return;
        }

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            // Basic payload size guard (max 1MB)
            if (body.length > 1e6) {
                req.destroy();
            }
        });

        req.on('end', () => {
            try {
                const incomingData = JSON.parse(body || '{}');
                const progressStore = readProgressData();

                // Merge and sanitize progress data
                progressStore[userId] = {
                    ...(progressStore[userId] || {}),
                    ...incomingData,
                    updatedAt: Date.now()
                };

                const saved = writeProgressData(progressStore);
                if (saved) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        userId,
                        message: 'Progress saved successfully',
                        updatedAt: progressStore[userId].updatedAt
                    }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Could not save progress to storage' }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
        });
        return;
    }

    // 5. Reset progress: POST /api/reset-progress/:userId
    if (req.method === 'POST' && pathname.startsWith('/api/reset-progress/')) {
        const userId = decodeURIComponent(pathname.replace('/api/reset-progress/', ''));
        const progressStore = readProgressData();
        delete progressStore[userId];
        writeProgressData(progressStore);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Progress reset on server' }));
        return;
    }

    // --- STATIC FILE SERVING ---
    if (req.method === 'GET') {
        let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
        if (safePath === '/' || safePath === '\\') {
            safePath = '/index.html';
        }

        const filePath = path.join(__dirname, safePath);

        // Security check: ensure path is within __dirname
        if (!filePath.startsWith(__dirname)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Access Denied');
            return;
        }

        fs.stat(filePath, (err, stats) => {
            if (err || !stats.isFile()) {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
                res.end('<h1>404 - File Not Found</h1><p>Arrow Escape Server</p>');
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';

            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
            });

            const stream = fs.createReadStream(filePath);
            stream.pipe(res);
        });
        return;
    }

    // Default 405 Method Not Allowed
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
});

server.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  Arrow Escape Puzzle Game Server Running!     `);
    console.log(`  URL: http://localhost:${PORT}               `);
    console.log(`  Health Check: http://localhost:${PORT}/api/health `);
    console.log(`  Levels API:   http://localhost:${PORT}/api/levels `);
    console.log(`===============================================`);
});
