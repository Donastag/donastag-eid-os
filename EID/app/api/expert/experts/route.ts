import { type NextRequest } from 'next/server'

const EXPERT_URL = process.env.EXPERT_URL || 'http://expert_system:8015'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  url.hostname = new URL(EXPERT_URL).hostname
  url.port = new URL(EXPERT_URL).port
  url.protocol = new URL(EXPERT_URL).protocol
  url.pathname = '/experts'
  url.search = 'limit=50'

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to load experts' }), { status: res.status })
  }
  return new Response(await res.text(), { status: 200 })
}
