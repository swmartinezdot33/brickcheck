'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { SetImage } from '@/components/ui/SetImage'

interface MoverSet {
  setId: string
  setNumber: string
  setName: string
  condition: string
  quantity: number
  currentPrice: number
  priceMonth30DaysAgo: number
  change: number
  percentChange: number
  imageUrl?: string
}

interface BiggestMoversProps {
  gainers: MoverSet[]
  losers: MoverSet[]
}

export function BiggestMovers({ gainers, losers }: BiggestMoversProps) {
  if (gainers.length === 0 && losers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Biggest Movers</CardTitle>
          <CardDescription>Sets with the largest value changes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add sets to your collection and wait for price data to see price movements. This feature will show your biggest gainers and
            losers once pricing data is available.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biggest Movers</CardTitle>
        <CardDescription>Sets with the largest value changes (30-day)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Gainers */}
          <div className="space-y-2">
            <h3 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Gainers
            </h3>
            {gainers.length > 0 ? (
              <div className="space-y-2">
                {gainers.map((mover) => (
                  <div
                    key={`${mover.setId}-${mover.condition}`}
                    className="p-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20"
                  >
                  <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
                        <SetImage src={mover.imageUrl} alt={mover.setName} className="h-12 w-12 object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{mover.setName}</div>
                        <div className="text-xs text-muted-foreground">
                          #{mover.setNumber} • {mover.condition === 'SEALED' ? '🔒 Sealed' : '📦 Used'}
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="text-xs">
                            <span className="text-muted-foreground">{formatCurrency(mover.priceMonth30DaysAgo)}</span>
                            {' → '}
                            <span className="font-semibold">{formatCurrency(mover.currentPrice)}</span>
                          </div>
                          <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                            +{mover.percentChange.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No gainers yet</p>
            )}
          </div>

          {/* Top Losers */}
          <div className="space-y-2">
            <h3 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Top Losers
            </h3>
            {losers.length > 0 ? (
              <div className="space-y-2">
                {losers.map((mover) => (
                  <div
                    key={`${mover.setId}-${mover.condition}`}
                    className="p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
                  >
                  <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
                        <SetImage src={mover.imageUrl} alt={mover.setName} className="h-12 w-12 object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{mover.setName}</div>
                        <div className="text-xs text-muted-foreground">
                          #{mover.setNumber} • {mover.condition === 'SEALED' ? '🔒 Sealed' : '📦 Used'}
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="text-xs">
                            <span className="text-muted-foreground">{formatCurrency(mover.priceMonth30DaysAgo)}</span>
                            {' → '}
                            <span className="font-semibold">{formatCurrency(mover.currentPrice)}</span>
                          </div>
                          <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                            {mover.percentChange.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No losers yet</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

