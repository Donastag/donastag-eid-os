'use client'

import { CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'

const metrics = [
  { label: 'Test Coverage', value: 94, status: 'good', trend: 2 },
  { label: 'Performance Score', value: 92, status: 'good', trend: 3 },
  { label: 'Accessibility', value: 88, status: 'good', trend: 1 },
  { label: 'Security Score', value: 96, status: 'good', trend: 2 },
]

const tests = [
  { name: 'Unit Tests', passed: 1240, failed: 3, skipped: 12, duration: '2.3s' },
  { name: 'Integration Tests', passed: 456, failed: 0, skipped: 2, duration: '5.1s' },
  { name: 'E2E Tests', passed: 89, failed: 1, skipped: 3, duration: '18.4s' },
]

export function VerificationDashboard() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Verification & Quality</h1>
          <p className="text-neutral-400 text-sm mt-1">Testing, performance, and accessibility metrics</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm text-neutral-400">{metric.label}</span>
                <div className="flex items-center gap-1 text-xs text-success">
                  <TrendingUp className="w-3 h-3" />
                  +{metric.trend}%
                </div>
              </div>
              <div className="text-3xl font-bold mb-3">{metric.value}%</div>
              <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div className="bg-success h-full" style={{ width: `${metric.value}%` }} />
              </div>
            </Card>
          ))}
        </div>

        {/* Lighthouse Score */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Lighthouse Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { name: 'Performance', score: 94, color: 'success' },
              { name: 'Accessibility', score: 98, color: 'success' },
              { name: 'Best Practices', score: 92, color: 'success' },
              { name: 'SEO', score: 100, color: 'success' },
              { name: 'PWA', score: 88, color: 'success' },
            ].map((item) => (
              <div key={item.name} className="text-center p-4 bg-neutral-900 rounded-lg">
                <div className={`text-3xl font-bold text-${item.color} mb-1`}>{item.score}</div>
                <div className="text-xs text-neutral-400">{item.name}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Test Results */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Test Results</h2>
          <div className="space-y-4">
            {tests.map((test) => (
              <div key={test.name} className="p-4 bg-neutral-900 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm">{test.name}</h3>
                  <span className="text-xs text-neutral-500">{test.duration}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 flex gap-2">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm text-success">{test.passed}</span>
                    </div>
                    {test.failed > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-danger" />
                        <span className="text-sm text-danger">{test.failed}</span>
                      </div>
                    )}
                    {test.skipped > 0 && (
                      <div className="text-sm text-neutral-500">{test.skipped} skipped</div>
                    )}
                  </div>
                  <div className="w-32 bg-neutral-800 rounded-full h-2">
                    <div className="bg-success h-full rounded-full" style={{ width: `${(test.passed / (test.passed + test.failed)) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
