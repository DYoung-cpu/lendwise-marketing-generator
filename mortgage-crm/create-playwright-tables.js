import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  'https://bpobvnmzhaeqxflcedsm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwb2J2bm16aGFlcXhmbGNlZHNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA4MDU2NywiZXhwIjoyMDc3NjU2NTY3fQ.VuL2SLRaolM18XnEuscP_stzrc0l7W-xHpliCO_oi2g'
);

console.log('🗄️  Creating Playwright MCP database tables...\n');

// Create tables directly
const tables = [
  {
    name: 'playwright_validations',
    sql: `
      CREATE TABLE IF NOT EXISTS playwright_validations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        generation_id TEXT NOT NULL,
        image_url TEXT NOT NULL,
        dimensions JSONB,
        colors JSONB,
        complexity JSONB,
        score NUMERIC(3,2),
        issues TEXT[],
        has_design_elements BOOLEAN,
        has_proper_composition BOOLEAN,
        has_good_contrast BOOLEAN,
        raw_metrics JSONB,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        validation_duration_ms INTEGER
      )
    `
  },
  {
    name: 'playwright_learning_patterns',
    sql: `
      CREATE TABLE IF NOT EXISTS playwright_learning_patterns (
        pattern_type TEXT PRIMARY KEY,
        trigger_conditions JSONB,
        quality_impact TEXT,
        recommendation TEXT,
        frequency INTEGER DEFAULT 1,
        avg_score_when_present NUMERIC(3,2),
        avg_score_when_absent NUMERIC(3,2),
        confidence NUMERIC(3,2),
        first_seen TIMESTAMPTZ DEFAULT NOW(),
        last_seen TIMESTAMPTZ DEFAULT NOW(),
        active BOOLEAN DEFAULT TRUE
      )
    `
  },
  {
    name: 'playwright_performance_tracking',
    sql: `
      CREATE TABLE IF NOT EXISTS playwright_performance_tracking (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        operation TEXT NOT NULL,
        duration_ms INTEGER,
        success BOOLEAN,
        error_message TEXT,
        image_url TEXT,
        generation_id TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      )
    `
  }
];

for (const table of tables) {
  try {
    // Attempt to query the table (if it exists)
    const { data, error } = await supabase
      .from(table.name)
      .select('*')
      .limit(1);

    if (error && error.message.includes('does not exist')) {
      console.log(`📋 Table "${table.name}" needs to be created in Supabase dashboard`);
      console.log(`   SQL: ${table.sql.trim().substring(0, 80)}...`);
    } else if (error) {
      console.log(`⚠️  Table "${table.name}": ${error.message}`);
    } else {
      console.log(`✅ Table "${table.name}" exists (${data?.length || 0} rows)`);
    }
  } catch (e) {
    console.log(`❌ Error checking table "${table.name}":`, e.message);
  }
}

console.log('\n📊 Please create these tables in Supabase SQL Editor:');
console.log('   1. Go to https://supabase.com/dashboard');
console.log('   2. Select your project');
console.log('   3. Go to SQL Editor');
console.log('   4. Run: PLAYWRIGHT-MCP-DATABASE-SCHEMA.sql');
console.log('\n   Or the system will auto-create on first use (if permissions allow)');
