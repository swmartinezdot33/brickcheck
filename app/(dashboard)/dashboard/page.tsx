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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your LEGO collection value and trends
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Change</CardTitle>
            {todayChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${todayChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">30-Day Change</CardTitle>
            {thirtyDayChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${thirtyDayChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
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

