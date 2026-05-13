export type IssueCategory =
  | 'Cleaning'
  | 'Damage'
  | 'Fair wear and tear'
  | 'Admin/default fee'
  | 'Missing item'
  | 'Gardening'
  | 'Rent arrears'
  | 'Other'

export interface CaseData {
  tenantName: string
  landlordName: string
  depositAmount: number
  totalDeductionAmount: number
  tenancyStartDate: string
  tenancyEndDate: string
  depositScheme?: string
  issueCategory: IssueCategory
  userQuestion: string
}

export interface UploadedDocument {
  name: string
  type: string
  text: string
}

export interface DeductionAnalysis {
  deductionType: string
  amount: string
  position: 'Dispute' | 'Partially dispute' | 'Accept' | 'Needs more evidence'
  strength: 'Strong' | 'Medium' | 'Weak'
  reasoning: string
  evidenceUsed: string[]
  missingEvidence: string[]
  citations?: string[]
}

export interface MainAgentResponse {
  summary: string
  deductionAnalysis: DeductionAnalysis[]
  draftEmail: string
  nextActions: string[]
  riskFlags: string[]
  disclaimer: string
}

export interface EvaluatorResult {
  score: number
  passed: boolean
  feedback: string
  requiredFixes: string[]
}

export interface RiskEvaluatorResult {
  riskLevel: 'low' | 'medium' | 'high'
  riskFlags: string[]
  safeToProceed: boolean
  escalationMessage: string
}

export interface AggregateResult {
  overallConfidence: number
  overallRisk: 'low' | 'medium' | 'high'
  approved: boolean
  combinedFeedback: string[]
}

export interface RetrievedSource {
  sourceName: string
  chunkId: string
  excerpt: string
  score?: number
  retrievalGroup?: string
  citationId?: string
}

export interface AnalysisRequest {
  caseData: CaseData
  documents: UploadedDocument[]
}

export interface AnalysisResponse {
  finalResponse: MainAgentResponse
  retrievedSources: RetrievedSource[]
  evaluations: {
    legal: EvaluatorResult
    evidence: EvaluatorResult
    risk: RiskEvaluatorResult
    tone: EvaluatorResult
    aggregate: AggregateResult
  }
  metadata: {
    chunksUsed: number
    totalChunksAvailable: number
    estimatedTokensSaved: string
    retrievalStrategy: string
  }
}

export interface TextChunk {
  id: string
  text: string
  source: string
  metadata: Record<string, string>
  embedding?: number[]
}
