'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Package, Loader2, Share2, ZoomIn } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface SharedCollectionItem {
  id: string
  collection_id: string
  set_id: string
  condition: 'SEALED' | 'USED'
  condition_grade: string | null
  quantity: number
  created_at: string
  updated_at: string
  sets: {
    id: string
    set_number: string
    name: string
    theme: string | null
    year: number | null
    piece_count: number | null
    msrp_cents: number | null
    image_url: string | null
    retired: boolean
  } | null
}

interface SharedCollection {
  collection: {
    id: string
    name: string
    description: string | null
    created_at: string
    updated_at: string
    owner_display_name: string | null
  }
  items: SharedCollectionItem[]
  itemCount: number
}

export default function ShareCollectionContent({ token }: { token: string }) {
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const { data, isLoading, error } = useQuery<SharedCollection>({
    queryKey: ['shared-collection', token],
    queryFn: async () => {
      const res = await fetch(`/api/share/${token}`)
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Collection not found or not shared')
        }
        throw new Error('Failed to fetch collection')
      }
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading collection...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Collection Not Found</h1>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'This collection is not available or has been removed.'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              The link may be invalid or the collection may no longer be shared.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
                  {data.collection.name}
                </h1>
                {data.collection.description && (
                  <p className="text-muted-foreground text-lg">{data.collection.description}</p>
                )}
              </div>
              <Link
                href="/"
                className="text-sm text-primary hover:underline flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                BrickCheck
              </Link>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{data.itemCount} {data.itemCount === 1 ? 'set' : 'sets'}</span>
              <span>•</span>
              {data.collection.owner_display_name ? (
                <>
                  <span>Collection by {data.collection.owner_display_name}</span>
                  <span>•</span>
                </>
              ) : null}
              <span>Shared collection</span>
            </div>
          </div>

          {/* Collection Items - 4x4 Grid */}
          {data.items.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">This collection is empty</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.items.map((item) => {
                const hasImage = item.sets?.image_url && !failedImages.has(item.sets.image_url)
                
                return (
                  <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 flex flex-col h-full">
                      {/* Image - Clickable for enlargement */}
                      <div className="mb-4 relative">
                        {hasImage ? (
                          <button
                            onClick={() => setSelectedImage({
                              url: item.sets!.image_url!,
                              alt: item.sets!.name || 'Set image'
                            })}
                            className="relative aspect-square bg-muted rounded-lg overflow-hidden border border-primary/10 group-hover:border-primary/30 transition-colors flex items-center justify-center w-full cursor-pointer"
                          >
                            <img
                              src={item.sets!.image_url!}
                              alt={item.sets!.name || 'Set image'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={() => {
                                if (item.sets?.image_url) {
                                  setFailedImages(prev => new Set(prev).add(item.sets!.image_url!))
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ) : (
                          <div className="aspect-square bg-muted rounded-lg overflow-hidden border border-primary/10 flex items-center justify-center">
                            <Package className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                          {item.sets?.name || 'Unknown Set'}
                        </h3>
                        
                        {/* Badges */}
                        <div className="flex gap-1 flex-wrap mb-3">
                          {item.sets?.retired ? (
                            <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
                              ⭐ Retired
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                              Active
                            </Badge>
                          )}
                          <Badge variant={item.condition === 'SEALED' ? 'default' : 'secondary'} className="text-xs">
                            {item.condition}
                          </Badge>
                          {item.condition_grade && (
                            <Badge variant="outline" className="text-xs">{item.condition_grade}</Badge>
                          )}
                        </div>
                        
                        {/* Set Info */}
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          #{item.sets?.set_number} • {item.sets?.theme || 'Unknown Theme'}
                        </p>
                        
                        {/* Quantity & Pieces */}
                        <div className="text-xs text-muted-foreground space-y-1 mt-auto">
                          <div>Qty: {item.quantity}</div>
                          {item.sets?.piece_count && (
                            <div>{item.sets.piece_count.toLocaleString()} pieces</div>
                          )}
                          {item.sets?.year && (
                            <div>Year: {item.sets.year}</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>
              This is a shared collection from{' '}
              <Link href="/" className="text-primary hover:underline">
                BrickCheck
              </Link>
              {' '}— Track your LEGO collection value like stocks
            </p>
          </div>
        </div>
      </div>

      {/* Image Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-[95vw] p-0">
          {selectedImage && (
            <div className="relative aspect-square w-full max-h-[90vh] bg-muted flex items-center justify-center">
              <img
                src={selectedImage.url}
                alt={selectedImage.alt}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
