'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SetSearch } from '@/components/collection/SetSearch'
import { CollectionList } from '@/components/collection/CollectionList'
import { CollectionItemWithSet } from '@/types'
import { AddItemModal } from '@/components/collection/AddItemModal'

export default function CollectionPage() {
  const [editingItem, setEditingItem] = useState<CollectionItemWithSet | null>(null)
  const [searchTab, setSearchTab] = useState('search')
  const [retiredFilter, setRetiredFilter] = useState<'all' | 'retired' | 'active'>('all')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Collection</h1>
        <p className="text-muted-foreground">Manage your LEGO sets</p>
      </div>

      <Tabs value={searchTab} onValueChange={setSearchTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">Search & Add</TabsTrigger>
          <TabsTrigger value="collection">My Collection</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search for Sets</CardTitle>
              <CardDescription>
                Search by set number or name, then add to your collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SetSearch />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collection" className="space-y-4">
          <Card>
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
        </TabsContent>
      </Tabs>

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

