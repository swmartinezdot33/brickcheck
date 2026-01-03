import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculatePriceEstimate, calculateTrend } from '@/lib/pricing/engine'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const { setId } = await params
    const supabase = await createClient()

    // Get set details
    const { data: set, error: setError } = await supabase
      .from('sets')
      .select('*')
      .eq('id', setId)
      .single()

    if (setError || !set) {
      return NextResponse.json({ error: 'Set not found' }, { status: 404 })
    }

    // Get price snapshots
    const { data: snapshots, error: snapshotsError } = await supabase
      .from('price_snapshots')
      .select('*')
      .eq('set_id', setId)
      .order('timestamp', { ascending: false })
      .limit(1000)

    if (snapshotsError) {
      console.error('Error fetching snapshots:', snapshotsError)
    }

    // Calculate price estimates
    const sealedEstimate = snapshots
      ? calculatePriceEstimate(snapshots, 'SEALED')
      : null
    const usedEstimate = snapshots
      ? calculatePriceEstimate(snapshots, 'USED')
      : null

    // Calculate trends
    const sealedTrend7d = snapshots
      ? calculateTrend(snapshots, 'SEALED', 7)
      : null
    const sealedTrend30d = snapshots
      ? calculateTrend(snapshots, 'SEALED', 30)
      : null
    const usedTrend7d = snapshots
      ? calculateTrend(snapshots, 'USED', 7)
      : null
    const usedTrend30d = snapshots
      ? calculateTrend(snapshots, 'USED', 30)
      : null

    // Get recent data points for chart (last 90 days)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const recentSnapshots = snapshots
      ? snapshots.filter(
          (s) => new Date(s.timestamp) >= ninetyDaysAgo
        )
      : []

    // Group by date for chart
    const chartData = recentSnapshots.reduce((acc, snapshot) => {
      const date = new Date(snapshot.timestamp).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { date, sealed: [], used: [] }
      }
      acc[date][snapshot.condition.toLowerCase()].push(snapshot.price_cents)
      return acc
    }, {} as Record<string, { date: string; sealed: number[]; used: number[] }>)

    const chartSeries = Object.values(chartData)
      .map((day) => ({
        date: day.date,
        sealed: day.sealed.length > 0 ? day.sealed.reduce((a, b) => a + b, 0) / day.sealed.length : null,
        used: day.used.length > 0 ? day.used.reduce((a, b) => a + b, 0) / day.used.length : null,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      set,
      pricing: {
        sealed: sealedEstimate,
        used: usedEstimate,
        trends: {
          sealed: {
            '7d': sealedTrend7d,
            '30d': sealedTrend30d,
          },
          used: {
            '7d': usedTrend7d,
            '30d': usedTrend30d,
          },
        },
        chartData: chartSeries,
        recentSnapshots: recentSnapshots.slice(0, 10), // Last 10 for recent data table
      },
    })
  } catch (error) {
    console.error('Error fetching set details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch set details', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

