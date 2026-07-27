'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [isSending, setIsSending] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = message.trim()
    if (!text || isSending) return

    const userMessage = { role: 'user' as const, content: text }
    setMessages((prev) => [...prev, userMessage])
    setMessage('')
    setIsSending(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || 'No response' }])
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: failed to send message' }])
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="surface-primary border border-white/10 rounded-xl shadow-2xl w-80 sm:w-96 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-accent-primary" />
              <span className="text-sm font-medium text-white">Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-500 hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-h-[200px] max-h-[320px] overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-xs text-neutral-500">Send a message to get started.</div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-accent-primary text-white'
                      : 'bg-neutral-900/60 text-neutral-200 border border-white/8'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-neutral-900/60 border border-white/8 rounded-lg px-3 py-2 text-xs text-neutral-400">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-white/8 px-3 py-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 resize-none rounded-lg bg-neutral-900/50 border border-white/10 px-3 py-2 text-xs text-foreground placeholder-neutral-500 focus-visible:outline-none focus-visible:border-accent-primary"
              />
              <Button
                size="icon-sm"
                variant="default"
                onClick={handleSend}
                disabled={!message.trim() || isSending}
                className="shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <Button
        size="icon-lg"
        variant="default"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full shadow-lg"
      >
        <MessageCircle className="w-5 h-5" />
      </Button>
    </div>
  )
}
