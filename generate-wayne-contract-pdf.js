import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

async function generatePDF() {
    try {
        // Read the HTML file
        const htmlPath = '/mnt/c/Users/dyoun/Downloads/Wayne_Davis_Compensation_Agreement.html';
        const logoPath = '/mnt/c/Users/dyoun/Downloads/lendwise-logo.png';
        const outputPath = '/mnt/c/Users/dyoun/Downloads/Wayne_Davis_Compensation_Agreement.pdf';

        console.log('Reading HTML file...');
        let html = fs.readFileSync(htmlPath, 'utf8');

        console.log('Reading logo and converting to base64...');
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString('base64');
        const logoDataUri = `data:image/png;base64,${logoBase64}`;

        console.log('Updating HTML with logo...');

        // Replace ALL instances of text-based headers with logo
        // All logos same size: 270px (10% smaller than 300px)
        html = html.replace(
            /<div style="font-size: 24pt; font-weight: bold; color: #C5A657; margin-bottom: 5px;">LENDWISE<\/div>\s*<div style="font-size: 18pt; color: #C5A657;">MORTGAGE<\/div>/g,
            `<img src="${logoDataUri}" alt="LendWise Mortgage Logo" style="max-width: 270px; height: auto; margin: 0 auto 10px; display: block;">`
        );

        // Subsequent page headers - same size
        html = html.replace(
            /<div style="font-size: 20pt; font-weight: bold; color: #C5A657; margin-bottom: 5px;">LENDWISE MORTGAGE<\/div>/g,
            `<img src="${logoDataUri}" alt="LendWise Mortgage Logo" style="max-width: 270px; height: auto; margin: 0 auto 10px; display: block;">`
        );

        // Reduce header spacing to fit more content on page 1
        html = html.replace(
            /\.header \{\s*text-align: center;\s*margin-bottom: 20px;\s*border-bottom: 3px solid #C5A657;\s*padding-bottom: 15px;\s*\}/,
            `.header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 3px solid #C5A657;
            padding-bottom: 10px;
        }`
        );

        // Reduce h1 margins
        html = html.replace(
            /h1 \{\s*color: #0047AB;\s*font-size: 18pt;\s*margin: 20px 0 5px 0;\s*text-align: center;\s*\}/,
            `h1 {
            color: #0047AB;
            font-size: 18pt;
            margin: 15px 0 5px 0;
            text-align: center;
        }`
        );

        // Reduce h2 margins
        html = html.replace(
            /h2 \{\s*color: #0047AB;\s*font-size: 13pt;\s*margin-top: 25px;\s*margin-bottom: 12px;/,
            `h2 {
            color: #0047AB;
            font-size: 13pt;
            margin-top: 18px;
            margin-bottom: 10px;`
        );

        // REMOVE ALL FORCED PAGE BREAKS - let content flow naturally
        html = html.replace(/<div class="page-break"><\/div>/g, '');

        // Remove all the "Page X" comment markers and redundant headers
        html = html.replace(/<!-- Page \d+ -->\s*/g, '');

        // Remove all duplicate headers except the first one
        let firstHeaderFound = false;
        html = html.replace(/<div class="header">[\s\S]*?<\/div>/g, (match) => {
            if (!firstHeaderFound) {
                firstHeaderFound = true;
                return match; // Keep the first header
            }
            return ''; // Remove all other headers
        });

        // Add strategic page break after Employment Classification to start Compensation on page 2
        html = html.replace(
            /(<p>Employment classification \(W-2 vs 1099\)[\s\S]*?accordingly\.<\/p>)/,
            '$1\n    <div style="page-break-after: always;"></div>'
        );

        // Reduce body padding for more space
        html = html.replace(
            /body \{\s*font-family: 'Arial', sans-serif;\s*font-size: 10pt;\s*line-height: 1.4;\s*color: #333;\s*max-width: 8in;\s*margin: 0 auto;\s*padding: 20px;/,
            `body {
            font-family: 'Arial', sans-serif;
            font-size: 10pt;
            line-height: 1.3;
            color: #333;
            max-width: 8in;
            margin: 0 auto;
            padding: 15px;`
        );

        // Reduce padding in boxes for more compact layout
        html = html.replace(/padding: 15px;/g, 'padding: 12px;');
        html = html.replace(/padding: 20px;/g, 'padding: 15px;');

        // Make signature section ULTRA compact to fit all 3 signatures on one page
        html = html.replace(
            /\.signature-section \{\s*margin-top: 40px;\s*page-break-inside: avoid;\s*\}/,
            `.signature-section {
            margin-top: 15px;
            page-break-inside: avoid;
        }`
        );

        html = html.replace(
            /\.signature-block \{\s*margin: 30px 0;\s*padding: 20px;\s*border: 1px solid #dee2e6;\s*border-radius: 5px;\s*\}/,
            `.signature-block {
            margin: 8px 0;
            padding: 8px;
            border: 1px solid #dee2e6;
            border-radius: 5px;
        }`
        );

        html = html.replace(
            /\.signature-line \{\s*border-bottom: 1px solid #000;\s*margin: 40px 0 10px 0;\s*min-height: 40px;\s*\}/,
            `.signature-line {
            border-bottom: 1px solid #000;
            margin: 10px 0 3px 0;
            min-height: 15px;
        }`
        );

        // Reduce checkbox section spacing
        html = html.replace(
            /\.checkbox-section \{\s*margin: 20px 0;\s*padding: 15px;/,
            `.checkbox-section {
            margin: 15px 0;
            padding: 10px;`
        );

        html = html.replace(
            /\.checkbox-item \{\s*margin: 15px 0;/,
            `.checkbox-item {
            margin: 8px 0;`
        );

        // REMOVE ALL DATES - they'll be e-signed
        html = html.replace(/<p><strong>Date:<\/strong> 2025-10-27<\/p>/g, '<p><strong>Date:</strong> _______________</p>');
        html = html.replace(/<p><strong>Date:<\/strong><br>2025-10-27<\/p>/g, '<p><strong>Date:</strong> _______________</p>');

        // COMPLETELY REDESIGN SIGNATURE SECTION - Horizontal layout
        // Remove the entire page 8 signature section and restructure
        html = html.replace(
            /(<div class="signature-section">[\s\S]*?<\/div>\s*<div class="footer">[\s\S]*?<\/div>)\s*<div class="page-break"><\/div>\s*<!-- Page 8 -->[\s\S]*?<h2>SIGNATURES<\/h2>[\s\S]*?(<div class="footer">[\s\S]*?<\/div>)/,
            `$1`
        );

        // Create new horizontal signature layout CSS
        html = html.replace(
            /<\/style>/,
            `
        .signatures-horizontal {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-top: 15px;
        }
        .sig-col {
            flex: 1;
            border: 1px solid #dee2e6;
            padding: 8px;
            border-radius: 5px;
        }
        .sig-col h4 {
            color: #0047AB;
            font-size: 10pt;
            margin: 0 0 5px 0;
        }
        .sig-col p {
            margin: 3px 0;
            font-size: 9pt;
        }
        .sig-col .signature-line {
            border-bottom: 1px solid #000;
            margin: 8px 0 3px 0;
            min-height: 12px;
        }
        </style>`
        );

        // Replace EVERYTHING from signature-section through end of document with horizontal layout
        // This removes both the page 7 signature section AND the entire page 8
        html = html.replace(
            /<div class="signature-section">[\s\S]*$/m,
            `<h3 style="margin-top: 15px; margin-bottom: 8px;">SIGNATURES</h3>
            <div class="signatures-horizontal" style="page-break-inside: avoid;">
                <div class="sig-col">
                    <h4>LOAN OFFICER</h4>
                    <p><strong>Name:</strong> Wayne Davis</p>
                    <p><strong>Title:</strong> Loan Officer</p>
                    <p><strong>Signature:</strong></p>
                    <div class="signature-line"></div>
                    <p><strong>Date:</strong> _______________</p>
                </div>
                <div class="sig-col">
                    <h4>COMPANY REPRESENTATIVE</h4>
                    <p><strong>Name:</strong> Tony Nasim</p>
                    <p><strong>Title:</strong> Sr. Loan Officer / Partner</p>
                    <p><strong>Signature:</strong></p>
                    <div class="signature-line"></div>
                    <p><strong>Date:</strong> _______________</p>
                </div>
                <div class="sig-col">
                    <h4>COMPANY REPRESENTATIVE</h4>
                    <p><strong>Name:</strong> David Young</p>
                    <p><strong>Title:</strong> President of Business Development / Partner</p>
                    <p><strong>Signature:</strong></p>
                    <div class="signature-line"></div>
                    <p><strong>Date:</strong> _______________</p>
                </div>
            </div>
</body>
</html>`
        );

        // FIX 1: Remove the repetitive Phase 2 box (it's already in Agreement Terms)
        html = html.replace(
            /<div class="phase-box">\s*<h3 style="color: #0047AB; margin-top: 0;">PHASE 2: STANDARD COMPENSATION \(After 5 Brokered Deals\)<\/h3>[\s\S]*?<\/div>\s*<\/div>/,
            '</div>'
        );

        // FIX 2: Add note about 6-month recapture period fluctuating based on lender
        html = html.replace(
            /(<li>Loan is paid off, refinanced, or satisfied within six \(6\) months of funding date\.<\/li>)/,
            '$1\n        <p style="margin-left: 25px; margin-top: 8px; font-style: italic; color: #666;"><strong>Note:</strong> The six (6) month recapture period is standard, but may fluctuate depending on the specific lender to whom the loan will be sold. The applicable recapture period for each loan will be determined by the investor/lender requirements.</p>'
        );

        // FIX 3: Fix signature alignment - ensure all "Signature:" labels align vertically
        // The issue is David Young's longer title creates extra height
        // Solution: Set fixed height for title area in all signature boxes
        html = html.replace(
            /\.sig-col p \{\s*margin: 3px 0;\s*font-size: 9pt;\s*\}/,
            `.sig-col p {
            margin: 3px 0;
            font-size: 9pt;
        }
        .sig-col p:nth-of-type(2) {
            min-height: 28px;
        }`
        );

        // LEGAL FIX #1: Add indemnification clause after Section 2
        html = html.replace(
            /(<h2>2\. RECAPTURE\/CLAWBACK PROVISIONS<\/h2>[\s\S]*?<p><strong>Collection Method:<\/strong>[\s\S]*?<\/p>)/,
            `$1

    <p><strong>Fraud and Misconduct:</strong> The recapture provisions above apply only to commission amounts. In cases of fraud, misrepresentation, negligence, or willful misconduct by Loan Officer that results in damages to Lendwise Mortgage, borrowers, or third parties, Loan Officer shall be liable for and shall indemnify Lendwise Mortgage for all damages, losses, costs, and legal fees incurred. This indemnification obligation is separate from and in addition to commission recapture rights.</p>`
        );

        // LEGAL FIX #3: Define Tony Nasim's role as Partner
        html = html.replace(
            /(Work with Tony Nasim as your mentor for your first 5 brokered deals\.)/,
            `$1 Tony Nasim is a Partner at Lendwise Mortgage and serves as your designated mentor during the training period.`
        );

        // LEGAL FIX #5: Remove contradictory employee classification (Section 8)
        // Keep only Independent Contractor language
        html = html.replace(
            /<h2>8\. OUTSIDE SALES EMPLOYEE CLASSIFICATION<\/h2>\s*<p><strong>FLSA Exemption:<\/strong>[\s\S]*?<\/p>\s*<p><strong>Basis:<\/strong>[\s\S]*?<\/p>/,
            `<h2>8. INDEPENDENT CONTRACTOR RELATIONSHIP</h2>
    <p><strong>Classification:</strong> Loan Officer is an independent contractor, not an employee of Lendwise Mortgage, Inc. for all purposes including but not limited to: tax withholding, benefits, workers' compensation, and unemployment insurance.</p>
    <p><strong>Control:</strong> Loan Officer maintains control over the manner and means of performing services, subject to compliance with applicable lending regulations and company quality standards. Loan Officer determines own work schedule and location.</p>
    <p><strong>Tax Obligations:</strong> As detailed in Section 12, Loan Officer is solely responsible for all federal and state tax obligations including quarterly estimated tax payments.</p>`
        );

        // LEGAL FIX #7: Change "BANKED LOANS" to "CORRESPONDENT LOANS" globally
        html = html.replace(/BANKED LOANS/g, 'CORRESPONDENT LOANS');
        html = html.replace(/Banked Loans/g, 'Correspondent Loans');
        html = html.replace(/banked loans/g, 'correspondent loans');

        // Update payment timing to 1st and 15th of month
        html = html.replace(
            /Commissions are paid within <strong>two \(2\) business days<\/strong> after loan funding and Lendwise Mortgage receipt of funds\./,
            'Commissions are paid on the <strong>1st and 15th day of each month</strong>, depending upon the loan purchase date by the investor.'
        );

        // MAJOR RESTRUCTURE: Fix Phase 1 and Phase 2 to apply to BOTH loan types
        // Phase 1 = First 5 deals (any combination) = 50/50 split with Tony on BOTH brokered and correspondent
        // Phase 2 = After 5 deals = 85% brokered + 150 BPS correspondent (no Tony split)

        // Replace the entire compensation structure section - using simpler matching
        html = html.replace(
            /<h2>COMPENSATION STRUCTURE<\/h2>[\s\S]*?<h2>1\. PAYMENT TERMS & TIMING<\/h2>/,
            `<h2>COMPENSATION STRUCTURE</h2>

    <p><strong>Your compensation operates in two phases based on total loans funded (brokered + correspondent combined):</strong></p>

    <div class="phase-box">
        <h3 style="color: #0047AB; margin-top: 0;">PHASE 1: TRAINING PERIOD (First 5 Funded Loans - Any Combination)</h3>
        <p>Work with Tony Nasim as your mentor for your first 5 funded loans (brokered and/or correspondent combined). Tony Nasim is a Partner at Lendwise Mortgage and serves as your designated mentor during the training period.</p>

        <p><strong>CORRESPONDENT LOANS (Phase 1):</strong></p>
        <ul>
            <li><strong>You receive:</strong> 75 BPS (0.75%) of loan amount</li>
            <li><strong>Tony Nasim receives:</strong> 75 BPS (0.75%) of loan amount</li>
        </ul>
        <div class="example-box">
            <strong>Example:</strong> $500,000 correspondent loan = You: $3,750, Tony Nasim: $3,750 (Total: 150 BPS)
        </div>
        <p class="important">Maximum Cap: $37,500 per loan for your portion during Phase 1</p>

        <p style="margin-top: 15px;"><strong>BROKERED LOANS (Phase 1):</strong></p>
        <ul>
            <li><strong>You receive:</strong> 50% of brokered commission</li>
            <li><strong>Tony Nasim receives:</strong> 50% of brokered commission</li>
        </ul>
        <div class="example-box">
            <strong>Example:</strong> $10,000 brokered commission = You: $5,000, Tony Nasim: $5,000
        </div>
    </div>

    <div class="phase-box">
        <h3 style="color: #0047AB; margin-top: 0;">PHASE 2: STANDARD COMPENSATION (After 5 Funded Loans)</h3>
        <p>After funding your first 5 loans (any combination of brokered and correspondent), you automatically transition to standard compensation. Tony Nasim no longer receives any split.</p>

        <p><strong>CORRESPONDENT LOANS (Phase 2):</strong></p>
        <ul>
            <li><strong>You receive:</strong> 150 BPS (1.50%) of loan amount on all closed correspondent loans</li>
        </ul>
        <div class="example-box">
            <strong>Examples:</strong> $500,000 loan = $7,500 | $1,000,000 loan = $15,000
        </div>
        <p class="important">Maximum Cap: $75,000 per loan</p>

        <p style="margin-top: 15px;"><strong>BROKERED LOANS (Phase 2):</strong></p>
        <ul>
            <li><strong>You receive:</strong> 85% of brokered commission</li>
            <li><strong>LendWise Mortgage receives:</strong> 15% of brokered commission</li>
        </ul>
        <div class="example-box">
            <strong>Example:</strong> $10,000 brokered commission = You: $8,500, LendWise: $1,500
        </div>
    </div>

    <h2>1. PAYMENT TERMS & TIMING</h2>`
        );

        // Update the Agreement Terms summary box to reflect corrected phase structure
        html = html.replace(
            /<p><strong>CORRESPONDENT LOANS:<\/strong> Fixed 150 BPS \(1\.50%\) of loan amount, capped at \$75,000 per loan\. No phase structure applies\.<\/p>\s*<p><strong>BROKERED LOANS - Phase 1 \(Training\):<\/strong> First 5 brokered deals - LO receives 50%, Tony Nasim receives 50%\.<\/p>\s*<p><strong>BROKERED LOANS - Phase 2 \(Standard\):<\/strong> After 5 brokered deals - LO receives 85%, Lendwise Mortgage receives 15%\.<\/p>/,
            `<p><strong>PHASE 1 (Training - First 5 Funded Loans Total):</strong></p>
        <ul style="margin-left: 25px; margin-top: 5px; margin-bottom: 10px;">
            <li>Correspondent loans: LO receives 75 BPS, Tony Nasim receives 75 BPS (cap: $37,500 per loan for LO)</li>
            <li>Brokered loans: LO receives 50%, Tony Nasim receives 50%</li>
        </ul>
        <p><strong>PHASE 2 (Standard - After 5 Funded Loans):</strong></p>
        <ul style="margin-left: 25px; margin-top: 5px;">
            <li>Correspondent loans: LO receives 150 BPS (1.50%) of loan amount (cap: $75,000 per loan)</li>
            <li>Brokered loans: LO receives 85%, Lendwise Mortgage receives 15%</li>
        </ul>
        <p style="margin-top: 10px;"><em>Tony Nasim receives no compensation after Phase 1 completion.</em></p>`
        );

        // Update Section 3 explanation to reflect phase structure applies to both
        html = html.replace(
            /(<h2>3\. CORRESPONDENT LOAN COMPENSATION STRUCTURE<\/h2>\s*<p><strong>BROKERED LOANS vs CORRESPONDENT LOANS:<\/strong><\/p>\s*<p><strong>Brokered Loans:<\/strong>[\s\S]*?<\/p>\s*<p><strong>Correspondent Loans[\s\S]*?<\/p>\s*<p><strong>KEY DISTINCTION:<\/strong>[\s\S]*?<\/p>)\s*<h3>Correspondent Loan BPS Calculation Examples:<\/h3>\s*<ul>[\s\S]*?<\/ul>\s*<p class="important">Maximum Cap:[\s\S]*?<\/p>\s*<p><strong>Dual Compensation Structure:<\/strong>[\s\S]*?<\/p>/,
            `$1

    <h3>Phase Structure Application:</h3>
    <p><strong>Phase 1 (Training):</strong> Your first 5 funded loans (any combination of brokered and correspondent) are compensated at training rates with 50/50 split to mentor Tony Nasim.</p>
    <p><strong>Phase 2 (Standard):</strong> After completing 5 funded loans, all subsequent loans (both brokered and correspondent) are compensated at standard rates. No mentor split applies.</p>

    <h3>Correspondent Loan BPS Calculation Examples (Phase 2):</h3>
    <ul>
        <li>$300,000 loan × 150 BPS = $4,500 commission</li>
        <li>$500,000 loan × 150 BPS = $7,500 commission</li>
        <li>$750,000 loan × 150 BPS = $11,250 commission</li>
    </ul>
    <p class="important">Maximum Cap: Correspondent loan commissions are capped at $75,000 per loan in Phase 2 ($37,500 for your portion in Phase 1).</p>

    <h3>Correspondent Loan BPS Calculation Examples (Phase 1):</h3>
    <ul>
        <li>$300,000 loan × 75 BPS = $2,250 to you, $2,250 to Tony Nasim</li>
        <li>$500,000 loan × 75 BPS = $3,750 to you, $3,750 to Tony Nasim</li>
        <li>$750,000 loan × 75 BPS = $5,625 to you, $5,625 to Tony Nasim</li>
    </ul>`
        );

        // LEGAL FIX #13: Add compensation lock provision after Section 12
        html = html.replace(
            /(<h2>12\. INDEPENDENT CONTRACTOR STATUS<\/h2>[\s\S]*?<p><strong>Business Expenses:<\/strong>[\s\S]*?<\/p>)/,
            `$1

    <h2>13. COMPENSATION LOCK & MODIFICATION</h2>
    <p><strong>Compensation Lock:</strong> The compensation structure applicable to any loan is determined by the agreement in effect on the date Lendwise Mortgage receives a complete loan application from the borrower. Any subsequent amendments to this compensation agreement shall not affect compensation for loans already in the pipeline (application received prior to amendment).</p>
    <p><strong>Quarterly BPS Adjustments:</strong> Loan Officer's correspondent loan compensation rate is currently set at 150 BPS (1.50%) on all closed correspondent loans. This rate may be modified on a quarterly basis (January 1, April 1, July 1, and October 1) or at any time prior to Loan Officer submitting their first loan application, upon mutual written agreement between Loan Officer and Lendwise Mortgage. Any rate adjustments will apply prospectively to new loan applications only, in accordance with the compensation lock provision above.</p>
    <p><strong>Amendments:</strong> As stated in the Legal Provisions section, this agreement may only be amended by written document signed by both parties. No verbal modifications are valid.</p>
    <p><strong>Good Faith:</strong> Both parties agree to negotiate any compensation modifications in good faith and with reasonable advance notice (minimum 30 days) to allow Loan Officer to complete pipeline under existing terms.</p>`
        );

        // LEGAL FIX #15: Add IP ownership clause after new Section 13
        html = html.replace(
            /(<h2>13\. COMPENSATION LOCK & MODIFICATION<\/h2>[\s\S]*?<p><strong>Good Faith:<\/strong>[\s\S]*?<\/p>)/,
            `$1

    <h2>14. INTELLECTUAL PROPERTY & WORK PRODUCT</h2>
    <p><strong>Company Property:</strong> All marketing materials, presentations, templates, systems, processes, training materials, and other work product created by Loan Officer during the term of this agreement using company resources, time, or confidential information are the exclusive property of Lendwise Mortgage, Inc.</p>
    <p><strong>License to Use:</strong> During the term of this agreement, Loan Officer is granted a non-exclusive license to use company-owned materials solely for the purpose of originating loans on behalf of Lendwise Mortgage.</p>
    <p><strong>Return of Materials:</strong> Upon termination, Loan Officer must immediately cease using all company materials and return or destroy all copies (physical and digital) within 48 hours. This includes but is not limited to: marketing presentations, rate sheets, borrower education materials, email templates, and social media content.</p>
    <p><strong>Personal Materials:</strong> Loan Officer retains ownership of marketing materials created entirely on their own time using their own resources and not incorporating any Lendwise confidential information, provided such materials do not use the Lendwise name, logo, or branding.</p>`
        );

        // Update section numbers after insertion
        html = html.replace(/<h2>LEGAL PROVISIONS<\/h2>/, '<h2>15. LEGAL PROVISIONS</h2>');
        html = html.replace(/<h2>AGREEMENT TERMS<\/h2>/, '<h2>16. AGREEMENT TERMS</h2>');

        // Add critical page-break-inside: avoid to prevent awkward splits
        // Keep the entire blue "AGREEMENT TERMS" box together
        html = html.replace(
            /<div style="background-color: #f0f7ff; padding: 20px; border: 2px solid #0047AB;/g,
            '<div style="background-color: #f0f7ff; padding: 15px; border: 2px solid #0047AB; page-break-inside: avoid;'
        );

        // Keep each phase-box together
        html = html.replace(
            /\.phase-box \{\s*background-color: #fff;\s*border: 2px solid #C5A657;\s*padding: 15px;\s*margin: 15px 0;\s*border-radius: 5px;\s*\}/,
            `.phase-box {
            background-color: #fff;
            border: 2px solid #C5A657;
            padding: 12px;
            margin: 12px 0;
            border-radius: 5px;
            page-break-inside: avoid;
        }`
        );

        // Keep info sections together
        html = html.replace(
            /\.info-section \{\s*background-color: #f8f9fa;\s*padding: 15px;\s*border-radius: 5px;\s*margin-bottom: 20px;\s*border: 1px solid #dee2e6;\s*\}/,
            `.info-section {
            background-color: #f8f9fa;
            padding: 12px;
            border-radius: 5px;
            margin-bottom: 15px;
            border: 1px solid #dee2e6;
            page-break-inside: avoid;
        }`
        );

        // Force AGREEMENT TERMS to start on new page
        html = html.replace(
            /<h2>AGREEMENT TERMS<\/h2>/,
            '<h2 style="page-break-before: always;">AGREEMENT TERMS</h2>'
        );

        // Keep entire LOAN OFFICER ACKNOWLEDGMENT section together
        html = html.replace(
            /<h2>LOAN OFFICER ACKNOWLEDGMENT<\/h2>/,
            '<h2 style="page-break-before: always;">LOAN OFFICER ACKNOWLEDGMENT</h2>'
        );

        // Reduce h3 margins
        html = html.replace(
            /h3 \{\s*color: #0047AB;\s*font-size: 11pt;\s*margin-top: 15px;\s*margin-bottom: 8px;\s*\}/,
            `h3 {
            color: #0047AB;
            font-size: 11pt;
            margin-top: 12px;
            margin-bottom: 6px;
        }`
        );

        // Save updated HTML temporarily
        const tempHtmlPath = '/mnt/c/Users/dyoun/Downloads/Wayne_Davis_Contract_with_Logo.html';
        fs.writeFileSync(tempHtmlPath, html);
        console.log(`Updated HTML saved to: ${tempHtmlPath}`);

        // Generate PDF
        console.log('Launching browser to generate PDF...');
        const browser = await chromium.launch();
        const page = await browser.newPage();

        await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle' });

        console.log('Generating PDF...');
        await page.pdf({
            path: outputPath,
            format: 'Letter',
            margin: {
                top: '0.5in',
                right: '0.5in',
                bottom: '0.75in',
                left: '0.5in'
            },
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: '<div></div>', // Empty header - no logo on pages 2+
            footerTemplate: `
                <div style="width: 100%; text-align: center; font-size: 8pt; color: #999; padding-bottom: 10px;">
                    <span>Lendwise Mortgage, Inc. - NMLS #2702455 | DRE #02282825 | Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
                </div>
            `
        });

        await browser.close();

        console.log('✅ PDF generated successfully!');
        console.log(`📄 HTML with logo: ${tempHtmlPath}`);
        console.log(`📄 PDF: ${outputPath}`);

    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        process.exit(1);
    }
}

generatePDF();
