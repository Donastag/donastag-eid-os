'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface Expert {
  id: string
  name: string
  domain: string
  description: string
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

interface Consultation {
  id: string
  expert_id: string
  question: string
  answer?: string
  status: string
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export default function ExpertPage() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [expertsRes, consultationsRes] = await Promise.all([
          fetch('/api/expert/experts'),
          fetch('/api/expert/consultations'),
        ])
        if (!expertsRes.ok || !consultationsRes.ok) throw new Error('Failed to load expert data')
        const expertsData = await expertsRes.json()
        const consultationsData = await consultationsRes.json()
        setExperts(expertsData.experts || [])
        setConsultations(consultationsData.consultations || [])
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
        <h1 className="text-3xl font-bold text-white">Expert System</h1>
        <p className="text-neutral-400 text-sm">Domain experts and consultations.</p>
        {loading ? (
          <div className="flex items-center gap-2 text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading experts...
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Experts</h2>
              {experts.length === 0 ? (
                <div className="surface-primary rounded-lg p-6 text-sm text-neutral-500">No experts yet.</div>
              ) : (
                <div className="space-y-2">
                  {experts.map((expert) => (
                    <div key={expert.id} className="surface-primary rounded-lg p-4">
                      <div className="text-sm font-medium text-white">{expert.name}</div>
                      <div className="text-xs text-neutral-500">{expert.domain}</div>
                      <div className="text-xs text-neutral-400 mt-1">{expert.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Consultations</h2>
              {consultations.length === 0 ? (
                <div className="surface-primary rounded-lg p-6 text-sm text-neutral-500">No consultations yet.</div>
              ) : (
                <div className="space-y-2">
                  {consultations.map((c) => (
                    <div key={c.id} className="surface-primary rounded-lg p-4">
                      <div className="text-sm font-medium text-white">{c.question}</div>
                      <div className="text-xs text-neutral-500">{c.status} • {c.created_at ? new Date(c.created_at).toLocaleString() : ''}</div>
                      {c.answer && <div className="text-xs text-neutral-400 mt-1">{c.answer}</div>}
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
