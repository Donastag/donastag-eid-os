'use client'

import { Search, Star, TrendingUp, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'

const assets = [
  {
    id: '1',
    name: 'Auth Flow Component',
    category: 'Components',
    rating: 4.9,
    reuse: 1240,
    performance: 98,
    preview: '#6366f1',
  },
  {
    id: '2',
    name: 'Dashboard Template',
    category: 'Templates',
    rating: 4.8,
    reuse: 856,
    performance: 96,
    preview: '#8b5cf6',
  },
  {
    id: '3',
    name: 'Smooth Fade Animation',
    category: 'Animations',
    rating: 4.7,
    reuse: 532,
    performance: 99,
    preview: '#06b6d4',
  },
  {
    id: '4',
    name: 'Form Validation Library',
    category: 'Libraries',
    rating: 4.9,
    reuse: 1089,
    performance: 97,
    preview: '#10b981',
  },
  {
    id: '5',
    name: 'Data Table Advanced',
    category: 'Components',
    rating: 4.8,
    reuse: 743,
    performance: 95,
    preview: '#f59e0b',
  },
  {
    id: '6',
    name: 'Notification System',
    category: 'Systems',
    rating: 4.9,
    reuse: 924,
    performance: 99,
    preview: '#ef4444',
  },
]

export function AssetLibrary() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Asset Library</h1>
            <p className="text-neutral-400 text-sm mt-1">Browse and manage reusable assets</p>
          </div>
          <button className="px-4 py-2 bg-accent-primary hover:opacity-90 text-white rounded-lg flex items-center gap-2 transition-opacity">
            <Plus className="w-4 h-4" />
            Upload Asset
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search assets..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-accent-primary transition-colors"
            />
          </div>
          <select className="px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-accent-primary transition-colors">
            <option>All Categories</option>
            <option>Components</option>
            <option>Templates</option>
            <option>Animations</option>
            <option>Libraries</option>
          </select>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <Card key={asset.id} className="group cursor-pointer hover:border-accent-primary/50 transition-colors">
              <div className="p-4 space-y-3">
                <div className="h-32 rounded-lg bg-neutral-800 border border-white/5" style={{backgroundColor: asset.preview + '20'}} />
                
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm">{asset.name}</h3>
                      <p className="text-xs text-neutral-500 mt-1">{asset.category}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-neutral-400">
                      <Star className="w-3 h-3 fill-accent-primary text-accent-primary" />
                      {asset.rating}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1 text-neutral-400">
                    <TrendingUp className="w-3 h-3" />
                    {asset.reuse} uses
                  </div>
                  <div className="text-neutral-400">
                    {asset.performance}% perf
                  </div>
                </div>

                <button className="w-full px-3 py-2 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary text-xs font-medium rounded transition-colors">
                  Use Asset
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
