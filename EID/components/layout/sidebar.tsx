'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Zap,
  Network,
  BookOpen,
  Shield,
  Settings,
  Workflow,
  AlertCircle,
  Code2,
  Layers,
  GitBranch,
  Container,
  BarChart3,
  Database,
  Clock,
  ChevronDown,
  MessageCircle,
  Inbox,
} from 'lucide-react'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path?: string
  children?: MenuItem[]
  badge?: number
}

const menuItems: MenuItem[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" />, path: '/' },
  { id: 'inbox', label: 'Inbox', icon: <Inbox className="w-4 h-4" />, path: '/inbox' },
  {
    id: 'engineering',
    label: 'Engineering',
    icon: <Zap className="w-4 h-4" />,
    children: [
      { id: 'director', label: 'Director (AI)', icon: <Zap className="w-4 h-4" />, path: '/director' },
      { id: 'router', label: 'AI Router', icon: <Network className="w-4 h-4" />, path: '/router' },
      { id: 'workflow', label: 'Workflows', icon: <Workflow className="w-4 h-4" />, path: '/workflow' },
      { id: 'assets', label: 'Asset Library', icon: <Layers className="w-4 h-4" />, path: '/assets' },
    ],
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    icon: <Network className="w-4 h-4" />,
    children: [
      { id: 'services', label: 'Services', icon: <Container className="w-4 h-4" />, path: '/services' },
      { id: 'monitoring', label: 'Monitoring', icon: <BarChart3 className="w-4 h-4" />, path: '/monitoring' },
      { id: 'deployments', label: 'Deployments', icon: <GitBranch className="w-4 h-4" />, path: '/deployments' },
      { id: 'verification', label: 'Verification', icon: <AlertCircle className="w-4 h-4" />, path: '/verification' },
    ],
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    icon: <BookOpen className="w-4 h-4" />,
    children: [
      { id: 'graph', label: 'Knowledge Graph', icon: <Code2 className="w-4 h-4" />, path: '/graph' },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    icon: <Shield className="w-4 h-4" />,
    children: [
      { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" />, path: '/security' },
      { id: 'marketplace', label: 'Marketplace', icon: <Layers className="w-4 h-4" />, path: '/marketplace' },
      { id: 'compliance', label: 'Compliance', icon: <AlertCircle className="w-4 h-4" />, path: '/compliance' },
    ],
  },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, path: '/settings' },
  { id: 'telegram', label: 'Telegram', icon: <MessageCircle className="w-4 h-4" />, path: '/telegram' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    engineering: true,
    infrastructure: true,
  })

  const isActive = (path?: string) => {
    if (!path) return false
    return pathname === path
  }

  const toggleSection = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <aside className="w-64 border-r border-white/8 bg-neutral-900/50 overflow-y-auto flex flex-col">
      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleSection(item.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-foreground hover:bg-neutral-800/50 transition-smooth group"
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expanded[item.id] ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Children */}
                {expanded[item.id] && (
                  <div className="ml-2 border-l border-white/5 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.path || '#'}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-smooth pl-6 ${
                          isActive(child.path)
                            ? 'text-accent-primary bg-accent-primary/10 border-l-2 border-accent-primary'
                            : 'text-neutral-500 hover:text-foreground hover:bg-neutral-800/30'
                        }`}
                      >
                        {child.icon}
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.path || '#'}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-smooth ${
                  isActive(item.path)
                    ? 'text-accent-primary bg-accent-primary/10'
                    : 'text-neutral-400 hover:text-foreground hover:bg-neutral-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/8 p-4 space-y-2">
        <div className="text-xs text-neutral-500 px-2">Status</div>
        <div className="text-xs text-neutral-400 px-3 py-2 bg-neutral-800/50 rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success"></span>
          All systems operational
        </div>
      </div>
    </aside>
  )
}
