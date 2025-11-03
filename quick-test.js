#!/usr/bin/env node

/**
 * Quick System Test - Fast validation
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('\n' + '='.repeat(60));
console.log('⚡ QUICK SYSTEM TEST');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

async function test(name, fn) {
    process.stdout.write(`\n${name}... `);
    try {
        await fn();
        console.log('✅');
        passed++;
    } catch (error) {
        console.log(`❌ ${error.message}`);
        failed++;
    }
}

async function runTests() {

    // Test 1: Orchestrator loads
    await test('Orchestrator initialization', async () => {
        const { default: MasterOrchestrator } = await import('./orchestrator-v2.js');
        const orch = new MasterOrchestrator();
        if (!orch) throw new Error('Failed');
    });

    // Test 2: Replicate Master loads
    await test('Replicate Master initialization', async () => {
        const { default: ReplicateMaster } = await import('./replicate-master.js');
        const rep = new ReplicateMaster();
        if (!rep || !rep.isAvailable()) throw new Error('Replicate not available');
    });

    // Test 3: MCP Coordinator loads
    await test('MCP Coordinator initialization', async () => {
        const { default: MCPCoordinator } = await import('./mcp-coordinator.js');
        const mcp = new MCPCoordinator();
        if (!mcp || mcp.tools.size === 0) throw new Error('No tools registered');
    });

    // Test 4: Model selection
    await test('Replicate model selection', async () => {
        const { default: ReplicateMaster } = await import('./replicate-master.js');
        const rep = new ReplicateMaster();
        const model = rep.selectOptimalModel('Create image with NMLS ID# 123456', {});
        if (model !== 'imagen-3') throw new Error(`Wrong model: ${model}`);
    });

    // Test 5: Memory system
    await test('Perpetual memory system', async () => {
        const { default: MasterOrchestrator } = await import('./orchestrator-v2.js');
        const orch = new MasterOrchestrator();
        await orch.rememberForever('quick_test', { foo: 'bar' }, 5);
        const recalled = await orch.recall('quick_test');
        if (!recalled || recalled.foo !== 'bar') throw new Error('Memory failed');
    });

    // Results
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);

    if (failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! System is fully operational!');
        console.log('\n✨ You can now:');
        console.log('   1. Generate images with Replicate (imagen-3, flux, etc.)');
        console.log('   2. Use quality control loops');
        console.log('   3. Store/recall from perpetual memory');
        console.log('   4. Train brand LoRA models');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some tests failed. Check errors above.');
        process.exit(1);
    }
}

runTests();
