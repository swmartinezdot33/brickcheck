'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

interface ChartDataPoint {
  date: string
  sealed: number | null
  used: number | null
}

interface PriceChartProps {
  data: ChartDataPoint[]
  condition?: 'SEALED' | 'USED'
}

export function PriceChart({ data, condition }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No price data available</p>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d')
    } catch {
      return dateStr
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value ? formatCurrency(entry.value) : 'N/A'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price History</CardTitle>
        <CardDescription>Last 90 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              tickFormatter={(value) => `$${(value / 100).toFixed(0)}`}
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {(!condition || condition === 'SEALED') && (
              <Line
                type="monotone"
                dataKey="sealed"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Sealed"
                dot={false}
              />
            )}
            {(!condition || condition === 'USED') && (
              <Line
                type="monotone"
                dataKey="used"
                stroke="#10b981"
                strokeWidth={2}
                name="Used"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

