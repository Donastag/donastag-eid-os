'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Zap, GitBranch, AlertCircle, Clock, TrendingUp, Users, CheckCircle, FolderOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { getDirectorProjects, type DirectorProject } from '@/lib/director/client'

interface Widget {
  id: string
  title: string
  icon: React.ReactNode
  value: string
  subtitle?: string
  trend?: string
  color: string
}

const widgets: Widget[] = [
  {
    id: 'deployments',
    title: 'Deployments',
    icon: <GitBranch className="w-5 h-5" />,
    value: '24',
    subtitle: 'This week',
    trend: '+12% from last week',
    color: 'bg-accent-primary/10',
  },
  {
    id: 'workflow-runs',
    title: 'Workflow Runs',
    icon: <Zap className="w-5 h-5" />,
    value: '1,204',
    subtitle: 'This month',
    trend: '+8% success rate',
    color: 'bg-success/10',
  },
  {
    id: 'active-alerts',
    title: 'Active Alerts',
    icon: <AlertCircle className="w-5 h-5" />,
    value: '3',
    subtitle: 'Requiring attention',
    trend: 'Down from 5',
    color: 'bg-warning/10',
  },
  {
    id: 'system-uptime',
    title: 'System Uptime',
    icon: <CheckCircle className="w-5 h-5" />,
    value: '99.98%',
    subtitle: 'Last 30 days',
    trend: 'Target: 99.95%',
    color: 'bg-success/10',
  },
  {
    id: 'avg-response',
    title: 'Avg Response',
    icon: <TrendingUp className="w-5 h-5" />,
    value: '245ms',
    subtitle: 'P95 latency',
    trend: '-15% improvement',
    color: 'bg-accent-primary/10',
  },
  {
    id: 'team-members',
    title: 'Team Members',
    icon: <Users className="w-5 h-5" />,
    value: '12',
    subtitle: 'Active this week',
    trend: 'All contributing',
    color: 'bg-accent-secondary/10',
  },
  {
    id: 'pending-reviews',
    title: 'Pending Reviews',
    icon: <Clock className="w-4 h-4" />,
    value: '8',
    subtitle: 'Pull requests',
    trend: 'Avg wait: 2h',
    color: 'bg-warning/10',
  },
  {
    id: 'code-quality',
    title: 'Code Quality',
    icon: <BarChart3 className="w-5 h-5" />,
    value: '94%',
    subtitle: 'Health score',
    trend: '+2% from last sprint',
    color: 'bg-success/10',
  },
]

export function MainWorkspace() {
  const [projects, setProjects] = useState<DirectorProject[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setProjectsLoading(true)
    setProjectsError(null)

    getDirectorProjects()
      .then((data) => {
        if (!cancelled) {
          setProjects(data.projects ?? [])
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setProjectsError(error instanceof Error ? error.message : 'Failed to load projects')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setProjectsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="flex-1 overflow-auto bg-gradient-to-b from-neutral-950 to-neutral-900/50">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-neutral-950/80 border-b border-white/8 px-8 py-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Engineering Dashboard</h1>
          <p className="text-neutral-400 text-sm">Real-time overview of your infrastructure and workflows</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="grid grid-cols-1 gap-6">
          <div className="surface-primary rounded-lg p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Welcome to Donastag Engineering OS</h2>
                <p className="text-neutral-400 text-sm max-w-2xl">
                  Your centralized platform for managing AI-powered workflows, infrastructure, and team collaboration. Everything you need to build, deploy, and monitor world-class systems.
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-accent-primary flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Widgets Grid */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Key Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {widgets.map((widget) => (
              <Card
                key={widget.id}
                className={`${widget.color} border border-white/5 backdrop-blur-sm hover:border-white/10 transition-smooth cursor-pointer group`}
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="text-neutral-400 group-hover:text-accent-primary transition-colors">
                      {widget.icon}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">{widget.value}</div>
                    <div className="text-xs text-neutral-500 mb-2">{widget.title}</div>
                    {widget.trend && (
                      <div className="text-xs text-accent-light">{widget.trend}</div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
          <div className="surface-primary rounded-lg divide-y divide-white/5">
            {projectsLoading && (
              <div className="p-4 text-sm text-neutral-400">Loading projects...</div>
            )}
            {projectsError && (
              <div className="p-4 text-sm text-red-400">{projectsError}</div>
            )}
            {!projectsLoading && !projectsError && projects.length === 0 && (
              <div className="p-4 text-sm text-neutral-500">No projects yet.</div>
            )}
            {projects.map((project) => (
              <div key={project.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-accent-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{project.name}</div>
                    <div className="text-xs text-neutral-500">
                      {(project.client || 'Unknown client') + ' • ' + (project.status || 'active')}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-neutral-500">
                  {project.created_at ? new Date(project.created_at).toLocaleString() : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
