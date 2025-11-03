#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function testSupabase() {
  console.log('🧪 Testing Supabase Connection...\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY');
    process.exit(1);
  }

  console.log(`📍 URL: ${supabaseUrl}`);
  console.log(`🔑 Key: ${supabaseKey.substring(0, 20)}...\n`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test tables
  const tables = [
    'model_performance',
    'generation_history',
    'intent_performance',
    'cost_tracking',
    'user_preferences',
    'request_cache'
  ];

  console.log('🔍 Checking tables...\n');

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: exists (${count || 0} rows)`);
      }
    } catch (error) {
      console.log(`❌ ${table}: ${error.message}`);
    }
  }

  // Test insert
  console.log('\n🧪 Testing insert into model_performance...');

  try {
    const testData = {
      model_id: 'test/model-' + Date.now(),
      total_uses: 1,
      successful_uses: 1,
      average_quality: 0.95
    };

    const { data, error } = await supabase
      .from('model_performance')
      .insert(testData)
      .select();

    if (error) {
      console.log(`❌ Insert failed: ${error.message}`);
    } else {
      console.log(`✅ Insert successful:`, data[0]);

      // Clean up test data
      await supabase
        .from('model_performance')
        .delete()
        .eq('model_id', testData.model_id);
      console.log(`✅ Cleanup successful`);
    }
  } catch (error) {
    console.log(`❌ Insert test failed: ${error.message}`);
  }

  console.log('\n✅ Supabase test complete!');
}

testSupabase().catch(console.error);
