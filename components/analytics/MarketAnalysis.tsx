'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Activity,
  Loader2,
  Info,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface SetMetric {
  set_id: string
  set_number: string
  name: string
  image_url: string | null
  currentPrice: number
  previousPrice: number
  priceChange: number
  percentChange: number
  trend: 'UP' | 'DOWN' | 'STABLE'
  volatility: number
  sampleSize: number
  firstPrice: number
  highestPrice: number
  lowestPrice: number
  avgPrice: number
}

interface AnalysisMetrics {
  trending: SetMetric[]
  gainers: SetMetric[]
  losers: SetMetric[]
  mostVolatile: SetMetric[]
  period: number
  totalSets: number
  averageChange: number
}

export function MarketAnalysis() {
  const [period, setPeriod] = useState('30')
  const [analysisType, setAnalysisType] = useState<'roi' | 'volatility' | 'momentum'>('roi')

  const { data, isLoading, error } = useQuery({
    queryKey: ['market-analysis', period],
    queryFn: async () => {
      const res = await fetch(`/api/trending?period=${period}`)
      if (!res.ok) throw new Error('Failed to fetch analysis data')
      return res.json() as Promise<AnalysisMetrics>
    },
  })

  const calculateROI = (metric: SetMetric) => {
    if (metric.firstPrice === 0) return 0
    return ((metric.currentPrice - metric.firstPrice) / metric.firstPrice) * 100
  }

  const calculateMomentum = (metric: SetMetric) => {
    // Momentum = current change / average price = velocity of change
    return metric.avgPrice ? (metric.priceChange / metric.avgPrice) * 100 : 0
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-12 text-center text-red-500">
          Failed to load market analysis
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  // Get sorted metrics based on analysis type
  let analyzedMetrics: (SetMetric & { score: number })[] = []

  if (analysisType === 'roi') {
    analyzedMetrics = data.trending.map((m) => ({
      ...m,
      score: calculateROI(m),
    }))
  } else if (analysisType === 'volatility') {
    analyzedMetrics = data.mostVolatile.map((m) => ({
      ...m,
      score: m.volatility,
    }))
  } else {
    analyzedMetrics = data.trending.map((m) => ({
      ...m,
      score: calculateMomentum(m),
    }))
  }

  // Sort by score
  analyzedMetrics.sort((a, b) => Math.abs(b.score) - Math.abs(a.score))

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Market Analysis Dashboard
          </CardTitle>
          <CardDescription>
            Deep dive into your collection's market performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Period Selector */}
          <div>
            <p className="text-sm font-medium mb-2">Time Period</p>
            <div className="flex gap-2 flex-wrap">
              {['7', '30', '90'].map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'outline'}
                  onClick={() => setPeriod(p)}
                  disabled={isLoading}
                  size="sm"
                >
                  {p}d
                </Button>
              ))}
            </div>
          </div>

          {/* Analysis Type Selector */}
          <div>
            <p className="text-sm font-medium mb-2">Analysis Type</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'roi' as const, label: 'ROI', icon: '📈' },
                { key: 'volatility' as const, label: 'Volatility', icon: '⚡' },
                { key: 'momentum' as const, label: 'Momentum', icon: '🚀' },
              ].map((option) => (
                <Button
                  key={option.key}
                  variant={analysisType === option.key ? 'default' : 'outline'}
                  onClick={() => setAnalysisType(option.key)}
                  size="sm"
                  className="justify-center"
                >
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {analysisType === 'roi' && <DollarSign className="h-5 w-5 text-blue-600" />}
            {analysisType === 'volatility' && <Activity className="h-5 w-5 text-yellow-600" />}
            {analysisType === 'momentum' && <TrendingUp className="h-5 w-5 text-green-600" />}
            {analysisType === 'roi' && 'Return on Investment'}
            {analysisType === 'volatility' && 'Market Volatility'}
            {analysisType === 'momentum' && 'Price Momentum'}
          </CardTitle>
          <CardDescription>
            {analysisType === 'roi' &&
              'Best performing sets by percentage return over the period'}
            {analysisType === 'volatility' &&
              'Sets with the most price fluctuation and risk'}
            {analysisType === 'momentum' && 'Sets gaining/losing momentum fastest'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyzedMetrics.length === 0 ? (
              <p className="text-muted-foreground text-sm">No data available for this analysis</p>
            ) : (
              analyzedMetrics.map((metric, index) => {
                const scoreColor =
                  analysisType === 'volatility'
                    ? 'text-yellow-600'
                    : metric.score > 0
                      ? 'text-green-600'
                      : 'text-red-600'

                const scoreBgColor =
                  analysisType === 'volatility'
                    ? 'bg-yellow-100'
                    : metric.score > 0
                      ? 'bg-green-100'
                      : 'bg-red-100'

                return (
                  <div
                    key={metric.set_id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-sm font-bold text-muted-foreground w-6">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{metric.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Set #{metric.set_number} • {metric.sampleSize} data points
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                      {analysisType === 'roi' && (
                        <div className="text-right">
                          <div className={`text-lg font-bold ${scoreColor}`}>
                            {metric.score > 0 ? '+' : ''}
                            {metric.score.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(metric.priceChange)}
                          </div>
                        </div>
                      )}

                      {analysisType === 'volatility' && (
                        <div className="text-right">
                          <div className={`text-lg font-bold ${scoreColor}`}>
                            ${(metric.volatility / 100).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            std deviation
                          </div>
                        </div>
                      )}

                      {analysisType === 'momentum' && (
                        <div className="text-right">
                          <div className={`text-lg font-bold ${scoreColor}`}>
                            {metric.score > 0 ? '+' : ''}
                            {metric.score.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            momentum score
                          </div>
                        </div>
                      )}

                      <Badge className={`${scoreBgColor} ${scoreColor}`}>
                        {analysisType === 'roi' && (metric.score > 0 ? '📈' : '📉')}
                        {analysisType === 'volatility' && '⚡'}
                        {analysisType === 'momentum' && (metric.score > 0 ? '🚀' : '📍')}
                      </Badge>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Market Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <strong>Portfolio Performance:</strong> Your collection has an average change of{' '}
            <span className={data.averageChange >= 0 ? 'text-green-600' : 'text-red-600'}>
              {data.averageChange >= 0 ? '+' : ''}
              {data.averageChange}%
            </span>{' '}
            over the last {period} days.
          </p>
          <p>
            <strong>Best Performers:</strong> {data.gainers.length > 0 ? `${data.gainers[0].name} is your top gainer at +${data.gainers[0].percentChange}%` : 'No gains yet.'}
          </p>
          <p>
            <strong>Risk Profile:</strong> Your most volatile set is {data.mostVolatile.length > 0 ? data.mostVolatile[0].name : 'unknown'} with a volatility of ${(data.mostVolatile[0]?.volatility || 0) / 100}.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

