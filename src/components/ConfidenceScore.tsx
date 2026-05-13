interface Props {
  score: number
  chunksUsed: number
  totalChunks: number
  tokenNote: string
}

export default function ConfidenceScore({ score, chunksUsed, totalChunks, tokenNote }: Props) {
  const pct = Math.round(score * 100)
  const color = pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'
  const ring = pct >= 75 ? 'border-green-400' : pct >= 50 ? 'border-yellow-400' : 'border-red-400'

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Analysis Confidence</h3>
        <div className={`w-16 h-16 rounded-full border-4 ${ring} flex items-center justify-center`}>
          <span className={`text-lg font-bold ${color}`}>{pct}%</span>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Chunks retrieved</span>
          <span className="font-semibold text-gray-800">{chunksUsed} of ~{totalChunks}</span>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">Token Efficiency</p>
          <p className="text-xs text-blue-600 leading-relaxed">{tokenNote}</p>
        </div>
      </div>
    </div>
  )
}
