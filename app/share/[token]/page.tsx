'use client'

import { Suspense, use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Loader2, Share2 } from 'lucide-react'
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
  }
  items: SharedCollectionItem[]
  itemCount: number
}

function ShareCollectionContent({ token }: { token: string }) {

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
            <span>Shared collection</span>
          </div>
        </div>

        {/* Collection Items */}
        {data.items.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">This collection is empty</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {data.items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail Image */}
                    {item.sets?.image_url ? (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 border-primary/10">
                        <Image
                          src={item.sets.image_url}
                          alt={item.sets.name || 'Set image'}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-muted flex items-center justify-center border-2 border-primary/10 flex-shrink-0">
                        <Package className="h-10 w-10 text-muted-foreground" />
                      </div>
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
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Quantity: {item.quantity}</span>
                        {item.sets?.piece_count && (
                          <span>{item.sets.piece_count.toLocaleString()} pieces</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
  )
}

export default function ShareCollectionPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading collection...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <ShareCollectionContent token={token} />
    </Suspense>
  )
}

