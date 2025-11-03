#!/usr/bin/env node

/**
 * Simple HTTP server for Marketing CRM interface
 * Serves marketing-crm.html on port 8080
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Enable CORS
app.use(cors());

// Serve wisr-ai-generator files at root (for assets like config.js, wisr-owl.mp4, etc.)
app.use(express.static(path.join(__dirname, 'wisr-ai-generator')));

// Serve static files from current directory
app.use(express.static(__dirname));

// Serve wisr-ai-generator directory for assets (alternate path)
app.use('/wisr-ai-generator', express.static(path.join(__dirname, 'wisr-ai-generator')));

// Root route serves marketing-crm.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'wisr-ai-generator', 'marketing-crm.html'));
});

// Also serve on /marketing-crm
app.get('/marketing-crm', (req, res) => {
    res.sendFile(path.join(__dirname, 'wisr-ai-generator', 'marketing-crm.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log('🎨 MARKETING CRM INTERFACE SERVER');
    console.log(`${'='.repeat(60)}`);
    console.log(`\n✅ Marketing CRM UI: http://localhost:${PORT}`);
    console.log(`📍 Direct link: http://localhost:${PORT}/marketing-crm`);
    console.log(`\n🔌 Backend API: http://localhost:3001`);
    console.log(`🚀 Powered by: Replicate (imagen-3, flux, SDXL)`);
    console.log(`🎯 Quality Control: 95% accuracy guarantee\n`);
});
