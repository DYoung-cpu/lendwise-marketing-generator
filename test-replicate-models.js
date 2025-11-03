#!/usr/bin/env node

/**
 * Test Replicate Models - Find working model versions
 */

import Replicate from 'replicate';
import dotenv from 'dotenv';
dotenv.config();

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
});

console.log('\n' + '='.repeat(60));
console.log('🔍 TESTING REPLICATE MODELS');
console.log('='.repeat(60));
console.log(`\n🔑 API Token: ${process.env.REPLICATE_API_TOKEN?.substring(0, 10)}...`);

// Test models - simplified list
const modelsToTest = [
    {
        name: 'flux-schnell',
        id: 'black-forest-labs/flux-schnell',
        description: 'Fast, free-tier friendly model'
    },
    {
        name: 'flux-dev',
        id: 'black-forest-labs/flux-dev',
        description: 'Balanced quality model'
    },
    {
        name: 'sdxl',
        id: 'stability-ai/sdxl',
        description: 'Cost-effective SDXL'
    }
];

async function testModel(modelInfo) {
    try {
        console.log(`\n📸 Testing: ${modelInfo.name}`);
        console.log(`   ID: ${modelInfo.id}`);
        console.log(`   Description: ${modelInfo.description}`);

        // Try to get model info
        const response = await fetch(`https://api.replicate.com/v1/models/${modelInfo.id}`, {
            headers: {
                'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
            }
        });

        if (!response.ok) {
            console.log(`   ❌ Status: ${response.status} - ${await response.text()}`);
            return null;
        }

        const data = await response.json();
        const latestVersion = data.latest_version?.id;

        if (latestVersion) {
            console.log(`   ✅ Available!`);
            console.log(`   📋 Latest version: ${latestVersion}`);
            return {
                ...modelInfo,
                version: latestVersion,
                fullRef: `${modelInfo.id}:${latestVersion}`
            };
        } else {
            console.log(`   ⚠️  No version info available`);
            return null;
        }

    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return null;
    }
}

async function main() {
    const workingModels = [];

    for (const model of modelsToTest) {
        const result = await testModel(model);
        if (result) {
            workingModels.push(result);
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit safety
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTS');
    console.log('='.repeat(60));

    if (workingModels.length === 0) {
        console.log('\n❌ No working models found!');
        console.log('\n⚠️  NEXT STEPS:');
        console.log('   1. Add payment method to Replicate account');
        console.log('   2. Visit: https://replicate.com/account/billing');
        console.log('   3. Or use the old Gemini backend temporarily');
        process.exit(1);
    }

    console.log(`\n✅ Found ${workingModels.length} working models:\n`);

    for (const model of workingModels) {
        console.log(`${model.name}:`);
        console.log(`  id: '${model.id}',`);
        console.log(`  version: '${model.version}',`);
        console.log(``);
    }

    console.log('\n💡 RECOMMENDATION:');
    console.log(`   Use: ${workingModels[0].name} (${workingModels[0].description})`);
    console.log(`   Full reference: ${workingModels[0].fullRef}`);

    process.exit(0);
}

main();
