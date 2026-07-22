'use client'

import { useState } from 'react'
import { Send, Trash2, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function TelegramSettings() {
  const [botToken, setBotToken] = useState('')
  const [chatId, setChatId] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const handleSaveSettings = async () => {
    if (!botToken || !chatId) {
      setMessage({ type: 'error', text: 'Bot token and chat ID are required' })
      return
    }

    setLoading(true)
    try {
      // Get current window URL for webhook
      const webhookUrl = `${window.location.origin}/api/telegram/webhook`

      const response = await fetch('/api/telegram/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken,
          chatId,
          webhookUrl,
        }),
      })

      const data = (await response.json()) as {
        ok?: boolean
        error?: string
        settings?: Record<string, unknown>
      }

      if (data.ok) {
        setMessage({ type: 'success', text: 'Telegram bot connected successfully!' })
        setIsConnected(true)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to disconnect Telegram?')) return

    setLoading(true)
    try {
      const response = await fetch('/api/telegram/settings', {
        method: 'DELETE',
      })

      const data = (await response.json()) as { ok?: boolean; error?: string }

      if (data.ok) {
        setMessage({ type: 'success', text: 'Telegram disconnected' })
        setBotToken('')
        setChatId('')
        setIsConnected(false)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to disconnect' })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestNotification = async () => {
    if (!botToken || !chatId) {
      setMessage({ type: 'error', text: 'Please configure Telegram first' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken,
          chatId,
          type: 'alert',
          data: {
            title: 'Test Notification',
            message: 'This is a test notification from Donastag Engineering OS',
            severity: 'info',
          },
        }),
      })

      const data = (await response.json()) as { ok?: boolean; error?: string }

      if (data.ok) {
        setMessage({ type: 'success', text: 'Test notification sent!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send notification' })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="p-6 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Telegram Integration</h1>
          <p className="text-neutral-400">
            Connect your Telegram bot to receive deployment and alert notifications
          </p>
        </div>

        <Card className="border-white/10 bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-primary"></div>
              Configuration
            </CardTitle>
            <CardDescription>
              Enter your Telegram bot credentials to enable notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bot Token Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Bot Token</label>
              <input
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="Paste your Telegram bot token here"
                className="w-full px-4 py-2 bg-neutral-800/50 border border-white/10 rounded-lg text-sm text-foreground placeholder-neutral-500 focus:border-accent-primary focus:outline-none transition-colors"
                disabled={loading}
              />
              <p className="text-xs text-neutral-500">
                Get your token from{' '}
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:underline"
                >
                  @BotFather
                </a>{' '}
                on Telegram
              </p>
            </div>

            {/* Chat ID Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Chat ID</label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Your Telegram chat ID (e.g., 123456789)"
                className="w-full px-4 py-2 bg-neutral-800/50 border border-white/10 rounded-lg text-sm text-foreground placeholder-neutral-500 focus:border-accent-primary focus:outline-none transition-colors"
                disabled={loading}
              />
              <p className="text-xs text-neutral-500">
                Send /start to your bot to find your chat ID
              </p>
            </div>

            {/* Status Message */}
            {message && (
              <div
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm text-foreground">{message.text}</p>
              </div>
            )}

            {/* Connection Status */}
            {isConnected && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-primary/10 border border-accent-primary/20">
                <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></div>
                <p className="text-sm text-foreground">Telegram bot is connected and ready</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-medium hover:bg-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {loading ? 'Connecting...' : 'Connect'}
              </button>

              <button
                onClick={handleTestNotification}
                disabled={loading || !isConnected}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-200 rounded-lg text-sm font-medium transition-colors"
              >
                Send Test
              </button>

              {isConnected && (
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-400 rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Disconnect
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="mt-6 border-white/10 bg-neutral-900/30">
          <CardHeader>
            <CardTitle className="text-base">How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-400">
            <p>
              1. Create a Telegram bot by messaging{' '}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-primary hover:underline"
              >
                @BotFather
              </a>
              . Use /newbot to create a new bot and get your token.
            </p>
            <p>
              2. Send /start to your new bot and then get your chat ID (usually shown when you
              interact with the bot).
            </p>
            <p>
              3. Enter both the bot token and chat ID above, then click Connect to set up the
              webhook.
            </p>
            <p>
              4. Once connected, you will receive notifications for deployments, alerts, and other
              important events.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
