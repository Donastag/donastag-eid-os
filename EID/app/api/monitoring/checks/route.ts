import { type NextRequest } from 'next/server'

const MONITORING_URL = process.env.MONITORING_URL || 'http://monitoring:8000'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  url.hostname = new URL(MONITORING_URL).hostname
  url.port = new URL(MONITORING_URL).port
  url.protocol = new URL(MONITORING_URL).protocol
  url.pathname = '/checks'
  url.search = 'limit=50'

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to load checks' }), { status: res.status })
  }
  return new Response(await res.text(), { status: 200 })
}
