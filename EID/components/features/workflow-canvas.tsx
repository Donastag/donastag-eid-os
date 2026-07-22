'use client'

import { Plus, Play, ZoomIn, ZoomOut, Download, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WorkflowNode {
  id: string
  label: string
  type: 'trigger' | 'action' | 'decision' | 'end'
  x: number
  y: number
}

const nodes: WorkflowNode[] = [
  { id: '1', label: 'Webhook Trigger', type: 'trigger', x: 100, y: 100 },
  { id: '2', label: 'Parse Request', type: 'action', x: 300, y: 100 },
  { id: '3', label: 'Validate Input', type: 'decision', x: 500, y: 100 },
  { id: '4', label: 'Process Data', type: 'action', x: 700, y: 50 },
  { id: '5', label: 'Update DB', type: 'action', x: 700, y: 200 },
  { id: '6', label: 'Send Response', type: 'end', x: 900, y: 125 },
]

const nodeColors = {
  trigger: 'bg-success/20 border-success/40 text-success',
  action: 'bg-accent-primary/20 border-accent-primary/40 text-accent-primary',
  decision: 'bg-warning/20 border-warning/40 text-warning',
  end: 'bg-danger/20 border-danger/40 text-danger',
}

const nodeShapes = {
  trigger: 'rounded-lg',
  action: 'rounded-lg',
  decision: 'rounded-none transform rotate-45 w-20 h-20',
  end: 'rounded-full w-16 h-16',
}

export function WorkflowCanvas() {
  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="border-b border-white/8 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="w-5 h-5 text-accent-primary" />
          <div>
            <h2 className="font-semibold text-white">Workflow Builder</h2>
            <p className="text-xs text-neutral-500">6 steps configured</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-neutral-400 border-white/10">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" className="text-neutral-400 border-white/10">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="sm" className="bg-accent-primary hover:bg-accent-secondary">
            <Play className="w-4 h-4 mr-2" />
            Execute
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-neutral-950 to-neutral-900/50 relative">
        {/* Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Nodes */}
        <div className="relative w-full h-full">
          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1="180"
              y1="125"
              x2="300"
              y2="125"
              stroke="oklch(0.55 0.2 264)"
              strokeWidth="2"
              opacity="0.5"
            />
            <line
              x1="380"
              y1="125"
              x2="500"
              y2="125"
              stroke="oklch(0.55 0.2 264)"
              strokeWidth="2"
              opacity="0.5"
            />
            <line x1="575" y1="100" x2="700" y2="75" stroke="oklch(0.65 0.18 50)" strokeWidth="2" opacity="0.5" />
            <line
              x1="575"
              y1="150"
              x2="700"
              y2="225"
              stroke="oklch(0.55 0.2 264)"
              strokeWidth="2"
              opacity="0.5"
            />
            <line
              x1="750"
              y1="50"
              x2="900"
              y2="100"
              stroke="oklch(0.55 0.2 264)"
              strokeWidth="2"
              opacity="0.5"
            />
            <line
              x1="750"
              y1="200"
              x2="900"
              y2="150"
              stroke="oklch(0.55 0.2 264)"
              strokeWidth="2"
              opacity="0.5"
            />
          </svg>

          {/* Node Elements */}
          {nodes.map((node) => (
            <div
              key={node.id}
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
              className={`absolute px-3 py-2 rounded-lg border cursor-move hover:shadow-lg hover:shadow-accent-primary/20 transition-all group ${
                nodeColors[node.type]
              } ${nodeShapes[node.type] || 'w-auto'}`}
            >
              <p className="text-xs font-medium whitespace-nowrap">{node.label}</p>
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border-2 border-accent-primary"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/8 p-4 flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          Right-click to add nodes • Drag to connect • Double-click to edit
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-neutral-400 border-white/10">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-accent-primary hover:bg-accent-secondary">
            <Plus className="w-4 h-4 mr-2" />
            Add Node
          </Button>
        </div>
      </div>
    </div>
  )
}
