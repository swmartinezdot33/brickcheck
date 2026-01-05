'use client'

import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Loader2, Package, ExternalLink, Plus, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import { Set } from '@/types'
import Link from 'next/link'
import { SetImage } from '@/components/ui/SetImage'
import { formatCurrency } from '@/lib/utils'
import { AddItemModal } from '@/components/collection/AddItemModal'

export default function BrowsePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [selectedSet, setSelectedSet] = useState<Set | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('perPage') || '25', 10))
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const [retiredFilter, setRetiredFilter] = useState<'all' | 'active' | 'retired'>((searchParams.get('filter') as 'all' | 'active' | 'retired') || 'all')

  // Sync collectionId from localStorage to URL if not present
  useEffect(() => {
    const urlCollectionId = searchParams.get('collectionId')
    if (!urlCollectionId && typeof window !== 'undefined') {
      try {
        const storedCollectionId = localStorage.getItem('brickcheck_selected_collection_id')
        if (storedCollectionId) {
          const params = new URLSearchParams(searchParams.toString())
          params.set('collectionId', storedCollectionId)
          router.replace(`/browse?${params.toString()}`, { scroll: false })
        }
      } catch (error) {
        // Ignore localStorage errors
      }
    }
  }, [searchParams, router])

  // Update URL when search state changes (debounced to avoid too many updates)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    // Preserve collectionId if it exists
    if (query) params.set('q', query)
    else params.delete('q')
    if (itemsPerPage !== 25) params.set('perPage', itemsPerPage.toString())
    else params.delete('perPage')
    if (currentPage !== 1) params.set('page', currentPage.toString())
    else params.delete('page')
    if (retiredFilter !== 'all') params.set('filter', retiredFilter)
    else params.delete('filter')
    
    const newQueryString = params.toString()
    const currentQueryString = searchParams.toString()
    
    // Only update if query string actually changed
    if (newQueryString !== currentQueryString) {
      const newUrl = newQueryString ? `/browse?${newQueryString}` : '/browse'
      router.replace(newUrl, { scroll: false })
    }
  }, [query, itemsPerPage, currentPage, retiredFilter, router, searchParams])

  // Real-time search as user types (debounced by React Query)
  const { data, isLoading, error } = useQuery({
    queryKey: ['browse-sets', query],
    queryFn: async () => {
      if (!query || query.length < 2) return []
      const res = await fetch(`/api/searchSets?q=${encodeURIComponent(query)}`)
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to search')
      }
      const data = await res.json()
      return data.results as Set[]
    },
    enabled: query.length >= 2,
    staleTime: 30000,
  })

  const handleAddToCollection = (set: Set) => {
    setSelectedSet(set)
    setAddModalOpen(true)
  }

  const handleAddSuccess = () => {
    setAddModalOpen(false)
    setSelectedSet(null)
  }

  // Filter by retired status
  const filteredData = useMemo(() => {
    if (!data) return []
    
    return data.filter((set) => {
      if (retiredFilter === 'retired') return set.retired === true
      if (retiredFilter === 'active') return set.retired !== true
      return true // 'all'
    })
  }, [data, retiredFilter])

  // Calculate pagination
  const paginatedData = useMemo(() => {
    if (!filteredData) return { items: [], total: 0, totalPages: 0, start: 0, end: 0 }

    const total = filteredData.length
    const itemsToShow = itemsPerPage === -1 ? total : itemsPerPage
    const totalPages = Math.ceil(total / itemsToShow)
    const start = (currentPage - 1) * itemsToShow
    const end = Math.min(start + itemsToShow, total)

    return {
      items: filteredData.slice(start, end),
      total,
      totalPages,
      start,
      end,
    }
  }, [filteredData, itemsPerPage, currentPage])

  // Reset to page 1 when items per page changes
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1)
  }

  // Reset to page 1 when filter changes
  const handleRetiredFilterChange = (value: 'all' | 'active' | 'retired') => {
    setRetiredFilter(value)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
          Browse & Search Sets
        </h1>
        <p className="text-muted-foreground">Search for LEGO sets, browse results, and add them to your collection</p>
      </div>

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-50/30 to-transparent dark:from-purple-950/20">
        <CardHeader>
          <CardTitle>Search LEGO Sets</CardTitle>
          <CardDescription>
            Search by set number, name, or theme. Results appear as you type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by set number, name, or theme (e.g., 75192, Millennium Falcon, Star Wars)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {query.length > 0 && query.length < 2 && (
            <p className="text-sm text-muted-foreground mt-4">
              Type at least 2 characters to search for sets
            </p>
          )}

          {query.length === 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Start typing to search for LEGO sets. Try: 75192, Millennium, Titanic, or Disney
            </p>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-red-500 mb-2">Error searching sets</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <p className="text-sm text-muted-foreground mt-2">Please try again or check your connection</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && query.length >= 2 && (!filteredData || filteredData.length === 0) && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No sets found for "{query}"</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try searching for: 75192, Millennium, Titanic, or Disney
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && data && data.length > 0 && (
        <div>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-2xl font-semibold">
                <span className="text-gradient-lego">{paginatedData.total.toLocaleString()}</span> {paginatedData.total === 1 ? 'Set' : 'Sets'} Found
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Retired/Active Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Select value={retiredFilter} onValueChange={(value: any) => handleRetiredFilterChange(value)}>
                    <SelectTrigger className="w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Results Per Page */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Per page:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="-1">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Results info and pagination controls */}
            <div className="flex items-center justify-between gap-4 flex-wrap bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Showing {paginatedData.total === 0 ? 0 : paginatedData.start + 1}–{paginatedData.end} of {paginatedData.total.toLocaleString()} sets
              </p>
              
              {paginatedData.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Page</span>
                    <span className="text-sm font-semibold">{currentPage}</span>
                    <span className="text-sm text-muted-foreground">of {paginatedData.totalPages}</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(paginatedData.totalPages, p + 1))}
                    disabled={currentPage === paginatedData.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedData.items.map((set) => (
              <Card key={set.id || set.set_number} className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">{set.name}</CardTitle>
                      <CardDescription>
                        #{set.set_number} {set.theme && `• ${set.theme}`} {set.year && `• ${set.year}`}
                      </CardDescription>
                    </div>
                    {set.retired && (
                      <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white shrink-0">
                        ⭐ Retired
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="aspect-square w-full bg-muted rounded-lg overflow-hidden mb-2">
                      <SetImage
                        src={set.image_url}
                        alt={set.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {set.piece_count != null && Number(set.piece_count) > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {Number(set.piece_count).toLocaleString()} pieces
                      </p>
                    )}
                    {set.msrp_cents && (
                      <p className="text-sm font-medium">
                        MSRP: {formatCurrency(set.msrp_cents)}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        variant="default"
                        onClick={() => handleAddToCollection(set)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Collection
                      </Button>
                      <Button className="flex-1" variant="outline" asChild>
                        <Link href={`/browse/${set.id || set.set_number}?${searchParams.toString()}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom pagination controls */}
          {paginatedData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="text-sm text-muted-foreground mx-4">
                Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{paginatedData.totalPages}</span>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(paginatedData.totalPages, p + 1))}
                disabled={currentPage === paginatedData.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}

      {selectedSet && (
        <AddItemModal
          open={addModalOpen}
          onOpenChange={(open) => {
            setAddModalOpen(open)
            if (!open) {
              setSelectedSet(null)
            }
          }}
          set={selectedSet}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  )
}
