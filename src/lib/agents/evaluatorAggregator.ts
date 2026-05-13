import type { EvaluatorResult, RiskEvaluatorResult, AggregateResult } from '@/lib/case/caseTypes'

export function aggregateEvaluations(
  legal: EvaluatorResult,
  evidence: EvaluatorResult,
  risk: RiskEvaluatorResult,
  tone: EvaluatorResult,
): AggregateResult {
  const scoreAvg = (legal.score + evidence.score + tone.score) / 3
  const allPassed = legal.passed && evidence.passed && tone.passed && risk.safeToProceed

  const feedback: string[] = []
  if (legal.feedback) feedback.push(`Legal: ${legal.feedback}`)
  if (evidence.feedback) feedback.push(`Evidence: ${evidence.feedback}`)
  if (tone.feedback) feedback.push(`Tone: ${tone.feedback}`)
  if (risk.escalationMessage) feedback.push(`Risk: ${risk.escalationMessage}`)

  return {
    overallConfidence: Math.round(scoreAvg * 100) / 100,
    overallRisk: risk.riskLevel,
    approved: allPassed,
    combinedFeedback: feedback,
  }
}
