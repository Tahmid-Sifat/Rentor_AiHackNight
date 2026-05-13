import type { DeductionAnalysis, RetrievedSource } from '@/lib/case/caseTypes'

const POSITION_STYLES: Record<string, string> = {
  'Dispute': 'bg-green-100 text-green-800 border-green-200',
  'Partially dispute': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Accept': 'bg-red-100 text-red-800 border-red-200',
  'Needs more evidence': 'bg-gray-100 text-gray-700 border-gray-200',
}

const STRENGTH_STYLES: Record<string, string> = {
  Strong: 'bg-green-500',
  Medium: 'bg-yellow-500',
  Weak: 'bg-red-500',
}

interface Props {
  deduction: DeductionAnalysis
  sources?: RetrievedSource[]
}

export default function DeductionAnalysisCard({ deduction, sources = [] }: Props) {
  const posStyle = POSITION_STYLES[deduction.position] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  const strColor = STRENGTH_STYLES[deduction.strength] ?? 'bg-gray-400'
  const citationSources = (deduction.citations ?? [])
    .map((citation) => sources.find((source) => source.citationId === citation))
    .filter((source): source is RetrievedSource => Boolean(source))

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-base">{deduction.deductionType}</h3>
          <p className="text-2xl font-bold text-gray-800">£{deduction.amount}</p>
        </div>
        <div className="text-right shrink-0">
          <span className={`inline-block border px-3 py-1 rounded-full text-xs font-semibold ${posStyle}`}>
            {deduction.position}
          </span>
          <div className="flex items-center gap-1 mt-2 justify-end">
            <span className={`w-2.5 h-2.5 rounded-full ${strColor}`}></span>
            <span className="text-xs text-gray-500">{deduction.strength} case</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed mb-4">{deduction.reasoning}</p>

      {citationSources.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Supported By</p>
          <div className="flex flex-wrap gap-1.5">
            {citationSources.map((source) => (
              <span
                key={`${source.citationId}-${source.chunkId}`}
                title={source.sourceName}
                className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full border border-indigo-100"
              >
                {source.citationId} · {source.sourceName}
              </span>
            ))}
          </div>
        </div>
      )}

      {deduction.evidenceUsed.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Evidence Used</p>
          <div className="flex flex-wrap gap-1.5">
            {deduction.evidenceUsed.map((e) => (
              <span key={e} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-100">{e}</span>
            ))}
          </div>
        </div>
      )}

      {deduction.missingEvidence.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-1">Missing Evidence — Request from Landlord</p>
          <div className="flex flex-wrap gap-1.5">
            {deduction.missingEvidence.map((e) => (
              <span key={e} className="bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-full border border-orange-100">{e}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
