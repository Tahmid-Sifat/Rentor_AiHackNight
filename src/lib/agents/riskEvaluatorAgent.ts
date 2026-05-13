import { chatComplete, isValidJsonObject } from '@/lib/ai/llmClient'
import { buildRiskEvaluatorPrompt } from '@/lib/ai/promptTemplates'
import { safeJsonParse } from '@/lib/utils/safeJsonParse'
import type { RiskEvaluatorResult } from '@/lib/case/caseTypes'

const FALLBACK: RiskEvaluatorResult = {
  riskLevel: 'medium',
  riskFlags: [
    'Deposit protection scheme not confirmed — verify which scheme holds the deposit.',
    'If the deposit is not protected, this becomes a higher-risk situation requiring separate legal advice.',
  ],
  safeToProceed: true,
  escalationMessage:
    'This appears to be a standard deposit dispute. However, please confirm that your deposit was protected in an approved scheme. If it was not, contact Citizens Advice for advice on deposit protection penalties.',
}

export async function runRiskEvaluator(
  caseFacts: string,
  mainResponse: string,
): Promise<RiskEvaluatorResult> {
  try {
    const prompt = buildRiskEvaluatorPrompt(caseFacts, mainResponse)
    const raw = await chatComplete(prompt, undefined, undefined, isValidJsonObject)
    return safeJsonParse<RiskEvaluatorResult>(raw, FALLBACK)
  } catch {
    return FALLBACK
  }
}
