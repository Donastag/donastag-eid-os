import type { DirectorProjectsResponse, DirectorRequestsResponse, DirectorDirectResponse } from './types'

const DIRECTOR_BASE_URL =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'
    : 'http://localhost:8002'

export async function getDirectorProjects(): Promise<DirectorProjectsResponse> {
  const res = await fetch(`${DIRECTOR_BASE_URL}/projects`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Failed to load projects: ${res.status}`)
  }

  return res.json()
}

export async function getDirectorRequests(): Promise<DirectorRequestsResponse> {
  const res = await fetch(`${DIRECTOR_BASE_URL}/requests`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Failed to load requests: ${res.status}`)
  }

  return res.json()
}

export async function postDirectorDirect(prompt: string): Promise<DirectorDirectResponse> {
  const res = await fetch(`${DIRECTOR_BASE_URL}/direct`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    body: JSON.stringify({ prompt }),
  })

  if (!res.ok) {
    throw new Error(`Failed to send prompt: ${res.status}`)
  }

  return res.json()
}
