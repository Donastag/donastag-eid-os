export type InboxItemType =
  | 'repository'
  | 'bug-report'
  | 'rfc'
  | 'requirement'
  | 'documentation'
  | 'architecture'
  | 'code-snippet'
  | 'design'
  | 'video'
  | 'image'
  | 'other'

export type InboxItemStatus =
  | 'queued'
  | 'analyzing'
  | 'classified'
  | 'routed'
  | 'completed'
  | 'failed'

export interface InboxItem {
  id: string
  type: InboxItemType
  status: InboxItemStatus
  title: string
  description: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt: Date
  analyzedAt?: Date
  content?: string
  metadata: Record<string, any>
  confidence: number
  routedTo?: string[]
  tags: string[]
  error?: string
}

export interface InboxFilter {
  status?: InboxItemStatus
  type?: InboxItemType
  searchQuery?: string
}

export interface AnalysisResult {
  type: InboxItemType
  confidence: number
  suggestedTags: string[]
  summary: string
  routingDestinations: string[]
  extractedMetadata: Record<string, any>
}
