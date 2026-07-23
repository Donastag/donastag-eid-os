import { type NextRequest } from 'next/server'

const JOURNAL_URL = process.env.JOURNAL_URL || 'http://journal:8000'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  url.hostname = new URL(JOURNAL_URL).hostname
  url.port = new URL(JOURNAL_URL).port
  url.protocol = new URL(JOURNAL_URL).protocol
  url.pathname = '/entries'
  url.search = 'limit=50'

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to load journal' }), { status: res.status })
  }
  return new Response(await res.text(), { status: 200 })
}
