import { type NextRequest } from 'next/server'

const KG_URL = process.env.KG_URL || 'http://kg:8000'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  url.hostname = new URL(KG_URL).hostname
  url.port = new URL(KG_URL).port
  url.protocol = new URL(KG_URL).protocol
  url.pathname = '/relations'
  url.search = 'limit=100'

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to load relations' }), { status: res.status })
  }
  return new Response(await res.text(), { status: 200 })
}
