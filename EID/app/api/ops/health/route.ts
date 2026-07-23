import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({
      items: [
        { name: 'Backup', status: 'manual', detail: 'scripts/backup.sh' },
        { name: 'Restore', status: 'manual', detail: 'scripts/restore.sh <file>' },
        { name: 'Metrics', status: 'ok', detail: 'http://localhost:8016/metrics' },
      ],
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
