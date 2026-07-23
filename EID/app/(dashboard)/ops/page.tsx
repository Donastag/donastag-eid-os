'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface OpItem {
  name: string
  status: string
  detail?: string
}

export default function OpsPage() {
  const [items, setItems] = useState<OpItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/ops/health')
        if (!res.ok) throw new Error('Failed to load ops')
        const data = await res.json()
        setItems(data.items || [])
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
        <h1 className="text-3xl font-bold text-white">Operations</h1>
        <p className="text-neutral-400 text-sm">Backup, restore, and operational commands.</p>
        {loading ? (
          <div className="flex items-center gap-2 text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading operations...
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.name} className="surface-primary rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{item.name}</div>
                  <div className="text-xs text-neutral-500">{item.detail || item.status}</div>
                </div>
                <span className={`text-xs ${item.status === 'ok' ? 'text-green-400' : 'text-red-400'}`}>{item.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
