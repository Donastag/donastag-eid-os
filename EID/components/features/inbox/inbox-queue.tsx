'use client'

import { useState, useEffect } from 'react'
import { InboxStore } from '@/lib/inbox/store'
import { InboxItem, InboxFilter } from '@/lib/inbox/types'
import { Trash2, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react'

export function InboxQueue() {
  const [items, setItems] = useState<InboxItem[]>([])
  const [filter, setFilter] = useState<InboxFilter>({})
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    InboxStore.initialize()
    loadItems()
    const interval = setInterval(loadItems, 2000)
    return () => clearInterval(interval)
  }, [filter])

  const loadItems = () => {
    const filtered = InboxStore.getItems(filter)
    setItems(filtered)
    setStats(InboxStore.getStats())
  }

  const handleDelete = (id: string) => {
    InboxStore.deleteItem(id)
    loadItems()
  }

  const getStatusIcon = (status: InboxItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-danger" />
      default:
        return <Clock className="w-4 h-4 text-neutral-500" />
    }
  }

  const getStatusColor = (status: InboxItem['status']) => {
    switch (status) {
      case 'completed':
        return 'text-success'
      case 'failed':
        return 'text-danger'
      case 'analyzing':
        return 'text-warning'
      default:
        return 'text-neutral-400'
    }
  }

  const getTypeIcon = (type: InboxItem['type']) => {
    const icons: Record<string, string> = {
      repository: '📦',
      'bug-report': '🐛',
      rfc: '📝',
      requirement: '📋',
      documentation: '📚',
      architecture: '🏗️',
      'code-snippet': '💻',
      design: '🎨',
      video: '🎬',
      image: '🖼️',
      other: '📄',
    }
    return icons[type] || '📄'
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <div className="bg-neutral-900/50 border border-white/8 rounded-lg p-3">
            <div className="text-xs text-neutral-500">Total</div>
            <div className="text-lg font-semibold">{stats.total}</div>
          </div>
          <div className="bg-neutral-900/50 border border-white/8 rounded-lg p-3">
            <div className="text-xs text-neutral-500">Analyzing</div>
            <div className="text-lg font-semibold text-warning">{stats.byStatus.analyzing}</div>
          </div>
          <div className="bg-neutral-900/50 border border-white/8 rounded-lg p-3">
            <div className="text-xs text-neutral-500">Classified</div>
            <div className="text-lg font-semibold">{stats.byStatus.classified}</div>
          </div>
          <div className="bg-neutral-900/50 border border-white/8 rounded-lg p-3">
            <div className="text-xs text-neutral-500">Routed</div>
            <div className="text-lg font-semibold text-accent-primary">{stats.byStatus.routed}</div>
          </div>
          <div className="bg-neutral-900/50 border border-white/8 rounded-lg p-3">
            <div className="text-xs text-neutral-500">Complete</div>
            <div className="text-lg font-semibold text-success">{stats.byStatus.completed}</div>
          </div>
          <div className="bg-neutral-900/50 border border-white/8 rounded-lg p-3">
            <div className="text-xs text-neutral-500">Failed</div>
            <div className="text-lg font-semibold text-danger">{stats.byStatus.failed}</div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter({})}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            !filter.status && !filter.type && !filter.searchQuery
              ? 'bg-accent-primary/20 text-accent-primary'
              : 'bg-neutral-800/50 text-neutral-400 hover:text-foreground'
          }`}
        >
          All
        </button>
        {['queued', 'analyzing', 'classified', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter({ ...filter, status: status as any })}
            className={`px-3 py-1 rounded-lg text-sm transition-colors capitalize ${
              filter.status === status
                ? 'bg-accent-primary/20 text-accent-primary'
                : 'bg-neutral-800/50 text-neutral-400 hover:text-foreground'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <div className="text-sm">No items found</div>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-900/50 border border-white/8 rounded-lg p-4 hover:bg-neutral-900/70 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 flex items-start gap-3">
                  <div className="text-xl">{getTypeIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(item.status)}
                        <span className={`text-xs ${getStatusColor(item.status)} capitalize`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 truncate mt-1">{item.fileName}</p>
                    {item.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-neutral-800/50 text-neutral-300 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.routedTo && item.routedTo.length > 0 && (
                      <div className="text-xs text-accent-primary mt-2">
                        Routes to: {item.routedTo.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 hover:bg-neutral-800/50 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-neutral-500 hover:text-danger" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
