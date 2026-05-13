import { generateEmbedding } from '@/lib/ai/llmClient'
import { VectorStore, knowledgeBaseStore } from '@/lib/rag/vectorStore'
import { embedChunks } from '@/lib/rag/embeddings'
import { chunkDocuments } from '@/lib/rag/textChunker'
import { loadKnowledgeBase } from '@/lib/rag/documentLoader'
import { readCache, writeCache } from '@/lib/utils/cache'
import crypto from 'crypto'
import type { TextChunk, RetrievedSource, UploadedDocument } from '@/lib/case/caseTypes'

let kbInitialised = false

type ScoredChunk = TextChunk & { score: number }

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'can',
  'for',
  'from',
  'has',
  'have',
  'how',
  'i',
  'if',
  'in',
  'is',
  'it',
  'landlord',
  'my',
  'of',
  'on',
  'or',
  'should',
  'tenant',
  'that',
  'the',
  'this',
  'to',
  'uk',
  'was',
  'what',
  'with',
])

const TOPIC_TERMS: Record<string, string[]> = {
  cleaning: ['clean', 'cleaning', 'oven', 'hygiene', 'domestic', 'professional'],
  damage: ['damage', 'damaged', 'repair', 'replace', 'replacement', 'stain', 'broken'],
  wear: ['wear', 'tear', 'scuff', 'scuffs', 'marks', 'repainting', 'paint', 'decoration'],
  admin: ['admin', 'administration', 'fee', 'fees', 'charge', 'tenant fees act', 'default'],
  evidence: ['evidence', 'invoice', 'receipt', 'photo', 'photograph', 'inventory', 'check-in', 'check-out'],
  deposit: ['deposit', 'scheme', 'adr', 'dispute', 'protection', 'dps', 'tds', 'mydeposits'],
  risk: ['eviction', 'harassment', 'threat', 'court', 'unprotected', 'discrimination'],
}

interface KnowledgeBaseEmbeddingCache {
  version: 1
  corpusHash: string
  embeddingDim: number
  chunks: TextChunk[]
}

function getKnowledgeBaseCorpusHash(docs: Array<{ name: string; text: string; type: string }>): string {
  const hash = crypto.createHash('sha256')
  for (const doc of [...docs].sort((a, b) => a.name.localeCompare(b.name))) {
    hash.update(doc.name)
    hash.update('\0')
    hash.update(doc.type)
    hash.update('\0')
    hash.update(doc.text)
    hash.update('\0')
  }
  return hash.digest('hex')
}

function isKnowledgeBaseCache(value: unknown): value is KnowledgeBaseEmbeddingCache {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as KnowledgeBaseEmbeddingCache).version === 1 &&
    typeof (value as KnowledgeBaseEmbeddingCache).corpusHash === 'string' &&
    typeof (value as KnowledgeBaseEmbeddingCache).embeddingDim === 'number' &&
    Array.isArray((value as KnowledgeBaseEmbeddingCache).chunks)
  )
}

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9-]+/g) ?? [])
    .map((token) => token.replace(/^-+|-+$/g, ''))
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
}

function getActiveTopicTerms(query: string): string[] {
  const normalized = query.toLowerCase()
  const terms = new Set<string>()

  for (const [topic, topicTerms] of Object.entries(TOPIC_TERMS)) {
    if (normalized.includes(topic) || topicTerms.some((term) => normalized.includes(term))) {
      for (const term of topicTerms) terms.add(term)
    }
  }

  return [...terms]
}

function keywordScore(queryTokens: Set<string>, chunk: TextChunk): number {
  if (queryTokens.size === 0) return 0

  const chunkTokens = new Set(tokenize(`${chunk.source} ${chunk.metadata.type ?? ''} ${chunk.text}`))
  let overlap = 0
  for (const token of queryTokens) {
    if (chunkTokens.has(token)) overlap++
  }

  return overlap / queryTokens.size
}

function boostScore(query: string, chunk: TextChunk): number {
  const haystack = `${chunk.source} ${chunk.metadata.type ?? ''} ${chunk.text.slice(0, 500)}`.toLowerCase()
  const activeTerms = getActiveTopicTerms(query)
  let boost = 0

  for (const term of activeTerms) {
    if (haystack.includes(term)) boost += 0.025
  }

  const source = chunk.source.toLowerCase()
  const type = (chunk.metadata.type ?? '').toLowerCase()
  const normalizedQuery = query.toLowerCase()

  if (normalizedQuery.includes('clean') && source.includes('cleaning')) boost += 0.12
  if ((normalizedQuery.includes('admin') || normalizedQuery.includes('fee')) && source.includes('tenant-fees')) {
    boost += 0.12
  }
  if ((normalizedQuery.includes('wear') || normalizedQuery.includes('repaint') || normalizedQuery.includes('scuff')) && source.includes('wear')) {
    boost += 0.12
  }
  if (normalizedQuery.includes('evidence') && source.includes('evidence')) boost += 0.08
  if (normalizedQuery.includes('deposit') && source.includes('deposit')) boost += 0.08

  if (type.includes('inventory') && activeTerms.some((term) => ['inventory', 'check-in', 'check-out'].includes(term))) {
    boost += 0.08
  }
  if (type.includes('checkout') && normalizedQuery.includes('check-out')) boost += 0.08
  if (type.includes('tenancy') && normalizedQuery.includes('clause')) boost += 0.08
  if (type.includes('email') && (normalizedQuery.includes('deduction') || normalizedQuery.includes('landlord'))) {
    boost += 0.08
  }

  return Math.min(boost, 0.35)
}

function hybridRank(query: string, candidates: ScoredChunk[], topK: number): ScoredChunk[] {
  const queryTokens = new Set(tokenize(query))

  return candidates
    .map((candidate) => {
      const semantic = candidate.score
      const lexical = keywordScore(queryTokens, candidate)
      const boost = boostScore(query, candidate)
      const score = semantic * 0.72 + lexical * 0.2 + boost
      return { ...candidate, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}

async function ensureKnowledgeBase() {
  if (kbInitialised && knowledgeBaseStore.size() > 0) return

  const docs = loadKnowledgeBase()
  if (docs.length === 0) return

  const corpusHash = getKnowledgeBaseCorpusHash(docs)
  const probe = await generateEmbedding('probe')

  const cached = readCache<unknown>('kb-embeddings')
  if (isKnowledgeBaseCache(cached)) {
    if (cached.corpusHash === corpusHash && cached.embeddingDim === probe.length) {
      knowledgeBaseStore.clear()
      knowledgeBaseStore.addChunks(cached.chunks)
      kbInitialised = true
      return
    }

    console.warn(
      `[retriever] KB cache invalidated: ` +
        `corpus ${cached.corpusHash === corpusHash ? 'unchanged' : 'changed'}, ` +
        `embedding dim ${cached.embeddingDim} -> ${probe.length}`,
    )
  } else if (Array.isArray(cached)) {
    console.warn('[retriever] legacy KB embedding cache detected, regenerating with corpus fingerprint')
  }

  const chunks = chunkDocuments(docs)
  const embedded = await embedChunks(chunks)
  knowledgeBaseStore.clear()
  knowledgeBaseStore.addChunks(embedded)
  writeCache<KnowledgeBaseEmbeddingCache>('kb-embeddings', {
    version: 1,
    corpusHash,
    embeddingDim: probe.length,
    chunks: embedded,
  })
  kbInitialised = true
}

export async function retrieveKnowledgeChunks(
  query: string,
  topK = 4,
): Promise<RetrievedSource[]> {
  await ensureKnowledgeBase()
  if (knowledgeBaseStore.size() === 0) return []

  const queryEmbedding = await generateEmbedding(query)
  const candidateCount = Math.min(knowledgeBaseStore.size(), Math.max(topK * 8, 16))
  const candidates = knowledgeBaseStore.query(queryEmbedding, candidateCount)
  const results = hybridRank(query, candidates, topK)

  return results.map((r) => ({
    sourceName: r.source,
    chunkId: r.id,
    excerpt: r.text.slice(0, 300) + (r.text.length > 300 ? '...' : ''),
    score: r.score,
  }))
}

export async function retrieveDocumentChunks(
  docs: UploadedDocument[],
  query: string,
  topK = 3,
): Promise<RetrievedSource[]> {
  if (docs.length === 0) return []

  const store = new VectorStore()
  const chunks = chunkDocuments(docs)
  const embedded = await embedChunks(chunks)
  store.addChunks(embedded)

  const queryEmbedding = await generateEmbedding(query)
  const candidateCount = Math.min(store.size(), Math.max(topK * 8, 16))
  const candidates = store.query(queryEmbedding, candidateCount)
  const results = hybridRank(query, candidates, topK)

  return results.map((r) => ({
    sourceName: r.source,
    chunkId: r.id,
    excerpt: r.text.slice(0, 300) + (r.text.length > 300 ? '...' : ''),
    score: r.score,
  }))
}
