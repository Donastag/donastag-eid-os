import { type NextRequest } from 'next/server'

const WORKFLOW_URL = process.env.WORKFLOW_URL || 'http://workflow:8000'

export async function GET(request: NextRequest) {
  const runId = request.nextUrl.searchParams.get('run_id')
  if (!runId) {
    return new Response(JSON.stringify({ error: 'run_id is required' }), { status: 400 })
  }

  const url = new URL(request.url)
  url.hostname = new URL(WORKFLOW_URL).hostname
  url.port = new URL(WORKFLOW_URL).port
  url.protocol = new URL(WORKFLOW_URL).protocol
  url.pathname = '/events'
  url.search = `run_id=${runId}&limit=100`

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to load workflow events' }), { status: res.status })
  }
  return new Response(await res.text(), { status: 200 })
}
