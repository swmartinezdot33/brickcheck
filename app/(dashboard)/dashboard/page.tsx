'use client'

import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Package, DollarSign, Loader2, BarChart3 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DistributionChart } from '@/components/collection/DistributionChart'
import { CollectionSwitcher } from '@/components/collection/CollectionSwitcher'
import { BiggestMovers } from '@/components/collection/BiggestMovers'

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const collectionId = searchParams.get('collectionId')

  const { data: stats, isLoading } = useQuery({
    queryKey: ['collection-stats', collectionId],
    queryFn: async () => {
      const url = collectionId 
        ? `/api/collection/stats?collectionId=${collectionId}`
        : '/api/collection/stats'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch stats')
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

  const todayChange = stats?.todayChange || 0
  const thirtyDayChange = stats?.thirtyDayChange || 0
  const totalGain = stats?.totalGain || 0
  const portfolioCAGR = stats?.portfolioCAGR || 0

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Overview of your LEGO collection value and trends
          </p>
        </div>
        <div className="hidden md:block">
          <CollectionSwitcher />
        </div>
      </div>

      {/* Full-width Collection Selector on Mobile */}
      <div className="md:hidden">
        <CollectionSwitcher />
      </div>

      {/* Mobile: 2 columns, Desktop: 3 columns */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-3">
        {/* Total Value */}
        <Card className="border border-primary/20 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Value</CardTitle>
            <div className="h-6 md:h-8 w-6 md:w-8 rounded-lg bg-gradient-lego-blue flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-3 md:h-4 w-3 md:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pb-0">
            <div className="text-lg md:text-2xl font-bold">
              {formatCurrency(stats?.totalEstimatedValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {stats?.totalCostBasis ? `Cost: ${formatCurrency(stats.totalCostBasis)}` : 'No items'}
            </p>
          </CardContent>
        </Card>

        {/* Total Gain */}
        <Card className="border border-primary/20 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Gain</CardTitle>
            <div className={`h-6 md:h-8 w-6 md:w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${totalGain >= 0 ? 'bg-gradient-lego-green' : 'bg-gradient-lego-red'}`}>
              <BarChart3 className="h-3 md:h-4 w-3 md:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pb-0">
            <div className={`text-lg md:text-2xl font-bold ${totalGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {stats?.totalGainPercent !== undefined ? `${stats.totalGainPercent >= 0 ? '+' : ''}${stats.totalGainPercent.toFixed(1)}% all time` : 'N/A'}
            </p>
          </CardContent>
        </Card>

        {/* Annual Growth */}
        <Card className="border border-primary/20 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Annual Growth</CardTitle>
            <div className="h-6 md:h-8 w-6 md:w-8 rounded-lg bg-gradient-lego-purple flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-3 md:h-4 w-3 md:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pb-0">
            <div className="text-lg md:text-2xl font-bold text-purple-600 dark:text-purple-400">
              {portfolioCAGR.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              CAGR return
            </p>
          </CardContent>
        </Card>

        {/* 30-Day Change */}
        <Card className="border border-primary/20 bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">30-Day</CardTitle>
            <div className={`h-6 md:h-8 w-6 md:w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${thirtyDayChange >= 0 ? 'bg-gradient-lego-green' : 'bg-gradient-lego-red'}`}>
              {thirtyDayChange >= 0 ? (
                <TrendingUp className="h-3 md:h-4 w-3 md:w-4 text-white" />
              ) : (
                <TrendingDown className="h-3 md:h-4 w-3 md:w-4 text-white" />
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-0">
            <div className={`text-lg md:text-2xl font-bold ${thirtyDayChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {thirtyDayChange >= 0 ? '+' : ''}{formatCurrency(Math.abs(thirtyDayChange))}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {stats?.thirtyDayPercentChange !== undefined ? `${stats.thirtyDayPercentChange >= 0 ? '+' : ''}${stats.thirtyDayPercentChange.toFixed(1)}%` : 'N/A'}
            </p>
          </CardContent>
        </Card>

        {/* Total Sets */}
        <Card className="border border-primary/20 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Sets</CardTitle>
            <div className="h-6 md:h-8 w-6 md:w-8 rounded-lg bg-gradient-lego-yellow flex items-center justify-center flex-shrink-0">
              <Package className="h-3 md:h-4 w-3 md:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pb-0">
            <div className="text-lg md:text-2xl font-bold">{stats?.totalSets || 0}</div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {stats?.sealedCount || 0} sealed, {stats?.usedCount || 0} used
            </p>
          </CardContent>
        </Card>

        {/* Today's Change */}
        <Card className="border border-primary/20 bg-gradient-to-br from-cyan-50/50 to-transparent dark:from-cyan-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Today</CardTitle>
            <div className={`h-6 md:h-8 w-6 md:w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${todayChange >= 0 ? 'bg-gradient-lego-green' : 'bg-gradient-lego-red'}`}>
              {todayChange >= 0 ? (
                <TrendingUp className="h-3 md:h-4 w-3 md:w-4 text-white" />
              ) : (
                <TrendingDown className="h-3 md:h-4 w-3 md:w-4 text-white" />
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-0">
            <div className={`text-lg md:text-2xl font-bold ${todayChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {todayChange >= 0 ? '+' : ''}{formatCurrency(Math.abs(todayChange))}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {stats?.todayPercentChange !== undefined ? `${stats.todayPercentChange >= 0 ? '+' : ''}${stats.todayPercentChange.toFixed(1)}%` : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Biggest Movers - Show on all sizes */}
      <BiggestMovers 
        gainers={stats?.topGainers || []} 
        losers={stats?.topLosers || []} 
      />

      {/* Charts - Desktop only */}
      <div className="hidden md:grid gap-4 md:grid-cols-2">
        <DistributionChart 
          data={stats?.distributionByTheme || []} 
          title="Value by Theme" 
          description="Distribution of collection value across themes"
        />
        <DistributionChart 
          data={stats?.distributionByYear || []} 
          title="Value by Year" 
          description="Distribution of collection value across years"
        />
      </div>
    </div>
  )
}
