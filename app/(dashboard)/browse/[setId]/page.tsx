'use client'

import { use, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCollectionIdFromUrlOrStorage, buildUrlWithCollectionId } from '@/lib/utils/collection'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PriceChart } from '@/components/pricing/PriceChart'
import { RecentSales } from '@/components/pricing/RecentSales'
import { PriceForecastCard } from '@/components/pricing/PriceForecastCard'
import { AddItemModal } from '@/components/collection/AddItemModal'
import { formatCurrency } from '@/lib/utils'
import { Loader2, TrendingUp, TrendingDown, ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { SetImage } from '@/components/ui/SetImage'

export default function BrowseSetDetailPage({
  params,
}: {
  params: Promise<{ setId: string }>
}) {
  const { setId } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const collectionId = getCollectionIdFromUrlOrStorage(searchParams)

  // Sync collectionId from localStorage to URL if not present
  useEffect(() => {
    const urlCollectionId = searchParams.get('collectionId')
    if (!urlCollectionId && collectionId && typeof window !== 'undefined') {
      const params = new URLSearchParams(searchParams.toString())
      params.set('collectionId', collectionId)
      router.replace(`/browse/${setId}?${params.toString()}`, { scroll: false })
    }
  }, [collectionId, searchParams, router, setId])

  // Build back URL with search params and collectionId
  const backUrl = buildUrlWithCollectionId('/browse', collectionId, searchParams)

  const { data, isLoading, error } = useQuery({
    queryKey: ['set-detail', setId],
    queryFn: async () => {
      const res = await fetch(`/api/set/${setId}`)
      if (!res.ok) throw new Error('Failed to fetch set details')
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-red-500 mb-4">Failed to load set details</p>
          <Button variant="outline" asChild>
            <Link href={backUrl}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Browse
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { set, pricing } = data

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" className="mb-4" asChild>
          <Link href={backUrl}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">{set.name}</h1>
              {set.retired && <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white">⭐ Retired</Badge>}
            </div>
            <p className="text-muted-foreground">
              Set #{set.set_number} • {set.theme || 'Unknown Theme'} • {set.year || 'Unknown Year'}
            </p>
            {set.piece_count != null && Number(set.piece_count) > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {Number(set.piece_count).toLocaleString()} pieces
              </p>
            )}
          </div>
          <Button onClick={() => setAddModalOpen(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add to Collection
          </Button>
        </div>
      </div>

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-yellow-50/30 to-transparent dark:from-yellow-950/20">
        <CardContent className="p-6">
          <div className="max-w-md mx-auto aspect-square bg-muted rounded-lg overflow-hidden">
            <SetImage
              src={set.image_url}
              alt={set.name}
              className="w-full h-full object-cover"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sealed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sealed">Sealed</TabsTrigger>
          <TabsTrigger value="used">Used</TabsTrigger>
        </TabsList>

        <TabsContent value="sealed" className="space-y-4">
          {pricing.sealed ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Estimated Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(pricing.sealed.estimatedValue)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Confidence: {(pricing.sealed.confidence * 100).toFixed(0)}%
                    </p>
                  </CardContent>
                </Card>
                <PriceForecastCard setId={set.id} condition="SEALED" />
                {pricing.trends.sealed['7d'] && (
                  <Card className={`border-2 border-primary/20 bg-gradient-to-br ${pricing.trends.sealed['7d'].percentChange >= 0 ? 'from-green-50/50 dark:from-green-950/20' : 'from-red-50/50 dark:from-red-950/20'} to-transparent`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">7-Day Change</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${pricing.trends.sealed['7d'].percentChange >= 0 ? 'bg-gradient-lego-green' : 'bg-gradient-lego-red'}`}>
                          {pricing.trends.sealed['7d'].percentChange >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-white" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className={`text-2xl font-bold ${pricing.trends.sealed['7d'].percentChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {pricing.trends.sealed['7d'].percentChange >= 0 ? '+' : ''}
                          {pricing.trends.sealed['7d'].percentChange.toFixed(1)}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {pricing.trends.sealed['30d'] && (
                  <Card className={`border-2 border-primary/20 bg-gradient-to-br ${pricing.trends.sealed['30d'].percentChange >= 0 ? 'from-green-50/50 dark:from-green-950/20' : 'from-red-50/50 dark:from-red-950/20'} to-transparent`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">30-Day Change</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${pricing.trends.sealed['30d'].percentChange >= 0 ? 'bg-gradient-lego-green' : 'bg-gradient-lego-red'}`}>
                          {pricing.trends.sealed['30d'].percentChange >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-white" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className={`text-2xl font-bold ${pricing.trends.sealed['30d'].percentChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {pricing.trends.sealed['30d'].percentChange >= 0 ? '+' : ''}
                          {pricing.trends.sealed['30d'].percentChange.toFixed(1)}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              <PriceChart data={pricing.chartData} condition="SEALED" />
              {pricing.recentSnapshots && pricing.recentSnapshots.length > 0 && (
                <RecentSales snapshots={pricing.recentSnapshots} condition="SEALED" />
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No price data available for sealed condition</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="used" className="space-y-4">
          {pricing.used ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Estimated Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(pricing.used.estimatedValue)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Confidence: {(pricing.used.confidence * 100).toFixed(0)}%
                    </p>
                  </CardContent>
                </Card>
                <PriceForecastCard setId={set.id} condition="USED" />
                {pricing.trends.used['7d'] && (
                  <Card className={`border-2 border-primary/20 bg-gradient-to-br ${pricing.trends.used['7d'].percentChange >= 0 ? 'from-green-50/50 dark:from-green-950/20' : 'from-red-50/50 dark:from-red-950/20'} to-transparent`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">7-Day Change</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${pricing.trends.used['7d'].percentChange >= 0 ? 'bg-gradient-lego-green' : 'bg-gradient-lego-red'}`}>
                          {pricing.trends.used['7d'].percentChange >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-white" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className={`text-2xl font-bold ${pricing.trends.used['7d'].percentChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {pricing.trends.used['7d'].percentChange >= 0 ? '+' : ''}
                          {pricing.trends.used['7d'].percentChange.toFixed(1)}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {pricing.trends.used['30d'] && (
                  <Card className={`border-2 border-primary/20 bg-gradient-to-br ${pricing.trends.used['30d'].percentChange >= 0 ? 'from-green-50/50 dark:from-green-950/20' : 'from-red-50/50 dark:from-red-950/20'} to-transparent`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">30-Day Change</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${pricing.trends.used['30d'].percentChange >= 0 ? 'bg-gradient-lego-green' : 'bg-gradient-lego-red'}`}>
                          {pricing.trends.used['30d'].percentChange >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-white" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className={`text-2xl font-bold ${pricing.trends.used['30d'].percentChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {pricing.trends.used['30d'].percentChange >= 0 ? '+' : ''}
                          {pricing.trends.used['30d'].percentChange.toFixed(1)}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              <PriceChart data={pricing.chartData} condition="USED" />
              {pricing.recentSnapshots && pricing.recentSnapshots.length > 0 && (
                <RecentSales snapshots={pricing.recentSnapshots} condition="USED" />
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No price data available for used condition</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {addModalOpen && (
        <AddItemModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          set={set}
          onSuccess={() => {
            setAddModalOpen(false)
            router.push('/collection')
          }}
        />
      )}
    </div>
  )
}

