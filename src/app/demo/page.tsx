'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import UploadedDocumentList from '@/components/UploadedDocumentList'
import { DEMO_CASE_DATA, DEMO_DOCUMENTS } from '@/lib/case/demoCase'

export default function DemoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function runDemo() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseData: DEMO_CASE_DATA, documents: DEMO_DOCUMENTS }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      sessionStorage.setItem('analysisResult', JSON.stringify(data))
      sessionStorage.setItem('caseData', JSON.stringify(DEMO_CASE_DATA))
      router.push('/case/results')
    } catch {
      setError('Analysis failed. Make sure your OPENAI_API_KEY is set in .env.local, or the fallback response will be used.')
      setLoading(false)
    }
  }

  const field = (label: string, value: string | number) => (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Demo Case
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Aisha Khan vs ABC Lettings</h1>
        <p className="text-gray-500">A pre-loaded demonstration case showing £775 of proposed deposit deductions. Click Analyse to run the full RAG + multi-agent pipeline.</p>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Running Analysis Pipeline</h3>
            <div className="text-sm text-gray-500 mb-6 space-y-1.5 text-left">
              {['Loading knowledge base...', 'Embedding documents...', 'Retrieving relevant guidance...', 'Main agent generating response...', 'Running 4 evaluator agents...', 'Composing final response...'].map((s, i) => (
                <p key={i} className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  {s}
                </p>
              ))}
            </div>
            <div className="flex justify-center gap-2">
              {[0,1,2].map((i) => (
                <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Case Details</h2>
          <div className="grid grid-cols-2 gap-4">
            {field('Tenant', DEMO_CASE_DATA.tenantName)}
            {field('Landlord / Agent', DEMO_CASE_DATA.landlordName)}
            {field('Deposit', `£${DEMO_CASE_DATA.depositAmount}`)}
            {field('Total Deductions', `£${DEMO_CASE_DATA.totalDeductionAmount}`)}
            {field('Tenancy Period', `${DEMO_CASE_DATA.tenancyStartDate} → ${DEMO_CASE_DATA.tenancyEndDate}`)}
            {field('Deposit Scheme', DEMO_CASE_DATA.depositScheme || 'Unknown')}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 font-medium mb-1">Tenant Question</p>
            <p className="text-sm text-blue-900">{DEMO_CASE_DATA.userQuestion}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Proposed Deductions</h2>
          <div className="space-y-2">
            {[
              { item: 'Professional cleaning', amount: '£300' },
              { item: 'Repainting (hallway + bedroom)', amount: '£220' },
              { item: 'Mattress replacement contribution', amount: '£180' },
              { item: 'Administration fee', amount: '£75' },
            ].map((d) => (
              <div key={d.item} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{d.item}</span>
                <span className="text-sm font-semibold text-gray-900">{d.amount}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className="text-base font-bold text-red-600">£775</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Uploaded Evidence ({DEMO_DOCUMENTS.length} documents)</h2>
          <UploadedDocumentList documents={DEMO_DOCUMENTS} onRemove={() => {}} />
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={runDemo}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-lg"
        >
          {loading ? 'Running Analysis...' : '🚀 Analyse Demo Dispute'}
        </button>
      </div>
    </div>
  )
}
