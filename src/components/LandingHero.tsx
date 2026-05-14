'use client'
import Link from 'next/link'
import StarfieldBackground from './StarfieldBackground'

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-black text-white min-h-[90vh] flex items-center justify-center px-6">
      <StarfieldBackground />

      {/* Soft top + bottom edge fades for blending into next sections */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-[1]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-[1]" />

      <div className="relative z-10 max-w-4xl text-center py-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-blue-100 backdrop-blur-md mb-7">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          RAG · Multi-Agent AI System
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          <span
            className="bg-gradient-to-br from-white via-blue-100 to-indigo-300 bg-clip-text text-transparent"
            style={{ filter: 'drop-shadow(0 0 22px rgba(129, 140, 248, 0.35))' }}
          >
            Rentor
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-blue-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          An agentic RAG assistant that helps UK tenants challenge unfair landlord deposit
          deductions with evidence-backed dispute responses.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/case/new"
            className="group relative inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 font-semibold text-slate-900 shadow-[0_8px_30px_rgba(255,255,255,0.18)] transition-all hover:bg-blue-50 hover:shadow-[0_8px_40px_rgba(199,210,254,0.45)] hover:-translate-y-0.5"
          >
            Start Dispute Analysis
            <span className="ml-2 transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5"
          >
            View Demo Case
          </Link>
        </div>

        <p className="mt-10 text-xs text-blue-200/50 max-w-xl mx-auto">
          This tool helps organise evidence and draft dispute communications. It does not provide
          legal advice. For complex cases, contact Citizens Advice or Shelter.
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-1 text-white/40">
        <div className="h-8 w-5 rounded-full border border-white/30 flex justify-center pt-1.5">
          <div className="h-1.5 w-0.5 rounded-full bg-white/60 animate-[bounce_1.6s_infinite]" />
        </div>
      </div>
    </section>
  )
}
