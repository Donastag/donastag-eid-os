import { NextRequest, NextResponse } from 'next/server'
import { TelegramBot } from '@/lib/telegram/bot'
import { TelegramSettings } from '@/lib/telegram/types'

// In-memory storage (in production, use a database)
let telegramSettings: TelegramSettings | null = null

export async function GET() {
  try {
    if (!telegramSettings) {
      return NextResponse.json({ settings: null })
    }

    // Don't send sensitive token to client
    const { botToken, ...safeSettings } = telegramSettings
    return NextResponse.json({ settings: safeSettings })
  } catch (error) {
    console.error('[Telegram] GET settings error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { botToken, chatId, webhookUrl } = body as {
      botToken: string
      chatId: string
      webhookUrl?: string
    }

    if (!botToken) {
      return NextResponse.json(
        { error: 'Bot token is required' },
        { status: 400 }
      )
    }

    // Verify bot token by calling getMe
    const bot = new TelegramBot(botToken)
    const botInfo = await bot.getMe()

    if (!botInfo) {
      return NextResponse.json(
        { error: 'Invalid bot token' },
        { status: 400 }
      )
    }

    // Set webhook if URL provided
    if (webhookUrl) {
      const webhookSet = await bot.setWebhook(webhookUrl)
      if (!webhookSet) {
        console.warn('[Telegram] Failed to set webhook, but saving settings')
      }
    }

    // Save settings
    telegramSettings = {
      botToken,
      chatId: chatId || null,
      webhookUrl: webhookUrl || null,
      isActive: !!botToken && !!chatId,
      createdAt: telegramSettings?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log('[Telegram] Settings updated')

    return NextResponse.json({
      ok: true,
      settings: {
        botName: botInfo.username,
        chatId,
        isActive: telegramSettings.isActive,
        webhookUrl,
      },
    })
  } catch (error) {
    console.error('[Telegram] POST settings error:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    if (telegramSettings?.botToken) {
      const bot = new TelegramBot(telegramSettings.botToken)
      await bot.deleteWebhook()
    }

    telegramSettings = null

    console.log('[Telegram] Settings deleted')

    return NextResponse.json({ ok: true, message: 'Settings deleted' })
  } catch (error) {
    console.error('[Telegram] DELETE settings error:', error)
    return NextResponse.json(
      { error: 'Failed to delete settings' },
      { status: 500 }
    )
  }
}
