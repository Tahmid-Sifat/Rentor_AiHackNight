const features = [
  {
    icon: '📄',
    title: 'Upload Tenancy Evidence',
    desc: 'Upload your tenancy agreement, check-in inventory, check-out report, landlord emails, invoices, and any other relevant documents.',
    accent: 'from-blue-500/20 to-indigo-500/0',
  },
  {
    icon: '🤖',
    title: 'AI Analyses Deductions',
    desc: 'A RAG-powered main agent retrieves relevant tenancy law guidance and analyses each deduction against your uploaded evidence.',
    accent: 'from-purple-500/25 to-fuchsia-500/0',
  },
  {
    icon: '⚖️',
    title: 'Multi-Agent Evaluation',
    desc: 'Four evaluator agents review legal grounding, evidence usage, risk level, and tone before composing your final dispute response.',
    accent: 'from-emerald-500/25 to-teal-500/0',
  },
  {
    icon: '✉️',
    title: 'Dispute-Ready Response',
    desc: 'Get a structured analysis with a draft email to your landlord or letting agent, ready to send or customise.',
    accent: 'from-amber-500/25 to-orange-500/0',
  },
  {
    icon: '🔍',
    title: 'Evidence-Backed Guidance',
    desc: 'Every suggestion is grounded in your actual documents and UK tenancy guidance — not generic advice.',
    accent: 'from-cyan-500/25 to-sky-500/0',
  },
  {
    icon: '🛡️',
    title: 'Token-Efficient Architecture',
    desc: 'Only the most relevant document chunks are sent to the AI, reducing token usage and improving response focus.',
    accent: 'from-rose-500/20 to-pink-500/0',
  },
]

export default function FeatureCards() {
  return (
    <section className="relative py-24 px-6 bg-black text-white overflow-hidden">
      {/* faint nebula glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[820px] rounded-full bg-indigo-600/15 blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.3em] text-blue-300/70 uppercase mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-br from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
            A coordinated AI pipeline, not a chatbot
          </h2>
          <p className="text-blue-100/60 max-w-xl mx-auto">
            A resource-efficient, agentic AI system designed specifically for UK tenancy deposit disputes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md overflow-hidden transition-all hover:border-white/25 hover:bg-white/[0.07] hover:-translate-y-1"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-blue-100/60 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
