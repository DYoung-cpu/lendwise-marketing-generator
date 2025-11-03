#!/usr/bin/env node

/**
 * Server Stabilizer v2 - Actually monitors and restarts on failures
 */

import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import fetch from 'node-fetch';

class ServerStabilizerV2 extends EventEmitter {
    constructor(config = {}) {
        super();

        this.config = {
            script: config.script || 'quality-backend.js',
            port: config.port || 3001,
            maxRestarts: config.maxRestarts || 10,
            healthCheckInterval: config.healthCheckInterval || 10000,
            startupTimeout: config.startupTimeout || 30000,
            ...config
        };

        this.serverProcess = null;
        this.restartCount = 0;
        this.isHealthy = false;
        this.healthCheckTimer = null;
        this.consulErrorCount = 0;
    }

    async start() {
        console.log(`🚀 Starting server with auto-recovery...`);
        console.log(`📁 Script: ${this.config.script}`);
        console.log(`🔌 Port: ${this.config.port}`);

        // Kill any existing process
        await this.cleanup();

        // Reset counters
        this.consulErrorCount = 0;

        // Start the server
        await this.startServer();

        // Start health monitoring
        this.startHealthMonitoring();
    }

    async startServer() {
        return new Promise((resolve, reject) => {
            console.log(`🔄 Starting ${this.config.script}...`);

            this.serverProcess = spawn('node', [this.config.script], {
                env: { ...process.env, NODE_ENV: 'production' },
                stdio: 'pipe',
                cwd: process.cwd()
            });

            let startupComplete = false;
            const startupTimeout = setTimeout(() => {
                if (!startupComplete) {
                    console.error('❌ Server startup timeout');
                    this.handleCrash('Startup timeout');
                    reject(new Error('Startup timeout'));
                }
            }, this.config.startupTimeout);

            // Handle stdout
            this.serverProcess.stdout.on('data', (data) => {
                const output = data.toString();

                // Check for successful startup
                if (output.includes('Server running') ||
                    output.includes('Quality Backend ready') ||
                    output.includes('port') && output.includes(this.config.port.toString())) {

                    if (!startupComplete) {
                        startupComplete = true;
                        clearTimeout(startupTimeout);
                        console.log('✅ Server started successfully');
                        this.isHealthy = true;
                        resolve();
                    }
                }

                // Detect consul errors
                if (output.toLowerCase().includes('consul') &&
                    output.toLowerCase().includes('error')) {
                    this.handleConsulError(output);
                } else {
                    // Reset consul error count on successful operations
                    if (this.consulErrorCount > 0 && !output.includes('error')) {
                        this.consulErrorCount = 0;
                    }
                }

                // Log output (but filter out noise)
                if (!output.includes('[ioredis]') && !output.includes('dotenv')) {
                    console.log(output.trim());
                }
            });

            // Handle stderr
            this.serverProcess.stderr.on('data', (data) => {
                const error = data.toString();

                // Filter out ioredis errors (handled gracefully)
                if (!error.includes('[ioredis]')) {
                    console.error(`⚠️  Server error: ${error}`);
                }

                // Check for critical errors
                if (error.includes('EADDRINUSE')) {
                    console.error(`❌ Port ${this.config.port} already in use`);
                    this.cleanup();
                    reject(new Error('Port in use'));
                }
            });

            // Handle exit
            this.serverProcess.on('exit', (code, signal) => {
                console.log(`💀 Server exited with code ${code}, signal ${signal}`);

                if (code !== 0 && !startupComplete) {
                    clearTimeout(startupTimeout);
                    reject(new Error(`Server crashed during startup: ${code}`));
                } else if (code !== 0) {
                    this.handleCrash(`Exit code ${code}`);
                }
            });

            // Handle errors
            this.serverProcess.on('error', (error) => {
                console.error(`❌ Process error: ${error.message}`);
                if (!startupComplete) {
                    clearTimeout(startupTimeout);
                    reject(error);
                }
            });
        });
    }

    handleConsulError(output) {
        this.consulErrorCount++;
        console.log(`⚠️  Consul error ${this.consulErrorCount}/3`);

        if (this.consulErrorCount >= 3) {
            console.log('🔄 Too many consul errors, restarting server...');
            this.handleCrash('Multiple consul errors');
        }
    }

    async handleCrash(reason) {
        console.log(`💥 Server crash detected: ${reason}`);

        if (this.restartCount >= this.config.maxRestarts) {
            console.error(`❌ Max restarts (${this.config.maxRestarts}) reached - manual intervention required`);
            this.emit('max-restarts-reached');
            process.exit(1);
        }

        this.restartCount++;
        console.log(`🔄 Attempting restart ${this.restartCount}/${this.config.maxRestarts}...`);

        // Clean up
        await this.cleanup();

        // Wait before restart
        await this.delay(3000);

        // Restart
        try {
            await this.startServer();
            console.log(`✅ Server restarted successfully`);
            this.emit('server-restarted', { restartCount: this.restartCount });
        } catch (error) {
            console.error(`❌ Restart failed: ${error.message}`);
            // Will retry on next health check failure
        }
    }

    startHealthMonitoring() {
        console.log(`🏥 Starting health monitoring (every ${this.config.healthCheckInterval}ms)`);

        // Clear existing timer
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }

        this.healthCheckTimer = setInterval(async () => {
            await this.checkHealth();
        }, this.config.healthCheckInterval);

        // Do first check after a delay
        setTimeout(() => this.checkHealth(), 5000);
    }

    async checkHealth() {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`http://localhost:${this.config.port}/api/health`, {
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (response.ok) {
                if (!this.isHealthy) {
                    console.log('✅ Server health restored');
                    this.isHealthy = true;
                    // Reset restart counter on successful health check
                    if (this.restartCount > 0) {
                        console.log('📊 Resetting restart counter after stable operation');
                        this.restartCount = 0;
                    }
                }
            } else {
                throw new Error(`Health check failed: ${response.status}`);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error(`❌ Health check failed: ${error.message}`);
            }
            this.isHealthy = false;

            // Only restart if server was previously healthy or startup complete
            if (this.serverProcess && !this.serverProcess.killed) {
                await this.handleCrash('Health check failure');
            }
        }
    }

    async cleanup() {
        console.log('🧹 Cleaning up old processes...');

        // Stop health monitoring
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
        }

        // Kill server process
        if (this.serverProcess && !this.serverProcess.killed) {
            this.serverProcess.kill('SIGTERM');
            await this.delay(1000);

            if (!this.serverProcess.killed) {
                this.serverProcess.kill('SIGKILL');
            }
        }

        // Kill any orphaned processes on the port
        try {
            const { exec } = await import('child_process');
            await new Promise((resolve) => {
                exec(`lsof -ti :${this.config.port} | xargs kill -9 2>/dev/null`, resolve);
            });
        } catch (error) {
            // Ignore errors - port might already be free
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async stop() {
        console.log('🛑 Stopping server stabilizer...');
        await this.cleanup();
        this.emit('stopped');
    }
}

export default ServerStabilizerV2;
