'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'

interface SecurityScan {
  id: string
  request_id: string
  status: string
  findings: any[]
  score: number
  created_at?: string
  updated_at?: string
}

export default function SecurityPage() {
  const [scans, setScans] = useState<SecurityScan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/security/scans')
        if (!res.ok) throw new Error('Failed to load security scans')
        const data = await res.json()
        setScans(data.scans || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <main className="flex-1 overflow-auto bg-gradient-to-b from-neutral-950 to-neutral-900/50">
      <div className="px-8 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-white">Security</h1>
        <p className="text-neutral-400 text-sm">Latest security scans and findings.</p>
        {loading ? (
          <div className="flex items-center gap-2 text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading security scans...
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : scans.length === 0 ? (
          <div className="surface-primary rounded-lg p-6 text-sm text-neutral-500">No security scans yet.</div>
        ) : (
          <div className="space-y-4">
            {scans.map((scan) => (
              <div key={scan.id} className="surface-primary rounded-lg divide-y divide-white/5">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Request {scan.request_id}</div>
                    <div className="text-xs text-neutral-500">{scan.created_at ? new Date(scan.created_at).toLocaleString() : ''}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={scan.score >= 80 ? 'text-success' : scan.score >= 50 ? 'text-warning' : 'text-red-400'}>
                      Score: {scan.score}
                    </span>
                    <span className="text-neutral-400">{scan.status}</span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {(scan.findings || []).map((finding, idx) => (
                    <div key={idx} className="flex items-start justify-between text-xs">
                      <div>
                        <span className="text-neutral-400">{finding.title || 'Untitled finding'}</span>
                        {finding.detail && <span className="text-neutral-500 ml-2">{finding.detail}</span>}
                      </div>
                      <span className={finding.severity === 'high' ? 'text-red-400' : finding.severity === 'medium' ? 'text-warning' : 'text-neutral-400'}>
                        {finding.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
