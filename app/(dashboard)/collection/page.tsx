'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CollectionList } from '@/components/collection/CollectionList'
import { CollectionItemWithSet } from '@/types'
import { AddItemModal } from '@/components/collection/AddItemModal'
import { Button } from '@/components/ui/button'
import { Plus, Download } from 'lucide-react'
import Link from 'next/link'
import { ImportCollection } from '@/components/collection/ImportCollection'

export default function CollectionPage() {
  const [editingItem, setEditingItem] = useState<CollectionItemWithSet | null>(null)
  const [retiredFilter, setRetiredFilter] = useState<'all' | 'retired' | 'active'>('all')

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
          <Button asChild>
            <Link href="/browse">
              <Plus className="h-4 w-4 mr-2" />
              Browse & Add Sets
            </Link>
          </Button>
          <Button variant="outline" size="sm" title="Import Collection">
            <ImportCollection />
          </Button>
        </div>
      </div>

      <div className="md:hidden flex gap-2">
        <Button asChild className="flex-1">
          <Link href="/browse">
            <Plus className="h-4 w-4 mr-2" />
            Browse & Add Sets
          </Link>
        </Button>
        <Button variant="outline" size="sm" title="Import Collection">
          <ImportCollection />
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
