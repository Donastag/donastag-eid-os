import { TelegramApiResponse } from './types'

const TELEGRAM_API = 'https://api.telegram.org'

export class TelegramBot {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private getApiUrl(method: string): string {
    return `${TELEGRAM_API}/bot${this.token}/${method}`
  }

  async setWebhook(url: string): Promise<boolean> {
    try {
      const response = await fetch(this.getApiUrl('setWebhook'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = (await response.json()) as TelegramApiResponse<boolean>
      return data.ok
    } catch (error) {
      console.error('[Telegram] setWebhook error:', error)
      return false
    }
  }

  async deleteWebhook(): Promise<boolean> {
    try {
      const response = await fetch(this.getApiUrl('deleteWebhook'), {
        method: 'POST',
      })

      const data = (await response.json()) as TelegramApiResponse<boolean>
      return data.ok
    } catch (error) {
      console.error('[Telegram] deleteWebhook error:', error)
      return false
    }
  }

  async sendMessage(
    chatId: string | number,
    text: string,
    options?: Record<string, unknown>
  ): Promise<boolean> {
    try {
      const response = await fetch(this.getApiUrl('sendMessage'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          ...options,
        }),
      })

      const data = (await response.json()) as TelegramApiResponse<unknown>
      return data.ok
    } catch (error) {
      console.error('[Telegram] sendMessage error:', error)
      return false
    }
  }

  async answerCallbackQuery(
    queryId: string,
    text?: string,
    showAlert?: boolean
  ): Promise<boolean> {
    try {
      const response = await fetch(this.getApiUrl('answerCallbackQuery'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: queryId,
          text,
          show_alert: showAlert,
        }),
      })

      const data = (await response.json()) as TelegramApiResponse<boolean>
      return data.ok
    } catch (error) {
      console.error('[Telegram] answerCallbackQuery error:', error)
      return false
    }
  }

  async getMe(): Promise<Record<string, unknown> | null> {
    try {
      const response = await fetch(this.getApiUrl('getMe'), {
        method: 'GET',
      })

      const data = (await response.json()) as TelegramApiResponse<Record<string, unknown>>
      return data.ok ? data.result || null : null
    } catch (error) {
      console.error('[Telegram] getMe error:', error)
      return null
    }
  }
}

// Helper function to send deployment notification
export async function sendDeploymentNotification(
  botToken: string,
  chatId: string,
  deploymentData: {
    project: string
    version: string
    status: 'success' | 'failed'
    duration: number
  }
): Promise<boolean> {
  const bot = new TelegramBot(botToken)
  const statusEmoji = deploymentData.status === 'success' ? '✅' : '❌'
  const message = `
<b>${statusEmoji} Deployment ${deploymentData.status}</b>

<b>Project:</b> ${deploymentData.project}
<b>Version:</b> ${deploymentData.version}
<b>Duration:</b> ${deploymentData.duration}s
  `.trim()

  return bot.sendMessage(chatId, message)
}

// Helper function to send alert notification
export async function sendAlertNotification(
  botToken: string,
  chatId: string,
  alertData: {
    title: string
    message: string
    severity: 'critical' | 'warning' | 'info'
  }
): Promise<boolean> {
  const bot = new TelegramBot(botToken)
  const severityEmoji =
    alertData.severity === 'critical'
      ? '🚨'
      : alertData.severity === 'warning'
        ? '⚠️'
        : 'ℹ️'

  const message = `
<b>${severityEmoji} ${alertData.title}</b>

${alertData.message}
  `.trim()

  return bot.sendMessage(chatId, message)
}
