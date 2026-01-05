'use client'

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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
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
    <div className="space-y-4">
      {filteredData.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              {/* Thumbnail Image - Clickable */}
              {item.sets?.id && (
                <Link href={`/set/${item.sets.id}`} className="flex-shrink-0 hover:opacity-75 transition-opacity">
                  {item.sets?.image_url ? (
                    <img
                      src={item.sets.image_url}
                      alt={item.sets.name || 'Set image'}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border-2 border-primary/10 cursor-pointer"
                      onError={(e) => {
                        // Hide image if it fails to load
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-muted flex items-center justify-center border-2 border-primary/10 cursor-pointer">
                      <Package className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                    </div>
                  )}
                </Link>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-semibold text-lg">
                    {item.sets?.name || 'Unknown Set'}
                  </h3>
                  {item.sets?.retired && (
                    <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white">
                      ⭐ Retired
                    </Badge>
                  )}
                  <Badge variant={item.condition === 'SEALED' ? 'default' : 'secondary'}>
                    {item.condition}
                  </Badge>
                  {item.condition_grade && (
                    <Badge variant="outline">{item.condition_grade}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Set #{item.sets?.set_number} • {item.sets?.theme || 'Unknown Theme'} •{' '}
                  {item.sets?.year || 'Unknown Year'}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span>Quantity: {item.quantity}</span>
                  {item.acquisition_cost_cents && (
                    <span>
                      Cost: {formatCurrency(item.acquisition_cost_cents * item.quantity)}
                    </span>
                  )}
                  {item.acquisition_date && (
                    <span>Acquired: {new Date(item.acquisition_date).toLocaleDateString()}</span>
                  )}
                </div>
                {item.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>
                )}
              </div>
              <div className="flex gap-1">
                {/* View Details Button */}
                {item.sets?.id && (
                  <Button variant="ghost" size="sm" asChild title="View set details">
                    <Link href={`/set/${item.sets.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                
                {/* Edit Button */}
                {onEdit && (
                  <Button variant="ghost" size="sm" onClick={() => onEdit(item)} title="Edit item">
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                
                {/* Delete Button */}
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
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
