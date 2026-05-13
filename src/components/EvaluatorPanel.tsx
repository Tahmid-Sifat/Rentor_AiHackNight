import type { AnalysisResponse } from '@/lib/case/caseTypes'

const RISK_COLORS = { low: 'text-green-600', medium: 'text-yellow-600', high: 'text-red-600' }
const RISK_BG = { low: 'bg-green-50 border-green-200', medium: 'bg-yellow-50 border-yellow-200', high: 'bg-red-50 border-red-200' }

interface Props {
  evaluations: AnalysisResponse['evaluations']
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round((score ?? 0) * 100)
  const color = pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-10 text-right">{pct}%</span>
    </div>
  )
}

export default function EvaluatorPanel({ evaluations }: Props) {
  const { legal, evidence, tone, risk, aggregate } = evaluations
  const riskLevel = risk.riskLevel ?? 'low'

  return (
    <div className="space-y-4">
      <div className={`border rounded-xl p-4 ${RISK_BG[riskLevel]}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-gray-800">Overall Confidence</span>
          <span className="text-2xl font-bold text-blue-700">{Math.round((aggregate.overallConfidence ?? 0) * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Risk Level:</span>
          <span className={`font-semibold capitalize text-sm ${RISK_COLORS[riskLevel]}`}>{riskLevel}</span>
        </div>
        {aggregate.combinedFeedback?.length > 0 && (
          <ul className="mt-3 space-y-1">
            {aggregate.combinedFeedback.map((f, i) => (
              <li key={i} className="text-xs text-gray-600">• {f}</li>
            ))}
          </ul>
        )}
      </div>

      {[
        { label: 'Legal Grounding', icon: '⚖️', result: legal },
        { label: 'Evidence Usage', icon: '🔎', result: evidence },
        { label: 'Tone & Clarity', icon: '✍️', result: tone },
      ].map(({ label, icon, result }) => (
        <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span>{icon}</span>
            <span className="font-semibold text-gray-800 text-sm">{label}</span>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {result.passed ? 'Passed' : 'Needs Review'}
            </span>
          </div>
          <ScoreBar score={result.score} />
          {result.feedback && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{result.feedback}</p>}
          {result.requiredFixes?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {result.requiredFixes.map((f, i) => (
                <li key={i} className="text-xs text-orange-600">⚠ {f}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
