import { runMainDisputeAgent } from '@/lib/agents/mainDisputeAgent'
import { runLegalEvaluator } from '@/lib/agents/legalEvaluatorAgent'
import { runEvidenceEvaluator } from '@/lib/agents/evidenceEvaluatorAgent'
import { runRiskEvaluator } from '@/lib/agents/riskEvaluatorAgent'
import { runToneEvaluator } from '@/lib/agents/toneEvaluatorAgent'
import { aggregateEvaluations } from '@/lib/agents/evaluatorAggregator'
import { composeFinalResponse } from '@/lib/agents/finalComposer'
import { retrieveKnowledgeChunks, retrieveDocumentChunks } from '@/lib/rag/retriever'
import { buildRetrievalQueries } from '@/lib/rag/queryCompressor'
import { buildCaseFacts, buildKnowledgeContext, buildEvidenceContext } from '@/lib/rag/contextBuilder'
import { persistAnalysisToNeo4j } from '@/lib/neo4j/queryApi'
import type { AnalysisRequest, AnalysisResponse, RetrievedSource } from '@/lib/case/caseTypes'

export const runtime = 'nodejs'

function withRetrievalGroup(sources: RetrievedSource[], group: string): RetrievedSource[] {
  return sources.map((source) => ({ ...source, retrievalGroup: group }))
}

function dedupeSources(sources: RetrievedSource[], maxSources: number): RetrievedSource[] {
  const bestByChunk = new Map<string, RetrievedSource>()

  for (const source of sources) {
    const key = `${source.sourceName}:${source.chunkId}`
    const existing = bestByChunk.get(key)
    if (!existing || (source.score ?? 0) > (existing.score ?? 0)) {
      bestByChunk.set(key, source)
    }
  }

  return [...bestByChunk.values()]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, maxSources)
}

function assignCitationIds(kbSources: RetrievedSource[], docSources: RetrievedSource[]) {
  return {
    kbSources: kbSources.map((source, index) => ({ ...source, citationId: `KB${index + 1}` })),
    docSources: docSources.map((source, index) => ({ ...source, citationId: `DOC${index + 1}` })),
  }
}

export async function POST(request: Request) {
  try {
    const body: AnalysisRequest = await request.json()
    const { caseData, documents } = body

    // 1. Build focused queries for each likely deduction/theme
    const retrievalQueries = buildRetrievalQueries(caseData, documents)

    // 2. Retrieve knowledge-base and document chunks per deduction/theme
    const retrievalResults = await Promise.all(
      retrievalQueries.map(async ({ label, query }) => {
        const [kbSources, docSources] = await Promise.all([
          retrieveKnowledgeChunks(query, 2),
          retrieveDocumentChunks(documents, query, 2),
        ])

        return {
          kbSources: withRetrievalGroup(kbSources, label),
          docSources: withRetrievalGroup(docSources, label),
        }
      }),
    )

    const dedupedKbSources = dedupeSources(retrievalResults.flatMap((result) => result.kbSources), 10)
    const dedupedDocSources = dedupeSources(retrievalResults.flatMap((result) => result.docSources), 8)
    const { kbSources, docSources } = assignCitationIds(dedupedKbSources, dedupedDocSources)
    const allSources = [...kbSources, ...docSources]

    // 3. Build context strings
    const caseFacts = buildCaseFacts(caseData)
    const knowledgeContext = buildKnowledgeContext(kbSources)
    const evidenceContext = buildEvidenceContext(documents, docSources)

    // 4. Run main agent
    const mainResponse = await runMainDisputeAgent(
      caseFacts,
      caseData.userQuestion,
      knowledgeContext,
      evidenceContext,
    )

    const mainResponseStr = JSON.stringify(mainResponse)

    // 5. Run all evaluators in parallel
    const [legal, evidence, risk, tone] = await Promise.all([
      runLegalEvaluator(mainResponseStr, knowledgeContext),
      runEvidenceEvaluator(mainResponseStr, evidenceContext),
      runRiskEvaluator(caseFacts, mainResponseStr),
      runToneEvaluator(mainResponseStr),
    ])

    // 6. Aggregate and compose final response
    const aggregate = aggregateEvaluations(legal, evidence, risk, tone)
    const finalResponse = composeFinalResponse(mainResponse, risk, aggregate, legal)

    const totalChunksAvailable = retrievalQueries.length * 4 + documents.length * 3 + 7

    const response: AnalysisResponse = {
      finalResponse,
      retrievedSources: allSources,
      evaluations: { legal, evidence, risk, tone, aggregate },
      metadata: {
        chunksUsed: allSources.length,
        totalChunksAvailable,
        estimatedTokensSaved: `Only ${allSources.length} of ~${totalChunksAvailable} available chunks sent to the model, reducing context by ~${Math.round((1 - allSources.length / totalChunksAvailable) * 100)}%.`,
        retrievalStrategy: `Per-deduction hybrid retrieval across ${retrievalQueries.length} focused queries`,
      },
    }

    try {
      await persistAnalysisToNeo4j({ request: body, response })
    } catch (err) {
      console.error('Neo4j persistence error:', err)
    }

    return Response.json(response)
  } catch (err) {
    console.error('Analysis error:', err)
    return Response.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}
