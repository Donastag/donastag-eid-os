'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileUp, AlertCircle } from 'lucide-react'
import { InboxStore } from '@/lib/inbox/store'
import { ContentAnalyzer } from '@/lib/inbox/analyzer'

interface FileUploaderProps {
  onFileUploaded?: (fileId: string) => void
}

export function FileUploader({ onFileUploaded }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptedTypes = [
    '.pdf',
    '.txt',
    '.md',
    '.json',
    '.js',
    '.ts',
    '.tsx',
    '.jsx',
    '.py',
    '.zip',
    '.tar',
    '.gz',
    'image/*',
    'video/*',
  ]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    await processFiles(files)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    await processFiles(files)
  }

  const processFiles = async (files: File[]) => {
    setError(null)
    setIsProcessing(true)

    try {
      for (const file of files) {
        const reader = new FileReader()

        reader.onload = async () => {
          try {
            const content =
              typeof reader.result === 'string' ? reader.result : undefined
            const fileId = `inbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            // Analyze content
            const analysis = await ContentAnalyzer.analyzeFile(
              file.name,
              file.type,
              content
            )

            // Create inbox item
            const item = {
              id: fileId,
              type: analysis.type,
              status: 'classified' as const,
              title: analysis.summary,
              description: file.name,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              uploadedAt: new Date(),
              analyzedAt: new Date(),
              content,
              metadata: analysis.extractedMetadata,
              confidence: analysis.confidence,
              routedTo: analysis.routingDestinations,
              tags: analysis.suggestedTags,
            }

            InboxStore.addItem(item)
            onFileUploaded?.(fileId)
          } catch (err) {
            console.error('Error processing file:', err)
            setError(`Failed to process ${file.name}`)
          }
        }

        reader.onerror = () => {
          setError(`Failed to read ${file.name}`)
        }

        reader.readAsText(file)
      }
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto hover:opacity-80 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
          isDragging
            ? 'border-accent-primary bg-accent-primary/5'
            : 'border-white/10 hover:border-white/20 bg-neutral-900/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center justify-center gap-4">
          <div
            className={`p-3 rounded-lg transition-colors ${
              isDragging
                ? 'bg-accent-primary/20'
                : 'bg-neutral-800/50'
            }`}
          >
            <Upload className={`w-6 h-6 transition-colors ${
              isDragging ? 'text-accent-primary' : 'text-neutral-400'
            }`} />
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {isProcessing ? 'Processing files...' : 'Drag files here or click to select'}
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Support: Code, PDFs, Images, Videos, ZIP archives
            </p>
          </div>

          {!isProcessing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <FileUp className="w-4 h-4 inline mr-2" />
              Select Files
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
