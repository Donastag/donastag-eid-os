import { NextRequest, NextResponse } from 'next/server'
import { TelegramBot, sendDeploymentNotification, sendAlertNotification } from '@/lib/telegram/bot'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { botToken, chatId, type, data } = body as {
      botToken: string
      chatId: string
      type: 'deployment' | 'alert'
      data: Record<string, unknown>
    }

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: 'Missing botToken or chatId' },
        { status: 400 }
      )
    }

    let success = false

    if (type === 'deployment') {
      success = await sendDeploymentNotification(botToken, chatId, {
        project: (data.project as string) || 'Unknown',
        version: (data.version as string) || 'v1.0.0',
        status: (data.status as 'success' | 'failed') || 'success',
        duration: (data.duration as number) || 0,
      })
    } else if (type === 'alert') {
      success = await sendAlertNotification(botToken, chatId, {
        title: (data.title as string) || 'Alert',
        message: (data.message as string) || 'No message provided',
        severity: (data.severity as 'critical' | 'warning' | 'info') || 'info',
      })
    }

    if (success) {
      return NextResponse.json({
        ok: true,
        message: `${type} notification sent successfully`,
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[Telegram] Send API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
