'use client'

import { useEffect, useRef } from 'react'
import { PriceSnapshot } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

interface PriceHistoryChartProps {
  setId: string
  setName: string
  condition?: 'SEALED' | 'USED'
}

interface ChartPoint {
  date: string
  price: number
  source: string
}

export function PriceHistoryChart({ setId, setName, condition = 'SEALED' }: PriceHistoryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchAndRender = async () => {
      try {
        // Fetch price history for the set
        const res = await fetch(`/api/set/${setId}`)
        if (!res.ok) return

        const data = await res.json()
        if (!data.pricing || data.pricing.length === 0) return

        // Filter by condition and sort by date
        const filtered = data.pricing
          .filter((p: PriceSnapshot) => p.condition === condition)
          .sort((a: PriceSnapshot, b: PriceSnapshot) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          .slice(-30) // Last 30 data points

        if (filtered.length === 0) return

        renderChart(filtered)
      } catch (error) {
        console.error('Failed to load price history:', error)
      }
    }

    fetchAndRender()
  }, [setId, condition])

  const renderChart = (prices: PriceSnapshot[]) => {
    const canvas = canvasRef.current
    const container = containerRef.current

    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = 300

    // Calculate min/max prices for scaling
    const pricesInCents = prices.map((p) => p.price_cents)
    const minPrice = Math.min(...pricesInCents)
    const maxPrice = Math.max(...pricesInCents)
    const priceRange = maxPrice - minPrice || 1

    // Padding
    const padding = { top: 40, right: 40, bottom: 40, left: 60 }
    const chartWidth = canvas.width - padding.left - padding.right
    const chartHeight = canvas.height - padding.top - padding.bottom

    // Draw background
    ctx.fillStyle = '#f8f8f8'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(canvas.width - padding.right, y)
      ctx.stroke()
    }

    // Draw axes
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, canvas.height - padding.bottom)
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom)
    ctx.stroke()

    // Draw price labels on Y-axis
    ctx.fillStyle = '#666'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'right'
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange / 5) * (5 - i)
      const y = padding.top + (chartHeight / 5) * i
      ctx.fillText('$' + (price / 100).toFixed(0), padding.left - 10, y + 4)
    }

    // Draw date labels on X-axis
    ctx.textAlign = 'center'
    const step = Math.max(1, Math.floor(prices.length / 5))
    for (let i = 0; i < prices.length; i += step) {
      const date = new Date(prices[i].timestamp)
      const label = (date.getMonth() + 1) + '/' + date.getDate()
      const x = padding.left + (chartWidth / (prices.length - 1)) * i
      ctx.fillText(label, x, canvas.height - padding.bottom + 20)
    }

    // Draw price line
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.beginPath()

    prices.forEach((price, index) => {
      const x = padding.left + (chartWidth / (prices.length - 1)) * index
      const normalizedPrice = (price.price_cents - minPrice) / priceRange
      const y = padding.top + chartHeight - normalizedPrice * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw points
    prices.forEach((price, index) => {
      const x = padding.left + (chartWidth / (prices.length - 1)) * index
      const normalizedPrice = (price.price_cents - minPrice) / priceRange
      const y = padding.top + chartHeight - normalizedPrice * chartHeight

      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()

      // Hover effect (draw larger circle on last point)
      if (index === prices.length - 1) {
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.stroke()
      }
    })

    // Draw title
    ctx.fillStyle = '#000'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('Price History - Last 30 Points', padding.left, 25)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{setName} - Price Trend</CardTitle>
        <CardDescription>
          Historical price data ({condition === 'SEALED' ? 'New/Sealed' : 'Used/Pre-owned'})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="w-full bg-white rounded-lg border border-gray-200"
          style={{ minHeight: '340px' }}
        >
          <canvas
            ref={canvasRef}
            className="w-full"
            style={{ display: 'block' }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

