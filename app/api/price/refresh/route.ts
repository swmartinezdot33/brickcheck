import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MockPriceProvider } from '@/lib/providers/mock'

const priceProvider = new MockPriceProvider()

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const setId = searchParams.get('setId')

    if (!setId) {
      return NextResponse.json({ error: 'Query parameter "setId" is required' }, { status: 400 })
    }

    // Verify request is from cron or has proper auth
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.VERCEL_CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // For now, allow without auth in development
      // In production, require proper authentication
    }

    const supabase = await createClient()

    // Get set details
    const { data: set, error: setError } = await supabase
      .from('sets')
      .select('set_number')
      .eq('id', setId)
      .single()

    if (setError || !set) {
      return NextResponse.json({ error: 'Set not found' }, { status: 404 })
    }

    // Fetch prices from provider (mock for now, will be BrickLink in Milestone E)
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
      const { error: insertError } = await supabase
        .from('price_snapshots')
        .insert(snapshotsToInsert)

      if (insertError) {
        console.error('Error inserting price snapshots:', insertError)
        return NextResponse.json({ error: 'Failed to save price data' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      snapshotsAdded: snapshotsToInsert.length,
    })
  } catch (error) {
    console.error('Error refreshing prices:', error)
    return NextResponse.json(
      { error: 'Failed to refresh prices', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

