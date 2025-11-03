#!/usr/bin/env node

/**
 * System Test Script
 * Validates all components of the fixed system
 */

import MasterOrchestrator from './orchestrator-v2.js';
import ReplicateMaster from './replicate-master.js';
import MCPCoordinator from './mcp-coordinator.js';
import ServerStabilizer from './server-stabilizer.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class SystemTester {
    constructor() {
        this.results = [];
        this.passed = 0;
        this.failed = 0;
    }

    async runAllTests() {
        console.log('\n' + '='.repeat(80));
        console.log('🧪 SYSTEM VALIDATION TESTS');
        console.log('='.repeat(80));

        await this.testOrchestrator();
        await this.testReplicateMaster();
        await this.testMCPCoordinator();
        await this.testServerStabilizer();

        this.printResults();
    }

    async test(name, fn) {
        process.stdout.write(`\n📝 ${name}... `);

        try {
            await fn();
            console.log('✅ PASS');
            this.results.push({ name, passed: true });
            this.passed++;
        } catch (error) {
            console.log(`❌ FAIL: ${error.message}`);
            this.results.push({ name, passed: false, error: error.message });
            this.failed++;
        }
    }

    async testOrchestrator() {
        console.log('\n' + '-'.repeat(80));
        console.log('🤖 TESTING ORCHESTRATOR');
        console.log('-'.repeat(80));

        await this.test('Orchestrator initialization', async () => {
            const orch = new MasterOrchestrator();
            if (!orch) throw new Error('Failed to initialize');
        });

        await this.test('Memory system loaded', async () => {
            const orch = new MasterOrchestrator();
            if (typeof orch.memory === 'undefined') throw new Error('Memory not initialized');
        });

        await this.test('Perpetual memory store/recall', async () => {
            const orch = new MasterOrchestrator();
            await orch.rememberForever('test_key', { foo: 'bar' }, 5);
            const recalled = await orch.recall('test_key');
            if (!recalled || recalled.foo !== 'bar') {
                throw new Error('Memory recall failed');
            }
        });

        await this.test('Replicate model registry loaded', async () => {
            const orch = new MasterOrchestrator();
            if (!orch.replicateModels || Object.keys(orch.replicateModels).length === 0) {
                throw new Error('Replicate models not loaded');
            }
        });

        await this.test('Model selection logic', async () => {
            const orch = new MasterOrchestrator();
            const model = orch.selectBestReplicateModel({
                description: 'Create professional image with NMLS ID# 123456'
            });
            if (!model || model.id !== 'google-deepmind/imagen-3') {
                throw new Error(`Expected imagen-3 for text, got ${model?.id}`);
            }
        });

        await this.test('Agent registration', async () => {
            const orch = new MasterOrchestrator();
            if (orch.agents.size === 0) {
                throw new Error('No agents registered');
            }
            if (!orch.agents.has('marketing')) {
                throw new Error('Marketing agent not registered');
            }
        });

        await this.test('Agent invocation', async () => {
            const orch = new MasterOrchestrator();
            const result = await orch.invokeAgent('marketing', 'test command');
            if (!result) throw new Error('Agent invocation failed');
        });

        await this.test('Quality check system', async () => {
            const orch = new MasterOrchestrator();
            const score = await orch.checkQuality({ success: true }, {});
            if (typeof score !== 'number' || score < 0 || score > 1) {
                throw new Error(`Invalid quality score: ${score}`);
            }
        });
    }

    async testReplicateMaster() {
        console.log('\n' + '-'.repeat(80));
        console.log('🎨 TESTING REPLICATE MASTER');
        console.log('-'.repeat(80));

        await this.test('Replicate Master initialization', async () => {
            const rep = new ReplicateMaster();
            if (!rep) throw new Error('Failed to initialize');
        });

        await this.test('All models loaded', async () => {
            const rep = new ReplicateMaster();
            if (Object.keys(rep.models).length === 0) {
                throw new Error('No models loaded');
            }
            console.log(`      (${Object.keys(rep.models).length} models loaded)`);
        });

        await this.test('Model info retrieval', async () => {
            const rep = new ReplicateMaster();
            const info = rep.getModelInfo('flux-1.1-pro');
            if (!info || !info.best_for) {
                throw new Error('Failed to get model info');
            }
        });

        await this.test('Model selection for text', async () => {
            const rep = new ReplicateMaster();
            const model = rep.selectOptimalModel(
                'Create image with NMLS ID# 123456',
                {}
            );
            if (model !== 'imagen-3') {
                throw new Error(`Expected imagen-3 for text, got ${model}`);
            }
        });

        await this.test('Model selection for speed', async () => {
            const rep = new ReplicateMaster();
            const model = rep.selectOptimalModel(
                'Quick draft preview',
                { speed_priority: true }
            );
            if (model !== 'flux-schnell') {
                throw new Error(`Expected flux-schnell for speed, got ${model}`);
            }
        });

        await this.test('Model selection for quality', async () => {
            const rep = new ReplicateMaster();
            const model = rep.selectOptimalModel(
                'High quality professional image',
                { quality_priority: true }
            );
            if (model !== 'flux-1.1-pro') {
                throw new Error(`Expected flux-1.1-pro for quality, got ${model}`);
            }
        });

        if (process.env.REPLICATE_API_TOKEN) {
            console.log('      ✓ Replicate API token found');
        } else {
            console.log('      ⚠ Replicate API token not set (generation will fail)');
        }
    }

    async testMCPCoordinator() {
        console.log('\n' + '-'.repeat(80));
        console.log('🔧 TESTING MCP COORDINATOR');
        console.log('-'.repeat(80));

        await this.test('MCP Coordinator initialization', async () => {
            const mcp = new MCPCoordinator();
            if (!mcp) throw new Error('Failed to initialize');
        });

        await this.test('Tools registered', async () => {
            const mcp = new MCPCoordinator();
            if (mcp.tools.size === 0) {
                throw new Error('No tools registered');
            }
            console.log(`      (${mcp.tools.size} tools registered)`);
        });

        await this.test('Tool listing', async () => {
            const mcp = new MCPCoordinator();
            const tools = mcp.listTools();
            if (!Array.isArray(tools) || tools.length === 0) {
                throw new Error('Failed to list tools');
            }
        });

        await this.test('Memory tool execution', async () => {
            const mcp = new MCPCoordinator();
            const result = await mcp.executeTool('memory', {
                action: 'store',
                key: 'test',
                value: 'test_value'
            });
            if (!result.success) {
                throw new Error('Memory tool execution failed');
            }
        });

        await this.test('Memory tool retrieval', async () => {
            const mcp = new MCPCoordinator();
            // First store
            await mcp.executeTool('memory', {
                action: 'store',
                key: 'test2',
                value: 'retrieved_value'
            });
            // Then retrieve
            const result = await mcp.executeTool('memory', {
                action: 'get',
                key: 'test2'
            });
            if (!result.success || !result.data) {
                throw new Error('Memory retrieval failed');
            }
        });
    }

    async testServerStabilizer() {
        console.log('\n' + '-'.repeat(80));
        console.log('🛡️  TESTING SERVER STABILIZER');
        console.log('-'.repeat(80));

        await this.test('Server Stabilizer initialization', async () => {
            const server = new ServerStabilizer();
            if (!server) throw new Error('Failed to initialize');
        });

        await this.test('Status retrieval', async () => {
            const server = new ServerStabilizer();
            const status = server.getStatus();
            if (!status || typeof status.running !== 'boolean') {
                throw new Error('Invalid status');
            }
        });

        await this.test('Port clearing logic', async () => {
            const server = new ServerStabilizer();
            // This should complete without throwing
            await server.clearPort(9999);
        });
    }

    printResults() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 TEST RESULTS');
        console.log('='.repeat(80));

        console.log(`\n✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📝 Total: ${this.results.length}`);

        const successRate = (this.passed / this.results.length * 100).toFixed(1);
        console.log(`\n📈 Success Rate: ${successRate}%`);

        if (this.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.results
                .filter(r => !r.passed)
                .forEach(r => {
                    console.log(`   • ${r.name}: ${r.error}`);
                });
        }

        console.log('\n' + '='.repeat(80));

        if (this.failed === 0) {
            console.log('✅ ALL TESTS PASSED! System is ready to use.');
        } else {
            console.log('⚠️  Some tests failed. Check configuration and try again.');
        }

        console.log('='.repeat(80) + '\n');

        // Exit with appropriate code
        process.exit(this.failed === 0 ? 0 : 1);
    }
}

// Run tests
const tester = new SystemTester();
tester.runAllTests().catch(error => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
});
