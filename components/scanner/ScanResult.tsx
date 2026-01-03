'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle, Package } from 'lucide-react'
import { Set } from '@/types'
import { AddItemModal } from '@/components/collection/AddItemModal'

interface ScanResultProps {
  gtin: string
  onReset: () => void
}

export function ScanResult({ gtin, onReset }: ScanResultProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSet, setSelectedSet] = useState<Set | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['scan-lookup', gtin],
    queryFn: async () => {
      const res = await fetch(`/api/scanLookup?gtin=${encodeURIComponent(gtin)}`)
      if (!res.ok) {
        if (res.status === 404) {
          return null
        }
        throw new Error('Failed to lookup barcode')
      }
      const data = await res.json()
      return data.set as Set
    },
    retry: false,
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Looking up barcode...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-12 text-center space-y-4">
          <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <div>
            <h3 className="font-semibold mb-2">Set Not Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We couldn't find a LEGO set matching barcode: {gtin}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              You can try searching for the set manually instead.
            </p>
            <Button onClick={onReset} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {data.image_url && (
              <div className="w-32 h-32 shrink-0 bg-muted rounded-lg overflow-hidden">
                <img
                  src={data.image_url}
                  alt={data.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide image if it fails to load
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold text-lg">{data.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Set #{data.set_number} • {data.theme || 'Unknown Theme'} • {data.year || 'Unknown Year'}
              </p>
              {data.piece_count && (
                <p className="text-sm text-muted-foreground mb-4">
                  {data.piece_count.toLocaleString()} pieces
                </p>
              )}
              <Button
                onClick={() => {
                  setSelectedSet(data)
                  setModalOpen(true)
                }}
              >
                <Package className="h-4 w-4 mr-2" />
                Add to Collection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {selectedSet && (
        <AddItemModal
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open)
            if (!open) {
              setSelectedSet(null)
            }
          }}
          set={selectedSet}
        />
      )}
    </>
  )
}


