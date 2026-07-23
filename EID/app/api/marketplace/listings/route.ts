import { type NextRequest } from 'next/server'

const MARKETPLACE_URL = process.env.MARKETPLACE_URL || 'http://marketplace:8014'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  url.hostname = new URL(MARKETPLACE_URL).hostname
  url.port = new URL(MARKETPLACE_URL).port
  url.protocol = new URL(MARKETPLACE_URL).protocol
  url.pathname = '/listings'
  url.search = 'limit=50'

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to load listings' }), { status: res.status })
  }
  return new Response(await res.text(), { status: 200 })
}
