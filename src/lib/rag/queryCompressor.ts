import type { CaseData, UploadedDocument } from '@/lib/case/caseTypes'

export interface RetrievalQuery {
  label: string
  query: string
}

export function compressQuery(caseData: CaseData, userQuestion: string): string {
  const parts = [
    'UK tenancy deposit dispute',
    caseData.issueCategory,
    userQuestion,
    caseData.totalDeductionAmount ? `deduction £${caseData.totalDeductionAmount}` : '',
    'fair wear and tear evidence invoice landlord tenant',
  ]
  return parts.filter(Boolean).join(' ')
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term))
}

function buildFocusedQuery(caseData: CaseData, label: string, terms: string[]): RetrievalQuery {
  return {
    label,
    query: [
      compressQuery(caseData, caseData.userQuestion),
      label,
      ...terms,
    ].join(' '),
  }
}

export function buildRetrievalQueries(
  caseData: CaseData,
  documents: UploadedDocument[],
): RetrievalQuery[] {
  const corpus = [
    caseData.issueCategory,
    caseData.userQuestion,
    ...documents.map((doc) => `${doc.name} ${doc.type} ${doc.text}`),
  ]
    .join(' ')
    .toLowerCase()

  const queries: RetrievalQuery[] = []

  if (includesAny(corpus, ['clean', 'cleaning', 'oven', 'hob', 'hygiene'])) {
    queries.push(buildFocusedQuery(caseData, 'Cleaning deduction', [
      'professional cleaning',
      'domestic standard',
      'oven grease',
      'reasonable cleaning cost',
      'cleaning invoice',
    ]))
  }

  if (includesAny(corpus, ['repaint', 'painting', 'paint', 'scuff', 'scuffs', 'marks', 'decoration'])) {
    queries.push(buildFocusedQuery(caseData, 'Repainting and fair wear', [
      'fair wear and tear',
      'wall scuffs',
      'repainting',
      'check-in condition',
      'check-out condition',
    ]))
  }

  if (includesAny(corpus, ['mattress', 'stain', 'stained', 'replacement'])) {
    queries.push(buildFocusedQuery(caseData, 'Mattress or staining', [
      'mattress stain',
      'replacement contribution',
      'betterment',
      'age of item',
      'before and after photos',
    ]))
  }

  if (includesAny(corpus, ['admin', 'administration fee', 'tenant fees', 'default fee'])) {
    queries.push(buildFocusedQuery(caseData, 'Admin or default fee', [
      'Tenant Fees Act 2019',
      'admin fee',
      'default fee',
      'permitted payment',
      'prohibited fee',
    ]))
  }

  if (includesAny(corpus, ['adr', 'scheme', 'protected', 'protection', 'dps', 'tds', 'mydeposits'])) {
    queries.push(buildFocusedQuery(caseData, 'Deposit scheme and ADR', [
      'deposit protection scheme',
      'alternative dispute resolution',
      'ADR evidence',
      'release of funds',
      'scheme deadline',
    ]))
  }

  if (queries.length === 0) {
    queries.push({
      label: 'General dispute',
      query: compressQuery(caseData, caseData.userQuestion),
    })
  }

  return queries.slice(0, 6)
}
