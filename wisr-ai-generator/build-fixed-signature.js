import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE64_FILE = path.join(__dirname, 'orly-hakim-bg-base64.txt');
const OUTPUT_FILE = path.join(__dirname, 'orly-hakim-signature-fixed.html');

async function buildFixed() {
    console.log('🔧 Building FIXED signature with overlay...\n');

    const base64 = await fs.promises.readFile(BASE64_FILE, 'utf-8');

    const html = `<!-- Orly Hakim - LendWise Mortgage Email Signature (FIXED - Gmail Compatible) -->
<table cellpadding="0" cellspacing="0" border="0" style="width: 700px; max-width: 700px; height: 200px; background-image: url('data:image/png;base64,${base64.trim()}'); background-size: 700px 200px; background-repeat: no-repeat; background-position: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; border-collapse: collapse;">
    <tbody>
        <tr>
            <td colspan="3" style="height: 125px; padding: 0;"></td>
        </tr>
        <tr style="height: 60px;">
            <td style="width: 325px; padding: 0;"></td>
            <td style="width: 350px; padding: 10px 5px; vertical-align: middle;">
                <div style="text-align: center; line-height: 1.6;">
                    <a href="tel:3109222599" style="color: #DAA520; font-size: 12px; font-weight: bold; text-decoration: none; margin: 0 8px; display: inline-block;">📞 310-922-2599</a>
                    <a href="mailto:orly@lendwisemtg.com" style="color: #DAA520; font-size: 12px; font-weight: bold; text-decoration: none; margin: 0 8px; display: inline-block;">✉️ orly@lendwisemtg.com</a>
                    <a href="https://www.orlyhakimi.com" target="_blank" style="color: #DAA520; font-size: 12px; font-weight: bold; text-decoration: none; margin: 0 8px; display: inline-block;">🌐 www.orlyhakimi.com</a>
                </div>
            </td>
            <td style="width: 25px; padding: 0;"></td>
        </tr>
        <tr>
            <td colspan="3" style="height: 15px; padding: 0;"></td>
        </tr>
    </tbody>
</table>

<div style="width: 700px; max-width: 700px; text-align: center; padding: 10px 0; background: #f9f9f9; border-top: 2px solid #DAA520; font-family: Arial, sans-serif; margin-top: 5px;">
    <a href="https://lendwisemtg.com" target="_blank" style="color: #1B4D3E; font-size: 11px; font-weight: 500; text-decoration: none; margin: 0 8px;">🏠 LendWiseMTG.com</a>
    <span style="color: #666; margin: 0 2px;">|</span>
    <a href="tel:8187237376" style="color: #1B4D3E; font-size: 11px; font-weight: 500; text-decoration: none; margin: 0 8px;">📞 (818) 723-7376</a>
    <span style="color: #666; margin: 0 2px;">|</span>
    <a href="https://www.google.com/maps/search/?api=1&query=21800+Oxnard+St+220+Woodland+Hills+CA+91367" target="_blank" style="color: #1B4D3E; font-size: 11px; font-weight: 500; text-decoration: none; margin: 0 8px;">📍 21800 Oxnard St #220, Woodland Hills, CA 91367</a>
</div>

<div style="font-family: Arial, sans-serif; font-size: 9px; color: #666; margin-top: 10px; line-height: 1.4; max-width: 700px;">
    <p style="margin: 4px 0;"><strong>NMLS: 1017858</strong> | 5016 N. Pkwy Calabasas, Ste. 200, Calabasas, CA 91302</p>
    <p style="margin: 4px 0;"><strong>Confidentiality Notice:</strong> This message and its contents are confidential and intended solely for the addressee. If you are not the intended recipient, please delete this message and notify the sender.</p>
    <p style="margin: 4px 0;"><strong>IRS Circular 230 Disclosure:</strong> Any U.S. federal tax advice contained in this communication is not intended or written to be used, and cannot be used, for the purpose of avoiding penalties under the Internal Revenue Code or promoting, marketing, or recommending any transaction or matter.</p>
    <p style="margin: 4px 0;">Priority Financial Network is a dba of PFN Lending Group, Inc., NMLS ID #103098.</p>
</div>`;

    await fs.promises.writeFile(OUTPUT_FILE, html);
    console.log('✅ Fixed signature saved!\n');
    console.log('Key fixes:');
    console.log('- Text now overlays ON the background image');
    console.log('- Contact info positioned in red box area (125px from top)');
    console.log('- Gold text color (#DAA520) for visibility');
    console.log('- Footer separate from main signature');
    console.log('\nFile: orly-hakim-signature-fixed.html');
}

buildFixed().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
