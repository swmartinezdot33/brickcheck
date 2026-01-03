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
          retired
        )
      `
      )
      .eq('user_id', user.id)

    if (collectionId) {
      query = query.eq('collection_id', collectionId)
    }

    const { data: items, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get unique set IDs
    // @ts-ignore
    const setIds = Array.from(new Set(items.map((item) => item.sets.id)))

    // Fetch price snapshots for these sets (last 30 days to ensure we catch recent updates)
    // We fetch more than just the latest to potentially calculate trends if needed, 
    // but primarily we need the latest for current value.
    const { data: snapshotsData } = await supabase
      .from('price_snapshots')
      .select('*')
      .in('set_id', setIds)
      .gte('timestamp', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()) // Last 90 days
      .order('timestamp', { ascending: false })

    const snapshots = (snapshotsData || []) as PriceSnapshot[]

    // Helper to get latest price for a set/condition
    const getLatestPrice = (setId: string, condition: string): number | null => {
      const match = snapshots.find(
        (s) => s.set_id === setId && s.condition === condition
      )
      return match ? match.price_cents : null
    }

    // Helper to get price X days ago (approximate)
    const getHistoricalPrice = (setId: string, condition: string, daysAgo: number): number | null => {
      const targetDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      // Find snapshot closest to target date
      // Snapshots are ordered desc, so we look for the first one that is <= targetDate? 
      // Or just closest.
      // Simple approach: find first snapshot that is on or before the target date.
      const match = snapshots.find(
        (s) => s.set_id === setId && s.condition === condition && new Date(s.timestamp) <= targetDate
      )
      return match ? match.price_cents : null
    }

    let totalEstimatedValue = 0
    let totalEstimatedValue30DaysAgo = 0
    
    // Stats aggregators
    const distributionByTheme: Record<string, number> = {}
    const distributionByYear: Record<string, number> = {}
    
    // For CAGR
    let totalCAGRWeightedSum = 0
    let totalCAGRWeight = 0

    items?.forEach((item) => {
      const set = item.sets as any
      const latestPrice = getLatestPrice(set.id, item.condition)
      const historicalPrice = getHistoricalPrice(set.id, item.condition, 30) || latestPrice // Fallback to current if no history
      
      const itemValue = (latestPrice || 0) * item.quantity
      const itemValue30DaysAgo = (historicalPrice || 0) * item.quantity

      totalEstimatedValue += itemValue
      totalEstimatedValue30DaysAgo += itemValue30DaysAgo

      // Distribution
      if (itemValue > 0) {
        if (set.theme) {
          distributionByTheme[set.theme] = (distributionByTheme[set.theme] || 0) + itemValue
        }
        if (set.year) {
          distributionByYear[set.year] = (distributionByYear[set.year] || 0) + itemValue
        }
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

    const todayChange = 0 // Needs daily granularity snapshots for accurate daily change, skipping for now or use 24h
    // Simple 30 day change
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
      todayPercentChange: 0,
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
        .sort((a, b) => b.value - a.value)
    })
  } catch (error) {
    console.error('Error fetching collection stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collection stats', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
