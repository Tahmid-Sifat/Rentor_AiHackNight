import type { CaseData, UploadedDocument } from '@/lib/case/caseTypes'

export const DEMO_CASE_DATA: CaseData = {
  tenantName: 'Aisha Khan',
  landlordName: 'ABC Lettings',
  depositAmount: 1200,
  totalDeductionAmount: 775,
  tenancyStartDate: '2024-09-01',
  tenancyEndDate: '2025-08-31',
  depositScheme: 'Unknown',
  issueCategory: 'Cleaning',
  userQuestion:
    'My landlord wants to deduct £775 from my deposit for cleaning, repainting, a mattress stain, and an admin fee. Can I dispute this and what should I write back?',
}

export const DEMO_DOCUMENTS: UploadedDocument[] = [
  {
    name: 'tenancy-agreement.txt',
    type: 'tenancy-agreement',
    text: `ASSURED SHORTHOLD TENANCY AGREEMENT
Property: Flat 4, 22 Birchwood Road, Manchester, M14 5TR
Landlord: ABC Lettings Ltd
Tenant: Aisha Khan
Tenancy Start Date: 1 September 2024
Tenancy End Date: 31 August 2025
Monthly Rent: £950
Deposit Amount: £1,200

CLAUSE 5 – The Tenant must return the Property in similar condition to check-in, fair wear and tear excepted.
CLAUSE 6 – If the Property requires additional cleaning beyond normal standards at end of tenancy, reasonable cost may be deducted. Any clause requiring professional cleaning regardless of condition is unenforceable under the Tenant Fees Act 2019.
CLAUSE 7 – Minor marks consistent with normal habitation and fair wear and tear are not considered damage.
CLAUSE 8 – Deposit of £1,200 held as security. Protected in accordance with Housing Act 2004. Either party may refer dispute to deposit protection scheme ADR.`,
  },
  {
    name: 'check-in-inventory.txt',
    type: 'inventory',
    text: `CHECK-IN INVENTORY REPORT
Property: Flat 4, 22 Birchwood Road, Manchester, M14 5TR
Date: 1 September 2024

HALLWAY: Light scuffs near door frame and along lower half of left wall.
LIVING ROOM: Carpet worn in central area. Light marks near light switch.
KITCHEN: Oven shows signs of previous use, light grease marks on oven door glass and interior base. Hobs have light marks.
BEDROOM: Light scuffs in two places. Small mark near door.
BATHROOM: Minor limescale on shower head and tap.
MATTRESS: Good condition. Small mark visible on the right side seam area. Approximately 3cm diameter. Pre-existing.

GENERAL NOTES: Property cleaned to domestic standard. NOT professionally cleaned prior to this tenancy.
Tenant Signature: Aisha Khan — Date: 1 September 2024`,
  },
  {
    name: 'check-out-report.txt',
    type: 'checkout',
    text: `CHECK-OUT REPORT
Property: Flat 4, 22 Birchwood Road, Manchester, M14 5TR
Date: 31 August 2025

HALLWAY: Scuffs near door frame and lower left wall — similar to check-in condition.
LIVING ROOM: Carpet worn in central area. Some additional staining near kitchen entrance.
KITCHEN: Oven requires further cleaning. Grease build-up on oven door glass and interior — condition worse than check-in.
BEDROOM: Light scuffs in same locations as check-in. No new damage.
BATHROOM: Clean. Some limescale.
MATTRESS: Visible stain on TOP SURFACE of mattress. Approximately 15-20cm diameter stain on top centre. Different location from check-in seam mark.

GENERAL NOTES: Property generally in reasonable condition. Oven requires professional clean. Mattress has new visible stain not present at check-in.`,
  },
  {
    name: 'landlord-deductions-email.txt',
    type: 'email',
    text: `From: ABC Lettings Ltd
To: Aisha Khan
Date: 5 September 2025

Dear Aisha,

Following check-out, we propose the following deductions from your £1,200 deposit:

- £300 professional cleaning (oven required specialist cleaning due to grease build-up)
- £220 repainting hallway and bedroom (scuffs and marks)
- £180 mattress replacement contribution (visible stain)
- £75 administration fee for arranging contractors

TOTAL: £775

Please confirm you agree to release £775. If we do not hear from you within 10 days, we will apply to the deposit scheme for release of funds.

Regards,
Sarah Thompson, ABC Lettings Ltd`,
  },
]
