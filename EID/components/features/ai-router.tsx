'use client'

import { Network, Zap, Brain, Lightbulb, Cpu, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Model {
  id: string
  name: string
  provider: string
  icon: React.ReactNode
  capabilities: string[]
  latency: string
  costTier: 'free' | 'pro' | 'enterprise'
  isActive: boolean
}

const models: Model[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    icon: <Brain className="w-5 h-5" />,
    capabilities: ['Code Analysis', 'Architecture Design', 'Documentation'],
    latency: '2.1s',
    costTier: 'pro',
    isActive: true,
  },
  {
    id: 'claude-3',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    icon: <Zap className="w-5 h-5" />,
    capabilities: ['Context Understanding', 'Complex Tasks', 'Reasoning'],
    latency: '1.8s',
    costTier: 'enterprise',
    isActive: true,
  },
  {
    id: 'gemini-ultra',
    name: 'Gemini Ultra',
    provider: 'Google',
    icon: <Lightbulb className="w-5 h-5" />,
    capabilities: ['Multimodal', 'Real-time Data', 'Web Search'],
    latency: '1.5s',
    costTier: 'pro',
    isActive: false,
  },
  {
    id: 'llama-2-70b',
    name: 'Llama 2 70B',
    provider: 'Meta',
    icon: <Cpu className="w-5 h-5" />,
    capabilities: ['Open Source', 'Fine-tuning', 'Low Latency'],
    latency: '0.9s',
    costTier: 'free',
    isActive: true,
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    icon: <MessageSquare className="w-5 h-5" />,
    capabilities: ['Efficient', 'Fast', 'Cost-effective'],
    latency: '0.7s',
    costTier: 'pro',
    isActive: false,
  },
]

const costColors = {
  free: 'bg-success/10 text-success border-success/20',
  pro: 'bg-accent-primary/10 text-accent-primary border-accent-primary/20',
  enterprise: 'bg-warning/10 text-warning border-warning/20',
}

export function AIRouter() {
  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="border-b border-white/8 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Network className="w-5 h-5 text-accent-primary" />
          <h2 className="text-xl font-semibold text-white">AI Router</h2>
        </div>
        <p className="text-sm text-neutral-400">
          Select and configure AI models for your workflows
        </p>
      </div>

      {/* Models Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model) => (
            <div
              key={model.id}
              className={`p-4 rounded-lg border transition-smooth cursor-pointer ${
                model.isActive
                  ? 'border-accent-primary/50 bg-accent-primary/5 hover:border-accent-primary'
                  : 'border-white/5 bg-neutral-900/50 hover:border-white/10'
              }`}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      model.isActive
                        ? 'bg-accent-primary/20 text-accent-primary'
                        : 'bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {model.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{model.name}</h3>
                    <p className="text-xs text-neutral-500">{model.provider}</p>
                  </div>
                </div>
                {model.isActive && (
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                )}
              </div>

              {/* Capabilities */}
              <div className="mb-3 space-y-2">
                <p className="text-xs text-neutral-400 font-medium">Capabilities</p>
                <div className="flex flex-wrap gap-1">
                  {model.capabilities.map((cap) => (
                    <Badge
                      key={cap}
                      variant="outline"
                      className="text-xs border-white/10 text-neutral-400 bg-neutral-900/30"
                    >
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-neutral-500">Latency: {model.latency}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs border ${costColors[model.costTier]}`}
                  >
                    {model.costTier.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
