import type { TextChunk } from '@/lib/case/caseTypes'

function cosine(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB)
  return denom === 0 ? 0 : dot / denom
}

export class VectorStore {
  private chunks: TextChunk[] = []

  addChunks(chunks: TextChunk[]) {
    this.chunks.push(...chunks)
  }

  clear() {
    this.chunks = []
  }

  size() {
    return this.chunks.length
  }

  query(queryEmbedding: number[], topK: number): Array<TextChunk & { score: number }> {
    return this.chunks
      .filter((c) => c.embedding && c.embedding.length > 0)
      .map((c) => ({ ...c, score: cosine(queryEmbedding, c.embedding!) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
  }
}

// Module-level knowledge-base store (persists across requests in the same server process)
export const knowledgeBaseStore = new VectorStore()
