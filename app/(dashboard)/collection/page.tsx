'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getCollectionIdFromUrlOrStorage, buildUrlWithCollectionId } from '@/lib/utils/collection'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CollectionList } from '@/components/collection/CollectionList'
import { CollectionItemWithSet } from '@/types'
import { AddItemModal } from '@/components/collection/AddItemModal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ImportCollection } from '@/components/collection/ImportCollection'
import { ExportCollection } from '@/components/collection/ExportCollection'
import { CollectionSwitcher } from '@/components/collection/CollectionSwitcher'
import { ShareCollection } from '@/components/collection/ShareCollection'
import { useQuery } from '@tanstack/react-query'

export default function CollectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const collectionId = getCollectionIdFromUrlOrStorage(searchParams)
  const [editingItem, setEditingItem] = useState<CollectionItemWithSet | null>(null)
  const [retiredFilter, setRetiredFilter] = useState<'all' | 'retired' | 'active'>('all')

  // Sync collectionId from localStorage to URL if not present
  useEffect(() => {
    const urlCollectionId = searchParams.get('collectionId')
    if (!urlCollectionId && collectionId && typeof window !== 'undefined') {
      const params = new URLSearchParams(searchParams.toString())
      params.set('collectionId', collectionId)
      router.replace(`/collection?${params.toString()}`, { scroll: false })
    }
  }, [collectionId, searchParams, router])

  // Fetch current collection to get sharing status
  const { data: collections } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const res = await fetch('/api/collections')
      if (!res.ok) throw new Error('Failed to fetch collections')
      return res.json()
    },
  })

  const currentCollection = collections?.find((c: any) => c.id === collectionId) || collections?.[0]

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
            My Collection
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Manage your LEGO sets</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <CollectionSwitcher />
                <Button asChild>
                  <Link href={buildUrlWithCollectionId('/browse', collectionId)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Browse & Add Sets
                  </Link>
                </Button>
          <div className="flex items-center gap-1">
            {currentCollection && (
              <ShareCollection
                collectionId={currentCollection.id}
                collectionName={currentCollection.name}
                isPublic={currentCollection.is_public || false}
                shareToken={currentCollection.share_token || null}
              />
            )}
            <ExportCollection collectionId={collectionId} />
            <ImportCollection collectionId={collectionId} />
          </div>
        </div>
      </div>

      <div className="md:hidden flex flex-col gap-2">
        <div className="flex gap-2">
          <CollectionSwitcher />
          <div className="flex items-center gap-1 ml-auto">
            {currentCollection && (
              <ShareCollection
                collectionId={currentCollection.id}
                collectionName={currentCollection.name}
                isPublic={currentCollection.is_public || false}
                shareToken={currentCollection.share_token || null}
              />
            )}
            <ExportCollection collectionId={collectionId} />
            <ImportCollection collectionId={collectionId} />
          </div>
        </div>
              <Button asChild className="w-full">
                <Link href={buildUrlWithCollectionId('/browse', collectionId)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Browse & Add Sets
                </Link>
              </Button>
      </div>

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-950/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="text-lg md:text-xl">My Collection</CardTitle>
              <CardDescription className="text-xs md:text-sm">View and manage your LEGO sets</CardDescription>
            </div>
            <Select value={retiredFilter} onValueChange={(value: 'all' | 'retired' | 'active') => setRetiredFilter(value)}>
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sets</SelectItem>
                <SelectItem value="retired">⭐ Retired Only</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <CollectionList
            onEdit={(item) => {
              setEditingItem(item)
            }}
            retiredFilter={retiredFilter}
            collectionId={collectionId}
          />
        </CardContent>
      </Card>

      {editingItem && editingItem.sets && (
        <AddItemModal
          open={!!editingItem}
          onOpenChange={(open) => {
            if (!open) setEditingItem(null)
          }}
          set={editingItem.sets}
        />
      )}
    </div>
  )
}
