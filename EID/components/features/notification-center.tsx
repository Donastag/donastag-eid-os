'use client'

import { useState } from 'react'
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Trash2,
} from 'lucide-react'
import { TelegramNotification } from '@/lib/telegram/types'

interface NotificationCenterProps {
  notifications?: TelegramNotification[]
  onClear?: () => void
}

export function NotificationCenter({ notifications = [], onClear }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localNotifications, setLocalNotifications] = useState<TelegramNotification[]>(notifications)

  const getIcon = (type: TelegramNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const handleDelete = (id: string) => {
    setLocalNotifications(localNotifications.filter((n) => n.id !== id))
  }

  const handleClear = () => {
    setLocalNotifications([])
    onClear?.()
  }

  const unreadCount = localNotifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-neutral-800/50 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-neutral-400 hover:text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-primary rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-neutral-900 border border-white/10 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications ({localNotifications.length})
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-neutral-800 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {localNotifications.length > 0 ? (
              <div className="divide-y divide-white/5">
                {localNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 hover:bg-neutral-800/30 transition-colors group"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{notification.title}</p>
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-neutral-500 mt-2">
                          {new Date(notification.sentAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-neutral-700 rounded transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-neutral-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {localNotifications.length > 0 && (
            <div className="border-t border-white/10 p-3">
              <button
                onClick={handleClear}
                className="w-full px-3 py-2 text-sm text-neutral-400 hover:text-foreground hover:bg-neutral-800/50 rounded transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
