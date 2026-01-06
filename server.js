const http = require('http');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = 'config.json';
const FILE_TO_WATCH = 'music.js';

let config = { samplesDir: '', port: 8080 };
try {
    config = { ...config, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) };
} catch (e) { }

const PORT = config.port;
const SAMPLES_DIR = config.samplesDir;

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
}

function searchSamples(query) {
    const q = query.toLowerCase();
    return sampleCache.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.relativePath.toLowerCase().includes(q)
    );
}

// Parse slider annotations from code
function parseSliders(code) {
    const sliderRegex = /\/\/\s*@slider\s+(\w+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/g;
    const sliders = [];
    let match;
    while ((match = sliderRegex.exec(code)) !== null) {
        sliders.push({
            name: match[1],
            value: parseFloat(match[2]),
            min: parseFloat(match[3]),
            max: parseFloat(match[4])
        });
    }
    return sliders;
}

// Update slider value in code
function updateSliderValue(code, sliderName, newValue) {
    // Update the annotation comment
    const sliderRegex = new RegExp(`(\/\/\\s*@slider\\s+${sliderName}\\s+)[\\d.]+`, 'g');
    let updatedCode = code.replace(sliderRegex, `$1${newValue}`);

    // Update the variable assignment (if it exists)
    const varRegex = new RegExp(`(\\s+${sliderName}\\s*=\\s*)[\\d.]+`, 'g');
    updatedCode = updatedCode.replace(varRegex, `$1${newValue}`);

    return updatedCode;
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
}

const server = http.createServer((req, res) => {
    // Enable CORS for localhost access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (url.pathname === '/log-error' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { message, stack, url: errorUrl, line, col } = JSON.parse(body);
                console.error('CLIENT ERROR:');
                console.error(`  Message: ${message}`);
                if (errorUrl) console.error(`  URL: ${errorUrl}`);
                if (line) console.error(`  Line: ${line}, Column: ${col}`);
                if (stack) console.error(`  Stack:\n${stack}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
    } else if (url.pathname === '/update-slider' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { name, value } = JSON.parse(body);
                const code = fs.readFileSync(FILE_TO_WATCH, 'utf8');
                const updatedCode = updateSliderValue(code, name, value);
                fs.writeFileSync(FILE_TO_WATCH, updatedCode, 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
    } else if (url.pathname === '/events') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        const sendUpdate = () => {
            fs.readFile(FILE_TO_WATCH, 'utf8', (err, data) => {
                if (!err) {
                    const sliders = parseSliders(data);
                    res.write(`data: ${JSON.stringify({ code: data, sliders })}\n\n`);
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
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60'  // Cache search results for 1 min
        });
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

        // Check file exists before streaming
        fs.stat(fullPath, (err, stats) => {
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
            // Stream file instead of loading into memory
            res.writeHead(200, {
                'Content-Type': mimeTypes[ext] || 'application/octet-stream',
                'Content-Length': stats.size,
                'Cache-Control': 'public, max-age=3600'  // Cache for 1 hour
            });
            fs.createReadStream(fullPath).pipe(res);
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

scanSamplesDir();

server.listen(PORT);