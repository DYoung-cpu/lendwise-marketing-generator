# Loan Officer Compensation Agreements

This project contains the compensation agreement documents for LendWise Mortgage loan officers.

## Project Structure

```
LO Comp Agreement/
├── PDFs/                                      # Final compensation agreement PDFs
│   ├── Wayne_Davis_Compensation_Agreement.pdf
│   └── Mohamed_Hassan_Compensation_Agreement.pdf
├── templates/                                 # HTML templates for agreements
│   └── Wayne_Davis_Compensation_Agreement.html
├── assets/                                    # Shared assets
│   └── lendwise-logo.png
├── generate-wayne-pdf.js                      # PDF generation script
└── README.md                                  # This file
```

## Current Loan Officers

### Wayne Davis
- **File**: `PDFs/Wayne_Davis_Compensation_Agreement.pdf`
- **Status**: Active
- **Compensation Structure**:
  - **Phase 1** (First 5 funded loans - any combination):
    - Correspondent: 75 BPS to LO, 75 BPS to Tony Nasim (mentor)
    - Brokered: 50/50 split with Tony Nasim
  - **Phase 2** (After 5 funded loans):
    - Correspondent: 150 BPS (1.50%) - currently, adjustable quarterly or before first loan
    - Brokered: 85% to LO, 15% to LendWise
- **Payment Schedule**: 1st and 15th of each month (based on loan purchase date)
- **Start Date**: 2025-10-27

### Mohamed (Moe) Hassan
- **File**: `PDFs/Mohamed_Hassan_Compensation_Agreement.pdf`
- **Status**: Active
- **Compensation Structure**: [To be documented if needed]

## Generating Wayne's PDF

To regenerate Wayne's compensation agreement PDF:

```bash
cd "/mnt/c/Users/dyoun/Active Projects/LO Comp Agreement"
node generate-wayne-pdf.js
```

This will:
1. Read the HTML template from `templates/Wayne_Davis_Compensation_Agreement.html`
2. Apply all modifications (legal fixes, phase structure, formatting)
3. Embed the LendWise logo from `assets/lendwise-logo.png`
4. Generate the final PDF in `PDFs/Wayne_Davis_Compensation_Agreement.pdf`

## Key Features of Wayne's Agreement

### Legal Protections
- ✅ Independent Contractor classification (not employee)
- ✅ Indemnification clause (separate from commission recapture)
- ✅ Intellectual property ownership defined
- ✅ Compensation lock provision (protects pipeline during amendments)
- ✅ Quarterly BPS adjustment capability
- ✅ Recapture/clawback provisions for early payoffs

### Compensation Details
- **Phase Structure**: Both brokered AND correspondent loans have Phase 1/Phase 2
- **Mentor Split**: Tony Nasim receives 50% of ALL commissions during first 5 deals (any type)
- **Post-Training**: Tony receives nothing after first 5 deals
- **Correspondent BPS**: Currently 150 BPS, adjustable quarterly or before first loan submission
- **Payment Timing**: 1st and 15th of month (based on investor purchase date)
- **Caps**: $75,000 per loan in Phase 2, $37,500 per loan in Phase 1 (for LO portion)

### Document Formatting
- Professional PDF with LendWise owl logo on page 1 only
- Horizontal signature layout (Wayne, Tony Nasim, David Young)
- No awkward page breaks or blank pages
- Footer with company info (NMLS #2702455, DRE #02282825)
- All dates blank for e-signature readiness

## Making Changes

### To Modify Wayne's Agreement:

1. **Edit the HTML template**: `templates/Wayne_Davis_Compensation_Agreement.html`
2. **OR edit the script**: `generate-wayne-pdf.js` (if adding new legal provisions or structural changes)
3. **Regenerate**: Run `node generate-wayne-pdf.js`

### To Create New LO Agreement:

1. Duplicate `templates/Wayne_Davis_Compensation_Agreement.html`
2. Update loan officer details (name, start date, compensation structure)
3. Copy and modify `generate-wayne-pdf.js` to point to new template
4. Generate new PDF
5. Add to this README

## Script Modifications Applied

The `generate-wayne-pdf.js` script applies the following transformations:

1. **Logo embedding**: Base64 encodes and inserts logo
2. **Phase structure**: Rewrites compensation to show both loan types have phases
3. **Legal fixes**:
   - Indemnification clause
   - Independent contractor classification
   - Compensation lock provision
   - Quarterly BPS adjustment language
   - IP ownership clause
4. **Terminology**: Changes "banked loans" to "correspondent loans" globally
5. **Payment timing**: Updates to 1st/15th of month
6. **Formatting**: Optimizes page breaks, signature layout, spacing
7. **Tony Nasim's role**: Defined as Partner and mentor

## Notes

- All compensation rates can be negotiated per loan officer
- Phase structure (first 5 deals) is standard for new LOs
- Recapture period is 6 months standard but may vary by investor
- All agreements require signatures from: LO, Tony Nasim (Partner), David Young (President)

## Version History

- **2025-10-28**: Initial project creation with Wayne and Moe agreements
  - Fixed "$1" phantom text bug
  - Added quarterly BPS adjustment provision
  - Removed LendWise retention mention on correspondent loans
  - Updated payment timing to 1st/15th of month

---

**Project Owner**: David Young, LendWise Mortgage
**Last Updated**: 2025-10-28
