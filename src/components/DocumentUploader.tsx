'use client'
import { useRef } from 'react'
import type { UploadedDocument } from '@/lib/case/caseTypes'

interface Props {
  onDocuments: (docs: UploadedDocument[]) => void
}

export default function DocumentUploader({ onDocuments }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files) return
    const docs: UploadedDocument[] = []
    for (const file of Array.from(files)) {
      const text = await file.text()
      docs.push({ name: file.name, type: inferType(file.name), text })
    }
    onDocuments(docs)
  }

  function inferType(name: string): string {
    if (name.includes('inventory') || name.includes('check-in')) return 'inventory'
    if (name.includes('check-out') || name.includes('checkout')) return 'checkout'
    if (name.includes('agreement')) return 'tenancy-agreement'
    if (name.includes('email') || name.includes('deduction')) return 'email'
    return 'document'
  }

  return (
    <div
      className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
    >
      <div className="text-4xl mb-3">📂</div>
      <p className="font-medium text-blue-900 mb-1">Drop files here or click to upload</p>
      <p className="text-sm text-blue-600">Supports .txt, .md files. For PDFs, copy and paste text.</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".txt,.md,.text"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
