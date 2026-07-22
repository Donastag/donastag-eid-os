'use client'

import { Search, Download, Star, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'

const items = [
  {
    id: '1',
    name: 'Performance Expert',
    category: 'Expert',
    rating: 4.9,
    installs: 1240,
    description: 'Analyzes and optimizes app performance',
    tags: ['Performance', 'Analysis', 'Optimization'],
    installed: true,
  },
  {
    id: '2',
    name: 'Security Auditor',
    category: 'Expert',
    rating: 4.8,
    installs: 856,
    description: 'Comprehensive security assessment and recommendations',
    tags: ['Security', 'Audit', 'Compliance'],
    installed: false,
  },
  {
    id: '3',
    name: 'Deploy Policy Pack',
    category: 'Policy',
    rating: 4.7,
    installs: 532,
    description: 'Standard deployment and release policies',
    tags: ['Deployment', 'Policy', 'Release'],
    installed: true,
  },
  {
    id: '4',
    name: 'API Gateway Plugin',
    category: 'Plugin',
    rating: 4.9,
    installs: 1089,
    description: 'Advanced API gateway configuration and management',
    tags: ['API', 'Gateway', 'Routing'],
    installed: false,
  },
  {
    id: '5',
    name: 'Monitoring Pack Pro',
    category: 'Pack',
    rating: 4.8,
    installs: 743,
    description: 'Advanced monitoring and observability setup',
    tags: ['Monitoring', 'Observability', 'Metrics'],
    installed: true,
  },
  {
    id: '6',
    name: 'Testing Framework',
    category: 'Expert',
    rating: 4.9,
    installs: 924,
    description: 'Comprehensive testing strategy and implementation',
    tags: ['Testing', 'QA', 'Quality'],
    installed: false,
  },
]

export function Marketplace() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Marketplace</h1>
            <p className="text-neutral-400 text-sm mt-1">Extend your platform with experts, policies, and plugins</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search marketplace..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-accent-primary transition-colors"
            />
          </div>
          <select className="px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-accent-primary transition-colors">
            <option>All Categories</option>
            <option>Expert</option>
            <option>Policy</option>
            <option>Plugin</option>
            <option>Pack</option>
          </select>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="p-6 flex flex-col hover:border-accent-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-xs text-neutral-500">{item.category}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-400">
                  <Star className="w-3 h-3 fill-accent-primary text-accent-primary" />
                  {item.rating}
                </div>
              </div>

              <p className="text-sm text-neutral-400 mb-4">{item.description}</p>

              <div className="flex gap-2 mb-4 flex-wrap">
                {item.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-accent-primary/10 text-accent-primary text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1 text-xs text-neutral-500 mb-4">
                <Users className="w-3 h-3" />
                {item.installs} installs
              </div>

              <button
                className={`mt-auto w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.installed
                    ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    : 'bg-accent-primary hover:opacity-90 text-white'
                }`}
              >
                {item.installed ? (
                  <>
                    <Check className="w-4 h-4 inline mr-2" />
                    Installed
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 inline mr-2" />
                    Install
                  </>
                )}
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function Check() {
  return <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
}
