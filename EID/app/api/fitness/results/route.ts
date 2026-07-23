import { type NextRequest } from 'next/server'

const FITNESS_URL = process.env.FITNESS_URL || 'http://fitness:8011'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  url.hostname = new URL(FITNESS_URL).hostname
  url.port = new URL(FITNESS_URL).port
  url.protocol = new URL(FITNESS_URL).protocol
  url.pathname = '/results'
  url.search = 'limit=50'

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to load fitness results' }), { status: res.status })
  }
  return new Response(await res.text(), { status: 200 })
}
