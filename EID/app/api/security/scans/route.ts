import { type NextRequest } from 'next/server'

const SECURITY_URL = process.env.SECURITY_URL || 'http://security_engine:8000'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  url.hostname = new URL(SECURITY_URL).hostname
  url.port = new URL(SECURITY_URL).port
  url.protocol = new URL(SECURITY_URL).protocol
  url.pathname = '/scans'
  url.search = 'limit=50'

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to load security scans' }), { status: res.status })
  }
  return new Response(await res.text(), { status: 200 })
}
