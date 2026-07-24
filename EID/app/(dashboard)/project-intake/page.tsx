'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, BookOpen, FileText, Lightbulb } from 'lucide-react'

interface ProjectIntake {
  id: string
  name: string
  description: string
  requirements: Record<string, any>
  tech_stack: Record<string, any>
  constraints: Record<string, any>
  timeline_weeks: number | null
  status: string
  architectural_plan: Record<string, any>
  created_at: string
}

interface Lesson {
  id: string
  project_id: string
  phase: string
  title: string
  body: string
  tags: string[]
  created_at: string
}

export default function ProjectIntakePage() {
  const [intakes, setIntakes] = useState<ProjectIntake[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedIntake, setSelectedIntake] = useState<ProjectIntake | null>(null)
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [lessonPhase, setLessonPhase] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonBody, setLessonBody] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requirements: '{}',
    tech_stack: '{}',
    constraints: '{}',
    timeline_weeks: '',
  })

  const loadIntakes = async () => {
    try {
      const res = await fetch('/api/project-intake')
      if (!res.ok) throw new Error('Failed to load intakes')
      const data = await res.json()
      setIntakes(data || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  const loadLessons = async () => {
    try {
      const res = await fetch('/api/project-intake/lessons')
      if (!res.ok) throw new Error('Failed to load lessons')
      const data = await res.json()
      setLessons(data || [])
    } catch (e) {
      console.error('Failed to load lessons', e)
    }
  }

  useEffect(() => {
    Promise.all([loadIntakes(), loadLessons()]).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/project-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requirements: JSON.parse(formData.requirements || '{}'),
          tech_stack: JSON.parse(formData.tech_stack || '{}'),
          constraints: JSON.parse(formData.constraints || '{}'),
          timeline_weeks: formData.timeline_weeks ? parseInt(formData.timeline_weeks) : null,
        }),
      })
      if (!res.ok) throw new Error('Failed to create intake')
      setShowForm(false)
      setFormData({ name: '', description: '', requirements: '{}', tech_stack: '{}', constraints: '{}', timeline_weeks: '' })
      loadIntakes()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  const generatePlan = async (intake: ProjectIntake) => {
    try {
      const res = await fetch(`/api/project-intake/${intake.id}/plan`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to generate plan')
      loadIntakes()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  const addLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedIntake || !lessonPhase || !lessonTitle || !lessonBody) return
    try {
      const res = await fetch('/api/project-intake/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedIntake.id,
          phase: lessonPhase,
          title: lessonTitle,
          body: lessonBody,
          tags: [],
        }),
      })
      if (!res.ok) throw new Error('Failed to add lesson')
      setShowLessonForm(false)
      setLessonPhase('')
      setLessonTitle('')
      setLessonBody('')
      loadLessons()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  if (loading) {
    return (
      <main className="flex-1 overflow-auto bg-gradient-to-b from-neutral-950 to-neutral-900/50">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-auto bg-gradient-to-b from-neutral-950 to-neutral-900/50">
      <div className="px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Project Intake & Architecture</h1>
            <p className="text-neutral-400 text-sm mt-1">Evaluate, plan, execute, and capture lessons for every project.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Intake
          </button>
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="surface-primary rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">New Project Intake</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Project Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900/50 border border-white/10 rounded-lg text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Timeline (weeks)</label>
                <input
                  type="number"
                  value={formData.timeline_weeks}
                  onChange={(e) => setFormData({ ...formData, timeline_weeks: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900/50 border border-white/10 rounded-lg text-sm text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-900/50 border border-white/10 rounded-lg text-sm text-white"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Requirements (JSON)</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900/50 border border-white/10 rounded-lg text-sm text-white font-mono text-xs"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Tech Stack (JSON)</label>
                <textarea
                  value={formData.tech_stack}
                  onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900/50 border border-white/10 rounded-lg text-sm text-white font-mono text-xs"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Constraints (JSON)</label>
                <textarea
                  value={formData.constraints}
                  onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900/50 border border-white/10 rounded-lg text-sm text-white font-mono text-xs"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90">Save Intake</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-white/10 text-neutral-300 rounded-lg hover:bg-neutral-800/50">Cancel</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Project Intakes
            </h2>
            {intakes.length === 0 && <div className="text-neutral-500 text-sm">No project intakes yet.</div>}
            {intakes.map((intake) => (
              <div key={intake.id} className="surface-primary rounded-lg p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-medium">{intake.name}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{intake.description}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full border border-white/10 text-neutral-400">{intake.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-neutral-500">Requirements</div>
                    <pre className="text-neutral-300 mt-1 overflow-auto max-h-24">{JSON.stringify(intake.requirements, null, 2)}</pre>
                  </div>
                  <div>
                    <div className="text-neutral-500">Tech Stack</div>
                    <pre className="text-neutral-300 mt-1 overflow-auto max-h-24">{JSON.stringify(intake.tech_stack, null, 2)}</pre>
                  </div>
                  <div>
                    <div className="text-neutral-500">Constraints</div>
                    <pre className="text-neutral-300 mt-1 overflow-auto max-h-24">{JSON.stringify(intake.constraints, null, 2)}</pre>
                  </div>
                </div>
                {intake.architectural_plan && (
                  <div className="mt-3 p-3 rounded-lg bg-neutral-900/50 border border-white/5">
                    <div className="text-xs text-neutral-400 mb-2">Architectural Plan</div>
                    <pre className="text-xs text-neutral-300 overflow-auto max-h-48">{JSON.stringify(intake.architectural_plan, null, 2)}</pre>
                  </div>
                )}
                <div className="flex gap-2">
                  {intake.status === 'intake' && (
                    <button onClick={() => generatePlan(intake)} className="px-3 py-1.5 bg-accent-primary text-white text-xs rounded-lg hover:bg-accent-primary/90">
                      Generate Plan
                    </button>
                  )}
                  <button onClick={() => { setSelectedIntake(intake); setShowLessonForm(true); }} className="px-3 py-1.5 border border-white/10 text-neutral-300 text-xs rounded-lg hover:bg-neutral-800/50">
                    Add Lesson
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Lessons Learned
            </h2>
            {lessons.length === 0 && <div className="text-neutral-500 text-sm">No lessons captured yet.</div>}
            {lessons.map((lesson) => (
              <div key={lesson.id} className="surface-primary rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-neutral-400">{lesson.phase}</span>
                  <span className="text-xs text-neutral-500">{new Date(lesson.created_at).toLocaleDateString()}</span>
                </div>
                <h4 className="text-white text-sm font-medium">{lesson.title}</h4>
                <p className="text-neutral-400 text-xs">{lesson.body}</p>
              </div>
            ))}
          </div>
        </div>

        {showLessonForm && selectedIntake && (
          <form onSubmit={addLesson} className="surface-primary rounded-lg p-6 space-y-4 mt-6">
            <h3 className="text-white font-medium">Add Lesson to {selectedIntake.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Phase</label>
                <input
                  type="text"
                  value={lessonPhase}
                  onChange={(e) => setLessonPhase(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900/50 border border-white/10 rounded-lg text-sm text-white"
                  placeholder="e.g. setup, core, polish"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Title</label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900/50 border border-white/10 rounded-lg text-sm text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Lesson Body</label>
              <textarea
                value={lessonBody}
                onChange={(e) => setLessonBody(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900/50 border border-white/10 rounded-lg text-sm text-white"
                rows={3}
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90">Save Lesson</button>
              <button type="button" onClick={() => setShowLessonForm(false)} className="px-4 py-2 border border-white/10 text-neutral-300 rounded-lg hover:bg-neutral-800/50">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
