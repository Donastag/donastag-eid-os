'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface Check {
  target: string
  status: string
  status_code?: number
  detail?: string
  created_at?: string
}

export default function MonitoringPage() {
  const [checks, setChecks] = useState<Check[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/monitoring/checks')
        if (!res.ok) throw new Error('Failed to load checks')
        const data = await res.json()
        setChecks(data.checks || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const latest = checks.reduce<Map<string, Check>>((acc, item) => {
    if (!acc.has(item.target) || (item.created_at || '') > (acc.get(item.target)?.created_at || '')) {
      acc.set(item.target, item)
    }
    return acc
  }, new Map<string, Check>())

  return (
    <main className="flex-1 overflow-auto bg-gradient-to-b from neutral-950 to-neutral-900/50">
      <div className="px-8 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-white">Monitoring</h1>
        <p className="text-neutral-400 text-sm">Latest service health checks.</p>
        {loading ? (
          <div className="flex items-center gap-2 text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading checks...
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from(latest.values()).map((item) => (
              <div key={item.target} className="surface-primary rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-white">{item.target}</div>
                  <span className={
                    item.status === 'up' ? 'text-success' :
                    item.status === 'degraded' ? 'text-warning' :
                    'text-red-400'
                  }>{item.status}</span>
                </div>
                <div className="text-xs text-neutral-500">
                  {item.status_code !== undefined && item.status_code !== null ? `HTTP ${item.status_code}` : 'unreachable'}
                </div>
                {item.detail && <div className="text-xs text-neutral-400">{item.detail}</div>}
                {item.created_at && <div className="text-xs text-neutral-500">{new Date(item.created_at).toLocaleString()}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
