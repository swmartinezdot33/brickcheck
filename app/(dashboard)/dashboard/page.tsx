'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Package, DollarSign, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['collection-stats'],
    queryFn: async () => {
      const res = await fetch('/api/collection/stats')
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your LEGO collection value and trends
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-lego-blue flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalEstimatedValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalCostBasis ? `Cost basis: ${formatCurrency(stats.totalCostBasis)}` : 'No items yet'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Change</CardTitle>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${todayChange >= 0 ? 'bg-gradient-lego-green' : 'bg-gradient-lego-red'}`}>
              {todayChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-white" />
              ) : (
                <TrendingDown className="h-4 w-4 text-white" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${todayChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {todayChange >= 0 ? '+' : ''}
              {formatCurrency(Math.abs(todayChange))}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.todayPercentChange !== undefined
                ? `${stats.todayPercentChange >= 0 ? '+' : ''}${stats.todayPercentChange.toFixed(2)}%`
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">30-Day Change</CardTitle>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${thirtyDayChange >= 0 ? 'bg-gradient-lego-green' : 'bg-gradient-lego-red'}`}>
              {thirtyDayChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-white" />
              ) : (
                <TrendingDown className="h-4 w-4 text-white" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${thirtyDayChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {thirtyDayChange >= 0 ? '+' : ''}
              {formatCurrency(Math.abs(thirtyDayChange))}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.thirtyDayPercentChange !== undefined
                ? `${stats.thirtyDayPercentChange >= 0 ? '+' : ''}${stats.thirtyDayPercentChange.toFixed(2)}%`
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-lego-yellow flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSets || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.sealedCount || 0} sealed, {stats?.usedCount || 0} used
              {stats?.retiredCount ? ` • ${stats.retiredCount} retired` : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Biggest Movers</CardTitle>
          <CardDescription>Sets with the largest value changes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add sets to your collection to see price movements. This feature will show your biggest gainers and
            losers once pricing data is available.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

