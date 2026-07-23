'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ScoreResponse {
  overall: number
  breakdown: Record<string, number>
  computed_at?: string
}

export default function ScorePage() {
  const [score, setScore] = useState<ScoreResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [computing, setComputing] = useState(false)

  const load = async () => {
    try {
      const res = await fetch('/api/score/latest')
      if (!res.ok) throw new Error('Failed to load score')
      const data = await res.json()
      setScore(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const compute = async () => {
    setComputing(true)
    try {
      await fetch('/api/score/compute', { method: 'POST' })
      await load()
    } finally {
      setComputing(false)
    }
  }

  return (
    <main className="flex-1 overflow-auto bg-gradient-to-b from-neutral-950 to neutral-900/50">
      <div className="px-8 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-white">Engineering Score</h1>
        <p className="text-neutral-400 text-sm">Composite engineering health score.</p>
        {loading ? (
          <div className="flex items-center gap-2 text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading score...
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : (
          <div className="space-y-6">
            <div className="surface-primary rounded-lg p-6">
              <div className="text-sm text-neutral-400 mb-2">Overall Score</div>
              <div className="text-4xl font-bold text-white">{score ? (score.overall * 100).toFixed(1) : '0.0'}</div>
              <div className="text-xs text-neutral-500 mt-2">{score?.computed_at ? new Date(score.computed_at).toLocaleString() : ''}</div>
            </div>
            <div className="grid gap-4">
              {score?.breakdown && Object.entries(score.breakdown).map(([key, value]) => (
                <div key={key} className="surface-primary rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">{key.replace(/_/g, ' ')}</div>
                  </div>
                  <div className="text-sm text-neutral-300">{(value * 100).toFixed(1)}</div>
                </div>
              ))}
            </div>
            <button
              onClick={compute}
              disabled={computing}
              className="px-4 py-2 bg-white text-black rounded-lg text-sm hover:bg-neutral-200 transition disabled:opacity-50"
            >
              {computing ? 'Computing...' : 'Recompute Score'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
