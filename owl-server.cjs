const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3500;
const BASE_DIR = '/mnt/c/Users/dyoun/Active Projects';

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    let filePath = req.url === '/' ? '/owl-preview.html' : req.url;
    filePath = path.join(BASE_DIR, filePath);

    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
        '.html': 'text/html',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.css': 'text/css',
        '.js': 'application/javascript'
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1><p>Requested: ' + req.url + '</p>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🦉 LendWise Owl Logo Preview Server`);
    console.log(`📍 Server running at: http://localhost:${PORT}`);
    console.log(`📄 Preview page: http://localhost:${PORT}/owl-preview.html`);
    console.log(`\nPress Ctrl+C to stop\n`);
});
