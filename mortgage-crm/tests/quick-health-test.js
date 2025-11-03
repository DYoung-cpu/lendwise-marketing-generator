#!/usr/bin/env node

import fetch from 'node-fetch';

console.log('🧪 Quick Health Test\n');

const API_BASE = 'http://localhost:3001';

async function testHealth() {
  try {
    console.log(`Testing: ${API_BASE}/api/health`);

    const response = await fetch(`${API_BASE}/api/health`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Response:', data);

    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testModels() {
  try {
    console.log(`\nTesting: ${API_BASE}/api/models`);

    const response = await fetch(`${API_BASE}/api/models`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const models = await response.json();
    console.log(`✅ Found ${models.length} models`);
    console.log(`   First 3: ${models.slice(0, 3).map(m => m.id).join(', ')}`);

    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function run() {
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('\n❌ Server health check failed');
    process.exit(1);
  }

  const modelsOk = await testModels();
  if (!modelsOk) {
    console.log('\n❌ Models check failed');
    process.exit(1);
  }

  console.log('\n✅ All basic tests passed!');
  process.exit(0);
}

run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
