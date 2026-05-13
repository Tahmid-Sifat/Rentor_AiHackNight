import { DEMO_CASE_DATA, DEMO_DOCUMENTS } from '@/lib/case/demoCase'

export async function GET() {
  return Response.json({ caseData: DEMO_CASE_DATA, documents: DEMO_DOCUMENTS })
}
