import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const DIRECTOR_URL = process.env.DIRECTOR_URL || 'http://director:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = typeof body?.message === 'string' ? body.message.trim() : ''

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    const url = new URL('/orchestrate', DIRECTOR_URL)
    const resp = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: message,
        capability: 'chat.general',
        action: 'send',
        owner_project: 'default',
      }),
      cache: 'no-store',
    })

    if (!resp.ok) {
      return NextResponse.json({ error: 'Director request failed' }, { status: resp.status })
    }

    const data = await resp.json()
    return NextResponse.json({ reply: data.response || data.reason || 'No response' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 })
  }
}
