#!/usr/bin/env node

/**
 * Server Stabilizer - Fixes consul errors and ensures reliability
 * Auto-recovers from crashes and monitors health
 */

import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import http from 'http';

class ServerStabilizer extends EventEmitter {
    constructor(serverScript = 'quality-backend.js', port = 3001) {
        super();

        this.serverScript = serverScript;
        this.port = port;
        this.serverProcess = null;
        this.restartCount = 0;
        this.maxRestarts = 10;
        this.healthCheckInterval = 5000; // 5 seconds
        this.consulRetries = 0;
        this.maxConsulRetries = 3;
        this.healthCheckTimer = null;
        this.isStarting = false;
        this.lastHealthCheck = null;

        console.log('🛡️  Server Stabilizer initialized');
        console.log(`   Script: ${this.serverScript}`);
        console.log(`   Port: ${this.port}`);
        console.log(`   Max restarts: ${this.maxRestarts}`);
    }

    async startServer() {
        if (this.isStarting) {
            console.log('⏳ Server already starting...');
            return;
        }

        this.isStarting = true;

        console.log('\n' + '='.repeat(60));
        console.log('🚀 STARTING SERVER WITH AUTO-RECOVERY');
        console.log('='.repeat(60));

        // Kill any existing process
        if (this.serverProcess) {
            console.log('🔪 Killing existing process...');
            this.serverProcess.kill('SIGTERM');
            await this.delay(1000);
        }

        // Clear any existing process on port
        await this.clearPort(this.port);

        // Start new process
        console.log(`📦 Spawning: node ${this.serverScript}`);

        this.serverProcess = spawn('node', [this.serverScript], {
            env: {
                ...process.env,
                NODE_ENV: 'production',
                PORT: this.port.toString()
            },
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: false
        });

        // Handle stdout
        this.serverProcess.stdout.on('data', (data) => {
            const output = data.toString();
            process.stdout.write(output);

            // Detect consul errors
            if (output.toLowerCase().includes('consul') &&
                (output.toLowerCase().includes('error') ||
                 output.toLowerCase().includes('failed'))) {
                this.handleConsulError(output);
            }

            // Detect successful start
            if (output.includes('Server running') ||
                output.includes('listening') ||
                output.includes('ready')) {
                console.log('✅ Server started successfully');
                this.isStarting = false;
                this.consulRetries = 0;
                this.emit('started');
            }
        });

        // Handle stderr
        this.serverProcess.stderr.on('data', (data) => {
            const error = data.toString();
            process.stderr.write(error);
            this.handleError(error);
        });

        // Handle exit
        this.serverProcess.on('exit', (code, signal) => {
            this.isStarting = false;

            if (code === 0) {
                console.log('✅ Server exited cleanly');
                this.emit('stopped');
            } else {
                console.error(`❌ Server crashed: code ${code}, signal ${signal}`);
                this.handleCrash(code, signal);
            }
        });

        // Handle spawn errors
        this.serverProcess.on('error', (error) => {
            this.isStarting = false;
            console.error('❌ Failed to spawn server:', error.message);
            this.autoRestart('spawn_error');
        });

        // Start health monitoring after giving server time to start
        await this.delay(3000);
        this.startHealthCheck();
    }

    handleConsulError(output) {
        this.consulRetries++;

        console.log(`\n⚠️  CONSUL ERROR DETECTED (${this.consulRetries}/${this.maxConsulRetries})`);
        console.log(`   Output: ${output.substring(0, 200)}...`);

        if (this.consulRetries >= this.maxConsulRetries) {
            console.log('🔄 Too many consul errors, restarting server...');
            this.autoRestart('consul_errors');
        } else {
            console.log(`   Monitoring... will restart if ${this.maxConsulRetries - this.consulRetries} more occur`);
            this.emit('consul-error', { count: this.consulRetries, output });
        }
    }

    handleError(error) {
        const errorLower = error.toLowerCase();

        // Critical errors that require immediate restart
        if (errorLower.includes('eaddrinuse') ||
            errorLower.includes('port already in use')) {
            console.error('❌ Port conflict detected');
            this.autoRestart('port_conflict');
            return;
        }

        if (errorLower.includes('cannot find module')) {
            console.error('❌ Missing module detected');
            // Don't restart - this needs manual fix
            this.emit('fatal-error', error);
            return;
        }

        if (errorLower.includes('out of memory')) {
            console.error('❌ Out of memory');
            this.autoRestart('memory_error');
            return;
        }

        // Log but don't restart for non-critical errors
        this.emit('error', error);
    }

    handleCrash(code, signal) {
        this.emit('crash', { code, signal });
        this.autoRestart('crash');
    }

    async autoRestart(reason) {
        if (this.restartCount >= this.maxRestarts) {
            console.error(`\n${'='.repeat(60)}`);
            console.error('❌ MAX RESTARTS REACHED');
            console.error(`   Reason: ${reason}`);
            console.error(`   Restarts: ${this.restartCount}/${this.maxRestarts}`);
            console.error(`   Manual intervention required`);
            console.error('='.repeat(60));

            this.emit('max-restarts-reached', { reason, count: this.restartCount });
            process.exit(1);
        }

        this.restartCount++;

        console.log(`\n${'='.repeat(60)}`);
        console.log(`🔄 AUTO-RESTART #${this.restartCount}`);
        console.log(`   Reason: ${reason}`);
        console.log(`   Remaining: ${this.maxRestarts - this.restartCount}`);
        console.log('='.repeat(60));

        // Stop health checks during restart
        this.stopHealthCheck();

        // Wait before restart (exponential backoff)
        const waitTime = Math.min(3000 * this.restartCount, 30000);
        console.log(`⏳ Waiting ${waitTime}ms before restart...`);
        await this.delay(waitTime);

        // Reset consul retries
        this.consulRetries = 0;

        // Restart server
        this.emit('restarting', { count: this.restartCount, reason });
        await this.startServer();
    }

    startHealthCheck() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }

        console.log(`\n💓 Health monitoring started (every ${this.healthCheckInterval / 1000}s)`);

        this.healthCheckTimer = setInterval(async () => {
            try {
                const healthy = await this.checkHealth();

                if (healthy) {
                    this.lastHealthCheck = Date.now();
                    // Reset counters on successful health check
                    this.consulRetries = 0;
                    this.emit('healthy');
                } else {
                    console.error('❌ Health check failed');
                    this.emit('unhealthy');
                    this.autoRestart('health_check_failed');
                }

            } catch (error) {
                console.error('❌ Health check error:', error.message);
                this.emit('health-check-error', error);
                this.autoRestart('health_check_error');
            }
        }, this.healthCheckInterval);
    }

    async checkHealth() {
        return new Promise((resolve) => {
            const req = http.get(`http://localhost:${this.port}/api/health`, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(true);
                    } else {
                        console.warn(`⚠️  Health check returned ${res.statusCode}`);
                        resolve(false);
                    }
                });
            });

            req.on('error', (error) => {
                console.warn(`⚠️  Health check request failed: ${error.message}`);
                resolve(false);
            });

            req.setTimeout(3000, () => {
                req.destroy();
                console.warn('⚠️  Health check timeout');
                resolve(false);
            });
        });
    }

    stopHealthCheck() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
            console.log('💓 Health monitoring stopped');
        }
    }

    async clearPort(port) {
        console.log(`🔍 Checking port ${port}...`);

        return new Promise((resolve) => {
            const testServer = http.createServer();

            testServer.once('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    console.log(`⚠️  Port ${port} in use, attempting to clear...`);

                    // Try to kill process using the port
                    if (process.platform === 'win32') {
                        spawn('cmd', ['/c', `netstat -ano | findstr :${port}`], { stdio: 'pipe' })
                            .on('close', () => resolve());
                    } else {
                        spawn('lsof', ['-ti', `:${port}`], { stdio: 'pipe' })
                            .on('close', () => resolve());
                    }
                } else {
                    resolve();
                }
            });

            testServer.once('listening', () => {
                testServer.close();
                console.log(`✅ Port ${port} is available`);
                resolve();
            });

            testServer.listen(port);
        });
    }

    async stop() {
        console.log('\n🛑 Stopping server...');

        this.stopHealthCheck();

        if (this.serverProcess) {
            this.serverProcess.kill('SIGTERM');

            // Wait for graceful shutdown
            await this.delay(2000);

            // Force kill if still running
            if (!this.serverProcess.killed) {
                console.log('🔪 Force killing server...');
                this.serverProcess.kill('SIGKILL');
            }

            this.serverProcess = null;
        }

        console.log('✅ Server stopped');
        this.emit('stopped');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getStatus() {
        return {
            running: this.serverProcess !== null && !this.serverProcess.killed,
            restartCount: this.restartCount,
            consulRetries: this.consulRetries,
            lastHealthCheck: this.lastHealthCheck,
            isStarting: this.isStarting
        };
    }
}

export default ServerStabilizer;
