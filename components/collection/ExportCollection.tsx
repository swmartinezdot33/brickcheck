'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'

interface ExportCollectionProps {
  collectionId?: string | null
}

export function ExportCollection({ collectionId }: ExportCollectionProps) {
  const [open, setOpen] = useState(false)
  const [exported, setExported] = useState(false)

  // Fetch collection data
  const { data: collectionData, isLoading: isLoadingData } = useQuery({
    queryKey: ['collection-export', collectionId],
    queryFn: async () => {
      const url = collectionId 
        ? `/api/collection?collectionId=${collectionId}`
        : '/api/collection'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch collection')
      return res.json()
    },
    enabled: open,
  })

  const exportMutation = useMutation({
    mutationFn: async (format: 'json' | 'csv') => {
      if (!collectionData?.items) {
        throw new Error('No collection data to export')
      }

      let content: string
      let filename: string

      if (format === 'json') {
        content = JSON.stringify(collectionData.items, null, 2)
        filename = `lego-collection-${new Date().toISOString().split('T')[0]}.json`
      } else {
        // CSV format
        const headers = ['Set Number', 'Set Name', 'Condition', 'Quantity', 'Cost', 'Acquired Date']
        const rows = collectionData.items.map((item: any) => [
          item.sets?.set_number || '',
          item.sets?.name || '',
          item.condition || '',
          item.quantity || 1,
          item.cost_cents ? (item.cost_cents / 100).toFixed(2) : '',
          item.acquired_date || '',
        ])
        const csvContent = [
          headers.join(','),
          ...rows.map((row: string[]) =>
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
          ),
        ].join('\n')
        content = csvContent
        filename = `lego-collection-${new Date().toISOString().split('T')[0]}.csv`
      }

      // Create blob and download
      const blob = new Blob([content], {
        type: format === 'json' ? 'application/json' : 'text/csv',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return { success: true, filename }
    },
    onSuccess: () => {
      setExported(true)
      setTimeout(() => {
        setOpen(false)
        setExported(false)
      }, 2000)
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Export Collection">
          <Download className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Collection</DialogTitle>
          <DialogDescription>
            Download your collection in JSON or CSV format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : exported ? (
            <Card className="border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20">
              <CardContent className="pt-6">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ Collection exported successfully! Check your downloads folder.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => exportMutation.mutate('json')}
                  disabled={exportMutation.isPending}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2"
                >
                  {exportMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="h-5 w-5" />
                  )}
                  <span className="text-xs">JSON Format</span>
                </Button>
                <Button
                  onClick={() => exportMutation.mutate('csv')}
                  disabled={exportMutation.isPending}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2"
                >
                  {exportMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="h-5 w-5" />
                  )}
                  <span className="text-xs">CSV Format</span>
                </Button>
              </div>

              {exportMutation.isError && (
                <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20">
                  <CardContent className="pt-6">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      ✕ {exportMutation.error instanceof Error
                        ? exportMutation.error.message
                        : 'Failed to export collection'}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <strong>JSON:</strong> Full collection data with all details, compatible with future imports
                </p>
                <p>
                  <strong>CSV:</strong> Spreadsheet format, easy to edit in Excel or Google Sheets
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

