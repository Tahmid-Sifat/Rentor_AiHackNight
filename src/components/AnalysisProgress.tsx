'use client'

const STEPS = [
  { label: 'Reading tenancy documents', icon: '📄' },
  { label: 'Chunking and embedding evidence', icon: '🔢' },
  { label: 'Retrieving relevant tenancy guidance', icon: '🔍' },
  { label: 'Main agent drafting response', icon: '🤖' },
  { label: 'Legal evaluator reviewing', icon: '⚖️' },
  { label: 'Evidence evaluator reviewing', icon: '🔎' },
  { label: 'Risk evaluator reviewing', icon: '🛡️' },
  { label: 'Tone evaluator reviewing', icon: '✍️' },
  { label: 'Composing final response', icon: '✅' },
]

interface Props {
  currentStep: number
}

export default function AnalysisProgress({ currentStep }: Props) {
  return (
    <div className="max-w-lg mx-auto">
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const done = i < currentStep
          const active = i === currentStep
          return (
            <div
              key={step.label}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                active ? 'bg-blue-50 border border-blue-200' :
                done ? 'opacity-60' : 'opacity-30'
              }`}
            >
              <span className="text-xl w-8 text-center">
                {done ? '✅' : active ? <span className="animate-spin inline-block">⚙️</span> : step.icon}
              </span>
              <span className={`text-sm font-medium ${active ? 'text-blue-800' : 'text-gray-700'}`}>
                {step.label}
              </span>
              {active && (
                <span className="ml-auto flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${d * 150}ms` }}
                    />
                  ))}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
