import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculatePriceEstimate, calculateTrend } from '@/lib/pricing/engine'
import { getCatalogProvider } from '@/lib/providers'
import { getPriceProvider } from '@/lib/providers'

// Helper to check if string is a valid UUID
function isUUID(str: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const { setId } = await params
    const supabase = await createClient()

    let set = null
    let realSetId = null

    // 1. Resolve the Set
    // ----------------------------------------------------------------
    if (isUUID(setId)) {
      // It's a real database ID
      const { data, error } = await supabase
        .from('sets')
        .select('*')
        .eq('id', setId)
        .single()
      
      if (!error && data) {
        set = data
        realSetId = data.id
      }
    } else {
      // It's a "temp-12345" ID or just a set number "12345"
      const setNumber = setId.startsWith('temp-') ? setId.replace('temp-', '') : setId
      
      // A. Try to find by set_number in DB first
      const { data: dbSet, error: dbError } = await supabase
        .from('sets')
        .select('*')
        .eq('set_number', setNumber)
        .maybeSingle()

      if (dbSet) {
        set = dbSet
        realSetId = dbSet.id
      } else {
        // B. If not in DB, fetch from Catalog Provider and UPSERT
        console.log(`[set/id] Set ${setNumber} not found in DB, fetching from provider...`)
        try {
          const catalogProvider = getCatalogProvider()
          const metadata = await catalogProvider.getSetByNumber(setNumber)
          
          if (metadata) {
            // Upsert into DB
             const { data: newSet, error: upsertError } = await supabase
              .from('sets')
              .upsert({
                set_number: metadata.setNumber,
                name: metadata.name,
                theme: metadata.theme || null,
                year: metadata.year || null,
                piece_count: metadata.pieceCount || null,
                msrp_cents: metadata.msrpCents || null,
                image_url: metadata.imageUrl || null,
                retired: metadata.retired || false,
                brickset_id: metadata.bricksetId || null,
                bricklink_id: metadata.bricklinkId || null,
              }, { onConflict: 'set_number' })
              .select()
              .single()

             if (newSet && !upsertError) {
                set = newSet
                realSetId = newSet.id
             } else {
                 console.error('[set/id] Failed to upsert set:', upsertError)
             }
          }
        } catch (e) {
          console.error('[set/id] Provider lookup failed:', e)
        }
      }
    }

    if (!set || !realSetId) {
      return NextResponse.json({ error: 'Set not found' }, { status: 404 })
    }

    // 2. Fetch/Refresh Pricing
    // ----------------------------------------------------------------
    
    // Check if we need to refresh prices (if no snapshots or old data)
    // For MVP, let's just trigger a background refresh if data is older than 24h
    // or just fetch what we have for now to be fast.
    
    const { data: snapshots, error: snapshotsError } = await supabase
      .from('price_snapshots')
      .select('*')
      .eq('set_id', realSetId)
      .order('timestamp', { ascending: false })
      .limit(1000)

    if (snapshotsError) {
      console.error('Error fetching snapshots:', snapshotsError)
    }

    // OPTIONAL: If no price data exists, try to fetch it now (on-demand)
    // This improves the user experience for new sets
    let updatedSnapshots = snapshots || []
    if (updatedSnapshots.length === 0) {
        try {
            console.log(`[set/id] No price data for ${set.set_number}, fetching...`)
            const priceProvider = getPriceProvider()
            // Run refresh in background (don't await) or await if we want to show it immediately
            // Awaiting for better UX on first load
            const prices = await priceProvider.refreshPrices(set.set_number)
            
            if (prices.length > 0) {
                const { data: newSnapshots } = await supabase
                    .from('price_snapshots')
                    .insert(prices.map(p => ({
                        set_id: realSetId,
                        condition: p.condition,
                        source: p.metadata?.source || 'BRICKLINK', // Default or from metadata
                        price_cents: p.priceCents,
                        timestamp: p.timestamp,
                        sample_size: p.sampleSize,
                        variance: p.variance,
                        metadata: p.metadata
                    })))
                    .select()
                
                if (newSnapshots) {
                    updatedSnapshots = newSnapshots
                }
            }
        } catch (e) {
            console.error('[set/id] Price refresh failed:', e)
        }
    }

    // 3. Calculate Analytics
    // ----------------------------------------------------------------
    
    // Calculate price estimates
    const sealedEstimate = updatedSnapshots
      ? calculatePriceEstimate(updatedSnapshots, 'SEALED')
      : null
    const usedEstimate = updatedSnapshots
      ? calculatePriceEstimate(updatedSnapshots, 'USED')
      : null

    // Calculate trends
    const sealedTrend7d = updatedSnapshots
      ? calculateTrend(updatedSnapshots, 'SEALED', 7)
      : null
    const sealedTrend30d = updatedSnapshots
      ? calculateTrend(updatedSnapshots, 'SEALED', 30)
      : null
    const usedTrend7d = updatedSnapshots
      ? calculateTrend(updatedSnapshots, 'USED', 7)
      : null
    const usedTrend30d = updatedSnapshots
      ? calculateTrend(updatedSnapshots, 'USED', 30)
      : null

    // Get recent data points for chart (last 90 days)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const recentSnapshots = updatedSnapshots
      ? updatedSnapshots.filter(
          (s) => new Date(s.timestamp) >= ninetyDaysAgo
        )
      : []

    // Group by date for chart
    const chartData = recentSnapshots.reduce((acc, snapshot) => {
      const date = new Date(snapshot.timestamp).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { date, sealed: [], used: [] }
      }
      acc[date][snapshot.condition.toLowerCase() as 'sealed' | 'used'].push(snapshot.price_cents)
      return acc
    }, {} as Record<string, { date: string; sealed: number[]; used: number[] }>)

    const chartSeries = (Object.values(chartData) as Array<{ date: string; sealed: number[]; used: number[] }>)
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
        recentSnapshots: updatedSnapshots ? updatedSnapshots.slice(0, 50) : [], 
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
