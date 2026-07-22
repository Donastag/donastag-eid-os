import { NextRequest, NextResponse } from 'next/server'
import { TelegramUpdate } from '@/lib/telegram/types'

export async function POST(request: NextRequest) {
  try {
    const update = (await request.json()) as TelegramUpdate

    console.log('[Telegram] Received update:', update.update_id)

    // Handle message
    if (update.message) {
      const message = update.message
      const text = message.text || ''
      const userId = message.from.id
      const chatId = message.chat.id

      console.log(
        `[Telegram] Message from ${userId} in chat ${chatId}: ${text}`
      )

      // Handle commands
      if (text.startsWith('/start')) {
        // Could implement command handling here
      } else if (text.startsWith('/status')) {
        // Could implement status command
      }

      // Log successful processing
      return NextResponse.json({ ok: true, status: 'message_received' })
    }

    // Handle callback query
    if (update.callback_query) {
      const query = update.callback_query
      console.log(`[Telegram] Callback query from ${query.from.id}: ${query.data}`)

      return NextResponse.json({ ok: true, status: 'callback_received' })
    }

    return NextResponse.json({ ok: true, status: 'update_processed' })
  } catch (error) {
    console.error('[Telegram] Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET request should return 200 for webhook verification
export async function GET() {
  return NextResponse.json({ ok: true, message: 'Telegram webhook ready' })
}
