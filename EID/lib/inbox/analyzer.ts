import { InboxItemType, AnalysisResult } from './types'

export class ContentAnalyzer {
  static async analyzeFile(
    fileName: string,
    fileType: string,
    content?: string
  ): Promise<AnalysisResult> {
    // Pattern-based classification
    const type = this.classifyByFileType(fileName, fileType, content)
    const tags = this.extractTags(fileName, content)
    const destinations = this.suggestDestinations(type, tags)
    const summary = this.generateSummary(fileName, type, content)

    return {
      type,
      confidence: this.calculateConfidence(fileName, fileType, type),
      suggestedTags: tags,
      summary,
      routingDestinations: destinations,
      extractedMetadata: this.extractMetadata(fileName, content),
    }
  }

  private static classifyByFileType(
    fileName: string,
    fileType: string,
    content?: string
  ): InboxItemType {
    const nameLower = fileName.toLowerCase()
    const typeLower = fileType.toLowerCase()

    // Repository detection
    if (
      typeLower.includes('zip') ||
      typeLower.includes('tar') ||
      typeLower.includes('git') ||
      nameLower.includes('.git')
    ) {
      return 'repository'
    }

    // Check content for patterns
    if (content) {
      const contentLower = content.toLowerCase()

      // Bug report patterns
      if (
        contentLower.includes('bug') ||
        contentLower.includes('error') ||
        contentLower.includes('issue') ||
        contentLower.includes('broken')
      ) {
        return 'bug-report'
      }

      // RFC patterns
      if (
        contentLower.includes('rfc') ||
        contentLower.includes('enhancement') ||
        contentLower.includes('proposal')
      ) {
        return 'rfc'
      }

      // Architecture patterns
      if (
        contentLower.includes('architecture') ||
        contentLower.includes('diagram') ||
        contentLower.includes('system design')
      ) {
        return 'architecture'
      }

      // Documentation patterns
      if (
        contentLower.includes('documentation') ||
        contentLower.includes('guide') ||
        contentLower.includes('tutorial')
      ) {
        return 'documentation'
      }

      // Requirement patterns
      if (
        contentLower.includes('requirement') ||
        contentLower.includes('spec') ||
        contentLower.includes('should')
      ) {
        return 'requirement'
      }
    }

    // File type based classification
    if (typeLower.includes('pdf')) {
      return 'documentation'
    }
    if (
      typeLower.includes('image') ||
      typeLower.includes('jpeg') ||
      typeLower.includes('png') ||
      typeLower.includes('svg')
    ) {
      return 'design'
    }
    if (
      typeLower.includes('video') ||
      typeLower.includes('mp4') ||
      typeLower.includes('webm')
    ) {
      return 'video'
    }
    if (
      typeLower.includes('code') ||
      typeLower.includes('javascript') ||
      typeLower.includes('typescript') ||
      typeLower.includes('python')
    ) {
      return 'code-snippet'
    }
    if (typeLower.includes('text') || typeLower.includes('plain')) {
      return 'documentation'
    }

    return 'other'
  }

  private static extractTags(fileName: string, content?: string): string[] {
    const tags: Set<string> = new Set()

    // Extract from filename
    const nameParts = fileName.toLowerCase().split(/[._-]/)
    nameParts.forEach((part) => {
      if (part.length > 3 && !['test', 'file', 'doc', 'data'].includes(part)) {
        tags.add(part)
      }
    })

    // Extract from content keywords
    if (content) {
      const contentLower = content.toLowerCase()
      const keywords = [
        'authentication',
        'api',
        'database',
        'performance',
        'security',
        'accessibility',
        'testing',
        'deployment',
        'monitoring',
        'logging',
      ]

      keywords.forEach((keyword) => {
        if (contentLower.includes(keyword)) {
          tags.add(keyword)
        }
      })
    }

    return Array.from(tags).slice(0, 5)
  }

  private static suggestDestinations(type: InboxItemType, tags: string[]): string[] {
    const destinations: string[] = []

    switch (type) {
      case 'repository':
        destinations.push('Architecture Engine', 'Knowledge Graph', 'Verification Engine')
        break
      case 'bug-report':
        destinations.push('Verification Engine', 'Security Engine')
        break
      case 'rfc':
        destinations.push('Knowledge Genome', 'Architecture Engine')
        break
      case 'requirement':
        destinations.push('Workflow Builder', 'Knowledge Genome')
        break
      case 'architecture':
        destinations.push('Architecture Engine', 'Knowledge Graph')
        break
      case 'documentation':
        destinations.push('Knowledge Graph', 'Asset Library')
        break
      case 'design':
        destinations.push('Asset Library', 'Architecture Engine')
        break
      default:
        destinations.push('Knowledge Graph')
    }

    if (tags.includes('security')) {
      destinations.push('Security Engine')
    }
    if (tags.includes('api')) {
      destinations.push('Architecture Engine')
    }

    return Array.from(new Set(destinations))
  }

  private static generateSummary(
    fileName: string,
    type: InboxItemType,
    content?: string
  ): string {
    let summary = `${type.replace('-', ' ').toUpperCase()}: ${fileName}`

    if (content && content.length > 100) {
      summary += ` - ${content.substring(0, 100).trim()}...`
    }

    return summary
  }

  private static calculateConfidence(
    fileName: string,
    fileType: string,
    type: InboxItemType
  ): number {
    // Higher confidence if type can be clearly determined from file extension
    if (
      fileType.toLowerCase().includes('zip') ||
      fileType.toLowerCase().includes('pdf') ||
      fileType.toLowerCase().includes('image')
    ) {
      return 0.9
    }

    if (fileType.toLowerCase().includes('text')) {
      return 0.6
    }

    return 0.7
  }

  private static extractMetadata(fileName: string, content?: string): Record<string, any> {
    const metadata: Record<string, any> = {
      fileName,
      extension: fileName.split('.').pop(),
      dateAnalyzed: new Date().toISOString(),
    }

    if (content) {
      metadata.contentLength = content.length
      metadata.hasCode = /```|function|class|const |let |var /.test(content)
      metadata.hasLinks = /https?:\/\/|github\.com|gitlab\.com/.test(content)
    }

    return metadata
  }
}
