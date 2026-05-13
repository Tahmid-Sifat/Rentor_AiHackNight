interface Props {
  actions: string[]
}

export default function NextActionsList({ actions }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🎯</span>
        <h3 className="font-semibold text-gray-900">Suggested Next Actions</h3>
      </div>
      <ol className="space-y-3">
        {actions.map((action, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <span className="text-sm text-gray-700 leading-relaxed">{action}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
