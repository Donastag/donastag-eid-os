import { type NextRequest } from 'next/server'

const COLLAB_URL = process.env.COLLAB_URL || 'http://collaboration:8013'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  url.hostname = new URL(COLLAB_URL).hostname
  url.port = new URL(COLLAB_URL).port
  url.protocol = new URL(COLLAB_URL).protocol
  url.pathname = '/collaborators'
  url.search = 'limit=50'

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to load collaborators' }), { status: res.status })
  }
  return new Response(await res.text(), { status: 200 })
}
