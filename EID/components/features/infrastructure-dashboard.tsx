'use client'

import { Server, AlertTriangle, TrendingUp, Cpu, HardDrive, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Service {
  id: string
  name: string
  status: 'healthy' | 'warning' | 'error'
  uptime: string
  cpu: number
  memory: number
  responseTime: string
  lastChecked: string
}

const services: Service[] = [
  {
    id: 'api-prod',
    name: 'API Production',
    status: 'healthy',
    uptime: '99.99%',
    cpu: 32,
    memory: 68,
    responseTime: '145ms',
    lastChecked: '1 min ago',
  },
  {
    id: 'database-primary',
    name: 'Database Primary',
    status: 'healthy',
    uptime: '99.98%',
    cpu: 45,
    memory: 82,
    responseTime: '12ms',
    lastChecked: '2 min ago',
  },
  {
    id: 'cache-cluster',
    name: 'Cache Cluster',
    status: 'warning',
    uptime: '99.95%',
    cpu: 78,
    memory: 91,
    responseTime: '8ms',
    lastChecked: '30s ago',
  },
  {
    id: 'queue-service',
    name: 'Queue Service',
    status: 'healthy',
    uptime: '99.97%',
    cpu: 24,
    memory: 42,
    responseTime: '54ms',
    lastChecked: '1 min ago',
  },
  {
    id: 'cdn-edge',
    name: 'CDN Edge',
    status: 'healthy',
    uptime: '100%',
    cpu: 15,
    memory: 28,
    responseTime: '52ms',
    lastChecked: '5s ago',
  },
]

const statusConfig = {
  healthy: { color: 'bg-success/10 border-success/40 text-success', dot: 'bg-success' },
  warning: { color: 'bg-warning/10 border-warning/40 text-warning', dot: 'bg-warning' },
  error: { color: 'bg-danger/10 border-danger/40 text-danger', dot: 'bg-danger' },
}

const getResourceColor = (value: number) => {
  if (value < 50) return 'bg-success/20'
  if (value < 80) return 'bg-warning/20'
  return 'bg-danger/20'
}

export function InfrastructureDashboard() {
  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="border-b border-white/8 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Server className="w-5 h-5 text-accent-primary" />
          <h2 className="text-xl font-semibold text-white">Infrastructure</h2>
        </div>
        <p className="text-sm text-neutral-400">Real-time service monitoring</p>
      </div>

      {/* Status Summary */}
      <div className="border-b border-white/8 px-6 py-4 grid grid-cols-4 gap-4">
        <div className="p-3 rounded-lg bg-neutral-900/50 border border-white/5">
          <p className="text-xs text-neutral-500 mb-1">Services</p>
          <p className="text-lg font-semibold text-white">5</p>
        </div>
        <div className="p-3 rounded-lg bg-neutral-900/50 border border-white/5">
          <p className="text-xs text-neutral-500 mb-1">Healthy</p>
          <p className="text-lg font-semibold text-success">4</p>
        </div>
        <div className="p-3 rounded-lg bg-neutral-900/50 border border-white/5">
          <p className="text-xs text-neutral-500 mb-1">Warnings</p>
          <p className="text-lg font-semibold text-warning">1</p>
        </div>
        <div className="p-3 rounded-lg bg-neutral-900/50 border border-white/5">
          <p className="text-xs text-neutral-500 mb-1">Avg Uptime</p>
          <p className="text-lg font-semibold text-success">99.98%</p>
        </div>
      </div>

      {/* Services List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {services.map((service) => (
          <div
            key={service.id}
            className={`p-4 rounded-lg border ${statusConfig[service.status].color}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${statusConfig[service.status].dot} animate-pulse`}></div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{service.name}</h3>
                  <p className="text-xs text-neutral-500">Uptime: {service.uptime}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-400">{service.lastChecked}</p>
                <Badge
                  variant="outline"
                  className="text-xs border-white/20 bg-white/5 mt-1"
                >
                  {service.responseTime}
                </Badge>
              </div>
            </div>

            {/* Resources */}
            <div className="grid grid-cols-3 gap-3">
              {/* CPU */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="w-3 h-3" />
                  <span className="text-xs text-neutral-400">CPU</span>
                  <span className="ml-auto text-xs font-semibold">{service.cpu}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getResourceColor(service.cpu)} rounded-full`}
                    style={{ width: `${service.cpu}%` }}
                  ></div>
                </div>
              </div>

              {/* Memory */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <HardDrive className="w-3 h-3" />
                  <span className="text-xs text-neutral-400">Memory</span>
                  <span className="ml-auto text-xs font-semibold">{service.memory}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getResourceColor(service.memory)} rounded-full`}
                    style={{ width: `${service.memory}%` }}
                  ></div>
                </div>
              </div>

              {/* Latency */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-3 h-3" />
                  <span className="text-xs text-neutral-400">Latency</span>
                  <span className="ml-auto text-xs font-semibold">{service.responseTime}</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success/50 rounded-full"
                    style={{ width: '45%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
