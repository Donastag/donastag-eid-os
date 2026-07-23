import { type NextRequest } from 'next/server'

const WORKFLOW_URL = process.env.WORKFLOW_URL || 'http://workflow:8000'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  url.hostname = new URL(WORKFLOW_URL).hostname
  url.port = new URL(WORKFLOW_URL).port
  url.protocol = new URL(WORKFLOW_URL).protocol
  url.pathname = '/runs'
  url.search = 'limit=50'

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to load workflow runs' }), { status: res.status })
  }
  return new Response(await res.text(), { status: 200 })
}
