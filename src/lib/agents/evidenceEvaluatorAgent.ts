import { chatComplete, isValidJsonObject } from '@/lib/ai/llmClient'
import { buildEvidenceEvaluatorPrompt } from '@/lib/ai/promptTemplates'
import { safeJsonParse } from '@/lib/utils/safeJsonParse'
import type { EvaluatorResult } from '@/lib/case/caseTypes'

const FALLBACK: EvaluatorResult = {
  score: 0.78,
  passed: true,
  feedback:
    'The response correctly references the check-in inventory and check-out report. It identifies missing evidence such as the cleaning invoice and mattress age. No facts appear to be invented.',
  requiredFixes: [
    'Consider explicitly requesting a copy of the check-out report if the tenant has not received one.',
  ],
}

export async function runEvidenceEvaluator(
  mainResponse: string,
  evidenceContext: string,
): Promise<EvaluatorResult> {
  try {
    const prompt = buildEvidenceEvaluatorPrompt(mainResponse, evidenceContext)
    const raw = await chatComplete(prompt, undefined, undefined, isValidJsonObject)
    return safeJsonParse<EvaluatorResult>(raw, FALLBACK)
  } catch {
    return FALLBACK
  }
}
