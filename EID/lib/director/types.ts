export interface DirectorProject {
  id: string
  name: string
  client?: string
  status: string
  metadata?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface DirectorProjectsResponse {
  projects: DirectorProject[]
}

export interface DirectorRequest {
  id: string
  source: string
  capability?: string
  action?: string
  prompt: string
  allowed: boolean
  reason?: string
  response?: string
  created_at?: string
}

export interface DirectorRequestsResponse {
  requests: DirectorRequest[]
}

export interface DirectorDirectResponse {
  capability?: string
  action?: string
  allowed: boolean
  reason?: string
  response?: string
}
