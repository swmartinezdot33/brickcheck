'use client'

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Package, Eye } from 'lucide-react'
import { CollectionItemWithSet } from '@/types'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface CollectionListProps {
  onEdit?: (item: CollectionItemWithSet) => void
  retiredFilter?: 'all' | 'retired' | 'active'
  collectionId?: string | null
}

export function CollectionList({ onEdit, retiredFilter = 'all', collectionId }: CollectionListProps) {
  const queryClient = useQueryClient()
  const [failedImages, setFailedImages] = React.useState<Set<string>>(new Set())

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: async () => {
      const url = collectionId 
        ? `/api/collection?collectionId=${collectionId}`
        : '/api/collection'
      const res = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      if (!res.ok) throw new Error('Failed to fetch collection')
      const data = await res.json()
      return data.items as CollectionItemWithSet[]
    },
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/collection/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete item')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] })
      queryClient.invalidateQueries({ queryKey: ['collection-stats'] })
    },
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No items in your collection yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Search for sets or scan a barcode to get started
          </p>
        </CardContent>
      </Card>
    )
  }

  // Filter by retired status
  const filteredData = data.filter((item) => {
    if (retiredFilter === 'retired') {
      return item.sets?.retired === true
    }
    if (retiredFilter === 'active') {
      return item.sets?.retired !== true
    }
    return true // 'all'
  })

  if (filteredData.length === 0 && data.length > 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No {retiredFilter === 'retired' ? 'retired' : 'active'} sets found
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Try changing the filter to see other sets
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredData.map((item) => (
        <Card key={item.id} className="group hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex flex-col h-full">
            {/* Image - Clickable Square */}
            {item.sets?.id && (
              <Link href={`/set/${item.sets.id}`} className="mb-4">
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden border border-primary/10 group-hover:border-primary/30 transition-colors flex items-center justify-center">
                  {item.sets?.image_url && !failedImages.has(item.sets.image_url) ? (
                    <img
                      src={item.sets.image_url}
                      alt={item.sets.name || 'Set image'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={() => {
                        if (item.sets?.image_url) {
                          setFailedImages(prev => new Set(prev).add(item.sets!.image_url!))
                        }
                      }}
                    />
                  ) : (
                    <Package className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
              </Link>
            )}
            
            {/* Content */}
            <div className="flex-1 flex flex-col min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                {item.sets?.name || 'Unknown Set'}
              </h3>
              
              {/* Badges */}
              <div className="flex gap-1 flex-wrap mb-3">
                {item.sets?.retired && (
                  <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
                    Retired
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
                #{item.sets?.set_number} • {item.sets?.theme}
              </p>
              
              {/* Quantity & Cost */}
              <div className="text-xs text-muted-foreground space-y-1 mb-4">
                <div>Qty: {item.quantity}</div>
                {item.acquisition_cost_cents && (
                  <div className="font-semibold text-foreground">
                    {formatCurrency(item.acquisition_cost_cents * item.quantity)}
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-1 mt-auto">
                {item.sets?.id && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild 
                    className="flex-1"
                    title="View set details"
                  >
                    <Link href={`/set/${item.sets.id}`}>
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">View</span>
                    </Link>
                  </Button>
                )}
                
                {onEdit && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEdit(item)}
                    className="flex-1"
                    title="Edit item"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Edit</span>
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to remove this item from your collection?')) {
                      deleteMutation.mutate(item.id)
                    }
                  }}
                  title="Delete item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
