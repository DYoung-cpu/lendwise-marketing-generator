const http = require('http');
const fs = require('fs');
const path = require('path');

// Read config to get output filename
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const signatureFile = `./${config.output.filename}.html`;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        try {
            const html = fs.readFileSync(signatureFile, 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } catch (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Signature file not found. Please run: node build-signature.cjs');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = 3456;
server.listen(PORT, () => {
    console.log(`\n📧 Email Signature Server`);
    console.log(`📍 Server running at: http://localhost:${PORT}`);
    console.log(`\nServing: ${path.resolve(signatureFile)}`);
    console.log(`\nPress Ctrl+C to stop\n`);
});
