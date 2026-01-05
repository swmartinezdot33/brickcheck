'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { PriceChart } from '@/components/pricing/PriceChart'
import { RecentSales } from '@/components/pricing/RecentSales'
import { PriceForecastCard } from '@/components/pricing/PriceForecastCard'
import { formatCurrency } from '@/lib/utils'
import { Loader2, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { SetImage } from '@/components/ui/SetImage'

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

  const renderConditionContent = (condition: 'SEALED' | 'USED', pricingData: any) => {
    if (!pricingData) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No price data available for {condition.toLowerCase()} condition</p>
          </CardContent>
        </Card>
      )
    }

    const trend7d = pricing.trends[condition.toLowerCase()]['7d']
    const trend30d = pricing.trends[condition.toLowerCase()]['30d']
    const bgColor = condition === 'SEALED' ? 'from-blue-50/50 dark:from-blue-950/20' : 'from-purple-50/50 dark:from-purple-950/20'

    return (
      <div className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Retail Price */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Retail Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {set.msrp_cents ? formatCurrency(set.msrp_cents) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Original MSRP</p>
            </CardContent>
          </Card>

          {/* Current Value */}
          <Card className={`border-2 border-primary/20 bg-gradient-to-br ${bgColor} to-transparent`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(pricingData.estimatedValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Confidence: {(pricingData.confidence * 100).toFixed(0)}%
              </p>
            </CardContent>
          </Card>

          {/* Growth % */}
          <Card className={`border-2 border-primary/20 bg-gradient-to-br ${
            pricingData.estimatedValue >= (set.msrp_cents || 0) 
              ? 'from-green-50/50 dark:from-green-950/20' 
              : 'from-red-50/50 dark:from-red-950/20'
          } to-transparent`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  pricingData.estimatedValue >= (set.msrp_cents || 0)
                    ? 'bg-gradient-lego-green'
                    : 'bg-gradient-lego-red'
                }`}>
                  {pricingData.estimatedValue >= (set.msrp_cents || 0) ? (
                    <TrendingUp className="h-4 w-4 text-white" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className={`text-2xl font-bold ${
                  pricingData.estimatedValue >= (set.msrp_cents || 0)
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {set.msrp_cents ? (
                    <>
                      {pricingData.estimatedValue >= (set.msrp_cents || 0) ? '+' : ''}
                      {(((pricingData.estimatedValue - (set.msrp_cents || 0)) / (set.msrp_cents || 1)) * 100).toFixed(1)}%
                    </>
                  ) : 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Change */}
          {trend7d && (
            <Card className={`border-2 border-primary/20 bg-gradient-to-br ${trend7d.percentChange >= 0 ? 'from-green-50/50 dark:from-green-950/20' : 'from-red-50/50 dark:from-red-950/20'} to-transparent`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">7-Day Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${trend7d.percentChange >= 0 ? 'bg-gradient-lego-green' : 'bg-gradient-lego-red'}`}>
                    {trend7d.percentChange >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-white" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className={`text-2xl font-bold ${trend7d.percentChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {trend7d.percentChange >= 0 ? '+' : ''}
                    {trend7d.percentChange.toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 30-Day Change */}
          {trend30d && (
            <Card className={`border-2 border-primary/20 bg-gradient-to-br ${trend30d.percentChange >= 0 ? 'from-green-50/50 dark:from-green-950/20' : 'from-red-50/50 dark:from-red-950/20'} to-transparent`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">30-Day Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${trend30d.percentChange >= 0 ? 'bg-gradient-lego-green' : 'bg-gradient-lego-red'}`}>
                    {trend30d.percentChange >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-white" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className={`text-2xl font-bold ${trend30d.percentChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {trend30d.percentChange >= 0 ? '+' : ''}
                    {trend30d.percentChange.toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Forecast */}
          <PriceForecastCard setId={set.id} condition={condition} />
        </div>

        {/* Price Chart */}
        <PriceChart data={pricing.chartData} condition={condition} />

        {/* Recent Sales */}
        {pricing.recentSnapshots && pricing.recentSnapshots.length > 0 && (
          <RecentSales snapshots={pricing.recentSnapshots} condition={condition} />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">{set.name}</h1>
                {set.retired && <Badge className="bg-amber-500 hover:bg-amber-600 text-white">⭐ Retired</Badge>}
              </div>
              <p className="text-muted-foreground text-lg">Set #{set.set_number}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {set.theme && (
                  <Badge variant="outline" className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    {set.theme}
                  </Badge>
                )}
                {set.year && (
                  <Badge variant="outline" className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <Calendar className="h-3 w-3 mr-1" />
                    {set.year}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Set Details Sidebar */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-950/20">
          <CardHeader>
            <CardTitle className="text-lg">Set Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Set Number</span>
                <span className="font-semibold">{set.set_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Theme</span>
                <span className="font-semibold">{set.theme || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Year Released</span>
                <span className="font-semibold">{set.year || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pieces</span>
                <span className="font-semibold">{set.piece_count ? Number(set.piece_count).toLocaleString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold">{set.retired ? '⭐ Retired' : 'Active'}</span>
              </div>
              {set.msrp_cents && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MSRP</span>
                  <span className="font-semibold">{formatCurrency(set.msrp_cents)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Set Image */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-yellow-50/30 to-transparent dark:from-yellow-950/20">
        <CardContent className="p-8">
          <div className="max-w-2xl mx-auto bg-muted rounded-lg overflow-hidden">
            <SetImage
              src={set.image_url}
              alt={set.name}
              className="w-full h-auto object-cover max-h-96"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Sealed/Used */}
      <Tabs defaultValue="sealed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sealed">Sealed Condition</TabsTrigger>
          <TabsTrigger value="used">Used Condition</TabsTrigger>
        </TabsList>

        <TabsContent value="sealed" className="space-y-4">
          {renderConditionContent('SEALED', pricing.sealed)}
        </TabsContent>

        <TabsContent value="used" className="space-y-4">
          {renderConditionContent('USED', pricing.used)}
        </TabsContent>
      </Tabs>
    </div>
  )
}