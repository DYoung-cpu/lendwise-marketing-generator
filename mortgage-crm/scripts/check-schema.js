#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function checkSchema() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  console.log('📋 Checking actual table schemas...\n');

  // Try to select everything to see what columns exist
  const { data, error } = await supabase
    .from('model_performance')
    .select('*')
    .limit(0);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('model_performance columns:', Object.keys(data[0] || {}));
  }

  // Try inserting with minimal data to see what's required
  const { data: insertData, error: insertError } = await supabase
    .from('model_performance')
    .insert({ model_id: 'test-' + Date.now() })
    .select();

  if (insertError) {
    console.log('\nInsert error:', insertError.message);
  } else {
    console.log('\nInserted successfully:', insertData[0]);
    // Clean up
    await supabase.from('model_performance').delete().eq('model_id', insertData[0].model_id);
  }
}

checkSchema();
