'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { PriceForecast } from '@/lib/pricing/engine'
import { format } from 'date-fns'

interface PriceForecastCardProps {
  setId: string
  condition: 'SEALED' | 'USED'
}

export function PriceForecastCard({ setId, condition }: PriceForecastCardProps) {
  const { data: forecast, isLoading, error } = useQuery<PriceForecast>({
    queryKey: ['price-forecast', setId, condition],
    queryFn: async () => {
      const res = await fetch(`/api/set/${setId}/forecast?condition=${condition}`)
      if (!res.ok) {
        // If 400, it means insufficient data, which is fine
        if (res.status === 400) return null
        throw new Error('Failed to fetch forecast')
      }
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <Card className="border-2 border-primary/10">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error || !forecast) {
    // Only show if we have data
    return null
  }

  const isUp = forecast.trend === 'UP'
  const isDown = forecast.trend === 'DOWN'
  const isStable = forecast.trend === 'STABLE'

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>6-Month Forecast</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            forecast.confidence > 0.7 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            forecast.confidence > 0.4 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {(forecast.confidence * 100).toFixed(0)}% Confidence
          </span>
        </CardTitle>
        <CardDescription>
          Predicted value by {format(new Date(forecast.forecastDate), 'MMM yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              isUp ? 'bg-gradient-lego-green shadow-green-200 dark:shadow-none' :
              isDown ? 'bg-gradient-lego-red shadow-red-200 dark:shadow-none' :
              'bg-gray-100 dark:bg-gray-800'
            }`}>
              {isUp ? <TrendingUp className="h-5 w-5 text-white" /> :
               isDown ? <TrendingDown className="h-5 w-5 text-white" /> :
               <Minus className="h-5 w-5 text-gray-500" />}
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight">
                {formatCurrency(forecast.predictedValue)}
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                {isUp ? 'Projected Growth' : isDown ? 'Projected Decline' : 'Stable Trend'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}




