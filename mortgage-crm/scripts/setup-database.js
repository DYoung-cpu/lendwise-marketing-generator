#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

async function setupDatabase() {
  console.log('🗄️  Setting up Mortgage CRM Database...\n');

  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in .env file');
    console.error('\nPlease add:');
    console.error('  SUPABASE_URL=https://your-project.supabase.co');
    console.error('  SUPABASE_KEY=your-service-role-key\n');
    process.exit(1);
  }

  console.log('✅ Found Supabase credentials');
  console.log(`📍 URL: ${supabaseUrl}\n`);

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test connection
  try {
    console.log('🔌 Testing connection...');
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    if (error && !error.message.includes('does not exist')) {
      throw error;
    }
    console.log('✅ Connection successful\n');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }

  // Read schema file
  console.log('📖 Reading schema file...');
  const schemaPath = join(__dirname, '..', 'database', 'schema.sql');
  let schema;

  try {
    schema = readFileSync(schemaPath, 'utf-8');
    console.log('✅ Schema loaded\n');
  } catch (error) {
    console.error('❌ Could not read schema.sql:', error.message);
    process.exit(1);
  }

  // Split schema into individual statements
  const statements = schema
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  console.log(`📝 Found ${statements.length} SQL statements\n`);
  console.log('⚙️  Executing schema...');
  console.log('─'.repeat(50));

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';

    // Skip comments
    if (stmt.trim().startsWith('--') || stmt.trim().startsWith('/*')) {
      continue;
    }

    // Get statement type for logging
    const stmtType = stmt.match(/^(CREATE|ALTER|INSERT|COMMENT|DROP)/i)?.[0] || 'SQL';

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: stmt });

      if (error) {
        // Some errors are expected (e.g., "already exists")
        if (error.message.includes('already exists') ||
            error.message.includes('does not exist')) {
          console.log(`⚠️  ${stmtType} (${i + 1}/${statements.length}): ${error.message.substring(0, 60)}...`);
        } else {
          console.error(`❌ ${stmtType} (${i + 1}/${statements.length}): ${error.message}`);
          errors.push({ statement: i + 1, error: error.message });
          errorCount++;
        }
      } else {
        console.log(`✅ ${stmtType} (${i + 1}/${statements.length})`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ ${stmtType} (${i + 1}/${statements.length}): ${error.message}`);
      errors.push({ statement: i + 1, error: error.message });
      errorCount++;
    }
  }

  console.log('─'.repeat(50));
  console.log(`\n📊 Results:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}\n`);

  if (errors.length > 0) {
    console.log('⚠️  Some statements failed. This may be normal if tables already exist.');
    console.log('Detailed errors:');
    errors.forEach(e => {
      console.log(`  Statement ${e.statement}: ${e.error.substring(0, 100)}`);
    });
    console.log('');
  }

  // Verify tables exist
  console.log('🔍 Verifying tables...');

  const tablesToCheck = [
    'model_performance',
    'generation_history',
    'intent_performance',
    'cost_tracking',
    'user_preferences',
    'request_cache'
  ];

  let allTablesExist = true;

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Table '${table}' - ${error.message}`);
        allTablesExist = false;
      } else {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        console.log(`✅ Table '${table}' exists (${count || 0} rows)`);
      }
    } catch (error) {
      console.log(`❌ Table '${table}' - ${error.message}`);
      allTablesExist = false;
    }
  }

  console.log('');

  if (allTablesExist) {
    console.log('🎉 Database setup complete!');
    console.log('\n✨ Your Mortgage CRM is ready to learn from every generation!\n');
    return true;
  } else {
    console.log('⚠️  Some tables are missing.');
    console.log('\nTroubleshooting:');
    console.log('1. Make sure you are using the SERVICE ROLE key, not the anon key');
    console.log('2. Check if RLS policies are preventing access');
    console.log('3. Try running the schema.sql file manually in Supabase SQL Editor\n');
    return false;
  }
}

// Run setup
setupDatabase()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
