'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface CheckItem {
  name: string
  passed: boolean
}

interface Verification {
  id: string
  request_id: string
  status: string
  checks: CheckItem[]
  result: Record<string, any>
  created_at?: string
  updated_at?: string
}

export default function VerificationPage() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/verifications')
        if (!res.ok) throw new Error('Failed to load verifications')
        const data = await res.json()
        const items = (data.verifications || []).map((item: any) => ({
          ...item,
          checks: typeof item.checks === 'string' ? JSON.parse(item.checks) : item.checks,
          result: typeof item.result === 'string' ? JSON.parse(item.result) : item.result,
        }))
        setVerifications(items)
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
        <h1 className="text-3xl font-bold text-white">Verification</h1>
        <p className="text-neutral-400 text-sm">Latest Director request verifications.</p>
        {loading ? (
          <div className="flex items-center gap-2 text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading verifications...
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : verifications.length === 0 ? (
          <div className="surface-primary rounded-lg p-6 text-sm text-neutral-500">No verifications yet.</div>
        ) : (
          <div className="space-y-4">
            {verifications.map((item) => (
              <div key={item.id} className="surface-primary rounded-lg divide-y divide-white/5">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Request {item.request_id}</div>
                    <div className="text-xs text-neutral-500">{item.created_at ? new Date(item.created_at).toLocaleString() : ''}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {item.status === 'passed' ? (
                      <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="w-4 h-4" /> passed</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400"><XCircle className="w-4 h-4" /> failed</span>
                    )}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {(item.checks || []).map((check) => (
                    <div key={check.name} className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">{check.name}</span>
                      <span className={check.passed ? 'text-success' : 'text-red-400'}>{check.passed ? 'passed' : 'failed'}</span>
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
