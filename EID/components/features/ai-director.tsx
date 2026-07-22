'use client'

import { useState } from 'react'
import { Send, Zap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { postDirectorDirect, type DirectorDirectResponse } from '@/lib/director/client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AIDirector() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your Engineering Director AI. Ask me anything and I'll route it through the kernel.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const data: DirectorDirectResponse = await postDirectorDirect(input)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || `Allowed: ${String(data.allowed)}. Reason: ${data.reason || 'none'}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="border-b border-white/8 p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent-primary/20 flex items-center justify-center">
          <Zap className="w-4 h-4 text-accent-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-white">Engineering Director</h2>
          <p className="text-xs text-neutral-500">AI-powered guidance</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-accent-primary text-white rounded-br-none'
                  : 'bg-neutral-900 border border-white/10 text-neutral-100 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-2 opacity-60">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-neutral-900 border border-white/10 px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-accent-primary" />
                <span className="text-sm text-neutral-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/8 p-4 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about your infrastructure..."
            className="flex-1 px-3 py-2 bg-neutral-900/50 border border-white/8 rounded-lg text-sm text-foreground placeholder-neutral-500 focus-visible:outline-none focus-visible:border-accent-primary transition-colors"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-accent-primary hover:bg-accent-secondary text-white"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-neutral-500">
          Press Enter to send or click the send button
        </p>
      </div>
    </div>
  )
}
