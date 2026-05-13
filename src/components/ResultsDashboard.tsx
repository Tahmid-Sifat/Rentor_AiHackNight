'use client'
import { useState } from 'react'
import type { AnalysisResponse } from '@/lib/case/caseTypes'
import DeductionAnalysisCard from './DeductionAnalysisCard'
import DraftEmailBox from './DraftEmailBox'
import EvaluatorPanel from './EvaluatorPanel'
import RetrievedSourcesPanel from './RetrievedSourcesPanel'
import RiskFlags from './RiskFlags'
import NextActionsList from './NextActionsList'
import ConfidenceScore from './ConfidenceScore'

type Tab = 'analysis' | 'email' | 'evaluators' | 'sources'

interface Props {
  result: AnalysisResponse
}

export default function ResultsDashboard({ result }: Props) {
  const [tab, setTab] = useState<Tab>('analysis')
  const { finalResponse, evaluations, retrievedSources, metadata } = result
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'analysis', label: 'Dispute Analysis', icon: '⚖️' },
    { id: 'email', label: 'Draft Email', icon: '✉️' },
    { id: 'evaluators', label: 'Evaluators', icon: '🤖' },
    { id: 'sources', label: 'Sources', icon: '📚' },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 mb-6">
        <h2 className="font-bold text-xl mb-3">Analysis Summary</h2>
        <p className="text-blue-100 leading-relaxed whitespace-pre-line">{finalResponse.summary}</p>
      </div>

      {/* Risk Flags */}
      {(finalResponse.riskFlags?.length > 0 || evaluations.risk.escalationMessage) && (
        <div className="mb-6">
          <RiskFlags
            flags={finalResponse.riskFlags ?? []}
            escalationMessage={evaluations.risk.escalationMessage}
            riskLevel={evaluations.risk.riskLevel}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              tab === t.id ? 'bg-white text-blue-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {tab === 'analysis' && (
            <div className="space-y-4">
              {finalResponse.deductionAnalysis?.map((d, i) => (
                <DeductionAnalysisCard key={i} deduction={d} sources={retrievedSources} />
              ))}
            </div>
          )}
          {tab === 'email' && <DraftEmailBox email={finalResponse.draftEmail} />}
          {tab === 'evaluators' && <EvaluatorPanel evaluations={evaluations} />}
          {tab === 'sources' && <RetrievedSourcesPanel sources={retrievedSources} />}
        </div>

        <div className="space-y-4">
          <ConfidenceScore
            score={evaluations.aggregate.overallConfidence}
            chunksUsed={metadata.chunksUsed}
            totalChunks={metadata.totalChunksAvailable}
            tokenNote={metadata.estimatedTokensSaved}
          />
          <NextActionsList actions={finalResponse.nextActions ?? []} />
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">{finalResponse.disclaimer}</p>
      </div>
    </div>
  )
}
