#!/usr/bin/env node

import fetch from 'node-fetch';

async function healthCheck() {
  console.log('🏥 Running health check...\n');

  try {
    // Check if server is running
    const response = await fetch('http://localhost:3001/api/health');
    const data = await response.json();

    if (data.status === 'operational') {
      console.log('✅ Server is operational');

      // Check models
      const modelsResponse = await fetch('http://localhost:3001/api/models');
      const models = await modelsResponse.json();
      console.log(`✅ ${models.length} models loaded`);

      // Check performance endpoint
      const perfResponse = await fetch('http://localhost:3001/api/performance');
      const perf = await perfResponse.json();
      console.log(`✅ Performance tracking active`);

    } else {
      console.log('❌ Server is not healthy');
      process.exit(1);
    }

  } catch (error) {
    console.log('❌ Server is not running');
    console.log('   Run: npm run dev');
    process.exit(1);
  }
}

healthCheck();
