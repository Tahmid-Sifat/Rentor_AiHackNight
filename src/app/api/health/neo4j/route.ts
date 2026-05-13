import { verifyNeo4jConnection } from '@/lib/neo4j/queryApi'

export const runtime = 'nodejs'

export async function GET() {
  try {
    await verifyNeo4jConnection()
    return Response.json({ ok: true })
  } catch (err) {
    console.error('Neo4j health check failed:', err)
    return Response.json({ ok: false }, { status: 503 })
  }
}
