'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface JournalEntry {
  id: string
  source: string
  title: string
  body: string
  tags?: string[]
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/journal/entries')
        if (!res.ok) throw new Error('Failed to load journal')
        const data = await res.json()
        setEntries(data.entries || [])
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
        <h1 className="text-3xl font-bold text-white">Engineering Journal</h1>
        <p className="text-neutral-400 text-sm">Timestamped engineering notes and decisions.</p>
        {loading ? (
          <div className="flex items-center gap-2 text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading journal...
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : entries.length === 0 ? (
          <div className="surface-primary rounded-lg p-6 text-sm text-neutral-500">No journal entries yet.</div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="surface-primary rounded-lg divide-y divide-white/5">
                <div className="p-4">
                  <div className="text-sm font-medium text-white">{entry.title}</div>
                  <div className="text-xs text-neutral-500">{entry.source} • {entry.created_at ? new Date(entry.created_at).toLocaleString() : ''}</div>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {entry.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 rounded bg-white/5 text-neutral-400">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4 text-xs text-neutral-300 whitespace-pre-wrap">{entry.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
