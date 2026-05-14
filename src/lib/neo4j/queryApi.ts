import { randomUUID } from 'crypto'
import type {
  AnalysisRequest,
  AnalysisResponse,
  RetrievedSource,
} from '@/lib/case/caseTypes'

interface Neo4jQueryResponse {
  data?: {
    fields?: string[]
    values?: unknown[][]
  }
  errors?: Array<{
    code?: string
    message?: string
  }>
}

interface PersistAnalysisInput {
  request: AnalysisRequest
  response: AnalysisResponse
}

function getNeo4jConfig() {
  const uri = process.env.NEO4J_URI
  const queryApiUrl = process.env.NEO4J_QUERY_API_URL
  const username = process.env.NEO4J_USERNAME
  const password = process.env.NEO4J_PASSWORD
  const database = process.env.NEO4J_DATABASE ?? 'neo4j'

  if ((!uri && !queryApiUrl) || !username || !password) return null

  if (queryApiUrl) {
    return {
      endpoint: queryApiUrl,
      username,
      password,
    }
  }

  const host = uri!
    .replace(/^neo4j\+s:\/\//, '')
    .replace(/^neo4j:\/\//, '')
    .replace(/^bolt\+s:\/\//, '')
    .replace(/^bolt:\/\//, '')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')

  return {
    endpoint: `https://${host}/db/${encodeURIComponent(database)}/query/v2`,
    username,
    password,
  }
}

function oneLineCypher(statement: string) {
  return statement.replace(/\s+/g, ' ').trim()
}

async function runNeo4jQuery<T>(
  statement: string,
  parameters: Record<string, unknown> = {},
): Promise<T | null> {
  const config = getNeo4jConfig()
  if (!config) return null

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      statement: oneLineCypher(statement),
      parameters,
      txMetadata: {
        appName: 'Rentor',
      },
    }),
  })

  const body = (await response.json().catch(() => ({}))) as Neo4jQueryResponse
  const error = body.errors?.[0]

  if (!response.ok || error) {
    throw new Error(error?.message ?? `Neo4j Query API request failed with ${response.status}`)
  }

  return body as T
}

function sourceType(source: RetrievedSource) {
  return source.citationId?.startsWith('KB') ? 'knowledge_base' : 'uploaded_document'
}

export async function verifyNeo4jConnection() {
  return runNeo4jQuery<Neo4jQueryResponse>('RETURN 1 AS ok')
}

export async function persistAnalysisToNeo4j({ request, response }: PersistAnalysisInput) {
  const analysisId = randomUUID()
  const { caseData, documents } = request
  const sources = response.retrievedSources.map((source) => ({
    ...source,
    type: sourceType(source),
  }))

  await runNeo4jQuery(
    `
    MERGE (tenant:Tenant {name: $caseData.tenantName})
    MERGE (landlord:Landlord {name: $caseData.landlordName})
    CREATE (caseNode:DepositDisputeCase {
      id: $analysisId,
      depositAmount: $caseData.depositAmount,
      totalDeductionAmount: $caseData.totalDeductionAmount,
      tenancyStartDate: $caseData.tenancyStartDate,
      tenancyEndDate: $caseData.tenancyEndDate,
      depositScheme: $caseData.depositScheme,
      issueCategory: $caseData.issueCategory,
      userQuestion: $caseData.userQuestion,
      createdAt: datetime()
    })
    MERGE (tenant)-[:RAISED]->(caseNode)
    MERGE (landlord)-[:RESPONDS_TO]->(caseNode)
    CREATE (analysis:AnalysisResult {
      id: $analysisId,
      summary: $finalResponse.summary,
      draftEmail: $finalResponse.draftEmail,
      disclaimer: $finalResponse.disclaimer,
      overallConfidence: $evaluations.aggregate.overallConfidence,
      overallRisk: $evaluations.aggregate.overallRisk,
      approved: $evaluations.aggregate.approved,
      chunksUsed: $metadata.chunksUsed,
      retrievalStrategy: $metadata.retrievalStrategy,
      createdAt: datetime()
    })
    MERGE (caseNode)-[:HAS_ANALYSIS]->(analysis)
    FOREACH (doc IN $documents |
      CREATE (document:UploadedDocument {
        id: randomUUID(),
        name: doc.name,
        type: doc.type,
        textLength: size(doc.text)
      })
      MERGE (caseNode)-[:INCLUDES_DOCUMENT]->(document)
    )
    FOREACH (deduction IN $deductions |
      CREATE (deductionNode:DeductionAnalysis {
        id: randomUUID(),
        deductionType: deduction.deductionType,
        amount: deduction.amount,
        position: deduction.position,
        strength: deduction.strength,
        reasoning: deduction.reasoning,
        evidenceUsed: deduction.evidenceUsed,
        missingEvidence: deduction.missingEvidence,
        citations: deduction.citations
      })
      MERGE (analysis)-[:ASSESSES]->(deductionNode)
    )
    FOREACH (source IN $sources |
      MERGE (sourceNode:RetrievedSource {
        sourceName: source.sourceName,
        chunkId: source.chunkId
      })
      SET sourceNode.excerpt = source.excerpt,
          sourceNode.score = source.score,
          sourceNode.retrievalGroup = source.retrievalGroup,
          sourceNode.citationId = source.citationId,
          sourceNode.type = source.type
      MERGE (analysis)-[:USED_SOURCE]->(sourceNode)
    )
    RETURN caseNode.id AS id
    `,
    {
      analysisId,
      caseData,
      documents,
      finalResponse: response.finalResponse,
      evaluations: response.evaluations,
      metadata: response.metadata,
      deductions: response.finalResponse.deductionAnalysis,
      sources,
    },
  )
}
