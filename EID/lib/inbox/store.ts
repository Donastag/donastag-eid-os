import { InboxItem, InboxItemStatus, InboxItemType, InboxFilter } from './types'

const STORAGE_KEY = 'donastag_inbox_items'

export class InboxStore {
  private static items: InboxItem[] = []
  private static initialized = false

  static initialize() {
    if (this.initialized) return
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.items = JSON.parse(stored).map((item: any) => ({
          ...item,
          uploadedAt: new Date(item.uploadedAt),
          analyzedAt: item.analyzedAt ? new Date(item.analyzedAt) : undefined,
        }))
      }
    }
    this.initialized = true
  }

  static addItem(item: InboxItem) {
    this.items.unshift(item)
    this.save()
    return item
  }

  static updateItem(id: string, updates: Partial<InboxItem>) {
    const index = this.items.findIndex((i) => i.id === id)
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...updates }
      this.save()
      return this.items[index]
    }
    return null
  }

  static getItem(id: string) {
    return this.items.find((i) => i.id === id)
  }

  static getItems(filter?: InboxFilter) {
    let filtered = [...this.items]

    if (filter?.status) {
      filtered = filtered.filter((i) => i.status === filter.status)
    }
    if (filter?.type) {
      filtered = filtered.filter((i) => i.type === filter.type)
    }
    if (filter?.searchQuery) {
      const query = filter.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(query) ||
          i.description.toLowerCase().includes(query) ||
          i.tags.some((t) => t.toLowerCase().includes(query))
      )
    }

    return filtered
  }

  static getAllItems() {
    return [...this.items]
  }

  static deleteItem(id: string) {
    this.items = this.items.filter((i) => i.id !== id)
    this.save()
  }

  static getStats() {
    return {
      total: this.items.length,
      byStatus: {
        queued: this.items.filter((i) => i.status === 'queued').length,
        analyzing: this.items.filter((i) => i.status === 'analyzing').length,
        classified: this.items.filter((i) => i.status === 'classified').length,
        routed: this.items.filter((i) => i.status === 'routed').length,
        completed: this.items.filter((i) => i.status === 'completed').length,
        failed: this.items.filter((i) => i.status === 'failed').length,
      },
      byType: {
        repository: this.items.filter((i) => i.type === 'repository').length,
        bugReport: this.items.filter((i) => i.type === 'bug-report').length,
        rfc: this.items.filter((i) => i.type === 'rfc').length,
        requirement: this.items.filter((i) => i.type === 'requirement').length,
        documentation: this.items.filter((i) => i.type === 'documentation').length,
        architecture: this.items.filter((i) => i.type === 'architecture').length,
      },
    }
  }

  private static save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
    }
  }
}
