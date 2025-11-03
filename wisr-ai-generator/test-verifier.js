#!/usr/bin/env node
/**
 * Test the clickable verifier with a sample signature
 */

import { verifySignatureWithRetry } from './clickable-verifier.js';

const testHTML = `
<table style="max-width: 700px; font-family: Arial, sans-serif; border-collapse: collapse;">
    <tr>
        <td style="padding-right: 15px; vertical-align: middle;">
            <img src="https://via.placeholder.com/80x80/2d5f3f/DAA520?text=JD"
                 alt="Profile"
                 style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover; display: block;">
        </td>
        <td style="vertical-align: middle;">
            <div style="font-size: 18px; font-weight: bold; color: #2d5f3f; margin-bottom: 5px;">
                John Doe
            </div>
            <div style="font-size: 14px; color: #666; margin-bottom: 5px;">
                Loan Officer | NMLS #123456
            </div>
            <div style="font-size: 13px; color: #666; margin-bottom: 3px;">
                <a href="tel:5551234567" style="color: #2d5f3f; text-decoration: none;">📞 (555) 123-4567</a> |
                <a href="mailto:john@lendwisemtg.com" style="color: #2d5f3f; text-decoration: none;">✉️ john@lendwisemtg.com</a>
            </div>
            <div style="font-size: 12px; color: #999; margin-top: 5px;">
                <a href="https://lendwisemtg.com" style="color: #DAA520; text-decoration: none; font-weight: 600;">🌐 lendwisemtg.com</a>
            </div>
        </td>
    </tr>
</table>
`;

const userInfo = {
    name: 'John Doe',
    phone: '(555) 123-4567',
    email: 'john@lendwisemtg.com',
    nmls: '123456'
};

console.log('🧪 Testing Clickable Verifier\n');
console.log('Test signature HTML length:', testHTML.length, 'characters');
console.log('User info:', userInfo);

verifySignatureWithRetry(testHTML, userInfo, 1)
    .then(result => {
        console.log('\n' + '='.repeat(60));
        console.log('📊 VERIFICATION RESULT');
        console.log('='.repeat(60));
        console.log(`Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Issues found: ${result.issues.length}`);
        console.log(`\nChecks:`);
        Object.entries(result.checks).forEach(([key, value]) => {
            console.log(`  ${key.padEnd(20)} ${value}`);
        });

        if (result.issues.length > 0) {
            console.log(`\nIssues:`);
            result.issues.forEach((issue, i) => {
                console.log(`  ${i + 1}. ${issue}`);
            });
        }

        console.log(`\nScreenshot: ${result.screenshot}`);
        console.log('='.repeat(60));

        process.exit(result.passed ? 0 : 1);
    })
    .catch(error => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });
