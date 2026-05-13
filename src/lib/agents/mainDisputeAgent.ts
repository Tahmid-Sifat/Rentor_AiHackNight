import { chatComplete, isValidJsonObject } from '@/lib/ai/llmClient'
import { MAIN_AGENT_SYSTEM, buildMainAgentPrompt } from '@/lib/ai/promptTemplates'
import { safeJsonParse } from '@/lib/utils/safeJsonParse'
import type { MainAgentResponse } from '@/lib/case/caseTypes'

const FALLBACK: MainAgentResponse = {
  summary:
    'Based on the information provided, you may have grounds to dispute several of the proposed deductions. The repainting charge and admin fee appear particularly challengeable. The cleaning charge may be partially disputable depending on the check-in condition. The mattress charge has some risk as a new stain is noted at check-out.',
  deductionAnalysis: [
    {
      deductionType: 'Cleaning',
      amount: '300',
      position: 'Partially dispute',
      strength: 'Medium',
      reasoning:
        'The property was not professionally cleaned at check-in. The oven shows worsened condition at check-out compared to check-in. However, you should request an itemised invoice and evidence of check-in cleaning standard.',
      evidenceUsed: ['check-in-inventory.txt', 'check-out-report.txt'],
      missingEvidence: ['Professional cleaning invoice', 'Check-in cleaning evidence'],
      citations: ['KB1', 'DOC1', 'DOC2'],
    },
    {
      deductionType: 'Repainting',
      amount: '220',
      position: 'Dispute',
      strength: 'Strong',
      reasoning:
        'The check-in inventory already notes scuffs in the hallway and bedroom. Normal scuffs after a 12-month tenancy are fair wear and tear. No new significant damage is noted in the check-out report beyond what was present at check-in.',
      evidenceUsed: ['check-in-inventory.txt', 'check-out-report.txt'],
      missingEvidence: ['Decorator invoice', 'Photos showing damage beyond wear and tear'],
      citations: ['KB2', 'DOC1', 'DOC2'],
    },
    {
      deductionType: 'Mattress stain',
      amount: '180',
      position: 'Partially dispute',
      strength: 'Medium',
      reasoning:
        'The check-in inventory notes a pre-existing mark on the seam. The check-out report describes a new visible stain on the top surface in a different location. If the new stain is genuine, a contribution may be appropriate, but the landlord must account for the age of the mattress. Request evidence that this is a new stain, not the pre-existing mark.',
      evidenceUsed: ['check-in-inventory.txt', 'check-out-report.txt'],
      missingEvidence: ['Dated photos clearly showing new stain location', 'Mattress age and purchase receipt'],
      citations: ['KB3', 'DOC1', 'DOC2'],
    },
    {
      deductionType: 'Admin fee',
      amount: '75',
      position: 'Dispute',
      strength: 'Strong',
      reasoning:
        'An administration fee for arranging contractors is not a permitted payment under the Tenant Fees Act 2019. This is not an actual loss or damage — it is an admin charge, which is prohibited unless it falls within the narrow permitted default fee categories.',
      evidenceUsed: ['Tenant Fees Act knowledge base'],
      missingEvidence: [],
      citations: ['KB4', 'DOC3'],
    },
  ],
  draftEmail: `Subject: Dispute of Proposed Deposit Deductions – Flat 4, 22 Birchwood Road

Dear ABC Lettings,

Thank you for your email of 5 September 2025 setting out proposed deductions from my deposit of £1,200.

I do not agree to the release of £775 at this stage and wish to formally dispute several of the proposed deductions.

**Cleaning (£300):** I note that the property was not professionally cleaned at the start of the tenancy, as documented in the check-in inventory. I am happy to cover the cost of any additional cleaning required beyond the standard at check-in, but I dispute a full professional clean charge. Please provide an itemised invoice and evidence of the check-in standard.

**Repainting (£220):** The check-in inventory clearly notes scuffs in the hallway and bedroom walls. After a 12-month tenancy, minor scuffs constitute fair wear and tear. No new significant damage is noted in the check-out report. Please provide photographic evidence of damage beyond normal wear and tear, together with a decorator's invoice.

**Mattress (£180):** The check-in inventory notes a pre-existing mark on the mattress seam. I dispute that the stain described at check-out is entirely new. Please provide dated before-and-after photographs confirming the stain is in a new location, and provide evidence of the mattress's age and value to allow appropriate betterment calculations.

**Administration fee (£75):** I dispute this charge. An administration fee for arranging contractors is not a permitted payment under the Tenant Fees Act 2019. This is not an actual loss or damage.

I request that you provide supporting evidence for each charge within 14 days. I do not consent to the release of any disputed amounts until this matter is resolved, either by agreement or through the deposit scheme's Alternative Dispute Resolution service.

Could you also confirm the name of the deposit protection scheme in which my deposit is held?

Kind regards,
${process.env.DEMO_TENANT_NAME ?? 'Aisha Khan'}`,
  nextActions: [
    'Do not agree to release the disputed deposit amount yet.',
    'Reply to ABC Lettings disputing the deductions in writing (use the draft email above).',
    'Request an itemised cleaning invoice from ABC Lettings.',
    'Request dated photographs for the mattress stain to compare with check-in condition.',
    'Confirm with the deposit scheme that your deposit is protected.',
    'If ABC Lettings does not respond or agree, apply to the deposit scheme\'s ADR service.',
    'Keep copies of all correspondence.',
  ],
  riskFlags: ['Deposit protection scheme not confirmed — verify which scheme holds your deposit.'],
  disclaimer:
    'This tool helps organise evidence and draft tenancy deposit dispute communications. It does not provide legal advice and does not replace a solicitor, Citizens Advice, Shelter, or your deposit protection scheme.',
}

export async function runMainDisputeAgent(
  caseFacts: string,
  userQuestion: string,
  knowledgeContext: string,
  evidenceContext: string,
): Promise<MainAgentResponse> {
  try {
    const prompt = buildMainAgentPrompt(caseFacts, userQuestion, knowledgeContext, evidenceContext)
    const raw = await chatComplete(prompt, undefined, MAIN_AGENT_SYSTEM, isValidJsonObject)
    const parsed = safeJsonParse<MainAgentResponse>(raw, FALLBACK)
    if (parsed === FALLBACK) console.warn('[mainDisputeAgent] safeJsonParse returned FALLBACK; raw[0:300]:', raw.slice(0, 300))
    return parsed
  } catch (err) {
    console.warn('[mainDisputeAgent] chatComplete threw, using FALLBACK:', (err as Error).message)
    return FALLBACK
  }
}
