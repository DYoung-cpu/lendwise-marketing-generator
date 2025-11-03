#!/usr/bin/env node

/**
 * Automatic Supabase Database Setup
 * Runs the schema automatically
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n' + '='.repeat(80));
console.log('🗄️  SUPABASE DATABASE SETUP');
console.log('='.repeat(80));

async function setupDatabase() {
    // Check credentials
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;

    if (!url || !key) {
        console.error('\n❌ Supabase credentials not found in .env');
        process.exit(1);
    }

    console.log('\n✅ Supabase credentials found');
    console.log(`   URL: ${url}`);

    // Read schema file
    console.log('\n📖 Reading database schema...');
    const schemaPath = './database-schema.sql';

    try {
        const schema = await fs.readFile(schemaPath, 'utf-8');
        console.log(`✅ Schema loaded (${schema.length} characters)`);

        // Connect to Supabase
        console.log('\n🔌 Connecting to Supabase...');
        const supabase = createClient(url, key);

        console.log('\n' + '='.repeat(80));
        console.log('⚠️  MANUAL SETUP REQUIRED');
        console.log('='.repeat(80));

        console.log('\nThe Supabase JavaScript client cannot run raw SQL directly.');
        console.log('You need to run the schema in the Supabase SQL Editor.');
        console.log('\n📋 Follow these steps:');
        console.log('\n1. Open your browser and go to:');
        console.log(`   ${url.replace('.supabase.co', '.supabase.co/project/_/sql')}`);
        console.log('\n2. Click "SQL Editor" in the left sidebar');
        console.log('\n3. Click "New query"');
        console.log('\n4. Copy the ENTIRE contents of:');
        console.log('   /mnt/c/Users/dyoun/Active Projects/database-schema.sql');
        console.log('\n5. Paste into the SQL Editor');
        console.log('\n6. Click "Run" (or press Ctrl+Enter)');
        console.log('\n7. You should see: "Database schema created successfully!"');
        console.log('\n8. Verify by clicking "Table Editor" - you should see tables like:');
        console.log('   • perpetual_memory');
        console.log('   • learning_patterns');
        console.log('   • agent_invocations');
        console.log('   • quality_metrics');
        console.log('   • assets_generated');

        console.log('\n' + '='.repeat(80));
        console.log('📄 QUICK COPY:');
        console.log('='.repeat(80));
        console.log('\nI can display the schema for you to copy. Press Enter when ready...');

        // Wait for user
        process.stdin.once('data', async () => {
            console.log('\n' + '='.repeat(80));
            console.log('COPY THIS ENTIRE SCHEMA TO SUPABASE SQL EDITOR:');
            console.log('='.repeat(80));
            console.log('\n' + schema + '\n');
            console.log('='.repeat(80));
            console.log('END OF SCHEMA - Copy everything above');
            console.log('='.repeat(80));

            console.log('\n✅ After running in Supabase, come back and run:');
            console.log('   node check-requirements.js');
            console.log('\nIt should show: "Database connected successfully"');

            process.exit(0);
        });

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

setupDatabase();
