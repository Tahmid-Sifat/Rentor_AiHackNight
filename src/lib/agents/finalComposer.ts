import type {
  MainAgentResponse,
  EvaluatorResult,
  RiskEvaluatorResult,
  AggregateResult,
} from '@/lib/case/caseTypes'

export function composeFinalResponse(
  mainResponse: MainAgentResponse,
  risk: RiskEvaluatorResult,
  aggregate: AggregateResult,
  legalEval: EvaluatorResult,
): MainAgentResponse {
  const response = { ...mainResponse }

  // Always preserve disclaimer
  response.disclaimer =
    'This tool helps organise evidence and draft tenancy deposit dispute communications. It does not provide legal advice and does not replace a solicitor, Citizens Advice, Shelter, or your deposit protection scheme.'

  // Add risk flags from evaluators
  const combinedFlags = [...(response.riskFlags ?? []), ...(risk.riskFlags ?? [])]
  response.riskFlags = [...new Set(combinedFlags)]

  // If high risk, prepend a prominent warning to the summary
  if (risk.riskLevel === 'high') {
    response.summary =
      `⚠️ HIGH RISK: ${risk.escalationMessage}\n\n` + response.summary
    response.nextActions = [
      'URGENT: Contact Citizens Advice or Shelter before taking any further action.',
      ...response.nextActions,
    ]
  }

  // Apply any required legal fixes as notes
  if (legalEval.requiredFixes.length > 0) {
    response.nextActions = [
      ...response.nextActions,
      ...legalEval.requiredFixes.map((f) => `Note: ${f}`),
    ]
  }

  return response
}
