import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PriceSnapshot } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const collectionId = searchParams.get('collectionId')

    // Get collection items with sets
    let query = supabase
      .from('user_collection_items')
      .select(
        `
        id,
        quantity,
        condition,
        acquisition_cost_cents,
        acquisition_date,
        created_at,
        sets (
          id,
          set_number,
          name,
          theme,
          year,
          retired,
          msrp_cents
        )
      `
      )
      .eq('user_id', user.id)

    if (collectionId) {
      query = query.eq('collection_id', collectionId)
    }

    const { data: items, error } = await query

    if (error) {
      console.error('[Stats] Error fetching items:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Handle empty collections
    if (!items || items.length === 0) {
      return NextResponse.json({
        totalSets: 0,
        sealedCount: 0,
        usedCount: 0,
        retiredCount: 0,
        totalCostBasis: 0,
        totalEstimatedValue: 0,
        todayChange: 0,
        todayPercentChange: 0,
        thirtyDayChange: 0,
        thirtyDayPercentChange: 0,
        totalGain: 0,
        totalGainPercent: 0,
        portfolioCAGR: 0,
        distributionByTheme: [],
        distributionByYear: [],
        topGainers: [],
        topLosers: [],
      })
    }

    // Get unique set IDs, filtering out null sets
    // Note: Supabase returns sets as an object (not array) when using relational select
    const setIds = Array.from(
      new Set(
        items
          .map((item: any) => {
            const sets = item.sets as any
            return sets?.id
          })
          .filter((id: any): id is string => id !== null && id !== undefined)
      )
    )

    // Handle case where no valid set IDs found
    if (setIds.length === 0) {
      return NextResponse.json({
        totalSets: items.reduce((sum, item) => sum + item.quantity, 0),
        sealedCount: items.filter((item) => item.condition === 'SEALED').length,
        usedCount: items.filter((item) => item.condition === 'USED').length,
        retiredCount: items.filter((item) => {
          const sets = item.sets as any
          return sets?.retired === true
        }).length,
        totalCostBasis: items.reduce((sum, item) => {
          if (item.acquisition_cost_cents) {
            return sum + item.acquisition_cost_cents * item.quantity
          }
          return sum
        }, 0),
        totalEstimatedValue: 0,
        todayChange: 0,
        todayPercentChange: 0,
        thirtyDayChange: 0,
        thirtyDayPercentChange: 0,
        totalGain: 0,
        totalGainPercent: 0,
        portfolioCAGR: 0,
        distributionByTheme: [],
        distributionByYear: [],
        topGainers: [],
        topLosers: [],
      })
    }

    // Fetch price snapshots for these sets (last 90 days for historical comparison)
    const { data: snapshotsData, error: snapshotsError } = await supabase
      .from('price_snapshots')
      .select('*')
      .in('set_id', setIds)
      .gte('timestamp', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })

    if (snapshotsError) {
      console.error('[Stats] Error fetching price snapshots:', snapshotsError)
      // Continue with empty snapshots - prices will be null
    }

    const snapshots = (snapshotsData || []) as PriceSnapshot[]

    console.log(`[Stats] User: ${user.id}, Collection ID: ${collectionId || 'all'}`)
    console.log(`[Stats] Found ${items?.length || 0} items, ${snapshots.length} price snapshots`)
    console.log(`[Stats] Set IDs: ${setIds.slice(0, 5).join(', ')}${setIds.length > 5 ? '...' : ''} (${setIds.length} total)`)
    
    // Count items with/without price data for debugging
    let itemsWithSnapshots = 0
    let itemsUsingMSRP = 0
    let itemsWithNoPrice = 0

    // Helper to get latest price for a set/condition
    // Falls back to MSRP if no price snapshot exists
    const getLatestPrice = (setId: string, condition: string, msrpCents?: number | null): number | null => {
      // Filter snapshots for this set and condition, then find the most recent
      const relevantSnapshots = snapshots.filter(
        (s) => s.set_id === setId && s.condition === condition
      )
      if (relevantSnapshots.length > 0) {
        // Snapshots are already ordered by timestamp desc, so first one is latest
        return relevantSnapshots[0]?.price_cents || null
      }
      // Fallback to MSRP if no price snapshot (use MSRP for SEALED, estimate 60% for USED)
      if (msrpCents && msrpCents > 0) {
        if (condition === 'SEALED') {
          return msrpCents
        } else if (condition === 'USED') {
          // Estimate used price at 60% of MSRP
          return Math.round(msrpCents * 0.6)
        }
      }
      return null
    }

    // Helper to get price X days ago (approximate)
    // Falls back to latest price or MSRP if no historical snapshot exists
    const getHistoricalPrice = (setId: string, condition: string, daysAgo: number, msrpCents?: number | null): number | null => {
      const targetDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      
      // Filter snapshots for this set and condition
      const relevantSnapshots = snapshots.filter(
        (s) => s.set_id === setId && s.condition === condition
      )
      
      if (relevantSnapshots.length === 0) {
        // No snapshots at all - fall back to latest price (which may use MSRP)
        return getLatestPrice(setId, condition, msrpCents)
      }
      
      // Find snapshot closest to target date (on or before)
      // Snapshots are ordered desc, so we look for the first one that is <= targetDate
      const match = relevantSnapshots.find(
        (s) => new Date(s.timestamp) <= targetDate
      )
      
      // If no snapshot on/before target date, use the oldest one we have
      const historicalPrice = match ? match.price_cents : relevantSnapshots[relevantSnapshots.length - 1]?.price_cents || null
      
      // If we found a historical price, return it
      if (historicalPrice) {
        return historicalPrice
      }
      
      // Otherwise, fall back to latest price (which may use MSRP)
      return getLatestPrice(setId, condition, msrpCents)
    }

    // Helper to get price 1 day ago for today's change
    const getYesterdayPrice = (setId: string, condition: string, msrpCents?: number | null): number | null => {
      return getHistoricalPrice(setId, condition, 1, msrpCents)
    }

    let totalEstimatedValue = 0
    let totalEstimatedValue30DaysAgo = 0
    let totalEstimatedValueYesterday = 0
    
    // Stats aggregators
    const distributionByTheme: Record<string, number> = {}
    const distributionByYear: Record<string, number> = {}
    
    // For CAGR and biggest movers
    let totalCAGRWeightedSum = 0
    let totalCAGRWeight = 0
    const moversData: Array<{
      setId: string
      setNumber: string
      setName: string
      condition: string
      quantity: number
      currentPrice: number
      priceMonth30DaysAgo: number
      change: number
      percentChange: number
      imageUrl?: string
    }> = []

    items?.forEach((item: any) => {
      // Skip items without valid sets
      // Supabase returns sets as an object (not array) when using relational select
      const sets = item.sets as any
      if (!sets || !sets.id) {
        return
      }

      const set = sets
      const hasSnapshot = snapshots.some(
        (s) => s.set_id === set.id && s.condition === item.condition
      )
      
      if (hasSnapshot) itemsWithSnapshots++
      else if (set.msrp_cents && set.msrp_cents > 0) itemsUsingMSRP++
      else itemsWithNoPrice++
      
      const latestPrice = getLatestPrice(set.id, item.condition, set.msrp_cents)
      const historicalPrice = getHistoricalPrice(set.id, item.condition, 30, set.msrp_cents)
      const yesterdayPrice = getYesterdayPrice(set.id, item.condition, set.msrp_cents)
      
      // Log detailed price information for debugging
      if (items.length <= 10) { // Only log for small collections to avoid spam
        console.log(`[Stats] Set ${set.set_number} (${item.condition}): latest=${latestPrice}, 30d=${historicalPrice}, yesterday=${yesterdayPrice}, msrp=${set.msrp_cents}, hasSnapshot=${hasSnapshot}, qty=${item.quantity}`)
      }
      
      const itemValue = (latestPrice || 0) * item.quantity
      const itemValue30DaysAgo = (historicalPrice || 0) * item.quantity
      const itemValueYesterday = (yesterdayPrice || 0) * item.quantity
      
      // Log if we're getting zero values unexpectedly
      if (itemValue === 0 && (set.msrp_cents || hasSnapshot)) {
        console.warn(`[Stats] WARNING: Item ${set.set_number} has zero value but has price data. latestPrice=${latestPrice}, msrp=${set.msrp_cents}, hasSnapshot=${hasSnapshot}`)
      }

      totalEstimatedValue += itemValue
      totalEstimatedValue30DaysAgo += itemValue30DaysAgo
      totalEstimatedValueYesterday += itemValueYesterday

      // Distribution should include items even if using MSRP fallback
      // Only exclude if truly no price data at all
      if (itemValue > 0) {
        if (set.theme) {
          distributionByTheme[set.theme] = (distributionByTheme[set.theme] || 0) + itemValue
        }
        if (set.year) {
          distributionByYear[set.year] = (distributionByYear[set.year] || 0) + itemValue
        }
      }

      // Calculate price change for movers
      // Only include if we have both current and historical prices from snapshots (not MSRP fallback)
      // Check if we have actual snapshot data, not just MSRP fallback
      const hasHistoricalSnapshot = snapshots.some(
        (s) => s.set_id === set.id && s.condition === item.condition && new Date(s.timestamp) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )
      const hasCurrentSnapshot = snapshots.some(
        (s) => s.set_id === set.id && s.condition === item.condition
      )
      
      if (hasCurrentSnapshot && hasHistoricalSnapshot && latestPrice && historicalPrice && latestPrice > 0) {
        const priceChange = latestPrice - historicalPrice
        const pricePercentChange = (priceChange / historicalPrice) * 100
        
        moversData.push({
          setId: set.id,
          setNumber: set.set_number,
          setName: set.name,
          condition: item.condition,
          quantity: item.quantity,
          currentPrice: latestPrice,
          priceMonth30DaysAgo: historicalPrice,
          change: priceChange,
          percentChange: pricePercentChange,
        })
      }

      // CAGR Calculation
      // Formula: (Current Value / Cost) ^ (1 / Years) - 1
      if (item.acquisition_cost_cents && item.acquisition_cost_cents > 0 && latestPrice && latestPrice > 0) {
        const acquisitionDate = item.acquisition_date ? new Date(item.acquisition_date) : new Date(item.created_at)
        const daysHeld = (Date.now() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24)
        const yearsHeld = daysHeld / 365.25
        
        if (yearsHeld > 0.1) { // Only calculate if held for at least ~1 month to avoid wild swings
           const gainRatio = latestPrice / item.acquisition_cost_cents
           const cagr = Math.pow(gainRatio, 1 / yearsHeld) - 1
           
           // Weight by current value
           totalCAGRWeightedSum += cagr * itemValue
           totalCAGRWeight += itemValue
        }
      }
    })

    console.log(`[Stats] Price data: ${itemsWithSnapshots} with snapshots, ${itemsUsingMSRP} using MSRP, ${itemsWithNoPrice} with no price`)
    console.log(`[Stats] Total estimated value: ${totalEstimatedValue}, 30d ago: ${totalEstimatedValue30DaysAgo}, yesterday: ${totalEstimatedValueYesterday}`)
    console.log(`[Stats] Distribution themes: ${Object.keys(distributionByTheme).length}, years: ${Object.keys(distributionByYear).length}`)
    console.log(`[Stats] Movers: ${moversData.length} items with price changes`)

    // Get biggest movers - top 5 gainers and top 5 losers
    const sortedByChange = [...moversData].sort((a, b) => b.change - a.change)
    const topGainers = sortedByChange.slice(0, 5)
    const topLosers = sortedByChange.slice(-5).reverse()
    
    // Fetch set images for movers
    const moverSetIds = [...topGainers, ...topLosers].map(m => m.setId)
    const uniqueMoverSetIds = Array.from(new Set(moverSetIds))
    
    let setImages: Record<string, string> = {}
    if (uniqueMoverSetIds.length > 0) {
      const { data: setData } = await supabase
        .from('sets')
        .select('id, image_url')
        .in('id', uniqueMoverSetIds)
      
      if (setData) {
        setData.forEach((s: any) => {
          setImages[s.id] = s.image_url
        })
      }
    }
    
    // Add images to movers
    const gainersList = topGainers.map(m => ({
      ...m,
      imageUrl: setImages[m.setId] || undefined
    }))
    const losersList = topLosers.map(m => ({
      ...m,
      imageUrl: setImages[m.setId] || undefined
    }))

    // Calculate aggregate stats
    const totalSets = items?.reduce((sum, item) => sum + item.quantity, 0) || 0
    const sealedCount = items?.filter((item) => item.condition === 'SEALED').length || 0
    const usedCount = items?.filter((item) => item.condition === 'USED').length || 0
    const retiredCount = items?.filter((item) => {
      const sets = item.sets as any
      return sets?.retired === true
    }).length || 0
    
    const totalCostBasis =
      items?.reduce((sum, item) => {
        if (item.acquisition_cost_cents) {
          return sum + item.acquisition_cost_cents * item.quantity
        }
        return sum
      }, 0) || 0

    console.log(`[Stats] Total cost basis: ${totalCostBasis}, Total gain: ${totalEstimatedValue - totalCostBasis}`)

    // Calculate today's change (compared to yesterday)
    const todayChange = totalEstimatedValue - totalEstimatedValueYesterday
    const todayPercentChange = totalEstimatedValueYesterday > 0 
      ? (todayChange / totalEstimatedValueYesterday) * 100 
      : 0
    
    // Calculate 30 day change
    const thirtyDayChange = totalEstimatedValue - totalEstimatedValue30DaysAgo
    const thirtyDayPercentChange = totalEstimatedValue30DaysAgo > 0 
      ? (thirtyDayChange / totalEstimatedValue30DaysAgo) * 100 
      : 0

    // Portfolio CAGR
    const portfolioCAGR = totalCAGRWeight > 0 ? (totalCAGRWeightedSum / totalCAGRWeight) * 100 : 0
    
    // Absolute Gain
    const totalGain = totalEstimatedValue - totalCostBasis
    const totalGainPercent = totalCostBasis > 0 ? (totalGain / totalCostBasis) * 100 : 0

    return NextResponse.json({
      totalSets,
      sealedCount,
      usedCount,
      retiredCount,
      totalCostBasis,
      totalEstimatedValue,
      todayChange,
      todayPercentChange,
      thirtyDayChange,
      thirtyDayPercentChange,
      totalGain,
      totalGainPercent,
      portfolioCAGR,
      distributionByTheme: Object.entries(distributionByTheme)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10), // Top 10 themes
      distributionByYear: Object.entries(distributionByYear)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      topGainers: gainersList,
      topLosers: losersList,
    })
  } catch (error) {
    console.error('Error fetching collection stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collection stats', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
