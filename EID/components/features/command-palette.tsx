'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Command, ArrowRight, Zap, Network, Lock, ShoppingBag, GitBranch, CheckCircle, BookOpen, MessageCircle, Inbox } from 'lucide-react'

interface Command {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: string
  path: string
  shortcut?: string
}

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commands: Command[] = [
    {
      id: 'home',
      title: 'Home',
      description: 'Go to home dashboard',
      icon: <Zap className="w-4 h-4" />,
      category: 'Navigation',
      path: '/',
      shortcut: 'Cmd+H',
    },
    {
      id: 'inbox',
      title: 'Engineering Inbox',
      description: 'Single intake point for files and repositories',
      icon: <Inbox className="w-4 h-4" />,
      category: 'Navigation',
      path: '/inbox',
      shortcut: 'Cmd+I',
    },
    {
      id: 'director',
      title: 'Engineering Director',
      description: 'AI-powered engineering guidance',
      icon: <Command className="w-4 h-4" />,
      category: 'Engineering',
      path: '/director',
      shortcut: 'Cmd+E',
    },
    {
      id: 'router',
      title: 'AI Router',
      description: 'Select and configure AI models',
      icon: <Network className="w-4 h-4" />,
      category: 'Engineering',
      path: '/router',
    },
    {
      id: 'workflow',
      title: 'Workflows',
      description: 'Build and manage CI/CD workflows',
      icon: <GitBranch className="w-4 h-4" />,
      category: 'Engineering',
      path: '/workflow',
      shortcut: 'Cmd+W',
    },
    {
      id: 'assets',
      title: 'Asset Library',
      description: 'Browse components and templates',
      icon: <BookOpen className="w-4 h-4" />,
      category: 'Engineering',
      path: '/assets',
    },
    {
      id: 'services',
      title: 'Services',
      description: 'Monitor infrastructure services',
      icon: <Network className="w-4 h-4" />,
      category: 'Infrastructure',
      path: '/services',
      shortcut: 'Cmd+I',
    },
    {
      id: 'deployments',
      title: 'Deployments',
      description: 'View deployment history and status',
      icon: <GitBranch className="w-4 h-4" />,
      category: 'Infrastructure',
      path: '/deployments',
    },
    {
      id: 'graph',
      title: 'Knowledge Graph',
      description: 'Architecture and system documentation',
      icon: <BookOpen className="w-4 h-4" />,
      category: 'Knowledge',
      path: '/graph',
    },
    {
      id: 'security',
      title: 'Security Center',
      description: 'Vulnerability tracking and compliance',
      icon: <Lock className="w-4 h-4" />,
      category: 'Governance',
      path: '/security',
      shortcut: 'Cmd+S',
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      description: 'Browse extensions and plugins',
      icon: <ShoppingBag className="w-4 h-4" />,
      category: 'Governance',
      path: '/marketplace',
    },
    {
      id: 'verification',
      title: 'Verification',
      description: 'Quality checks and test results',
      icon: <CheckCircle className="w-4 h-4" />,
      category: 'Infrastructure',
      path: '/verification',
    },
    {
      id: 'telegram',
      title: 'Telegram Settings',
      description: 'Configure Telegram notifications',
      icon: <MessageCircle className="w-4 h-4" />,
      category: 'Settings',
      path: '/telegram',
    },
  ]

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
  )

  // Group by category
  const grouped = filteredCommands.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = []
      acc[cmd.category].push(cmd)
      return acc
    },
    {} as Record<string, Command[]>
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(!open)
        setSearch('')
        setSelectedIndex(0)
      }

      if (!open) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          router.push(filteredCommands[selectedIndex].path)
          setOpen(false)
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, selectedIndex, filteredCommands])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 rounded-lg surface-primary shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="w-4 h-4 text-neutral-500" />
          <input
            autoFocus
            type="text"
            placeholder="Search commands..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSelectedIndex(0)
            }}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-500"
          />
          <div className="text-xs text-neutral-500 font-mono">ESC</div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {Object.entries(grouped).length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-neutral-500">
              No commands found
            </div>
          ) : (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category}>
                <div className="px-3 py-2 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  {category}
                </div>
                {cmds.map((cmd, cmdIndex) => {
                  const overallIndex = filteredCommands.indexOf(cmd)
                  const isSelected = overallIndex === selectedIndex

                  return (
                    <button
                      key={cmd.id}
                      onClick={() => cmd.action()}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-smooth ${
                        isSelected
                          ? 'bg-accent-primary/10 text-accent-primary'
                          : 'text-neutral-300 hover:bg-neutral-800/50'
                      }`}
                    >
                      <div className="flex-shrink-0 text-neutral-500">{cmd.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{cmd.title}</div>
                        <div className="text-xs text-neutral-500">{cmd.description}</div>
                      </div>
                      {cmd.shortcut && (
                        <div className="text-xs text-neutral-600 font-mono">{cmd.shortcut}</div>
                      )}
                      {isSelected && (
                        <ArrowRight className="w-4 h-4 text-accent-primary" />
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-4 py-2 flex items-center justify-between text-xs text-neutral-600">
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-neutral-800/50">
              <ArrowRight className="w-3 h-3" /> Enter
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-neutral-800/50">
              ↑↓ Navigate
            </span>
          </div>
          <div className="text-neutral-700">
            {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  )
}
