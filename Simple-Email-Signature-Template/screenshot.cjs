const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Read config
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const signatureFile = `./${config.output.filename}.html`;

console.log('Taking screenshot of signature...\n');

try {
    // Start server in background
    const server = require('child_process').spawn('node', ['server.cjs'], {
        detached: true,
        stdio: 'ignore'
    });

    // Wait for server to start
    setTimeout(() => {
        try {
            // Take screenshot using Playwright
            execSync('npx playwright screenshot http://localhost:3456 signature-preview.png', {
                stdio: 'inherit'
            });

            console.log(`\n✅ Screenshot saved: ${path.resolve('./signature-preview.png')}\n`);
        } catch (error) {
            console.error('Failed to take screenshot. Make sure Playwright is installed.');
            console.log('Install with: npm install -D @playwright/test');
        } finally {
            // Kill the server
            server.kill();
        }
    }, 2000);
} catch (error) {
    console.error('Error:', error.message);
}
