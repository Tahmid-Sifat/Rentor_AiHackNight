'use client'
import type { UploadedDocument } from '@/lib/case/caseTypes'

const TYPE_ICONS: Record<string, string> = {
  'tenancy-agreement': '📋',
  inventory: '✅',
  checkout: '🔍',
  email: '✉️',
  document: '📄',
}

interface Props {
  documents: UploadedDocument[]
  onRemove: (index: number) => void
}

export default function UploadedDocumentList({ documents, onRemove }: Props) {
  if (documents.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{documents.length} document(s) uploaded</p>
      {documents.map((doc, i) => (
        <div key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">{TYPE_ICONS[doc.type] ?? '📄'}</span>
            <div>
              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
              <p className="text-xs text-gray-400">{doc.text.length.toLocaleString()} chars · {doc.type}</p>
            </div>
          </div>
          <button
            onClick={() => onRemove(i)}
            className="text-gray-400 hover:text-red-500 transition-colors text-sm px-2"
            title="Remove"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
