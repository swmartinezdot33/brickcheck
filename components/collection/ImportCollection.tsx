'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Upload, FileText, ExternalLink, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface ImportCollectionProps {
  collectionId?: string | null
}

export function ImportCollection({ collectionId }: ImportCollectionProps) {
  const [open, setOpen] = useState(false)
  const [importType, setImportType] = useState<'rebrickable' | 'lugnet' | 'csv' | null>(null)
  const [rebrickableUsername, setRebrickableUsername] = useState('')
  const [lugnetData, setLugnetData] = useState('')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const queryClient = useQueryClient()

  const importMutation = useMutation({
    mutationFn: async (data: { type: string; payload: any }) => {
      const formData = new FormData()
      formData.append('type', data.type)
      
      if (data.type === 'csv' && data.payload instanceof File) {
        formData.append('file', data.payload)
        if (collectionId) formData.append('collectionId', collectionId)
      } else {
        formData.append('payload', JSON.stringify(data.payload))
        if (collectionId) formData.append('collectionId', collectionId)
      }

      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      try {
        const res = await fetch('/api/collection/import', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || `Import failed: ${res.status} ${res.statusText}`)
        }

        return res.json()
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Import took too long and was cancelled. Try importing fewer sets at once.')
        }
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] })
      queryClient.invalidateQueries({ queryKey: ['collection-stats'] })
      setOpen(false)
      setImportType(null)
      setRebrickableUsername('')
      setLugnetData('')
      setCsvFile(null)
    },
  })

  const handleRebrickableImport = () => {
    if (!rebrickableUsername.trim()) {
      return
    }
    importMutation.mutate({
      type: 'rebrickable',
      payload: { username: rebrickableUsername.trim() },
    })
  }

  const handleLugnetImport = () => {
    if (!lugnetData.trim()) {
      return
    }
    importMutation.mutate({
      type: 'lugnet',
      payload: { data: lugnetData.trim() },
    })
  }

  const handleCsvImport = () => {
    if (!csvFile) {
      return
    }
    importMutation.mutate({
      type: 'csv',
      payload: csvFile,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Invalid file type', {
          description: 'Please select a CSV file'
        })
        return
      }
      setCsvFile(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import Collection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Your Collection</DialogTitle>
          <DialogDescription>
            Import your LEGO collection from Rebrickable, Lugnet, or a CSV file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Import Type Selection */}
          {!importType && (
            <div className="grid gap-4">
              {/* Rebrickable Option */}
              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setImportType('rebrickable')}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Import from Rebrickable</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your Rebrickable username to import your collection
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Lugnet Option */}
              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setImportType('lugnet')}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Import from Lugnet</h3>
                    <p className="text-sm text-muted-foreground">
                      Paste your Lugnet collection data
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* CSV Option */}
              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setImportType('csv')}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Import from CSV File</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload a CSV file with your collection data
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Rebrickable Import Form */}
          {importType === 'rebrickable' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImportType(null)}
                >
                  ← Back
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rebrickable-username">Rebrickable Username</Label>
                <Input
                  id="rebrickable-username"
                  placeholder="Enter your Rebrickable username"
                  value={rebrickableUsername}
                  onChange={(e) => setRebrickableUsername(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  We'll fetch your collection from Rebrickable using your username
                </p>
              </div>
              <Button
                onClick={handleRebrickableImport}
                disabled={!rebrickableUsername.trim() || importMutation.isPending}
                className="w-full"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import from Rebrickable'
                )}
              </Button>
            </div>
          )}

          {/* Lugnet Import Form */}
          {importType === 'lugnet' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImportType(null)}
                >
                  ← Back
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lugnet-data">Lugnet Collection Data</Label>
                <textarea
                  id="lugnet-data"
                  className="w-full min-h-[200px] px-3 py-2 border rounded-md resize-y"
                  placeholder="Paste your Lugnet collection data here..."
                  value={lugnetData}
                  onChange={(e) => setLugnetData(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Paste your collection data exported from Lugnet
                </p>
              </div>
              <Button
                onClick={handleLugnetImport}
                disabled={!lugnetData.trim() || importMutation.isPending}
                className="w-full"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import from Lugnet'
                )}
              </Button>
            </div>
          )}

          {/* CSV Import Form */}
          {importType === 'csv' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImportType(null)}
                >
                  ← Back
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="csv-file">CSV File</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {csvFile && (
                    <span className="text-sm text-muted-foreground">{csvFile.name}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload a CSV file with columns: set_number (or product_number, set_id, id, sku, code), quantity (optional), condition (optional)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="mt-2"
                >
                  <a
                    href="/api/collection/import/template"
                    download="collection-template.csv"
                  >
                    Download CSV Template
                  </a>
                </Button>
              </div>
              <Button
                onClick={handleCsvImport}
                disabled={!csvFile || importMutation.isPending}
                className="w-full"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import from CSV'
                )}
              </Button>
            </div>
          )}

          {/* Error Message */}
          {importMutation.isError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Import failed</p>
                <p className="text-sm">
                  {importMutation.error instanceof Error
                    ? importMutation.error.message
                    : 'An error occurred during import'}
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {importMutation.isSuccess && (
            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Import complete!</p>
                <p className="text-sm">
                  {importMutation.data?.importedCount || 0} new sets added
                  {importMutation.data?.skippedCount > 0 && ` • ${importMutation.data.skippedCount} skipped (already exists)`}
                  {importMutation.data?.errorCount > 0 && ` • ${importMutation.data.errorCount} not found`}
                </p>
                {importMutation.data?.message && (
                  <p className="text-xs mt-1 opacity-75">{importMutation.data.message}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
