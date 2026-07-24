import { type NextRequest } from 'next/server'

const PROJECT_INTAKE_URL = process.env.PROJECT_INTAKE_URL || 'http://project_intake:8000'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  url.hostname = new URL(PROJECT_INTAKE_URL).hostname
  url.port = new URL(PROJECT_INTAKE_URL).port
  url.protocol = new URL(PROJECT_INTAKE_URL).protocol
  url.pathname = '/intakes'
  url.search = 'limit=50'

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to load project intakes' }), { status: res.status })
  }
  return new Response(await res.text(), { status: 200 })
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  url.hostname = new URL(PROJECT_INTAKE_URL).hostname
  url.port = new URL(PROJECT_INTAKE_URL).port
  url.protocol = new URL(PROJECT_INTAKE_URL).protocol
  url.pathname = '/intakes'

  const body = await request.json()
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to create project intake' }), { status: res.status })
  }
  return new Response(await res.text(), { status: 201 })
}
