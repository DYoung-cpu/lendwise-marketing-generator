const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.url}`);

    if (req.url === '/' || req.url === '/index.html') {
        const filePath = '/mnt/c/Users/dyoun/Active Projects/email-signature/orly-lendwise-final.html';

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1><p>Please run build-orly-lendwise-signature.js first!</p>');
                return;
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Not Found</h1>');
    }
});

server.listen(PORT, () => {
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║  Orly Hakimi LendWise Signature Server Running! 🚀   ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    console.log(`📍 Server running at: http://localhost:${PORT}`);
    console.log(`\n📋 Instructions:`);
    console.log(`   1. Open http://localhost:${PORT} in your browser`);
    console.log(`   2. Click "Copy Signature to Clipboard"`);
    console.log(`   3. Go to Gmail Settings → General → Signature`);
    console.log(`   4. Paste the signature`);
    console.log(`\n⏹️  Press Ctrl+C to stop the server\n`);
});
