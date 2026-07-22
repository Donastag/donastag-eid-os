'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Command, Settings, Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationCenter } from '@/components/features/notification-center'

const SEARCH_RESULTS = [
  { id: 'home', title: 'Home', category: 'Pages', icon: '🏠', path: '/' },
  { id: 'director', title: 'Engineering Director', category: 'Features', icon: '🤖', path: '/director' },
  { id: 'router', title: 'AI Router', category: 'Features', icon: '🔀', path: '/router' },
  { id: 'workflow', title: 'Workflows', category: 'Pages', icon: '⚙️', path: '/workflow' },
  { id: 'services', title: 'Services', category: 'Infrastructure', icon: '📦', path: '/services' },
  { id: 'deployments', title: 'Deployments', category: 'Infrastructure', icon: '🚀', path: '/deployments' },
  { id: 'security', title: 'Security Center', category: 'Governance', icon: '🔒', path: '/security' },
  { id: 'graph', title: 'Knowledge Graph', category: 'Knowledge', icon: '📊', path: '/graph' },
]

export function Header() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const filteredResults = searchValue
    ? SEARCH_RESULTS.filter(
        (result) =>
          result.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          result.category.toLowerCase().includes(searchValue.toLowerCase())
      )
    : []

  return (
    <header className="h-16 border-b border-white/8 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="h-full flex items-center justify-between px-6 gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center">
            <span className="text-sm font-bold text-white">D</span>
          </div>
          <span className="font-semibold text-sm">Donastag</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search engineering tasks..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value)
                setIsSearching(true)
              }}
              onBlur={() => setTimeout(() => setIsSearching(false), 200)}
              className="w-full pl-10 pr-10 py-2 bg-neutral-900/50 border border-white/8 rounded-lg text-sm text-foreground placeholder-neutral-500 focus-visible:outline-none focus-visible:border-accent-primary transition-colors"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue('')}
                className="absolute right-3 text-neutral-500 hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Dropdown Results */}
            {isSearching && filteredResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-white/10 rounded-lg shadow-lg overflow-hidden z-50">
                {filteredResults.map((result, idx) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      router.push(result.path)
                      setSearchValue('')
                      setIsSearching(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      idx === 0 ? 'bg-accent-primary/10 text-accent-primary' : 'text-neutral-300 hover:bg-neutral-800/50'
                    }`}
                  >
                    <span>{result.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{result.title}</div>
                      <div className="text-xs text-neutral-500">{result.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          {/* Command Palette */}
          <div className="flex items-center gap-1 px-2 h-8 rounded-lg border border-white/10 bg-neutral-900/30 hover:bg-neutral-900/50 cursor-pointer transition-colors group" title="Command Palette (⌘K or Ctrl+K)">
            <Command className="w-4 h-4 text-neutral-500 group-hover:text-foreground transition-colors" />
            <span className="text-xs text-neutral-500 group-hover:text-foreground transition-colors font-mono">⌘K</span>
          </div>

          {/* Notifications Center */}
          <NotificationCenter />

          {/* Environment Selector */}
          <div className="h-8 px-3 flex items-center gap-2 bg-neutral-900/50 border border-white/8 rounded-lg text-xs">
            <span className="text-neutral-400">ENV:</span>
            <span className="font-mono text-foreground">production</span>
          </div>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-400 hover:text-foreground"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
