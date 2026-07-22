// Telegram Bot API Types

export interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
}

export interface TelegramMessage {
  message_id: number
  from: TelegramUser
  chat: TelegramChat
  date: number
  text?: string
  entities?: TelegramMessageEntity[]
  reply_markup?: TelegramReplyMarkup
}

export interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
}

export interface TelegramChat {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  type: 'private' | 'group' | 'supergroup' | 'channel'
}

export interface TelegramMessageEntity {
  type: 'mention' | 'hashtag' | 'bot_command' | 'url' | 'email' | 'code'
  offset: number
  length: number
}

export interface TelegramCallbackQuery {
  id: string
  from: TelegramUser
  chat_instance: string
  data?: string
  message?: TelegramMessage
}

export interface TelegramReplyMarkup {
  inline_keyboard?: TelegramInlineKeyboard[][]
}

export interface TelegramInlineKeyboard {
  text: string
  callback_data: string
}

export interface TelegramApiResponse<T> {
  ok: boolean
  result?: T
  error_code?: number
  description?: string
}

export interface TelegramSettings {
  botToken: string
  chatId: string | null
  webhookUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TelegramNotification {
  id: string
  type: 'deployment' | 'alert' | 'error' | 'success' | 'info'
  title: string
  message: string
  data?: Record<string, unknown>
  sentAt: string
  read: boolean
}
