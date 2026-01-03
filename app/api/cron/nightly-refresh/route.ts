import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculatePriceEstimate, calculateTrend } from '@/lib/pricing/engine'
import { MockPriceProvider } from '@/lib/providers/mock'

const priceProvider = new MockPriceProvider()

export async function POST(request: NextRequest) {
  try {
    // Verify request is from Vercel Cron
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.VERCEL_CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get all sets that appear in at least one user's collection
    const { data: collectionSets, error: collectionError } = await supabase
      .from('user_collection_items')
      .select('set_id, sets(id, set_number))')
      .not('set_id', 'is', null)

    if (collectionError) {
      return NextResponse.json({ error: 'Failed to fetch collection sets' }, { status: 500 })
    }

    // Get unique set IDs
    const uniqueSetIds = [...new Set(collectionSets?.map((item) => item.set_id) || [])]

    if (uniqueSetIds.length === 0) {
      return NextResponse.json({ message: 'No sets to refresh', refreshed: 0 })
    }

    let refreshed = 0
    let errors = 0

    // Refresh prices for each set
    for (const setId of uniqueSetIds) {
      try {
        // Get set details
        const { data: set } = await supabase
          .from('sets')
          .select('set_number')
          .eq('id', setId)
          .single()

        if (!set) continue

        // Fetch prices from provider
        const sealedPrices = await priceProvider.getPrices(set.set_number, 'SEALED')
        const usedPrices = await priceProvider.getPrices(set.set_number, 'USED')

        // Store latest price snapshots
        const snapshotsToInsert = [
          ...sealedPrices.slice(-1).map((p) => ({
            set_id: setId,
            condition: 'SEALED' as const,
            source: 'BRICKLINK',
            price_cents: p.priceCents,
            currency: p.currency,
            timestamp: p.timestamp,
            sample_size: p.sampleSize,
            variance: p.variance,
            metadata: p.metadata,
          })),
          ...usedPrices.slice(-1).map((p) => ({
            set_id: setId,
            condition: 'USED' as const,
            source: 'BRICKLINK',
            price_cents: p.priceCents,
            currency: p.currency,
            timestamp: p.timestamp,
            sample_size: p.sampleSize,
            variance: p.variance,
            metadata: p.metadata,
          })),
        ]

        if (snapshotsToInsert.length > 0) {
          await supabase.from('price_snapshots').insert(snapshotsToInsert)
        }

        refreshed++

        // Evaluate alerts for this set
        await evaluateAlerts(setId, supabase)
      } catch (error) {
        console.error(`Error refreshing set ${setId}:`, error)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      refreshed,
      errors,
      total: uniqueSetIds.length,
    })
  } catch (error) {
    console.error('Error in nightly refresh:', error)
    return NextResponse.json(
      { error: 'Failed to refresh prices', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function evaluateAlerts(setId: string, supabase: any) {
  // Get all enabled alerts for this set (or all sets if set_id is null)
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('enabled', true)
    .or(`set_id.eq.${setId},set_id.is.null`)

  if (!alerts || alerts.length === 0) return

  // Get price snapshots for this set
  const { data: snapshots } = await supabase
    .from('price_snapshots')
    .select('*')
    .eq('set_id', setId)
    .order('timestamp', { ascending: false })
    .limit(100)

  if (!snapshots || snapshots.length === 0) return

  // Calculate current price estimates
  const sealedEstimate = calculatePriceEstimate(snapshots, 'SEALED')
  const usedEstimate = calculatePriceEstimate(snapshots, 'USED')

  for (const alert of alerts) {
    // Skip if alert is for a specific set and it doesn't match
    if (alert.set_id && alert.set_id !== setId) continue

    // Skip if alert is for a specific condition and we don't have data for it
    if (alert.condition === 'SEALED' && !sealedEstimate) continue
    if (alert.condition === 'USED' && !usedEstimate) continue

    const estimate = alert.condition === 'USED' ? usedEstimate : sealedEstimate
    if (!estimate) continue

    let shouldTrigger = false
    let previousPrice: number | null = null
    let percentChange: number | null = null

    if (alert.alert_type === 'THRESHOLD' && alert.threshold_cents) {
      if (alert.direction === 'ABOVE' && estimate.estimatedValue >= alert.threshold_cents) {
        shouldTrigger = true
      } else if (alert.direction === 'BELOW' && estimate.estimatedValue <= alert.threshold_cents) {
        shouldTrigger = true
      } else if (alert.direction === 'EITHER') {
        // Check if crossed threshold
        const trend = calculateTrend(snapshots, alert.condition || 'SEALED', alert.window_days)
        if (trend) {
          const oldPrice = estimate.estimatedValue - trend.change
          if (
            (oldPrice < alert.threshold_cents && estimate.estimatedValue >= alert.threshold_cents) ||
            (oldPrice > alert.threshold_cents && estimate.estimatedValue <= alert.threshold_cents)
          ) {
            shouldTrigger = true
            previousPrice = Math.round(oldPrice)
          }
        }
      }
    } else if (alert.alert_type === 'PERCENT_CHANGE' && alert.percent_change) {
      const trend = calculateTrend(snapshots, alert.condition || 'SEALED', alert.window_days)
      if (trend) {
        const absPercentChange = Math.abs(trend.percentChange)
        if (absPercentChange >= alert.percent_change) {
          if (alert.direction === 'ABOVE' && trend.percentChange > 0) {
            shouldTrigger = true
            percentChange = trend.percentChange
          } else if (alert.direction === 'BELOW' && trend.percentChange < 0) {
            shouldTrigger = true
            percentChange = trend.percentChange
          } else if (alert.direction === 'EITHER') {
            shouldTrigger = true
            percentChange = trend.percentChange
          }
        }
      }
    }

    if (shouldTrigger) {
      // Check if we've already triggered this alert recently (within last 24 hours)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const { data: recentEvents } = await supabase
        .from('alert_events')
        .select('id')
        .eq('alert_id', alert.id)
        .eq('set_id', setId)
        .gte('triggered_at', yesterday.toISOString())
        .limit(1)

      if (recentEvents && recentEvents.length > 0) {
        continue // Already triggered recently
      }

      // Create alert event
      await supabase.from('alert_events').insert({
        alert_id: alert.id,
        set_id: setId,
        triggered_at: new Date().toISOString(),
        price_cents: estimate.estimatedValue,
        previous_price_cents: previousPrice,
        percent_change: percentChange,
        notification_sent: false,
      })
    }
  }
}

