interface Props {
  flags: string[]
  escalationMessage?: string
  riskLevel?: 'low' | 'medium' | 'high'
}

export default function RiskFlags({ flags, escalationMessage, riskLevel = 'low' }: Props) {
  if (flags.length === 0 && !escalationMessage) return null

  const isHigh = riskLevel === 'high'
  const containerClass = isHigh
    ? 'bg-red-50 border-red-300'
    : 'bg-yellow-50 border-yellow-300'
  const iconClass = isHigh ? 'text-red-500' : 'text-yellow-500'
  const textClass = isHigh ? 'text-red-800' : 'text-yellow-800'

  return (
    <div className={`border rounded-xl p-4 ${containerClass}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={iconClass}>{isHigh ? '🚨' : '⚠️'}</span>
        <span className={`font-semibold text-sm ${textClass}`}>
          {isHigh ? 'High Risk — Action Required' : 'Risk Flags'}
        </span>
      </div>
      <ul className="space-y-1.5">
        {flags.map((f, i) => (
          <li key={i} className={`text-sm ${textClass}`}>• {f}</li>
        ))}
      </ul>
      {escalationMessage && (
        <p className={`mt-3 text-sm font-medium ${textClass}`}>{escalationMessage}</p>
      )}
    </div>
  )
}
