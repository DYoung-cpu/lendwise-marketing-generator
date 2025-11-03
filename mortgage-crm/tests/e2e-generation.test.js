#!/usr/bin/env node

/**
 * End-to-End Generation Test
 *
 * This test verifies the complete workflow:
 * 1. API request → Master Orchestrator
 * 2. Intent analysis → Model selection
 * 3. Image generation via Replicate
 * 4. Quality validation (OCR, spelling, compliance)
 * 5. Learning system records outcome
 * 6. Database stores generation history
 */

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const API_BASE = process.env.API_BASE || 'http://localhost:3001';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Test configuration
const TEST_CONFIG = {
  timeout: 120000, // 2 minutes for image generation
  checkInterval: 2000, // Check every 2 seconds
  maxRetries: 3
};

class E2ETestRunner {
  constructor() {
    this.supabase = null;
    this.testId = `e2e-test-${Date.now()}`;
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  async initialize() {
    console.log('🚀 Initializing End-to-End Test Suite\n');
    console.log(`Test ID: ${this.testId}`);
    console.log(`API Base: ${API_BASE}`);
    console.log(`Timeout: ${TEST_CONFIG.timeout / 1000}s\n`);

    // Initialize Supabase if available
    if (SUPABASE_URL && SUPABASE_KEY) {
      this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log('✅ Supabase client initialized\n');
    } else {
      this.warn('⚠️  Supabase not configured - skipping database tests\n');
    }
  }

  pass(test, details = '') {
    this.results.passed.push(test);
    console.log(`✅ ${test}`);
    if (details) console.log(`   ${details}`);
  }

  fail(test, error) {
    this.results.failed.push({ test, error });
    console.log(`❌ ${test}`);
    console.log(`   Error: ${error}`);
  }

  warn(message) {
    this.results.warnings.push(message);
    console.log(message);
  }

  // Test 1: Server Health Check
  async testServerHealth() {
    console.log('📋 Test 1: Server Health Check');
    console.log('─'.repeat(50));

    try {
      const response = await fetch(`${API_BASE}/api/health`, {
        timeout: 5000
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const health = await response.json();

      this.pass('Server is running', `Status: ${health.status}`);

      if (health.services) {
        if (health.services.replicate?.available) {
          this.pass('Replicate API connected');
        } else {
          this.fail('Replicate API', 'Not available');
        }

        if (health.services.supabase?.available) {
          this.pass('Supabase connected');
        } else {
          this.warn('⚠️  Supabase not connected - will use local memory only');
        }
      }

      console.log('');
      return true;
    } catch (error) {
      this.fail('Server health check', error.message);
      console.log('\n⚠️  Is the server running? Try: npm run dev\n');
      return false;
    }
  }

  // Test 2: Model Discovery
  async testModelDiscovery() {
    console.log('📋 Test 2: Model Discovery');
    console.log('─'.repeat(50));

    try {
      const response = await fetch(`${API_BASE}/api/models`, {
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`Models endpoint failed: ${response.status}`);
      }

      const models = await response.json();

      if (!models || !Array.isArray(models)) {
        throw new Error('Invalid models response format');
      }

      this.pass(`Discovered ${models.length} models`);

      // Check for key models
      const keyModels = [
        'ideogram-ai/ideogram-v3',
        'google/imagen-4-fast',
        'black-forest-labs/flux-1.1-pro'
      ];

      const foundModels = keyModels.filter(modelId =>
        models.some(m => m.id === modelId)
      );

      if (foundModels.length === keyModels.length) {
        this.pass('All key models available', foundModels.join(', '));
      } else {
        this.warn(`⚠️  Some key models missing: ${keyModels.filter(m => !foundModels.includes(m)).join(', ')}`);
      }

      // Check enrichment
      const enrichedModels = models.filter(m => m.schema || m.description);
      if (enrichedModels.length > 0) {
        this.pass(`${enrichedModels.length} models have detailed metadata`);
      }

      console.log('');
      return models;
    } catch (error) {
      this.fail('Model discovery', error.message);
      console.log('');
      return null;
    }
  }

  // Test 3: Simple Text-to-Image Generation
  async testSimpleGeneration() {
    console.log('📋 Test 3: Simple Text-to-Image Generation');
    console.log('─'.repeat(50));

    const request = {
      type: 'rate-update',
      message: 'Test generation - 30-year fixed rate at 6.5%',
      loanOfficer: {
        name: 'E2E Test Officer',
        nmls: '123456',
        phone: '555-0100',
        email: 'test@lendwise.com'
      },
      preferences: {
        fastMode: true, // Use fast model for testing
        includeNMLS: true,
        testMode: true,
        testId: this.testId
      }
    };

    console.log('📤 Sending generation request...');
    console.log(`   Type: ${request.type}`);
    console.log(`   Message: ${request.message}`);
    console.log('');

    try {
      const startTime = Date.now();

      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request),
        timeout: TEST_CONFIG.timeout
      });

      const generationTime = ((Date.now() - startTime) / 1000).toFixed(2);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Generation failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      console.log('📥 Generation response received:');
      console.log(`   Success: ${result.success}`);
      console.log(`   Model: ${result.model || 'Unknown'}`);
      console.log(`   Time: ${generationTime}s`);
      console.log(`   Output URL: ${result.output ? '✅ Generated' : '❌ Missing'}`);
      console.log('');

      if (!result.success) {
        throw new Error(result.error || 'Generation reported failure');
      }

      this.pass('Image generated successfully', `${generationTime}s`);

      if (result.output) {
        this.pass('Output URL returned', result.output.substring(0, 60) + '...');
      } else {
        this.fail('Output URL', 'Missing from response');
      }

      if (result.model) {
        this.pass('Model used', result.model);
      } else {
        this.warn('⚠️  Model information not included in response');
      }

      console.log('');
      return result;
    } catch (error) {
      this.fail('Simple generation', error.message);

      if (error.message.includes('timeout')) {
        console.log('\n⚠️  Generation timed out. This could be normal for larger models.');
        console.log('   Consider increasing TEST_CONFIG.timeout or using fastMode: true\n');
      }

      console.log('');
      return null;
    }
  }

  // Test 4: Validation System
  async testValidation(generationResult) {
    console.log('📋 Test 4: Validation System');
    console.log('─'.repeat(50));

    if (!generationResult || !generationResult.validation) {
      this.warn('⚠️  No validation data available - skipping validation tests\n');
      return;
    }

    const validation = generationResult.validation;

    console.log('Validation Results:');
    console.log(`   Overall Score: ${validation.overall || 'N/A'}`);
    console.log(`   OCR Score: ${validation.ocr?.score || 'N/A'}`);
    console.log(`   Spelling Score: ${validation.spelling?.score || 'N/A'}`);
    console.log(`   Compliance Score: ${validation.compliance?.score || 'N/A'}`);
    console.log('');

    if (validation.overall >= 0.7) {
      this.pass('Overall quality acceptable', `Score: ${validation.overall}`);
    } else if (validation.overall > 0) {
      this.warn(`⚠️  Quality below threshold: ${validation.overall}`);
    }

    if (validation.ocr) {
      if (validation.ocr.textFound) {
        this.pass('OCR detected text', `${validation.ocr.extractedText?.length || 0} chars`);
      } else {
        this.warn('⚠️  OCR found no text in image');
      }
    }

    if (validation.spelling) {
      if (validation.spelling.errors && validation.spelling.errors.length > 0) {
        this.warn(`⚠️  Spelling errors found: ${validation.spelling.errors.join(', ')}`);
      } else {
        this.pass('Spelling check passed');
      }
    }

    if (validation.compliance) {
      if (validation.compliance.nmlsFound) {
        this.pass('NMLS number detected', validation.compliance.nmlsNumber);
      } else {
        this.warn('⚠️  NMLS number not found in image');
      }
    }

    console.log('');
  }

  // Test 5: Database Persistence
  async testDatabasePersistence() {
    console.log('📋 Test 5: Database Persistence');
    console.log('─'.repeat(50));

    if (!this.supabase) {
      this.warn('⚠️  Supabase not configured - skipping database tests\n');
      return;
    }

    try {
      // Check if our test generation was recorded
      const { data: history, error: historyError } = await this.supabase
        .from('generation_history')
        .select('*')
        .eq('user_id', this.testId)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (historyError) {
        throw new Error(`Database query failed: ${historyError.message}`);
      }

      if (history && history.length > 0) {
        this.pass('Generation recorded in database');
        console.log(`   ID: ${history[0].id}`);
        console.log(`   Model: ${history[0].model}`);
        console.log(`   Success: ${history[0].success}`);
        console.log(`   Quality: ${history[0].quality_score || 'N/A'}`);
      } else {
        this.warn('⚠️  Generation not found in database');
        console.log('   This could mean:');
        console.log('   - Database schema not applied yet');
        console.log('   - Learning system not saving to database');
        console.log('   - Using local memory only');
      }

      // Check model_performance table
      const { data: performance, error: perfError } = await this.supabase
        .from('model_performance')
        .select('*')
        .limit(5);

      if (!perfError && performance) {
        this.pass(`Model performance table accessible`, `${performance.length} records`);
      } else if (perfError?.message.includes('does not exist')) {
        this.warn('⚠️  model_performance table does not exist');
        console.log('   Run: node scripts/setup-database.js');
      }

      console.log('');
    } catch (error) {
      this.fail('Database persistence', error.message);
      console.log('');
    }
  }

  // Test 6: Performance Metrics
  async testPerformanceMetrics() {
    console.log('📋 Test 6: Performance Metrics');
    console.log('─'.repeat(50));

    try {
      const response = await fetch(`${API_BASE}/api/performance`, {
        timeout: 5000
      });

      if (!response.ok) {
        throw new Error(`Performance endpoint failed: ${response.status}`);
      }

      const metrics = await response.json();

      console.log('Performance Metrics:');

      if (metrics.topModels && metrics.topModels.length > 0) {
        this.pass(`${metrics.topModels.length} models have performance data`);
        console.log('\n   Top Models:');
        metrics.topModels.slice(0, 3).forEach((model, i) => {
          console.log(`   ${i + 1}. ${model.model}`);
          console.log(`      Uses: ${model.uses}, Quality: ${model.quality}`);
        });
      } else {
        this.warn('⚠️  No performance data yet (expected for first run)');
      }

      if (metrics.intentStats) {
        this.pass('Intent statistics available');
      }

      console.log('');
    } catch (error) {
      this.fail('Performance metrics', error.message);
      console.log('');
    }
  }

  // Final Report
  printSummary() {
    console.log('═'.repeat(50));
    console.log('📊 End-to-End Test Summary');
    console.log('═'.repeat(50));
    console.log('');

    console.log(`✅ Passed: ${this.results.passed.length}`);
    this.results.passed.forEach(test => {
      console.log(`   • ${test}`);
    });
    console.log('');

    if (this.results.failed.length > 0) {
      console.log(`❌ Failed: ${this.results.failed.length}`);
      this.results.failed.forEach(({ test, error }) => {
        console.log(`   • ${test}`);
        console.log(`     ${error}`);
      });
      console.log('');
    }

    if (this.results.warnings.length > 0) {
      console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
      this.results.warnings.forEach(warning => {
        console.log(`   • ${warning.replace('⚠️  ', '')}`);
      });
      console.log('');
    }

    const totalTests = this.results.passed.length + this.results.failed.length;
    const successRate = totalTests > 0
      ? ((this.results.passed.length / totalTests) * 100).toFixed(1)
      : 0;

    console.log(`Success Rate: ${successRate}%`);
    console.log('');

    if (this.results.failed.length === 0) {
      console.log('🎉 All critical tests passed!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Review warnings and address if needed');
      console.log('2. Run with different intent types (rate-update, open-house, testimonial)');
      console.log('3. Test with production models (remove fastMode)');
      console.log('4. Monitor cost tracking and quality scores');
      console.log('');
      return 0; // Success
    } else {
      console.log('⚠️  Some tests failed. Review errors above.');
      console.log('');
      console.log('Troubleshooting:');
      console.log('1. Make sure server is running: npm run dev');
      console.log('2. Check API keys in .env file');
      console.log('3. Verify Supabase schema: node scripts/test-supabase.js');
      console.log('4. Review server logs for detailed errors');
      console.log('');
      return 1; // Failure
    }
  }

  // Main test runner
  async run() {
    await this.initialize();

    const serverHealthy = await this.testServerHealth();
    if (!serverHealthy) {
      console.log('❌ Server health check failed. Cannot continue tests.\n');
      return this.printSummary();
    }

    const models = await this.testModelDiscovery();
    if (!models || models.length === 0) {
      console.log('❌ Model discovery failed. Cannot continue tests.\n');
      return this.printSummary();
    }

    const generationResult = await this.testSimpleGeneration();

    if (generationResult) {
      await this.testValidation(generationResult);
      await this.testDatabasePersistence();
    } else {
      console.log('⚠️  Skipping validation and database tests due to generation failure\n');
    }

    await this.testPerformanceMetrics();

    return this.printSummary();
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new E2ETestRunner();

  runner.run()
    .then(exitCode => {
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('\n💥 Fatal test error:', error);
      process.exit(1);
    });
}

export default E2ETestRunner;
