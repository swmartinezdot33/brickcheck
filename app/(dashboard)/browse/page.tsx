'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Loader2, Package, ExternalLink } from 'lucide-react'
import { Set } from '@/types'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default function BrowsePage() {
  const [query, setQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['browse-sets', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return []
      const res = await fetch(`/api/searchSets?q=${encodeURIComponent(searchTerm)}`)
      if (!res.ok) throw new Error('Failed to search')
      const data = await res.json()
      return data.results as Set[]
    },
    enabled: searchTerm.length >= 2,
    staleTime: 30000,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(query)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
          Browse Sets
        </h1>
        <p className="text-muted-foreground">Search and explore LEGO sets, view details, and add to your collection</p>
      </div>

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-50/30 to-transparent dark:from-purple-950/20">
        <CardHeader>
          <CardTitle>Search LEGO Sets</CardTitle>
          <CardDescription>
            Search by set number, name, or theme. Click on any set to view full details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by set number, name, or theme (e.g., 75192, Millennium Falcon, Star Wars)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={query.length < 2}>
              Search
            </Button>
          </form>

          {query.length < 2 && (
            <p className="text-sm text-muted-foreground mt-4">
              Type at least 2 characters to search for sets
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
            <p className="text-red-500">Error searching sets. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && searchTerm && (!data || data.length === 0) && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No sets found for "{searchTerm}"</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try searching for: 75192, Millennium, Titanic, or Disney
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && data && data.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              {data.length} {data.length === 1 ? 'Set' : 'Sets'} Found
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((set) => (
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
                      <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white">
                        ⭐ Retired
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {set.image_url && (
                      <div className="aspect-square w-full bg-muted rounded-lg overflow-hidden mb-2">
                        <img
                          src={set.image_url}
                          alt={set.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {set.piece_count && (
                      <p className="text-sm text-muted-foreground">
                        {set.piece_count.toLocaleString()} pieces
                      </p>
                    )}
                    {set.msrp_cents && (
                      <p className="text-sm font-medium">
                        MSRP: {formatCurrency(set.msrp_cents)}
                      </p>
                    )}
                    <Link href={`/browse/${set.id}`}>
                      <Button className="w-full" variant="default">
                        View Details
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

