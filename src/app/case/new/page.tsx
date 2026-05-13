'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CaseIntakeForm from '@/components/CaseIntakeForm'
import DocumentUploader from '@/components/DocumentUploader'
import UploadedDocumentList from '@/components/UploadedDocumentList'
import type { CaseData, UploadedDocument } from '@/lib/case/caseTypes'

const EMPTY_CASE: CaseData = {
  tenantName: '',
  landlordName: '',
  depositAmount: 0,
  totalDeductionAmount: 0,
  tenancyStartDate: '',
  tenancyEndDate: '',
  depositScheme: '',
  issueCategory: 'Cleaning',
  userQuestion: '',
}

export default function NewCasePage() {
  const router = useRouter()
  const [caseData, setCaseData] = useState<CaseData>(EMPTY_CASE)
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addDocuments(docs: UploadedDocument[]) {
    setDocuments((prev) => [...prev, ...docs])
  }

  function removeDocument(index: number) {
    setDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (!caseData.tenantName || !caseData.landlordName || !caseData.userQuestion) {
      setError('Please fill in tenant name, landlord name, and your question.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseData, documents }),
      })
      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      sessionStorage.setItem('analysisResult', JSON.stringify(data))
      sessionStorage.setItem('caseData', JSON.stringify(caseData))
      router.push('/case/results')
    } catch (err) {
      console.error(err)
      setError('Analysis failed. Please check your API key and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">New Dispute Case</h1>
        <p className="text-gray-500">Fill in your case details, upload documents, and let the AI analyse your dispute.</p>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Analysing your dispute...</h3>
            <p className="text-sm text-gray-500 mb-6">Running RAG retrieval and multi-agent evaluation. This may take 30–60 seconds.</p>
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 120}ms` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Step 1 */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-7 h-7 bg-blue-600 text-white rounded-full text-sm font-bold flex items-center justify-center">1</span>
            <h2 className="font-semibold text-gray-900 text-lg">Case Details</h2>
          </div>
          <CaseIntakeForm initial={EMPTY_CASE} onChange={setCaseData} />
        </section>

        {/* Step 2 */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-7 h-7 bg-blue-600 text-white rounded-full text-sm font-bold flex items-center justify-center">2</span>
            <h2 className="font-semibold text-gray-900 text-lg">Upload Documents</h2>
            <span className="text-sm text-gray-400">(optional but recommended)</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">Upload .txt files: tenancy agreement, inventories, landlord emails, invoices. You can also paste text into a .txt file and upload it.</p>
          <DocumentUploader onDocuments={addDocuments} />
          <div className="mt-4">
            <UploadedDocumentList documents={documents} onRemove={removeDocument} />
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-lg"
        >
          {loading ? 'Analysing...' : '🔍 Analyse Dispute'}
        </button>
      </div>
    </div>
  )
}
