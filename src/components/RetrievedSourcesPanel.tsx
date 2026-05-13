import type { RetrievedSource } from '@/lib/case/caseTypes'

interface Props {
  sources: RetrievedSource[]
}

export default function RetrievedSourcesPanel({ sources }: Props) {
  if (sources.length === 0) return null

  return (
    <div className="space-y-3">
      {sources.map((s, i) => (
        <div key={s.chunkId} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white bg-blue-600 rounded-full px-2 h-5 flex items-center justify-center">
                {s.citationId ?? i + 1}
              </span>
              <span className="text-sm font-semibold text-gray-800">{s.sourceName}</span>
            </div>
            {s.score !== undefined && (
              <span className="text-xs text-gray-400">
                Relevance: {Math.round(s.score * 100)}%
              </span>
            )}
          </div>
          {s.retrievalGroup && (
            <p className="text-[11px] font-medium text-indigo-600 mb-1">{s.retrievalGroup}</p>
          )}
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">{s.excerpt}</p>
        </div>
      ))}
    </div>
  )
}
