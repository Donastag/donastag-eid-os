import { type NextRequest } from 'next/server'

const INBOX_URL = process.env.INBOX_URL || 'http://inbox:8000'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  url.hostname = new URL(INBOX_URL).hostname
  url.port = new URL(INBOX_URL).port
  url.protocol = new URL(INBOX_URL).protocol
  url.pathname = '/items'
  url.search = 'limit=50'

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to load inbox' }), { status: res.status })
  }
  return new Response(await res.text(), { status: 200 })
}
