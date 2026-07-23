import { type NextRequest } from 'next/server'

const SCORE_URL = process.env.SCORE_URL || 'http://score:8010'

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  url.hostname = new URL(SCORE_URL).hostname
  url.port = new URL(SCORE_URL).port
  url.protocol = new URL(SCORE_URL).protocol
  url.pathname = '/compute'

  const res = await fetch(url.toString(), { method: 'POST', cache: 'no-store' })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to compute score' }), { status: res.status })
  }
  return new Response(await res.text(), { status: 200 })
}
