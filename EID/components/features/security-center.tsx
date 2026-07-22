'use client'

import { AlertCircle, CheckCircle2, Lock, Package, Key, Shield } from 'lucide-react'
import { Card } from '@/components/ui/card'

const sections = [
  {
    title: 'Vulnerabilities',
    icon: AlertCircle,
    count: 2,
    color: 'danger',
    items: [
      { name: 'express', version: '4.17.1', severity: 'High', cve: 'CVE-2022-24999' },
      { name: 'lodash', version: '4.17.20', severity: 'Medium', cve: 'CVE-2021-23337' },
    ],
  },
  {
    title: 'Dependencies',
    icon: Package,
    count: 247,
    color: 'success',
    items: [
      { name: '@vercel/analytics', version: '1.1.0', status: 'Updated' },
      { name: 'next', version: '16.0.0', status: 'Latest' },
      { name: 'react', version: '19.0.0', status: 'Latest' },
    ],
  },
  {
    title: 'Secrets',
    icon: Key,
    count: 12,
    color: 'warning',
    items: [
      { name: 'DATABASE_URL', updated: '2 days ago', rotated: true },
      { name: 'API_KEY_PROD', updated: '5 days ago', rotated: true },
    ],
  },
  {
    title: 'Certificates',
    icon: Lock,
    count: 4,
    color: 'success',
    items: [
      { name: 'domain.com', expires: '92 days', status: 'Valid' },
      { name: '*.api.domain.com', expires: '92 days', status: 'Valid' },
    ],
  },
]

export function SecurityCenter() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Security Center</h1>
            <p className="text-neutral-400 text-sm mt-1">Manage dependencies, secrets, and security</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
            <Shield className="w-4 h-4 text-success" />
            <span className="text-sm text-success font-medium">Overall Secure</span>
          </div>
        </div>

        {/* Security Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <Card key={section.title} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 text-${section.color}`} />
                    <div>
                      <h2 className="font-semibold">{section.title}</h2>
                      <p className="text-xs text-neutral-500">{section.count} items</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {section.items.map((item, i) => (
                    <div key={i} className="p-3 bg-neutral-900 rounded-lg flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.version && (
                          <div className="text-xs text-neutral-500">{item.version}</div>
                        )}
                        {item.cve && (
                          <div className="text-xs text-danger">{item.cve}</div>
                        )}
                      </div>
                      {item.status && (
                        <span className="text-xs text-neutral-400">{item.status}</span>
                      )}
                      {item.severity && (
                        <span className={`text-xs px-2 py-1 rounded bg-${item.severity === 'High' ? 'danger' : 'warning'}/20 text-${item.severity === 'High' ? 'danger' : 'warning'}`}>
                          {item.severity}
                        </span>
                      )}
                      {item.expires && (
                        <span className="text-xs text-success">{item.expires}</span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>

        {/* SBOM Export */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Software Bill of Materials</h2>
          <button className="px-4 py-2 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary rounded-lg text-sm font-medium transition-colors">
            Export SBOM (CycloneDX)
          </button>
        </Card>
      </div>
    </div>
  )
}
