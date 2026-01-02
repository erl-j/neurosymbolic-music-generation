const http = require('http');
const fs = require('fs');
const path = require('path');

const FILE_TO_WATCH = 'music.js';
const PORT = 8080;
const SAMPLES_DIR = '/Users/nicolasjonason/Music Assets';

// Cache of all audio files in samples dir
let sampleCache = [];
const AUDIO_EXTENSIONS = ['.wav', '.mp3', '.aiff', '.flac', '.ogg', '.m4a'];

function scanSamplesDir() {
    sampleCache = [];
    function scanDir(dir) {
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    scanDir(fullPath);
                } else if (AUDIO_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
                    sampleCache.push({
                        name: entry.name,
                        path: fullPath,
                        relativePath: path.relative(SAMPLES_DIR, fullPath)
                    });
                }
            }
        } catch (e) { }
    }
    scanDir(SAMPLES_DIR);
    console.log(`Indexed ${sampleCache.length} samples from ${SAMPLES_DIR}`);
}

function searchSamples(query) {
    const q = query.toLowerCase();
    return sampleCache.filter(s => s.name.toLowerCase().includes(q));
}

// Ensure file exists
if (!fs.existsSync(FILE_TO_WATCH)) {
    fs.writeFileSync(FILE_TO_WATCH, `
// Default Music File
return (t, s) => {
const notes = [];
if (t % 4 === 0) notes.push({ p: 36, w: 'drums', v: 0.9 });
return notes;
};
`.trim());
    console.log(`Created ${FILE_TO_WATCH}`);
}

const server = http.createServer((req, res) => {
    // Enable CORS for localhost access
    res.setHeader('Access-Control-Allow-Origin', '*');

    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (url.pathname === '/events') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        const sendUpdate = () => {
            fs.readFile(FILE_TO_WATCH, 'utf8', (err, data) => {
                if (!err) {
                    res.write(`data: ${JSON.stringify({ code: data })}\n\n`);
                }
            });
        };

        sendUpdate();

        const watcher = fs.watch(FILE_TO_WATCH, (eventType) => {
            if (eventType === 'change') sendUpdate();
        });

        req.on('close', () => watcher.close());
    } else if (url.pathname === '/search') {
        const query = url.searchParams.get('q') || '';
        const results = searchSamples(query);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results.map((s, i) => ({ index: i, name: s.name, path: s.relativePath }))));
    } else if (url.pathname === '/sample') {
        const samplePath = url.searchParams.get('path');
        if (!samplePath) {
            res.writeHead(400);
            res.end('Missing path');
            return;
        }
        const fullPath = path.join(SAMPLES_DIR, samplePath);
        if (!fullPath.startsWith(SAMPLES_DIR)) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }
        fs.readFile(fullPath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            const ext = path.extname(fullPath).toLowerCase();
            const mimeTypes = {
                '.wav': 'audio/wav',
                '.mp3': 'audio/mpeg',
                '.aiff': 'audio/aiff',
                '.flac': 'audio/flac',
                '.ogg': 'audio/ogg',
                '.m4a': 'audio/mp4'
            };
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

scanSamplesDir();

server.listen(PORT, () => {
    console.log(`Live Link Server running at http://localhost:${PORT}`);
    console.log(`Edit ${FILE_TO_WATCH} to see changes in the browser.`);
    console.log(`Samples dir: ${SAMPLES_DIR}`);
});