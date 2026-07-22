'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/features/inbox/file-uploader'
import { InboxQueue } from '@/components/features/inbox/inbox-queue'
import { Inbox, Upload } from 'lucide-react'

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'queue'>('upload')

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/8 px-6 py-4">
        <div className="flex items-center gap-3 mb-2">
          <Inbox className="w-5 h-5 text-accent-primary" />
          <h1 className="text-xl font-semibold">Engineering Inbox</h1>
        </div>
        <p className="text-sm text-neutral-400">
          Single intake point for repositories, files, PDFs, images, and more
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 px-6 py-4 border-b border-white/8">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'upload'
              ? 'bg-accent-primary/20 text-accent-primary'
              : 'text-neutral-400 hover:text-foreground hover:bg-neutral-800/30'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'queue'
              ? 'bg-accent-primary/20 text-accent-primary'
              : 'text-neutral-400 hover:text-foreground hover:bg-neutral-800/30'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Queue
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'upload' && (
          <div className="max-w-2xl">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Add Content</h2>
              <p className="text-sm text-neutral-400">
                Drag and drop files, or click to select. Supported formats: PDF, images, code files, archives, and more.
              </p>
            </div>
            <FileUploader onFileUploaded={() => setActiveTab('queue')} />
          </div>
        )}

        {activeTab === 'queue' && <InboxQueue />}
      </div>
    </div>
  )
}
