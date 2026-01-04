'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SetImage } from '@/components/ui/SetImage'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface SetMetric {
  set_id: string
  set_number: string
  name: string
  image_url: string | null
  currentPrice: number
  priceChange: number
  percentChange: number
  trend: 'UP' | 'DOWN' | 'STABLE'
  volatility: number
  sampleSize: number
}

interface TrendingData {
  trending: SetMetric[]
  gainers: SetMetric[]
  losers: SetMetric[]
  mostVolatile: SetMetric[]
  period: number
  totalSets: number
  averageChange: number
}

export function TrendingMetrics() {
  const [period, setPeriod] = useState('30')

  const { data, isLoading, error } = useQuery({
    queryKey: ['trending', period],
    queryFn: async () => {
      const res = await fetch(`/api/trending?period=${period}`)
      if (!res.ok) throw new Error('Failed to fetch trending data')
      return res.json() as Promise<TrendingData>
    },
  })

  if (error) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-red-500">
          Failed to load trending metrics
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2 flex-wrap">
        {['7', '30', '90'].map((p) => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            onClick={() => setPeriod(p)}
            disabled={isLoading}
          >
            {p} Days
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !data ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No trending data available
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalSets}</div>
                <p className="text-xs text-muted-foreground">in your collection</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Average Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${data.averageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.averageChange >= 0 ? '+' : ''}{data.averageChange}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.averageChange >= 0 ? 'Portfolio gaining' : 'Portfolio declining'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{period}d</div>
                <p className="text-xs text-muted-foreground">historical data</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Gainers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Top Gainers
              </CardTitle>
              <CardDescription>Sets with the biggest price increases</CardDescription>
            </CardHeader>
            <CardContent>
              {data.gainers.length === 0 ? (
                <p className="text-muted-foreground text-sm">No gaining sets</p>
              ) : (
                <div className="space-y-3">
                  {data.gainers.map((set) => (
                    <MetricRow key={set.set_id} set={set} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Losers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Top Losers
              </CardTitle>
              <CardDescription>Sets with the biggest price decreases</CardDescription>
            </CardHeader>
            <CardContent>
              {data.losers.length === 0 ? (
                <p className="text-muted-foreground text-sm">No losing sets</p>
              ) : (
                <div className="space-y-3">
                  {data.losers.map((set) => (
                    <MetricRow key={set.set_id} set={set} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Most Volatile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Most Volatile
              </CardTitle>
              <CardDescription>Sets with the highest price fluctuations</CardDescription>
            </CardHeader>
            <CardContent>
              {data.mostVolatile.length === 0 ? (
                <p className="text-muted-foreground text-sm">No volatile sets</p>
              ) : (
                <div className="space-y-3">
                  {data.mostVolatile.map((set) => (
                    <div key={set.set_id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden bg-muted">
                          <SetImage
                            src={set.image_url}
                            alt={set.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{set.name}</p>
                          <p className="text-xs text-muted-foreground">Set #{set.set_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-yellow-600">
                            ${(set.volatility / 100).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">volatility</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trending by Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Trending by Activity
              </CardTitle>
              <CardDescription>Sets with most market data points</CardDescription>
            </CardHeader>
            <CardContent>
              {data.trending.length === 0 ? (
                <p className="text-muted-foreground text-sm">No active sets</p>
              ) : (
                <div className="space-y-3">
                  {data.trending.map((set) => (
                    <div key={set.set_id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden bg-muted">
                          <SetImage
                            src={set.image_url}
                            alt={set.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{set.name}</p>
                          <p className="text-xs text-muted-foreground">Set #{set.set_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-blue-600">
                            {set.sampleSize} points
                          </div>
                          <div className="text-xs text-muted-foreground">market data</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function MetricRow({ set }: { set: SetMetric }) {
  const isGainer = set.trend === 'UP'

  return (
    <Link href={`/browse/${set.set_id}`}>
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden bg-muted">
            <SetImage src={set.image_url} alt={set.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{set.name}</p>
            <p className="text-xs text-muted-foreground">Set #{set.set_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div className={`text-sm font-semibold ${isGainer ? 'text-green-600' : 'text-red-600'}`}>
              {isGainer ? '+' : ''}{set.percentChange}%
            </div>
            <div className="text-xs text-muted-foreground">
              {isGainer ? '+' : ''}{formatCurrency(set.priceChange)}
            </div>
          </div>
          <Badge variant={isGainer ? 'default' : 'secondary'} className={isGainer ? 'bg-green-600' : 'bg-red-600'}>
            {isGainer ? '📈' : '📉'}
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </Link>
  )
}

