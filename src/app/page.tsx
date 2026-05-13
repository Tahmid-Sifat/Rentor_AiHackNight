import LandingHero from '@/components/LandingHero'
import FeatureCards from '@/components/FeatureCards'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <LandingHero />
      <FeatureCards />

      {/* Architecture section */}
      <section className="relative py-24 px-6 bg-black text-white overflow-hidden">
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[900px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="relative max-w-5xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-blue-300/70 uppercase mb-3">Architecture</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-br from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
            Multi-Agent Pipeline
          </h2>
          <p className="text-blue-100/60 mb-12 max-w-2xl mx-auto">
            A coordinated chain of specialised AI agents working in sequence to produce an evidence-grounded, peer-reviewed dispute response.
          </p>

          <div className="overflow-x-auto">
            <div className="inline-flex flex-col items-center gap-4 min-w-[640px]">
              <div className="flex gap-3 items-center">
                <PipelinePill label="Documents + Question" tone="blue" />
                <Arrow />
                <PipelinePill label="Query Compressor" tone="blue" />
                <Arrow />
                <PipelinePill label="RAG Retriever" tone="purple" />
              </div>
              <ArrowDown />
              <div className="rounded-xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 px-7 py-4 font-semibold shadow-[0_0_40px_rgba(129,140,248,0.35)] backdrop-blur-md">
                Main Tenancy Dispute Agent
              </div>
              <ArrowDown />
              <div className="flex gap-3 flex-wrap justify-center">
                {['Legal Evaluator', 'Evidence Evaluator', 'Risk Evaluator', 'Tone Evaluator'].map((a) => (
                  <PipelinePill key={a} label={a} tone="green" />
                ))}
              </div>
              <ArrowDown />
              <div className="rounded-xl border border-white/15 bg-white/[0.06] px-7 py-4 font-semibold backdrop-blur-md">
                Final Composed Response
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 bg-black text-white overflow-hidden border-t border-white/5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_55%)]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-br from-white to-blue-200 bg-clip-text text-transparent">
            Ready to defend your deposit?
          </h2>
          <p className="text-blue-100/60 mb-10 max-w-xl mx-auto">
            Try the demo case with pre-loaded documents, or start your own dispute analysis.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/demo"
              className="group inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 font-semibold text-slate-900 shadow-[0_8px_30px_rgba(255,255,255,0.18)] transition-all hover:bg-blue-50 hover:shadow-[0_8px_40px_rgba(199,210,254,0.45)] hover:-translate-y-0.5"
            >
              Try Demo Case
              <span className="ml-2 transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              href="/case/new"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5"
            >
              Start New Case
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function PipelinePill({ label, tone }: { label: string; tone: 'blue' | 'purple' | 'green' }) {
  const styles = {
    blue: 'border-blue-400/30 bg-blue-500/10 text-blue-100',
    purple: 'border-purple-400/30 bg-purple-500/10 text-purple-100',
    green: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
  }[tone]
  return (
    <div className={`rounded-lg border px-4 py-2 text-sm font-medium backdrop-blur-md ${styles}`}>
      {label}
    </div>
  )
}

function Arrow() {
  return <span className="text-white/30 text-lg">→</span>
}

function ArrowDown() {
  return <span className="text-white/30 text-xl">↓</span>
}
