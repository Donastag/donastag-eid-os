import { type NextRequest } from 'next/server'

const ASSET_URL = process.env.ASSET_URL || 'http://asset_evolution:8012'

export async function GET(request: NextRequest) {
  const assetId = request.nextUrl.searchParams.get('asset_id')
  if (!assetId) {
    return new Response(JSON.stringify({ error: 'asset_id is required' }), { status: 400 })
  }

  const url = new URL(request.url)
  url.hostname = new URL(ASSET_URL).hostname
  url.port = new URL(ASSET_URL).port
  url.protocol = new URL(ASSET_URL).protocol
  url.pathname = '/events'
  url.search = `asset_id=${encodeURIComponent(assetId)}&limit=50`

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to load events' }), { status: res.status })
  }
  return new Response(await res.text(), { status: 200 })
}
