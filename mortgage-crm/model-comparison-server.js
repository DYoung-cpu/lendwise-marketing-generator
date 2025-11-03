import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

// Serve static files from /tmp
app.use('/images', express.static('/tmp'));

app.get('/', (req, res) => {
  const results = JSON.parse(fs.readFileSync('/tmp/model-comparison-results.json', 'utf8'));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Model Comparison - Photo Integration Test</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
      padding: 40px 20px;
      min-height: 100vh;
    }

    .container {
      max-width: 1800px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      margin-bottom: 60px;
    }

    h1 {
      font-size: 3em;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 20px;
    }

    .subtitle {
      font-size: 1.2em;
      color: #aaa;
      margin-bottom: 10px;
    }

    .summary {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin: 30px 0;
    }

    .stat {
      text-align: center;
      padding: 20px 40px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }

    .stat-number {
      font-size: 2.5em;
      font-weight: bold;
      color: #4ade80;
    }

    .stat-label {
      color: #888;
      margin-top: 5px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(800px, 1fr));
      gap: 40px;
      margin-top: 40px;
    }

    .model-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 30px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .model-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .model-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 20px;
    }

    .model-name {
      font-size: 1.8em;
      font-weight: bold;
      color: #fff;
      margin-bottom: 10px;
    }

    .speed-badge {
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 0.9em;
    }

    .fastest { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); color: #000; }
    .fast { background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%); }
    .slow { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #000; }

    .description {
      color: #aaa;
      line-height: 1.6;
      margin-bottom: 20px;
      font-size: 0.95em;
    }

    .stats-row {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    .stat-item {
      flex: 1;
      padding: 15px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 10px;
      text-align: center;
    }

    .stat-value {
      font-size: 1.5em;
      font-weight: bold;
      color: #4ade80;
    }

    .stat-label-small {
      color: #888;
      font-size: 0.85em;
      margin-top: 5px;
    }

    .image-container {
      border-radius: 15px;
      overflow: hidden;
      margin-bottom: 20px;
      border: 2px solid rgba(255, 255, 255, 0.1);
    }

    .image-container img {
      width: 100%;
      height: auto;
      display: block;
    }

    .image-url {
      color: #60a5fa;
      font-size: 0.85em;
      word-break: break-all;
      padding: 10px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      margin-top: 10px;
    }

    .failed-card {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
    }

    .error-message {
      color: #fca5a5;
      padding: 15px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      font-size: 0.9em;
    }

    .winner-badge {
      position: absolute;
      top: -15px;
      right: 30px;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: #000;
      padding: 10px 20px;
      border-radius: 25px;
      font-weight: bold;
      font-size: 0.9em;
      box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
    }

    @media (max-width: 1400px) {
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🎨 AI Model Comparison</h1>
      <div class="subtitle">Multimodal Photo Integration Test</div>
      <div class="subtitle" style="color: #60a5fa;">Testing seamless loan officer photo integration into mortgage marketing materials</div>

      <div class="summary">
        <div class="stat">
          <div class="stat-number">${successful.length}/${results.length}</div>
          <div class="stat-label">Models Successful</div>
        </div>
        <div class="stat">
          <div class="stat-number">${successful.length > 0 ? successful.reduce((min, r) => Math.min(min, parseFloat(r.duration)), Infinity).toFixed(1) + 's' : 'N/A'}</div>
          <div class="stat-label">Fastest Generation</div>
        </div>
        <div class="stat">
          <div class="stat-number">${successful.length > 0 ? Math.min(...successful.map(r => (r.fileSize / 1024).toFixed(0))) + 'KB' : 'N/A'}</div>
          <div class="stat-label">Smallest File</div>
        </div>
      </div>
    </header>

    <div class="grid">
      ${successful.map((model, index) => {
        const duration = parseFloat(model.duration);
        const minDuration = Math.min(...successful.map(r => parseFloat(r.duration)));
        const speedClass = duration === minDuration ? 'fastest' : (duration < minDuration * 1.5 ? 'fast' : 'slow');
        const speedLabel = duration === minDuration ? '⚡ FASTEST' : (duration < minDuration * 1.5 ? '🚀 FAST' : '🐢 SLOW');
        const isWinner = duration === minDuration;
        const imageName = model.filename.split('/').pop();

        return `
        <div class="model-card" style="position: relative;">
          ${isWinner ? '<div class="winner-badge">🏆 FASTEST MODEL</div>' : ''}

          <div class="model-header">
            <div>
              <div class="model-name">${model.name}</div>
              <div style="color: #666; font-size: 0.85em; margin-bottom: 10px;">${model.model}</div>
            </div>
            <div class="speed-badge ${speedClass}">${speedLabel}</div>
          </div>

          <div class="description">${model.description}</div>

          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-value">${model.duration}s</div>
              <div class="stat-label-small">Generation Time</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${(model.fileSize / 1024).toFixed(0)}KB</div>
              <div class="stat-label-small">File Size</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${((model.fileSize / 1024) / parseFloat(model.duration)).toFixed(1)}KB/s</div>
              <div class="stat-label-small">Efficiency</div>
            </div>
          </div>

          <div class="image-container">
            <img src="/images/${imageName}" alt="${model.name} generated image">
          </div>

          <div class="image-url">
            <strong>URL:</strong> <a href="${model.url}" target="_blank" style="color: #60a5fa;">${model.url}</a>
          </div>
        </div>
        `;
      }).join('')}

      ${failed.map(model => `
        <div class="model-card failed-card">
          <div class="model-header">
            <div>
              <div class="model-name">❌ ${model.name}</div>
              <div style="color: #666; font-size: 0.85em; margin-bottom: 10px;">${model.model}</div>
            </div>
            <div class="speed-badge" style="background: rgba(239, 68, 68, 0.3);">FAILED</div>
          </div>

          <div class="description">${model.description}</div>

          <div class="error-message">
            <strong>Error:</strong> ${model.error}
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>
  `;

  res.send(html);
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║    AI MODEL COMPARISON SERVER                  ║
╚════════════════════════════════════════════════╝

🌐 Open in browser: http://localhost:${PORT}

📊 Showing results for ${JSON.parse(fs.readFileSync('/tmp/model-comparison-results.json')).length} models
✅ ${JSON.parse(fs.readFileSync('/tmp/model-comparison-results.json')).filter(r => r.success).length} successful generations
🖼️  Images loaded from /tmp/

Press Ctrl+C to stop server
  `);
});
