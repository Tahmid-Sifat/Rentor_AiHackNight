'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ResultsDashboard from '@/components/ResultsDashboard'
import type { AnalysisResponse, CaseData } from '@/lib/case/caseTypes'

export default function ResultsPage() {
  const router = useRouter()
  const [result] = useState<AnalysisResponse | null>(() => {
    if (typeof window === 'undefined') return null
    const stored = sessionStorage.getItem('analysisResult')
    return stored ? JSON.parse(stored) : null
  })
  const [caseData] = useState<CaseData | null>(() => {
    if (typeof window === 'undefined') return null
    const stored = sessionStorage.getItem('caseData')
    return stored ? JSON.parse(stored) : null
  })

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 py-20 px-6 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No results found</h2>
        <p className="text-gray-500 mb-6">Start a new case or try the demo to see results here.</p>
        <div className="flex gap-3">
          <button onClick={() => router.push('/case/new')} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">New Case</button>
          <button onClick={() => router.push('/demo')} className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">View Demo</button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-10 px-6">
      <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Dispute Analysis Results</h1>
          {caseData && (
            <p className="text-gray-500 text-sm">
              {caseData.tenantName} vs {caseData.landlordName} · £{caseData.totalDeductionAmount} disputed of £{caseData.depositAmount} deposit
            </p>
          )}
        </div>
        <button
          onClick={() => router.push('/case/new')}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          New Case
        </button>
      </div>
      <ResultsDashboard result={result} />
    </div>
  )
}
