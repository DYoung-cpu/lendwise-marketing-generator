#!/usr/bin/env node

import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const execAsync = promisify(exec);

async function preflight() {
  console.log('🔍 Running pre-flight checks...\n');

  const checks = [];

  // Check environment variables
  const requiredEnvVars = ['REPLICATE_API_TOKEN'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      checks.push(`❌ Missing ${envVar}`);
    } else {
      checks.push(`✅ ${envVar} configured`);
    }
  }

  // Check for node_modules
  if (!existsSync('node_modules')) {
    checks.push('❌ node_modules missing - run: npm install');
  } else {
    checks.push('✅ Dependencies installed');
  }

  // Check for hardcoded values
  try {
    const { stdout } = await execAsync('grep -r "David Young\\|62043" src/ || true');
    if (stdout) {
      checks.push('⚠️  Found hardcoded values - please review');
    } else {
      checks.push('✅ No hardcoded values found');
    }
  } catch (error) {
    checks.push('✅ No hardcoded values found');
  }

  // Display results
  console.log(checks.join('\n'));

  if (checks.some(c => c.startsWith('❌'))) {
    console.log('\n❌ Pre-flight checks failed');
    process.exit(1);
  }

  console.log('\n✅ All checks passed!');
}

preflight();
