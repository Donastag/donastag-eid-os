import { type NextRequest } from 'next/server'

const VERIFICATION_URL = process.env.VERIFICATION_URL || 'http://verification_engine:8000'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  url.hostname = new URL(VERIFICATION_URL).hostname
  url.port = new URL(VERIFICATION_URL).port
  url.protocol = new URL(VERIFICATION_URL).protocol
  url.pathname = '/verifications'
  url.search = 'limit=50'

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to load verifications' }), { status: res.status })
  }
  return new Response(await res.text(), { status: 200 })
}
