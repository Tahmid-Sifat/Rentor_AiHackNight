'use client'
import { useState } from 'react'

interface Props {
  email: string
}

export default function DraftEmailBox({ email }: Props) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-lg">✉️</span>
          <span className="font-semibold text-gray-800 text-sm">Draft Email to Landlord / Agent</span>
        </div>
        <button
          onClick={copy}
          className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
            copied ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          {copied ? '✓ Copied!' : '📋 Copy Email'}
        </button>
      </div>
      <pre className="p-5 text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed overflow-auto max-h-96">
        {email}
      </pre>
    </div>
  )
}
