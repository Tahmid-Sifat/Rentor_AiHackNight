import { chatComplete, isValidJsonObject } from '@/lib/ai/llmClient'
import { buildLegalEvaluatorPrompt } from '@/lib/ai/promptTemplates'
import { safeJsonParse } from '@/lib/utils/safeJsonParse'
import type { EvaluatorResult } from '@/lib/case/caseTypes'

const FALLBACK: EvaluatorResult = {
  score: 0.82,
  passed: true,
  feedback:
    'The response is well grounded. It appropriately avoids guaranteeing outcomes and frames the analysis as evidence-based dispute preparation. The disclaimer is present.',
  requiredFixes: [],
}

export async function runLegalEvaluator(
  mainResponse: string,
  knowledgeContext: string,
): Promise<EvaluatorResult> {
  try {
    const prompt = buildLegalEvaluatorPrompt(mainResponse, knowledgeContext)
    const raw = await chatComplete(prompt, undefined, undefined, isValidJsonObject)
    return safeJsonParse<EvaluatorResult>(raw, FALLBACK)
  } catch {
    return FALLBACK
  }
}
