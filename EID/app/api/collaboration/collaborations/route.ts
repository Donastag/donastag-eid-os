import { type NextRequest } from 'next/server'

const COLLAB_URL = process.env.COLLAB_URL || 'http://collaboration:8013'

export async function GET(request: NextRequest) {
  const assetId = request.nextUrl.searchParams.get('asset_id')
  if (!assetId) {
    return new Response(JSON.stringify({ error: 'asset_id is required' }), { status: 400 })
  }

  const url = new URL(request.url)
  url.hostname = new URL(COLLAB_URL).hostname
  url.port = new URL(COLLAB_URL).port
  url.protocol = new URL(COLLAB_URL).protocol
  url.pathname = '/collaborations'
  url.search = `asset_id=${encodeURIComponent(assetId)}&limit=50`

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to load collaborations' }), { status: res.status })
  }
  return new Response(await res.text(), { status: 200 })
}
