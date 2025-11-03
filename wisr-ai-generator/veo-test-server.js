/**
 * Veo 3.1 Live Testing Dev Server
 * Provides web interface for testing video generation with real-time feedback
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateVideo, estimateCost } from './runway-service.js';
import { buildRunwayPrompt, getVideoSettings } from './runway-prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// MIME types for serving static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4'
};

/**
 * Serve static files
 */
function serveStaticFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

/**
 * Parse POST body
 */
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Handle API requests
 */
async function handleAPI(req, res, urlPath) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // POST /api/generate - Generate video
  if (urlPath === '/api/generate' && req.method === 'POST') {
    try {
      const params = await parseBody(req);

      console.log('\n🎬 Video generation request received:');
      console.log(`   Model: ${params.model}`);
      console.log(`   Ratio: ${params.ratio}`);
      console.log(`   Duration: ${params.duration}s`);

      // Generate video
      const result = await generateVideo(
        params.imageUrl,
        params.prompt,
        {
          model: params.model,
          ratio: params.ratio,
          duration: params.duration,
          watermark: false,
          seed: params.seed
        }
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));

    } catch (error) {
      console.error('❌ API Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }));
    }
    return;
  }

  // POST /api/estimate - Estimate cost
  if (urlPath === '/api/estimate' && req.method === 'POST') {
    try {
      const params = await parseBody(req);
      const cost = estimateCost(params.duration, params.model);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(cost));

    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }));
    }
    return;
  }

  // GET /api/templates - Get available templates
  if (urlPath === '/api/templates' && req.method === 'GET') {
    const templates = [
      { id: 'rateAlert', name: 'Rate Alert', description: 'Urgent mortgage rate updates' },
      { id: 'marketIntelligence', name: 'Market Intelligence', description: 'Professional market data' },
      { id: 'educational', name: 'Educational', description: 'Educational mortgage content' },
      { id: 'downPaymentMyths', name: 'Down Payment Myths', description: 'Myth-busting content' },
      { id: 'testimonial', name: 'Testimonial', description: 'Client testimonials' },
      { id: 'personalBranding', name: 'Personal Branding', description: 'Professional intro' },
      { id: 'urgentAlert', name: 'Urgent Alert', description: 'Time-sensitive alerts' }
    ];

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(templates));
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'API endpoint not found' }));
}

/**
 * Main request handler
 */
const server = http.createServer(async (req, res) => {
  const urlPath = req.url === '/' ? '/veo-test-interface.html' : req.url;

  console.log(`${req.method} ${urlPath}`);

  // API routes
  if (urlPath.startsWith('/api/')) {
    await handleAPI(req, res, urlPath);
    return;
  }

  // Static files
  const filePath = path.join(__dirname, urlPath);

  // Security check - prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  serveStaticFile(filePath, res);
});

// Start server
server.listen(PORT, () => {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║     🎬 VEO 3.1 LIVE TESTING SERVER                        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`\n📱 Open in browser: http://localhost:${PORT}`);
  console.log(`\n🔧 API Endpoints:`);
  console.log(`   POST /api/generate   - Generate video`);
  console.log(`   POST /api/estimate   - Estimate cost`);
  console.log(`   GET  /api/templates  - List templates`);
  console.log(`\n💡 Press Ctrl+C to stop\n`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
