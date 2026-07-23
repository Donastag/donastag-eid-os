'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface AssetVersion {
  id: string
  asset_id: string
  version: string
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

interface AssetEvent {
  id: string
  asset_id: string
  from_version?: string
  to_version: string
  kind: string
  payload?: Record<string, any>
  created_at?: string
}

export default function AssetsPage() {
  const [versions, setVersions] = useState<AssetVersion[]>([])
  const [events, setEvents] = useState<AssetEvent[]>([])
  const [assetId, setAssetId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadVersions = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/assets/versions?asset_id=${encodeURIComponent(id)}`)
      if (!res.ok) throw new Error('Failed to load versions')
      const data = await res.json()
      setVersions(data.versions || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const loadEvents = async (id: string) => {
    try {
      const res = await fetch(`/api/assets/events?asset_id=${encodeURIComponent(id)}`)
      if (!res.ok) throw new Error('Failed to load events')
      const data = await res.json()
      setEvents(data.events || [])
    } catch (e) {
      setEvents([])
    }
  }

  const load = (id: string) => {
    setAssetId(id)
    loadVersions(id)
    loadEvents(id)
  }

  return (
    <main className="flex-1 overflow-auto bg-gradient-to-b from-neutral-950 to neutral-900/50">
      <div className="px-8 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-white">Asset Library</h1>
        <p className="text-neutral-400 text-sm">Track asset versions and evolution events.</p>
        <div className="flex gap-2">
          <input
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            placeholder="Asset ID"
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-500"
          />
          <button
            onClick={() => assetId && load(assetId)}
            className="px-4 py-2 bg-white text-black rounded-lg text-sm hover:bg-neutral-200 transition"
          >
            Load
          </button>
        </div>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        {loading && <div className="flex items-center gap-2 text-neutral-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>}
        <div className="grid grid-cols-2 gap-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Versions</h2>
            {versions.length === 0 ? (
              <div className="surface-primary rounded-lg p-6 text-sm text-neutral-500">No versions yet.</div>
            ) : (
              <div className="space-y-2">
                {versions.map((v) => (
                  <div key={v.id} className="surface-primary rounded-lg p-4">
                    <div className="text-sm font-medium text-white">{v.version}</div>
                    <div className="text-xs text-neutral-500">{v.created_at ? new Date(v.created_at).toLocaleString() : ''}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Events</h2>
            {events.length === 0 ? (
              <div className="surface-primary rounded-lg p-6 text-sm text-neutral-500">No events yet.</div>
            ) : (
              <div className="space-y-2">
                {events.map((e) => (
                  <div key={e.id} className="surface-primary rounded-lg p-4">
                    <div className="text-sm font-medium text-white">{e.kind}</div>
                    <div className="text-xs text-neutral-500">{e.from_version || 'none'} → {e.to_version}</div>
                    <div className="text-xs text-neutral-500">{e.created_at ? new Date(e.created_at).toLocaleString() : ''}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
