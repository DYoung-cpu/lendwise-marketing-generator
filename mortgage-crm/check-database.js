/**
 * Check Database Tables for Playwright MCP Integration
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpobvnmzhaeqxflcedsm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwb2J2bm16aGFlcXhmbGNlZHNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA4MDU2NywiZXhwIjoyMDc3NjU2NTY3fQ.VuL2SLRaolM18XnEuscP_stzrc0l7W-xHpliCO_oi2g'
);

console.log('\n📊 CHECKING PLAYWRIGHT MCP DATABASE TABLES\n');
console.log('='.repeat(60));

// Check playwright_validations
const { data: validations, error: v_err } = await supabase
  .from('playwright_validations')
  .select('*')
  .order('timestamp', { ascending: false })
  .limit(5);

console.log('\n1. playwright_validations');
if (v_err) {
  console.log(`   ❌ Error: ${v_err.message}`);
} else {
  console.log(`   ✅ Found ${validations?.length || 0} records`);
  if (validations && validations.length > 0) {
    validations.forEach((v, i) => {
      console.log(`   ${i + 1}. Score: ${v.score}, Issues: ${v.issues?.length || 0}, Duration: ${v.validation_duration_ms}ms`);
    });
  }
}

// Check playwright_learning_patterns
const { data: patterns, error: p_err } = await supabase
  .from('playwright_learning_patterns')
  .select('*')
  .order('frequency', { ascending: false })
  .limit(10);

console.log('\n2. playwright_learning_patterns');
if (p_err) {
  console.log(`   ❌ Error: ${p_err.message}`);
} else {
  console.log(`   ✅ Found ${patterns?.length || 0} records`);
  if (patterns && patterns.length > 0) {
    patterns.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.pattern_type}`);
      console.log(`      Impact: ${p.quality_impact}, Frequency: ${p.frequency}x, Confidence: ${(p.confidence * 100).toFixed(0)}%`);
      console.log(`      Recommendation: ${p.recommendation}`);
    });
  }
}

// Check playwright_performance_tracking
const { data: performance, error: perf_err } = await supabase
  .from('playwright_performance_tracking')
  .select('*')
  .order('timestamp', { ascending: false })
  .limit(5);

console.log('\n3. playwright_performance_tracking');
if (perf_err) {
  console.log(`   ❌ Error: ${perf_err.message}`);
} else {
  console.log(`   ✅ Found ${performance?.length || 0} records`);
  if (performance && performance.length > 0) {
    performance.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.operation}: ${p.duration_ms}ms (${p.success ? 'success' : 'failed'})`);
    });
  }
}

console.log('\n' + '='.repeat(60));
console.log('✅ Database check complete\n');

process.exit(0);
