'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingMetrics } from '@/components/trending/TrendingMetrics'
import { MarketAnalysis } from '@/components/analytics/MarketAnalysis'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Activity } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
          Market Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Track trends, analyze performance, and monitor your collection's market value
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Trending Sets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track your biggest gainers, losers, and most volatile sets across different time periods
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Market Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Deep dive into ROI, volatility, and momentum metrics for informed decisions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-yellow-600" />
              Real-Time Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get live pricing from BrickLink, eBay, StockX, and BrickEconomy all in one place
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trending">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-6">
          <TrendingMetrics />
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <MarketAnalysis />
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-950/20">
        <CardHeader>
          <CardTitle>How to Use Analytics</CardTitle>
          <CardDescription>Tips for getting the most out of market analytics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>📈 Trending Tab:</strong> Monitor your top gainers and losers over 7, 30, or 90-day periods.
            Identify which sets are appreciating fastest and which might need attention.
          </p>
          <p>
            <strong>🎯 Analysis Tab:</strong> Perform custom analysis using ROI, Volatility, or Momentum metrics.
            ROI shows percentage returns, Volatility shows price swings, and Momentum shows change velocity.
          </p>
          <p>
            <strong>💡 Portfolio Insights:</strong> Use the market insights box to understand your overall
            portfolio performance and identify risk areas.
          </p>
          <p>
            <strong>🔗 Data Sources:</strong> All prices come from BrickLink, eBay, StockX, and BrickEconomy
            integrated automatically for the most accurate market data.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

