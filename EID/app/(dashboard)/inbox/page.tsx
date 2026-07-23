'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface InboxItem {
  id: string
  source: string
  subject: string
  body: string
  status: string
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/inbox/items')
        if (!res.ok) throw new Error('Failed to load inbox')
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
        <h1 className="text-3xl font-bold text-white">Inbox</h1>
        <p className="text-neutral-400 text-sm">Engineering intake and requests.</p>
        {loading ? (
          <div className="flex items-center gap-2 text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading inbox...
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : items.length === 0 ? (
          <div className="surface-primary rounded-lg p-6 text-sm text-neutral-500">No inbox items yet.</div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="surface-primary rounded-lg divide-y divide-white/5">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">{item.subject}</div>
                    <div className="text-xs text-neutral-500">{item.source} • {item.created_at ? new Date(item.created_at).toLocaleString() : ''}</div>
                  </div>
                  <span className="text-xs text-neutral-400">{item.status}</span>
                </div>
                <div className="p-4 text-xs text-neutral-300 whitespace-pre-wrap">{item.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
