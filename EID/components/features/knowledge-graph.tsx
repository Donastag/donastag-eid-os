'use client'

import { Network, Search, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GraphNode {
  id: string
  label: string
  category: 'architecture' | 'pattern' | 'library' | 'service'
  connections: string[]
}

const nodes: GraphNode[] = [
  {
    id: 'microservices',
    label: 'Microservices Architecture',
    category: 'architecture',
    connections: ['kubernetes', 'docker', 'api-gateway'],
  },
  {
    id: 'kubernetes',
    label: 'Kubernetes',
    category: 'service',
    connections: ['docker', 'monitoring'],
  },
  {
    id: 'docker',
    label: 'Docker Containers',
    category: 'service',
    connections: ['kubernetes', 'registry'],
  },
  {
    id: 'api-gateway',
    label: 'API Gateway Pattern',
    category: 'pattern',
    connections: ['load-balancing', 'auth-service'],
  },
  {
    id: 'monitoring',
    label: 'Monitoring & Observability',
    category: 'service',
    connections: ['prometheus', 'grafana'],
  },
  {
    id: 'prometheus',
    label: 'Prometheus',
    category: 'library',
    connections: ['monitoring', 'alerting'],
  },
  {
    id: 'grafana',
    label: 'Grafana',
    category: 'library',
    connections: ['monitoring', 'prometheus'],
  },
]

const categoryColors = {
  architecture: 'bg-accent-primary/10 border-accent-primary/40',
  pattern: 'bg-success/10 border-success/40',
  library: 'bg-accent-secondary/10 border-accent-secondary/40',
  service: 'bg-warning/10 border-warning/40',
}

export function KnowledgeGraph() {
  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="border-b border-white/8 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Network className="w-5 h-5 text-accent-primary" />
          <h2 className="text-xl font-semibold text-white">Knowledge Graph</h2>
        </div>
        <p className="text-sm text-neutral-400">Architecture and systems documentation</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Search */}
        <div className="border-b border-white/8 p-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-900/50 border border-white/8 rounded-lg text-sm text-foreground placeholder-neutral-500 focus-visible:outline-none focus-visible:border-accent-primary transition-colors"
            />
          </div>
        </div>

        {/* Graph */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-neutral-950 to-neutral-900/50 relative p-6">
          {/* SVG Canvas for connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="oklch(0.55 0.2 264)" opacity="0.5" />
              </marker>
            </defs>
            {/* Example connections */}
            <line x1="100" y1="60" x2="300" y2="60" stroke="oklch(0.55 0.2 264)" strokeWidth="1" markerEnd="url(#arrowhead)" />
            <line x1="300" y1="60" x2="500" y2="60" stroke="oklch(0.55 0.2 264)" strokeWidth="1" markerEnd="url(#arrowhead)" />
            <line x1="100" y1="60" x2="100" y2="200" stroke="oklch(0.55 0.2 264)" strokeWidth="1" markerEnd="url(#arrowhead)" />
          </svg>

          {/* Nodes */}
          <div className="relative space-y-6">
            {nodes.map((node, idx) => (
              <div key={node.id} className={`p-4 rounded-lg border cursor-pointer hover:shadow-lg hover:shadow-accent-primary/20 transition-all transform ${categoryColors[node.category]}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-2">{node.label}</h3>
                    <p className="text-xs text-neutral-400 mb-3">
                      Connects to {node.connections.length} nodes
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {node.connections.map((conn) => (
                        <span
                          key={conn}
                          className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-neutral-400 hover:text-accent-light cursor-pointer"
                        >
                          {conn}
                        </span>
                      ))}
                    </div>
                  </div>
                  <BookOpen className="w-5 h-5 text-neutral-600 flex-shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/8 p-4 flex gap-2">
          <Button size="sm" variant="outline" className="text-neutral-400 border-white/10">
            Export Graph
          </Button>
          <Button size="sm" className="bg-accent-primary hover:bg-accent-secondary">
            Add Node
          </Button>
        </div>
      </div>
    </div>
  )
}
