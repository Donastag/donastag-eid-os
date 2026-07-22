'use client'

import { useState } from 'react'
import { ChevronUp, Terminal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BottomConsole() {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="border-t border-white/8 bg-neutral-950/80 backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/8">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-accent-primary" />
          <span className="text-sm font-medium">Console Output</span>
          <span className="text-xs text-neutral-500 ml-2">Ready</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-neutral-500 hover:text-foreground"
          >
            <ChevronUp
              className={`w-4 h-4 transition-transform ${isExpanded ? '' : 'rotate-180'}`}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-500 hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="h-40 overflow-auto bg-black/50 font-mono text-xs p-4 space-y-1">
          <div className="text-neutral-500">
            <span className="text-accent-primary">$</span> npm run build
          </div>
          <div className="text-neutral-400">
            <span className="text-success">✓</span> Compiling...
          </div>
          <div className="text-neutral-400 ml-4">
            - Built 1,245 modules
          </div>
          <div className="text-neutral-400 ml-4">
            - Optimized assets
          </div>
          <div className="text-neutral-400 ml-4">
            - Generated manifest
          </div>
          <div className="text-success mt-2">
            Build complete in 2.34s
          </div>
        </div>
      )}
    </div>
  )
}
