'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CollectionList } from '@/components/collection/CollectionList'
import { CollectionItemWithSet } from '@/types'
import { AddItemModal } from '@/components/collection/AddItemModal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function CollectionPage() {
  const [editingItem, setEditingItem] = useState<CollectionItemWithSet | null>(null)
  const [retiredFilter, setRetiredFilter] = useState<'all' | 'retired' | 'active'>('all')

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
            My Collection
          </h1>
          <p className="text-muted-foreground">Manage your LEGO sets</p>
        </div>
        <Button asChild>
          <Link href="/browse">
            <Plus className="h-4 w-4 mr-2" />
            Browse & Add Sets
          </Link>
        </Button>
      </div>

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Collection</CardTitle>
              <CardDescription>View and manage your LEGO sets</CardDescription>
            </div>
            <Select value={retiredFilter} onValueChange={(value: 'all' | 'retired' | 'active') => setRetiredFilter(value)}>
              <SelectTrigger className="w-[140px]">
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
