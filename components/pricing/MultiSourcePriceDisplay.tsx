'use client'

import { PriceSnapshot } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface MultiSourcePriceDisplayProps {
  prices: PriceSnapshot[]
  condition: 'SEALED' | 'USED'
}

export function MultiSourcePriceDisplay({ prices, condition }: MultiSourcePriceDisplayProps) {
  // Group prices by source
  const groupedPrices = new Map<string, PriceSnapshot[]>()

  prices.forEach((price) => {
    const meta = price.metadata as any
    const source = (meta?.source || meta?.provider || 'UNKNOWN') as string
    if (!groupedPrices.has(source)) {
      groupedPrices.set(source, [])
    }
    groupedPrices.get(source)!.push(price)
  })

  // Define source display info
  const sourceInfo: Record<string, { name: string; color: string; icon: string }> = {
    BRICKLINK: { name: 'BrickLink', color: 'bg-blue-100 dark:bg-blue-900', icon: '🔗' },
    BRICKECONOMY: { name: 'BrickEconomy', color: 'bg-green-100 dark:bg-green-900', icon: '📊' },
    EBAY: { name: 'eBay', color: 'bg-red-100 dark:bg-red-900', icon: '🛍️' },
    EBAY_SOLD: { name: 'eBay (Sold)', color: 'bg-orange-100 dark:bg-orange-900', icon: '✓' },
    STOCKX: { name: 'StockX', color: 'bg-purple-100 dark:bg-purple-900', icon: '📈' },
    STOCKX_ASK: { name: 'StockX Ask', color: 'bg-purple-100 dark:bg-purple-900', icon: '📊' },
    STOCKX_BID: { name: 'StockX Bid', color: 'bg-purple-100 dark:bg-purple-900', icon: '🏷️' },
  }

  const getSourceDisplay = (source: string) => {
    return sourceInfo[source] || { name: source, color: 'bg-gray-100 dark:bg-gray-900', icon: '•' }
  }

  if (prices.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No pricing data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from(groupedPrices.entries()).map(([source, sourcePrices]) => {
          const display = getSourceDisplay(source)
          const avgPrice = Math.round(
            sourcePrices.reduce((sum, p) => sum + p.price_cents, 0) / sourcePrices.length
          )
          const minPrice = Math.min(...sourcePrices.map((p) => p.price_cents))
          const maxPrice = Math.max(...sourcePrices.map((p) => p.price_cents))
          const sampleSize = sourcePrices.reduce((sum, p) => sum + (p.sample_size || 1), 0)

          return (
            <Card key={source} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{display.icon} {display.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {condition === 'SEALED' ? '📦 New/Sealed' : '🔄 Used/Pre-owned'}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className={display.color}>
                    {sourcePrices.length} listing{sourcePrices.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Average Price (highlighted) */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Average Price</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {formatCurrency(avgPrice)}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Lowest</div>
                      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(minPrice)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Highest</div>
                      <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(maxPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Sample Info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <Activity className="h-3 w-3" />
                    <span>{sampleSize} data point{sampleSize > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Price Comparison Summary */}
      {Array.from(groupedPrices.entries()).length > 1 && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Market Comparison</CardTitle>
            <CardDescription>Prices across all available sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                const allPrices = prices.map((p) => p.price_cents).sort((a, b) => a - b)
                const medianPrice = allPrices[Math.floor(allPrices.length / 2)]
                const lowestPrice = allPrices[0]
                const highestPrice = allPrices[allPrices.length - 1]
                const avgPrice = Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length)
                const priceSpread = highestPrice - lowestPrice

                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Market Median</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(medianPrice)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Price Spread</div>
                        <div className="text-2xl font-bold">
                          {formatCurrency(priceSpread)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {((priceSpread / medianPrice) * 100).toFixed(1)}% variance
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lowest Available:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(lowestPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Highest Listed:</span>
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            {formatCurrency(highestPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

