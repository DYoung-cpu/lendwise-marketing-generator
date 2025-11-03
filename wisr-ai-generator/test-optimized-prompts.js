/**
 * Test Optimized Prompts with Veo 3.1
 * Using Nano's successful text accuracy strategies
 */

import { optimizedPromptsForVeo } from './veo-prompt-optimizer.js';

console.log('\n╔═══════════════════════════════════════════════════════╗');
console.log('║   🎯 OPTIMIZED PROMPTS FOR VEO 3.1                    ║');
console.log('║   (Based on Nano Success Strategies)                  ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

console.log('━'.repeat(60));
console.log('📋 STRATEGY 1: CONTAINER-BASED (Like Nano)');
console.log('━'.repeat(60));
console.log(optimizedPromptsForVeo.rateAlert);
console.log('\n');

console.log('━'.repeat(60));
console.log('📋 STRATEGY 2: ULTRA-EXPLICIT (Letter-by-Letter)');
console.log('━'.repeat(60));
console.log(optimizedPromptsForVeo.rateAlertUltraExplicit);
console.log('\n');

console.log('━'.repeat(60));
console.log('📋 STRATEGY 3: WORD-BY-WORD SPECIFICATION');
console.log('━'.repeat(60));
console.log(optimizedPromptsForVeo.rateAlertWordByWord);
console.log('\n');

console.log('━'.repeat(60));
console.log('📋 STRATEGY 4: REPETITIVE REINFORCEMENT');
console.log('━'.repeat(60));
console.log(optimizedPromptsForVeo.comprehensiveRateAlert);
console.log('\n');

console.log('═'.repeat(60));
console.log('💡 RECOMMENDED TESTING ORDER:');
console.log('═'.repeat(60));
console.log('1. Start with CONTAINER-BASED (closest to Nano success)');
console.log('2. If that fails, try REPETITIVE REINFORCEMENT');
console.log('3. If still failing, try WORD-BY-WORD');
console.log('4. Last resort: ULTRA-EXPLICIT letter-by-letter\n');

console.log('🎯 Each strategy increases explicitness but also prompt length');
console.log('💰 With 195 credits remaining, test 1-2 strategies maximum\n');
