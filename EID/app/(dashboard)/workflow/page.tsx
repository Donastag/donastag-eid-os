'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface WorkflowRun {
  id: string
  name: string
  status: string
  input?: Record<string, any>
  output?: Record<string, any>
  started_at?: string
  finished_at?: string
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

interface WorkflowEvent {
  id: string
  run_id: string
  kind: string
  payload?: Record<string, any>
  created_at?: string
}

export default function WorkflowPage() {
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null)
  const [events, setEvents] = useState<WorkflowEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRuns = async () => {
    try {
      const res = await fetch('/api/workflow/runs')
      if (!res.ok) throw new Error('Failed to load workflow runs')
      const data = await res.json()
      setRuns(data.runs || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRuns()
  }, [])

  const selectRun = async (run: WorkflowRun) => {
    setSelectedRun(run)
    try {
      const res = await fetch(`/api/workflow/events?run_id=${run.id}`)
      if (!res.ok) throw new Error('Failed to load events')
      const data = await res.json()
      setEvents(data.events || [])
    } catch (e) {
      setEvents([])
    }
  }

  return (
    <main className="flex-1 overflow-auto bg-gradient-to-b from-neutral-950 to neutral-900/50">
      <div className="px-8 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-white">Workflow Intelligence</h1>
        <p className="text-neutral-400 text-sm">Workflow runs and events.</p>
        {loading ? (
          <div className="flex items-center gap-2 text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading workflows...
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Runs</h2>
              {runs.length === 0 ? (
                <div className="surface-primary rounded-lg p-6 text-sm text-neutral-500">No workflow runs yet.</div>
              ) : (
                <div className="space-y-2">
                  {runs.map((run) => (
                    <button
                      key={run.id}
                      onClick={() => selectRun(run)}
                      className={`w-full text-left surface-primary rounded-lg p-4 transition-smooth ${
                        selectedRun?.id === run.id ? 'border border-white/10' : ''
                      }`}
                    >
                      <div className="text-sm font-medium text-white">{run.name}</div>
                      <div className="text-xs text-neutral-500">{run.status} • {run.created_at ? new Date(run.created_at).toLocaleString() : ''}</div>
                    </button>
                  ))}
                </div>
              )}
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Events</h2>
              {!selectedRun ? (
                <div className="surface-primary rounded-lg p-6 text-sm text-neutral-500">Select a run to view events.</div>
              ) : events.length === 0 ? (
                <div className="surface-primary rounded-lg p-6 text-sm text-neutral-500">No events for this run.</div>
              ) : (
                <div className="space-y-2">
                  {events.map((event) => (
                    <div key={event.id} className="surface-primary rounded-lg p-4">
                      <div className="text-sm font-medium text-white">{event.kind}</div>
                      <div className="text-xs text-neutral-500">{event.created_at ? new Date(event.created_at).toLocaleString() : ''}</div>
                      {event.payload && Object.keys(event.payload).length > 0 && (
                        <pre className="mt-2 text-xs text-neutral-300 whitespace-pre-wrap">{JSON.stringify(event.payload, null, 2)}</pre>
                      )}
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
