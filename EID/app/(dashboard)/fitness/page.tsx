'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface FitnessResult {
  id: string
  rule: string
  status: string
  detail?: string
  score_impact?: number
  created_at?: string
}

export default function FitnessPage() {
  const [results, setResults] = useState<FitnessResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/fitness/results')
        if (!res.ok) throw new Error('Failed to load fitness results')
        const data = await res.json()
        setResults(data.results || [])
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
        <h1 className="text-3xl font-bold text-white">Architecture Fitness</h1>
        <p className="text-neutral-400 text-sm">Rules-based architecture evaluation.</p>
        {loading ? (
          <div className="flex items-center gap-2 text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading fitness results...
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : results.length === 0 ? (
          <div className="surface-primary rounded-lg p-6 text-sm text-neutral-500">No fitness results yet.</div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <div key={result.id} className="surface-primary rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{result.rule}</div>
                  <div className="text-xs text-neutral-500">{result.detail || result.status}</div>
                </div>
                <span className={`text-xs ${result.status === 'passed' ? 'text-green-400' : 'text-red-400'}`}>{result.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
