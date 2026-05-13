import fs from 'fs'
import path from 'path'

export interface RawDocument {
  name: string
  text: string
  type: string
}

export function loadKnowledgeBase(): RawDocument[] {
  const kbDir = path.join(process.cwd(), 'data', 'knowledge-base')
  if (!fs.existsSync(kbDir)) return []

  return fs
    .readdirSync(kbDir)
    .filter((f) => f.endsWith('.md') || f.endsWith('.txt'))
    .map((file) => ({
      name: file,
      text: fs.readFileSync(path.join(kbDir, file), 'utf-8'),
      type: 'knowledge-base',
    }))
}

export function loadDemoCase(): RawDocument[] {
  const demoDir = path.join(process.cwd(), 'data', 'demo-case')
  if (!fs.existsSync(demoDir)) return []

  return fs
    .readdirSync(demoDir)
    .filter((f) => f.endsWith('.txt') || f.endsWith('.md'))
    .map((file) => ({
      name: file,
      text: fs.readFileSync(path.join(demoDir, file), 'utf-8'),
      type: inferDocType(file),
    }))
}

function inferDocType(filename: string): string {
  if (filename.includes('inventory')) return 'inventory'
  if (filename.includes('check-out') || filename.includes('checkout')) return 'checkout'
  if (filename.includes('agreement')) return 'tenancy-agreement'
  if (filename.includes('email') || filename.includes('deduction')) return 'email'
  return 'document'
}
