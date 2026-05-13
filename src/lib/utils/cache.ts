import fs from 'fs'
import path from 'path'

const CACHE_DIR = path.join(process.cwd(), '.cache')

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
}

export function readCache<T>(key: string): T | null {
  try {
    ensureCacheDir()
    const filePath = path.join(CACHE_DIR, `${key}.json`)
    if (!fs.existsSync(filePath)) return null
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data) as T
  } catch {
    return null
  }
}

export function writeCache<T>(key: string, data: T): void {
  try {
    ensureCacheDir()
    const filePath = path.join(CACHE_DIR, `${key}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8')
  } catch {
    // Non-fatal: cache write failure just means next request re-embeds
  }
}
