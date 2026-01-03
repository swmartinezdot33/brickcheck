'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { PriceChart } from '@/components/pricing/PriceChart'
import { RecentSales } from '@/components/pricing/RecentSales'
import { formatCurrency } from '@/lib/utils'
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react'

export default function SetDetailPage({
  params,
}: {
  params: Promise<{ setId: string }>
}) {
  const { setId } = use(params)

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
          <p className="text-red-500">Failed to load set details</p>
        </CardContent>
      </Card>
    )
  }

  const { set, pricing } = data

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold">{set.name}</h1>
          {set.retired && <Badge variant="secondary">Retired</Badge>}
        </div>
        <p className="text-muted-foreground">
          Set #{set.set_number} • {set.theme || 'Unknown Theme'} • {set.year || 'Unknown Year'}
        </p>
        {set.piece_count && (
          <p className="text-sm text-muted-foreground mt-1">
            {set.piece_count.toLocaleString()} pieces
          </p>
        )}
      </div>

      <Tabs defaultValue="sealed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sealed">Sealed</TabsTrigger>
          <TabsTrigger value="used">Used</TabsTrigger>
        </TabsList>

        <TabsContent value="sealed" className="space-y-4">
          {pricing.sealed ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
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
                {pricing.trends.sealed['7d'] && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">7-Day Change</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {pricing.trends.sealed['7d'].percentChange >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <div className="text-2xl font-bold">
                          {pricing.trends.sealed['7d'].percentChange >= 0 ? '+' : ''}
                          {pricing.trends.sealed['7d'].percentChange.toFixed(1)}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {pricing.trends.sealed['30d'] && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">30-Day Change</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {pricing.trends.sealed['30d'].percentChange >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <div className="text-2xl font-bold">
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
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
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
                {pricing.trends.used['7d'] && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">7-Day Change</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {pricing.trends.used['7d'].percentChange >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <div className="text-2xl font-bold">
                          {pricing.trends.used['7d'].percentChange >= 0 ? '+' : ''}
                          {pricing.trends.used['7d'].percentChange.toFixed(1)}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {pricing.trends.used['30d'] && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">30-Day Change</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {pricing.trends.used['30d'].percentChange >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <div className="text-2xl font-bold">
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
    </div>
  )
}

