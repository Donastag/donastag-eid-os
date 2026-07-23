'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface Collaborator {
  id: string
  name: string
  role: string
  email?: string
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

interface Collaboration {
  id: string
  collaborator_id: string
  collaborator_name?: string
  asset_id: string
  permission: string
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export default function CollaborationPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [collaborations, setCollaborations] = useState<Collaboration[]>([])
  const [assetId, setAssetId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCollaborators = async () => {
    try {
      const res = await fetch('/api/collaboration/collaborators')
      if (!res.ok) throw new Error('Failed to load collaborators')
      const data = await res.json()
      setCollaborators(data.collaborators || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  const loadCollaborations = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/collaboration/collaborations?asset_id=${encodeURIComponent(id)}`)
      if (!res.ok) throw new Error('Failed to load collaborations')
      const data = await res.json()
      setCollaborations(data.collaborations || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCollaborators()
  }, [])

  return (
    <main className="flex-1 overflow-auto bg-gradient-to-b from-neutral-950 to neutral-900/50">
      <div className="px-8 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-white">Collaboration</h1>
        <p className="text-neutral-400 text-sm">Collaborators and asset access.</p>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <div className="grid grid-cols-2 gap-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Collaborators</h2>
            {collaborators.length === 0 ? (
              <div className="surface-primary rounded-lg p-6 text-sm text-neutral-500">No collaborators yet.</div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((c) => (
                  <div key={c.id} className="surface-primary rounded-lg p-4">
                    <div className="text-sm font-medium text-white">{c.name}</div>
                    <div className="text-xs text-neutral-500">{c.role} • {c.email || ''}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Asset Collaborations</h2>
            <input
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              placeholder="Asset ID"
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-500"
            />
            <button
              onClick={() => assetId && loadCollaborations(assetId)}
              className="px-4 py-2 bg-white text-black rounded-lg text-sm hover:bg-neutral-200 transition"
            >
              Load Collaborations
            </button>
            {loading && <div className="flex items-center gap-2 text-neutral-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>}
            {collaborations.length === 0 && !loading && <div className="text-sm text-neutral-500">No collaborations for this asset.</div>}
            <div className="space-y-2">
              {collaborations.map((c) => (
                <div key={c.id} className="surface-primary rounded-lg p-4">
                  <div className="text-sm font-medium text-white">{c.collaborator_name || c.collaborator_id}</div>
                  <div className="text-xs text-neutral-500">{c.permission} • {c.asset_id}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
