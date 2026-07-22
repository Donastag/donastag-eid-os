'use client'

import { GitBranch, Check, AlertCircle, Loader2, UserCircle2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Deployment {
  id: string
  version: string
  branch: string
  status: 'completed' | 'in-progress' | 'failed' | 'rolled-back'
  author: string
  message: string
  timestamp: string
  duration: string
  environment: string
  changes: number
}

const deployments: Deployment[] = [
  {
    id: '1',
    version: 'v2.4.2',
    branch: 'main',
    status: 'completed',
    author: 'Alice Chen',
    message: 'Fix: Improve authentication flow and add rate limiting',
    timestamp: '2 hours ago',
    duration: '3m 42s',
    environment: 'production',
    changes: 12,
  },
  {
    id: '2',
    version: 'v2.4.1',
    branch: 'main',
    status: 'completed',
    author: 'Bob Smith',
    message: 'Feat: Add real-time notifications system',
    timestamp: '5 hours ago',
    duration: '4m 18s',
    environment: 'production',
    changes: 28,
  },
  {
    id: '3',
    version: 'v2.4.0',
    branch: 'staging',
    status: 'in-progress',
    author: 'Carol Wu',
    message: 'Chore: Update dependencies and optimize build',
    timestamp: 'Currently deploying',
    duration: '1m 30s',
    environment: 'staging',
    changes: 45,
  },
  {
    id: '4',
    version: 'v2.3.9',
    branch: 'main',
    status: 'failed',
    author: 'David Lee',
    message: 'Feat: Database schema migration',
    timestamp: '1 day ago',
    duration: '2m 15s',
    environment: 'production',
    changes: 8,
  },
  {
    id: '5',
    version: 'v2.3.8',
    branch: 'main',
    status: 'rolled-back',
    author: 'Eve Martinez',
    message: 'Fix: Critical bug in payment processing',
    timestamp: '2 days ago',
    duration: '3m 05s',
    environment: 'production',
    changes: 3,
  },
]

const statusConfig = {
  completed: { icon: Check, color: 'text-success', bg: 'bg-success/10' },
  'in-progress': { icon: Loader2, color: 'text-accent-primary', bg: 'bg-accent-primary/10', animate: true },
  failed: { icon: AlertCircle, color: 'text-danger', bg: 'bg-danger/10' },
  'rolled-back': { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10' },
}

export function DeploymentsTimeline() {
  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="border-b border-white/8 p-6">
        <div className="flex items-center gap-3 mb-2">
          <GitBranch className="w-5 h-5 text-accent-primary" />
          <h2 className="text-xl font-semibold text-white">Deployment Timeline</h2>
        </div>
        <p className="text-sm text-neutral-400">Track and manage your application deployments</p>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {deployments.map((deployment, idx) => {
            const config = statusConfig[deployment.status]
            const Icon = config.icon
            return (
              <div
                key={deployment.id}
                className="relative p-4 rounded-lg border border-white/8 bg-neutral-900/50 hover:border-white/12 transition-all"
              >
                {/* Timeline Line */}
                {idx < deployments.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-12 bg-gradient-to-b from-white/20 to-white/5"></div>
                )}

                {/* Content */}
                <div className="flex gap-4">
                  {/* Status Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{deployment.version}</h3>
                          <Badge
                            variant="outline"
                            className={`text-xs border-white/20 ${
                              deployment.environment === 'production'
                                ? 'bg-danger/10 text-danger'
                                : 'bg-warning/10 text-warning'
                            }`}
                          >
                            {deployment.environment}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-400 mt-1">{deployment.message}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-500 mb-2">{deployment.timestamp}</p>
                        <Button size="sm" variant="outline" className="text-neutral-400 border-white/10">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <UserCircle2 className="w-3 h-3 text-neutral-500" />
                        <span className="text-neutral-400">{deployment.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-3 h-3 text-neutral-500" />
                        <span className="text-neutral-400">{deployment.branch}</span>
                      </div>
                      <div className="text-neutral-500">Duration: {deployment.duration}</div>
                      <div className="text-neutral-500">{deployment.changes} changes</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
