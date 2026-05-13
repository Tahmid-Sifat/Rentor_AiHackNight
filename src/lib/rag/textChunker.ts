import type { TextChunk } from '@/lib/case/caseTypes'

const CHUNK_SIZE = 600
const OVERLAP = 100

export function chunkText(text: string, source: string, metadata: Record<string, string> = {}): TextChunk[] {
  const words = text.split(/\s+/).filter(Boolean)
  const chunks: TextChunk[] = []
  let i = 0
  let chunkIndex = 0

  while (i < words.length) {
    const slice = words.slice(i, i + CHUNK_SIZE).join(' ')
    chunks.push({
      id: `${source}-chunk-${chunkIndex}`,
      text: slice,
      source,
      metadata,
    })
    chunkIndex++
    i += CHUNK_SIZE - OVERLAP
    if (i >= words.length) break
  }

  return chunks
}

export function chunkDocuments(
  docs: Array<{ name: string; text: string; type?: string }>,
): TextChunk[] {
  return docs.flatMap((doc) =>
    chunkText(doc.text, doc.name, { type: doc.type ?? 'document' }),
  )
}
