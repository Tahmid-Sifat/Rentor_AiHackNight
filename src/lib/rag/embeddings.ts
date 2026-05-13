import { generateEmbeddings } from '@/lib/ai/llmClient'
import type { TextChunk } from '@/lib/case/caseTypes'

export async function embedChunks(chunks: TextChunk[]): Promise<TextChunk[]> {
  if (chunks.length === 0) return []

  // Batch in groups of 100 to respect API limits
  const BATCH = 100
  const result: TextChunk[] = []

  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH)
    const texts = batch.map((c) => c.text)
    const embeddings = await generateEmbeddings(texts)
    batch.forEach((chunk, idx) => {
      result.push({ ...chunk, embedding: embeddings[idx] })
    })
  }

  return result
}
