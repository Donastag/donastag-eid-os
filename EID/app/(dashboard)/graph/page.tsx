'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface Entity {
  id: string
  kind: string
  name: string
  data?: Record<string, any>
  created_at?: string
  updated_at?: string
}

interface Relation {
  id: string
  source_id: string
  target_id: string
  kind: string
  data?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export default function GraphPage() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [relations, setRelations] = useState<Relation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [entitiesRes, relationsRes] = await Promise.all([
          fetch('/api/kg/entities'),
          fetch('/api/kg/relations'),
        ])
        if (!entitiesRes.ok || !relationsRes.ok) throw new Error('Failed to load graph')
        const entitiesData = await entitiesRes.json()
        const relationsData = await relationsRes.json()
        setEntities(entitiesData.entities || [])
        setRelations(relationsData.relations || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <main className="flex-1 overflow-auto bg-gradient-to-b from-neutral-950 to neutral-900/50">
      <div className="px-8 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-white">Knowledge Graph</h1>
        <p className="text-neutral-400 text-sm">Entities and relations across engineering systems.</p>
        {loading ? (
          <div className="flex items-center gap-2 text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading graph...
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : (
          <div className="space-y-6">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Entities</h2>
              {entities.length === 0 ? (
                <div className="surface-primary rounded-lg p-6 text-sm text-neutral-500">No entities yet.</div>
              ) : (
                <div className="grid gap-3">
                  {entities.map((entity) => (
                    <div key={entity.id} className="surface-primary rounded-lg divide-y divide-white/5">
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-white">{entity.name}</div>
                          <div className="text-xs text-neutral-500">{entity.kind} • {entity.created_at ? new Date(entity.created_at).toLocaleString() : ''}</div>
                        </div>
                      </div>
                      {entity.data && Object.keys(entity.data).length > 0 && (
                        <pre className="p-4 text-xs text-neutral-300 whitespace-pre-wrap">{JSON.stringify(entity.data, null, 2)}</pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Relations</h2>
              {relations.length === 0 ? (
                <div className="surface-primary rounded-lg p-6 text-sm text-neutral-500">No relations yet.</div>
              ) : (
                <div className="grid gap-3">
                  {relations.map((relation) => (
                    <div key={relation.id} className="surface-primary rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">{relation.kind}</div>
                        <div className="text-xs text-neutral-500">{relation.source_id} → {relation.target_id}</div>
                      </div>
                      <span className="text-xs text-neutral-400">{relation.created_at ? new Date(relation.created_at).toLocaleString() : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
