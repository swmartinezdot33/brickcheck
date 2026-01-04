import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPriceProvider } from '@/lib/providers'

/**
 * Bulk refresh prices for ALL sets in the database
 * This endpoint can be called manually or via cron to populate price data
 */
export async function POST(request: NextRequest) {
  try {
    // Verify request is from Vercel Cron or has proper auth
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.VERCEL_CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow in development, but require auth in production
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const supabase = await createClient()

    // Get ALL sets from database
    const { data: allSets, error: setsError } = await supabase
      .from('sets')
      .select('id, set_number')
      .order('set_number', { ascending: true })

    if (setsError) {
      return NextResponse.json({ error: 'Failed to fetch sets', details: setsError.message }, { status: 500 })
    }

    if (!allSets || allSets.length === 0) {
      return NextResponse.json({ message: 'No sets found in database', refreshed: 0 })
    }

    // Get price provider
    let priceProvider
    try {
      priceProvider = getPriceProvider()
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Price API not configured',
          message: error instanceof Error ? error.message : 'No price API configured. Please configure BRICKECONOMY_API_KEY or BrickLink credentials.',
        },
        { status: 503 }
      )
    }

    // Determine source(s)
    const sources: string[] = []
    if (process.env.BRICKECONOMY_API_KEY) sources.push('BRICKECONOMY')
    if (
      process.env.BRICKLINK_CONSUMER_KEY &&
      process.env.BRICKLINK_CONSUMER_SECRET &&
      process.env.BRICKLINK_TOKEN &&
      process.env.BRICKLINK_TOKEN_SECRET
    ) {
      sources.push('BRICKLINK')
    }
    const source = sources.join('+') || 'UNKNOWN'

    let refreshed = 0
    let errors = 0
    let skipped = 0
    const batchSize = 10 // Process in batches to avoid overwhelming APIs

    console.log(`[refresh-all-prices] Starting bulk refresh for ${allSets.length} sets...`)

    // Process sets in batches
    for (let i = 0; i < allSets.length; i += batchSize) {
      const batch = allSets.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(async (set) => {
          try {
            // Check if we already have recent price data (within last 24 hours)
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            
            const { data: recentSnapshots } = await supabase
              .from('price_snapshots')
              .select('id')
              .eq('set_id', set.id)
              .gte('timestamp', yesterday.toISOString())
              .limit(1)

            // Skip if we have recent data (to avoid unnecessary API calls)
            if (recentSnapshots && recentSnapshots.length > 0) {
              skipped++
              return
            }

            // Fetch prices from provider
            const sealedPrices = await priceProvider.getPrices(set.set_number, 'SEALED')
            const usedPrices = await priceProvider.getPrices(set.set_number, 'USED')

            // Store latest price snapshots
            const snapshotsToInsert = [
              ...sealedPrices.slice(-1).map((p) => ({
                set_id: set.id,
                condition: 'SEALED' as const,
                source,
                price_cents: p.priceCents,
                currency: p.currency || 'USD',
                timestamp: p.timestamp,
                sample_size: p.sampleSize,
                variance: p.variance,
                metadata: p.metadata,
              })),
              ...usedPrices.slice(-1).map((p) => ({
                set_id: set.id,
                condition: 'USED' as const,
                source,
                price_cents: p.priceCents,
                currency: p.currency || 'USD',
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
                console.error(`Error inserting prices for set ${set.set_number}:`, insertError)
                errors++
              } else {
                refreshed++
                if (refreshed % 50 === 0) {
                  console.log(`[refresh-all-prices] Progress: ${refreshed}/${allSets.length} sets refreshed...`)
                }
              }
            } else {
              // No prices found for this set
              skipped++
            }

            // Small delay to respect rate limits
            await new Promise((resolve) => setTimeout(resolve, 100))
          } catch (error) {
            console.error(`Error refreshing prices for set ${set.set_number}:`, error)
            errors++
          }
        })
      )

      // Delay between batches to respect rate limits
      if (i + batchSize < allSets.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    console.log(`[refresh-all-prices] Complete: ${refreshed} refreshed, ${skipped} skipped, ${errors} errors`)

    return NextResponse.json({
      success: true,
      refreshed,
      skipped,
      errors,
      total: allSets.length,
      source,
    })
  } catch (error) {
    console.error('Error in bulk price refresh:', error)
    return NextResponse.json(
      {
        error: 'Failed to refresh prices',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}


