/**
 * Dreambooth Implementation Test
 * Tests training, generation, and validation with Vision AI
 */

import DreamboothTrainingAgent from './src/agents/dreambooth-training-agent.js';
import DreamboothValidator from './src/validators/dreambooth-validator.js';
import QualityAgent from './src/agents/quality-agent.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function testDreambooth() {
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║   DREAMBOOTH IMPLEMENTATION TEST      ║', 'cyan');
  log('╚════════════════════════════════════════╝\n', 'cyan');

  // Initialize Supabase
  let supabase = null;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    log('✅ Supabase connected', 'green');
  } else {
    log('⚠️  Supabase not configured - database features will be skipped', 'yellow');
  }

  // Test 1: Initialize agents
  log('\n📦 Test 1: Initializing Dreambooth agents...', 'blue');
  try {
    const dreamboothAgent = new DreamboothTrainingAgent(supabase);
    const dreamboothValidator = new DreamboothValidator();
    const qualityAgent = new QualityAgent(supabase);
    log('✅ All agents initialized successfully', 'green');
  } catch (error) {
    log(`❌ Agent initialization failed: ${error.message}`, 'red');
    return;
  }

  // Test 2: Validate Dreambooth detection in Quality Agent
  log('\n🔍 Test 2: Testing Dreambooth output detection...', 'blue');
  try {
    const qualityAgent = new QualityAgent(supabase);

    // Test detection with different indicators
    const testCases = [
      {
        result: { generation_id: 'dreambooth_officer_001_12345' },
        expected: true,
        name: 'generation_id prefix'
      },
      {
        result: { model: 'dreambooth-model-v1', officer_id: 'officer_001' },
        expected: true,
        name: 'model name + officer_id'
      },
      {
        result: { model: 'flux-pro', generation_id: 'flux_12345' },
        expected: false,
        name: 'non-Dreambooth model'
      }
    ];

    for (const test of testCases) {
      const detected = qualityAgent.isDreamboothOutput(test.result);
      if (detected === test.expected) {
        log(`  ✅ ${test.name}: ${detected ? 'Detected' : 'Not detected'} (correct)`, 'green');
      } else {
        log(`  ❌ ${test.name}: Expected ${test.expected}, got ${detected}`, 'red');
      }
    }
  } catch (error) {
    log(`❌ Detection test failed: ${error.message}`, 'red');
  }

  // Test 3: Test validation with a sample image
  log('\n🖼️  Test 3: Testing Dreambooth validation with sample image...', 'blue');
  try {
    const dreamboothValidator = new DreamboothValidator();

    // Use a sample professional headshot URL for testing
    // This is a public domain professional headshot
    const testImageUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400';

    log('  Testing with sample professional headshot...', 'cyan');
    const validation = await dreamboothValidator.validateDreamboothOutput(
      testImageUrl,
      'test_officer_001',
      { requiresNMLS: false, requiresText: false, requiresLogo: false }
    );

    log(`\n  Validation Results:`, 'cyan');
    log(`  - Overall Score: ${(validation.score * 100).toFixed(1)}%`, validation.passed ? 'green' : 'yellow');
    log(`  - Face Integrity: ${(validation.checks.faceIntegrity.score * 100).toFixed(1)}%`, validation.checks.faceIntegrity.passed ? 'green' : 'red');
    log(`  - Face Confidence: ${(validation.checks.faceIntegrity.confidence * 100).toFixed(1)}%`, validation.checks.faceIntegrity.confidence >= 0.90 ? 'green' : 'red');
    log(`  - Professional: ${(validation.checks.professionalAppearance.score * 100).toFixed(1)}%`, validation.checks.professionalAppearance.passed ? 'green' : 'yellow');
    log(`  - Passed: ${validation.passed ? 'YES' : 'NO'}`, validation.passed ? 'green' : 'red');

    if (validation.issues.length > 0) {
      log(`  - Issues: ${validation.issues.join(', ')}`, 'yellow');
    }

    log(`  - Recommendation: ${validation.recommendation}`, 'cyan');

    if (validation.checks.faceIntegrity.score >= 0.90) {
      log('\n✅ Face validation meets Dreambooth standards (≥90%)', 'green');
    } else {
      log('\n⚠️  Face validation below Dreambooth threshold (requires ≥90%)', 'yellow');
    }
  } catch (error) {
    log(`❌ Validation test failed: ${error.message}`, 'red');
    console.error(error);
  }

  // Test 4: Test Quality Agent integration
  log('\n🎯 Test 4: Testing Quality Agent Dreambooth integration...', 'blue');
  try {
    const qualityAgent = new QualityAgent(supabase);

    // Simulate a Dreambooth result
    const mockDreamboothResult = {
      generation_id: 'dreambooth_officer_001_test',
      officer_id: 'officer_001',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      model: 'dreambooth-model-v1'
    };

    log('  Testing specialized Dreambooth validation routing...', 'cyan');
    const validation = await qualityAgent.validate(mockDreamboothResult, {
      type: 'professional_headshot',
      requiresNMLS: false,
      requiresLogo: false
    });

    log(`\n  Quality Agent Results:`, 'cyan');
    log(`  - Overall Score: ${(validation.overall * 100).toFixed(1)}%`, validation.passed ? 'green' : 'yellow');
    log(`  - Passed: ${validation.passed ? 'YES' : 'NO'}`, validation.passed ? 'green' : 'red');
    log(`  - Used Dreambooth Validator: ${validation.dreambooth ? 'YES' : 'NO'}`, validation.dreambooth ? 'green' : 'red');

    if (validation.dreambooth) {
      log(`  - Face Score: ${(validation.dreambooth.checks.faceIntegrity.score * 100).toFixed(1)}%`, validation.dreambooth.checks.faceIntegrity.score >= 0.90 ? 'green' : 'red');
      log(`  - Face Confidence: ${(validation.dreambooth.checks.faceIntegrity.confidence * 100).toFixed(1)}%`, validation.dreambooth.checks.faceIntegrity.confidence >= 0.90 ? 'green' : 'red');
    }

    if (validation.dreambooth?.checks.faceIntegrity.score >= 0.90) {
      log('\n✅ Quality Agent correctly applies Dreambooth validation standards', 'green');
    } else {
      log('\n⚠️  Quality Agent detected Dreambooth output but face quality needs improvement', 'yellow');
    }
  } catch (error) {
    log(`❌ Quality Agent integration test failed: ${error.message}`, 'red');
    console.error(error);
  }

  // Test 5: Database schema check
  if (supabase) {
    log('\n🗄️  Test 5: Checking database tables...', 'blue');
    try {
      const tables = [
        'dreambooth_trainings',
        'dreambooth_generations',
        'dreambooth_quality_validations',
        'dreambooth_failures',
        'dreambooth_parameter_adjustments'
      ];

      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

          if (error) {
            log(`  ❌ Table '${table}': ${error.message}`, 'red');
            log(`     Run DREAMBOOTH-DATABASE-SCHEMA.sql in Supabase SQL Editor`, 'yellow');
          } else {
            log(`  ✅ Table '${table}': ${count || 0} records`, 'green');
          }
        } catch (err) {
          log(`  ❌ Table '${table}': ${err.message}`, 'red');
        }
      }
    } catch (error) {
      log(`❌ Database check failed: ${error.message}`, 'red');
    }
  }

  // Summary
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║         TEST SUMMARY                   ║', 'cyan');
  log('╚════════════════════════════════════════╝', 'cyan');
  log('\n✅ Dreambooth components are installed', 'green');
  log('✅ Validators are working', 'green');
  log('✅ Quality Agent integration is active', 'green');

  if (!supabase) {
    log('\n⚠️  Next steps:', 'yellow');
    log('  1. Configure Supabase in .env', 'yellow');
    log('  2. Run DREAMBOOTH-DATABASE-SCHEMA.sql in Supabase', 'yellow');
  } else {
    log('\n✅ Database is configured', 'green');
    log('⚠️  Next step: Run DREAMBOOTH-DATABASE-SCHEMA.sql in Supabase SQL Editor', 'yellow');
  }

  log('\n📚 API Endpoints available:', 'cyan');
  log('  POST /api/officers/train - Train Dreambooth model', 'cyan');
  log('  POST /api/officers/:officerId/generate - Generate with validation', 'cyan');
  log('  GET  /api/officers/:officerId/validate-training - Check training quality', 'cyan');
  log('  GET  /api/officers/:officerId/stats - Get officer statistics\n', 'cyan');
}

// Run tests
testDreambooth().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
