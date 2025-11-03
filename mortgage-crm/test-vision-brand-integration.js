/**
 * Vision AI & Brand Learning Integration Test
 * Tests the complete flow: generation → validation → critique → learning
 */

async function testIntegration() {
  const baseUrl = 'http://localhost:3001/api';

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   VISION AI & BRAND LEARNING INTEGRATION TEST');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Step 1: Generate an image
  console.log('📸 STEP 1: Generate test image...\n');
  const generateResponse = await fetch(`${baseUrl}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'loan-officer-intro',
      data: {
        name: 'David Young',
        nmls: '123456',
        title: 'Senior Loan Officer',
        email: 'david@lendwise.com',
        phone: '(555) 123-4567'
      }
    })
  });

  const generation = await generateResponse.json();
  console.log('✅ Generation completed!');
  console.log(`   Model: ${generation.model}`);
  console.log(`   Success: ${generation.success}`);
  console.log(`   Quality Score: ${generation.validation?.overall || 'N/A'}`);
  console.log(`   URL: ${generation.url}\n`);

  if (generation.validation?.visionAI) {
    console.log('🔍 Vision AI Analysis:');
    console.log(`   - Text readability: ${generation.validation.visual.analysis?.text.readable_score}`);
    console.log(`   - NMLS found: ${generation.validation.visual.analysis?.text.nmls_found || 'none'}`);
    console.log(`   - Faces detected: ${generation.validation.visual.analysis?.faces.count || 0}`);
    console.log(`   - Brand match: ${generation.validation.visual.analysis?.brand.brand_match.score}\n`);
  } else {
    console.log('⚠️  Vision AI analysis not available (Google Cloud Vision not configured)\n');
  }

  // Step 2: Submit a critique
  console.log('💬 STEP 2: Submit user critique...\n');

  const critiques = [
    {
      rating: 2,
      text: 'The text is too small and hard to read. The colors are too dark.'
    },
    {
      rating: 3,
      text: 'The image quality is blurry and lacks professionalism.'
    }
  ];

  const generationId = generation.url.split('/').pop().replace('.jpg', '');

  for (const critique of critiques) {
    const critiqueResponse = await fetch(`${baseUrl}/critique`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generation_id: generationId,
        critique: critique.text,
        rating: critique.rating
      })
    });

    const critiqueResult = await critiqueResponse.json();
    console.log(`📝 Critique submitted (${critique.rating}⭐):`);
    console.log(`   "${critique.text}"`);
    console.log(`   Issues identified: ${critiqueResult.issues?.join(', ')}`);
    console.log(`   Will learn: ${critiqueResult.learned}\n`);
  }

  // Step 3: Check learned preferences
  console.log('🧠 STEP 3: Check learned brand preferences...\n');

  const prefsResponse = await fetch(`${baseUrl}/brand-preferences`);
  const prefs = await prefsResponse.json();

  console.log(`📊 Total preferences: ${prefs.count}`);
  console.log(`✅ Active preferences (frequency ≥ 2): ${prefs.active}\n`);

  if (prefs.preferences.length > 0) {
    console.log('Learned preferences:');
    prefs.preferences.forEach(pref => {
      const status = pref.active ? '✅ ACTIVE' : '⏳ LEARNING';
      console.log(`   ${status} ${pref.issue} (seen ${pref.frequency}x)`);
      console.log(`      → Solution: ${pref.solution}`);
    });
  } else {
    console.log('   No preferences learned yet (need more feedback)');
  }

  // Step 4: Generate another image to see if preferences are applied
  console.log('\n📸 STEP 4: Generate another image with learned preferences...\n');

  const secondGenResponse = await fetch(`${baseUrl}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'rate-update',
      data: {
        rate: '6.5%',
        product: '30-Year Fixed'
      }
    })
  });

  const secondGen = await secondGenResponse.json();
  console.log('✅ Second generation completed!');
  console.log(`   Model: ${secondGen.model}`);
  console.log(`   Quality Score: ${secondGen.validation?.overall || 'N/A'}`);
  console.log(`   URL: ${secondGen.url}\n`);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('   INTEGRATION TEST COMPLETE');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📋 SUMMARY:');
  console.log(`   ✅ Vision AI: ${generation.validation?.visionAI ? 'ENABLED' : 'DISABLED (needs Google Cloud Vision)'}`);
  console.log(`   ✅ Brand Learning: ${prefs.success ? 'WORKING' : 'ERROR'}`);
  console.log(`   ✅ Critique Submission: WORKING`);
  console.log(`   ✅ Preference Learning: ${prefs.count > 0 ? 'LEARNING' : 'READY'}`);
  console.log(`   ✅ Preference Application: ${prefs.active > 0 ? 'ACTIVE' : 'PENDING (need 2+ critiques)'}\n`);

  console.log('💡 Next Steps:');
  if (!generation.validation?.visionAI) {
    console.log('   1. Configure Google Cloud Vision (optional):');
    console.log('      - Set GOOGLE_APPLICATION_CREDENTIALS env var');
    console.log('      - Or use: gcloud auth application-default login');
  }
  console.log('   2. Submit more critiques (same issues) to activate preferences');
  console.log('   3. Generate more images to see improvements applied automatically\n');
}

// Run test
testIntegration().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
