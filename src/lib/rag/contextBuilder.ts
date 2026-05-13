import type { CaseData, RetrievedSource, UploadedDocument } from '@/lib/case/caseTypes'

export function buildCaseFacts(caseData: CaseData): string {
  return `
Tenant Name: ${caseData.tenantName}
Landlord/Agent: ${caseData.landlordName}
Deposit Amount: £${caseData.depositAmount}
Total Deduction Amount: £${caseData.totalDeductionAmount}
Tenancy Start Date: ${caseData.tenancyStartDate}
Tenancy End Date: ${caseData.tenancyEndDate}
Deposit Scheme: ${caseData.depositScheme || 'Unknown / Not provided'}
Issue Category: ${caseData.issueCategory}
`.trim()
}

export function buildKnowledgeContext(sources: RetrievedSource[]): string {
  if (sources.length === 0) return 'No knowledge base sources retrieved.'
  return sources
    .map((s, i) => {
      const group = s.retrievalGroup ? ` | Focus: ${s.retrievalGroup}` : ''
      const citation = s.citationId ?? `KB${i + 1}`
      return `[${citation} | KB Source ${i + 1}: ${s.sourceName}${group}]\n${s.excerpt}`
    })
    .join('\n\n')
}

export function buildEvidenceContext(
  docs: UploadedDocument[],
  retrievedChunks: RetrievedSource[],
): string {
  if (docs.length === 0 && retrievedChunks.length === 0) return 'No uploaded documents provided.'

  const chunkContext = retrievedChunks
    .map((c, i) => {
      const group = c.retrievalGroup ? ` | Focus: ${c.retrievalGroup}` : ''
      const citation = c.citationId ?? `DOC${i + 1}`
      return `[${citation} | Evidence Chunk ${i + 1}: ${c.sourceName}${group}]\n${c.excerpt}`
    })
    .join('\n\n')

  const docList = docs.map((d) => d.name).join(', ')

  return `Uploaded documents: ${docList}\n\n${chunkContext}`
}
