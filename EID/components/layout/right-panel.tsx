'use client'

import { MessageSquare, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function RightPanel() {
  return (
    <aside className="w-80 border-l border-white/8 bg-neutral-900/50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/8 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-accent-primary" />
          <h3 className="font-semibold text-sm">Context Panel</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-foreground">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          {/* Suggestions */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Suggestions</h4>
            {[
              'Review deployment logs',
              'Check alert configuration',
              'Optimize database queries',
              'Update team documentation',
            ].map((suggestion, i) => (
              <Card
                key={i}
                className="p-3 bg-neutral-800/30 border border-white/5 hover:border-white/10 cursor-pointer transition-smooth group text-xs"
              >
                <div className="flex items-start gap-2 group-hover:text-accent-light">
                  <span className="text-accent-primary flex-shrink-0 mt-0.5">•</span>
                  <span className="text-neutral-400 group-hover:text-foreground">{suggestion}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Quick Actions</h4>
            <div className="space-y-2">
              {['View Logs', 'Run Tests', 'Deploy', 'Rollback'].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs justify-start text-neutral-400 border-white/5 hover:border-white/10 hover:text-foreground"
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>

          {/* Related Items */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Related</h4>
            {[
              { label: 'Incident #2034', type: 'Critical' },
              { label: 'PR #1245', type: 'Review' },
              { label: 'Task #891', type: 'In Progress' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-neutral-800/30 border border-white/5 hover:border-white/10 cursor-pointer transition-smooth"
              >
                <div className="text-xs font-medium text-foreground mb-1">{item.label}</div>
                <div className="text-xs text-neutral-500">{item.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/8 p-4">
        <Button className="w-full bg-accent-primary hover:bg-accent-secondary text-white text-sm" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>
    </aside>
  )
}
