import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the period from query params (7, 30, 90 days)
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || '30'
    const days = parseInt(period, 10)

    // Calculate the date range
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    // Get all price snapshots for user's sets within the date range
    const { data: userSets } = await supabase
      .from('user_collection_items')
      .select('set_id, sets(id, set_number, name, image_url)')
      .eq('user_id', user.id)

    if (!userSets || userSets.length === 0) {
      return NextResponse.json({
        trending: [],
        gainers: [],
        losers: [],
        mostVolatile: [],
        period: days,
      })
    }

    const setIds = (userSets as any[]).map((item) => item.set_id)

    // Get price history for these sets
    const { data: priceHistory } = await supabase
      .from('price_snapshots')
      .select('*')
      .in('set_id', setIds)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false })

    if (!priceHistory || priceHistory.length === 0) {
      return NextResponse.json({
        trending: [],
        gainers: [],
        losers: [],
        mostVolatile: [],
        period: days,
      })
    }

    // Calculate metrics for each set
    const setMetrics = new Map<
      string,
      {
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
    >()

    // Group prices by set
    const pricesBySet = new Map<string, any[]>()
    priceHistory.forEach((snapshot: any) => {
      if (!pricesBySet.has(snapshot.set_id)) {
        pricesBySet.set(snapshot.set_id, [])
      }
      pricesBySet.get(snapshot.set_id)!.push(snapshot)
    })

    // Calculate metrics
    pricesBySet.forEach((prices, setId) => {
      const set = (userSets as any[]).find((s) => s.set_id === setId)
      if (!set) return

      // Sort by timestamp ascending
      const sorted = prices.sort(
        (a: any, b: any) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )

      const pricesInCents = sorted.map((p: any) => p.price_cents)
      const currentPrice = pricesInCents[pricesInCents.length - 1]
      const firstPrice = pricesInCents[0]
      const highestPrice = Math.max(...pricesInCents)
      const lowestPrice = Math.min(...pricesInCents)
      const avgPrice = Math.round(
        pricesInCents.reduce((a: number, b: number) => a + b, 0) / pricesInCents.length
      )

      // Calculate volatility (standard deviation)
      const mean = avgPrice
      const variance =
        pricesInCents.reduce((sum: number, price: number) => sum + Math.pow(price - mean, 2), 0) /
        pricesInCents.length
      const volatility = Math.sqrt(variance)

      const priceChange = currentPrice - firstPrice
      const percentChange = ((priceChange / firstPrice) * 100)
      const trend = priceChange > 0 ? 'UP' : priceChange < 0 ? 'DOWN' : 'STABLE'

      setMetrics.set(setId, {
        set_id: setId,
        set_number: set.sets?.set_number || '',
        name: set.sets?.name || 'Unknown',
        image_url: set.sets?.image_url || null,
        currentPrice,
        previousPrice: sorted.length > 1 ? pricesInCents[pricesInCents.length - 2] : firstPrice,
        priceChange,
        percentChange: Math.round(percentChange * 10) / 10,
        trend,
        volatility: Math.round(volatility * 10) / 10,
        sampleSize: pricesInCents.length,
        firstPrice,
        highestPrice,
        lowestPrice,
        avgPrice,
      })
    })

    // Convert to array and sort
    const metrics = Array.from(setMetrics.values())

    // Get gainers (top 5 by percent change)
    const gainers = metrics
      .filter((m) => m.trend === 'UP')
      .sort((a, b) => b.percentChange - a.percentChange)
      .slice(0, 5)

    // Get losers (bottom 5 by percent change)
    const losers = metrics
      .filter((m) => m.trend === 'DOWN')
      .sort((a, b) => a.percentChange - b.percentChange)
      .slice(0, 5)

    // Get most volatile
    const mostVolatile = metrics
      .sort((a, b) => b.volatility - a.volatility)
      .slice(0, 5)

    // Get trending (by trading volume/sample size)
    const trending = metrics
      .sort((a, b) => b.sampleSize - a.sampleSize)
      .slice(0, 5)

    return NextResponse.json({
      trending,
      gainers,
      losers,
      mostVolatile,
      period: days,
      totalSets: metrics.length,
      averageChange: Math.round(
        (metrics.reduce((sum, m) => sum + m.percentChange, 0) / metrics.length) * 10
      ) / 10,
    })
  } catch (error) {
    console.error('[Trending API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending data' },
      { status: 500 }
    )
  }
}

