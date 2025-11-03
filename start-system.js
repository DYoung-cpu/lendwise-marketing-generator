#!/usr/bin/env node

/**
 * Complete System Startup Script
 * Starts Redis, Backend with Stabilizer, and Frontend
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

console.log(`
╔════════════════════════════════════════════╗
║   MORTGAGE AI SYSTEM - COMPLETE STARTUP    ║
╚════════════════════════════════════════════╝
`);

// Check for required environment variables
const requiredEnvVars = [
    'GEMINI_API_KEY',
    'ANTHROPIC_API_KEY'
];

const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.log('Add them to your .env file');
    process.exit(1);
}

// Optional but recommended
if (!process.env.REPLICATE_API_TOKEN) {
    console.warn('⚠️ REPLICATE_API_TOKEN not set - will use Gemini fallback');
}

async function startRedis() {
    console.log('🔴 Starting Redis...');

    // Check if Redis is already running
    const checkRedis = spawn('redis-cli', ['ping']);

    return new Promise((resolve) => {
        checkRedis.on('exit', (code) => {
            if (code === 0) {
                console.log('✅ Redis already running');
                resolve();
            } else {
                console.log('📦 Starting Redis server...');

                // Try Docker first
                const dockerRedis = spawn('docker', [
                    'run', '-d',
                    '--name', 'redis-mortgage-ai',
                    '-p', '6379:6379',
                    'redis:latest'
                ], { stdio: 'pipe' });

                dockerRedis.on('exit', (dockerCode) => {
                    if (dockerCode === 0) {
                        console.log('✅ Redis started via Docker');
                    } else {
                        console.log('⚠️ Redis not available - using in-memory cache');
                    }
                    resolve();
                });

                dockerRedis.on('error', () => {
                    // Docker not available, try native redis-server
                    const nativeRedis = spawn('redis-server', [], { 
                        stdio: 'pipe',
                        detached: true
                    });

                    nativeRedis.on('error', () => {
                        console.log('⚠️ Redis not installed - using in-memory cache');
                        resolve();
                    });

                    nativeRedis.on('spawn', () => {
                        console.log('✅ Redis started natively');
                        nativeRedis.unref();
                        resolve();
                    });
                });
            }
        });
    });
}

async function startBackendWithStabilizer() {
    console.log('\n📦 Starting Backend with Stabilizer...');

    const backend = spawn('node', ['server-stabilizer-v2.js'], {
        env: { ...process.env },
        stdio: 'inherit'
    });

    backend.on('exit', (code) => {
        if (code !== 0) {
            console.error(`❌ Backend stabilizer crashed with code ${code}`);
            process.exit(1);
        }
    });

    return backend;
}

async function startFrontend() {
    console.log('\n🌐 Starting Frontend Server...');

    // Check if marketing-crm-server.js exists
    const frontend = spawn('node', ['wisr-ai-generator/veo-test-server.js'], {
        env: { ...process.env, PORT: 8080 },
        stdio: 'pipe'
    });

    frontend.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Server running') || output.includes('listening')) {
            console.log('✅ Frontend running at http://localhost:8080');
        }
        console.log(output.trim());
    });

    frontend.stderr.on('data', (data) => {
        console.error(`Frontend error: ${data}`);
    });

    frontend.on('exit', (code) => {
        if (code !== 0) {
            console.error(`❌ Frontend crashed with code ${code}`);
        }
    });

    return frontend;
}

async function main() {
    let backend = null;
    let frontend = null;

    try {
        // Start Redis (optional but recommended)
        await startRedis();

        // Start backend with stabilizer
        backend = await startBackendWithStabilizer();

        // Give backend a moment to start
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Start frontend
        frontend = await startFrontend();

        console.log(`
╔════════════════════════════════════════════╗
║           SYSTEM READY TO USE!              ║
║                                             ║
║  Frontend: http://localhost:8080            ║
║  Backend:  http://localhost:3001           ║
║                                             ║
║  Press Ctrl+C to stop all services         ║
╚════════════════════════════════════════════╝
        `);

        // Handle shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 Shutting down system...');

            if (backend) backend.kill('SIGTERM');
            if (frontend) frontend.kill('SIGTERM');

            // Stop Redis if we started it
            spawn('docker', ['stop', 'redis-mortgage-ai'], { stdio: 'ignore' });

            console.log('👋 Goodbye!');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Startup failed:', error);
        if (backend) backend.kill();
        if (frontend) frontend.kill();
        process.exit(1);
    }
}

main();
