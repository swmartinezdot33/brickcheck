'use client'

import { PriceSnapshot } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface RecentSalesProps {
  snapshots: PriceSnapshot[]
  condition: 'SEALED' | 'USED'
}

export function RecentSales({ snapshots, condition }: RecentSalesProps) {
  // Filter by condition and sort by most recent
  const filteredSnapshots = snapshots
    .filter((s) => s.condition === condition)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20) // Show last 20 sales

  if (filteredSnapshots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>No recent sales data available for {condition.toLowerCase()} condition</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Calculate average for comparison
  const averagePrice =
    filteredSnapshots.reduce((sum, s) => sum + s.price_cents, 0) / filteredSnapshots.length

  // Calculate price statistics
  const minPrice = Math.min(...filteredSnapshots.map((s) => s.price_cents))
  const maxPrice = Math.max(...filteredSnapshots.map((s) => s.price_cents))
  const medianPrice = filteredSnapshots.length > 0
    ? [...filteredSnapshots]
        .sort((a, b) => a.price_cents - b.price_cents)
        [Math.floor(filteredSnapshots.length / 2)].price_cents
    : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Recent Sales Data</CardTitle>
            <CardDescription>
              Showing last {filteredSnapshots.length} sales for {condition.toLowerCase()} condition
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Average</p>
              <p className="text-sm font-semibold">{formatCurrency(averagePrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Median</p>
              <p className="text-sm font-semibold">{formatCurrency(medianPrice)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>Range: {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Source</TableHead>
                <TableHead className="font-semibold">Sample Size</TableHead>
                <TableHead className="font-semibold">Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSnapshots.map((snapshot, index) => {
                const date = new Date(snapshot.timestamp)
                const isAboveAverage = snapshot.price_cents > averagePrice
                const variancePercent = snapshot.variance
                  ? ((snapshot.variance / snapshot.price_cents) * 100).toFixed(1)
                  : null
                const priceDiff = snapshot.price_cents - averagePrice
                const priceDiffPercent = ((priceDiff / averagePrice) * 100).toFixed(1)

                return (
                  <TableRow key={snapshot.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(date, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-base font-bold ${
                            isAboveAverage
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {formatCurrency(snapshot.price_cents)}
                        </span>
                        {priceDiff !== 0 && (
                          <span
                            className={`text-xs ${
                              isAboveAverage
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            ({isAboveAverage ? '+' : ''}
                            {priceDiffPercent}%)
                          </span>
                        )}
                        {isAboveAverage ? (
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-medium">
                        {snapshot.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {snapshot.sample_size ? (
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{snapshot.sample_size}</span>
                          <span className="text-xs text-muted-foreground">
                            {snapshot.sample_size === 1 ? 'sale' : 'sales'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {variancePercent ? (
                        <span className="text-sm text-muted-foreground">±{variancePercent}%</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

