#!/usr/bin/env node

/**
 * Quick Test - Verify Replicate Integration is Ready
 * This does NOT make actual API calls - just verifies configuration
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('\n' + '='.repeat(60));
console.log('🔍 REPLICATE INTEGRATION - READINESS CHECK');
console.log('='.repeat(60));

let checks = 0;
let passed = 0;

function check(name, condition, details = '') {
    checks++;
    if (condition) {
        console.log(`✅ ${name}`);
        if (details) console.log(`   ${details}`);
        passed++;
    } else {
        console.log(`❌ ${name}`);
        if (details) console.log(`   ${details}`);
    }
}

// Check 1: Replicate API Token
check(
    'Replicate API Token',
    process.env.REPLICATE_API_TOKEN && process.env.REPLICATE_API_TOKEN.startsWith('r8_'),
    process.env.REPLICATE_API_TOKEN ? 'Token found' : 'Missing REPLICATE_API_TOKEN'
);

// Check 2: Replicate Username
check(
    'Replicate Username',
    process.env.REPLICATE_USERNAME === 'dyoun',
    `Username: ${process.env.REPLICATE_USERNAME || 'NOT SET'}`
);

// Check 3: Supabase URL
check(
    'Supabase URL',
    process.env.SUPABASE_URL && process.env.SUPABASE_URL.includes('supabase.co'),
    `URL: ${process.env.SUPABASE_URL ? 'Configured' : 'NOT SET'}`
);

// Check 4: Supabase Key
check(
    'Supabase Key',
    process.env.SUPABASE_KEY && process.env.SUPABASE_KEY.startsWith('eyJ'),
    process.env.SUPABASE_KEY ? 'JWT token found' : 'NOT SET'
);

// Check 5: Files exist
import { existsSync } from 'fs';
check(
    'orchestrator-v2.js exists',
    existsSync('./orchestrator-v2.js'),
    './orchestrator-v2.js'
);

check(
    'quality-backend.js exists',
    existsSync('./quality-backend.js'),
    './quality-backend.js'
);

check(
    'marketing-crm.html exists',
    existsSync('./wisr-ai-generator/marketing-crm.html'),
    './wisr-ai-generator/marketing-crm.html'
);

// Check 6: Ports
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

async function checkPorts() {
    try {
        const { stdout: port3001 } = await execAsync('lsof -ti :3001');
        check('Backend running on port 3001', port3001.trim().length > 0, 'PID: ' + port3001.trim());
    } catch {
        check('Backend running on port 3001', false, 'Port not in use');
    }

    try {
        const { stdout: port8080 } = await execAsync('lsof -ti :8080');
        check('Frontend running on port 8080', port8080.trim().length > 0, 'PID: ' + port8080.trim());
    } catch {
        check('Frontend running on port 8080', false, 'Port not in use');
    }

    // Check 7: Verify marketing-crm.html has correct endpoint
    import { readFileSync } from 'fs';
    const htmlContent = readFileSync('./wisr-ai-generator/marketing-crm.html', 'utf8');
    const hasCorrectEndpoint = htmlContent.includes('/api/generate-quality');
    check(
        'marketing-crm.html uses /api/generate-quality',
        hasCorrectEndpoint,
        hasCorrectEndpoint ? 'Correct endpoint configured' : 'Still using old endpoint'
    );

    // Final Results
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passed}/${checks}`);

    if (passed === checks) {
        console.log('\n🎉 ALL CHECKS PASSED!');
        console.log('\n✨ System is ready for testing:');
        console.log('   1. Open http://localhost:8080');
        console.log('   2. Enter a prompt with NMLS ID');
        console.log('   3. Click Generate');
        console.log('   4. Watch console for "Using Replicate" message');
        console.log('\n📝 Expected model: imagen-3 (for text rendering)');
        console.log('⏱️  Expected time: 10-30 seconds');
        console.log('💰 Cost per image: $0.01');
        process.exit(0);
    } else {
        console.log(`\n⚠️  ${checks - passed} checks failed. Review errors above.`);
        process.exit(1);
    }
}

checkPorts();
