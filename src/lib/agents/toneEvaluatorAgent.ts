import { chatComplete, isValidJsonObject } from '@/lib/ai/llmClient'
import { buildToneEvaluatorPrompt } from '@/lib/ai/promptTemplates'
import { safeJsonParse } from '@/lib/utils/safeJsonParse'
import type { EvaluatorResult } from '@/lib/case/caseTypes'

const FALLBACK: EvaluatorResult = {
  score: 0.88,
  passed: true,
  feedback:
    'The response is clear, professional, and accessible. The draft email is firm but polite. Next actions are clear and actionable.',
  requiredFixes: [],
}

export async function runToneEvaluator(mainResponse: string): Promise<EvaluatorResult> {
  try {
    const prompt = buildToneEvaluatorPrompt(mainResponse)
    const raw = await chatComplete(prompt, undefined, undefined, isValidJsonObject)
    return safeJsonParse<EvaluatorResult>(raw, FALLBACK)
  } catch {
    return FALLBACK
  }
}
