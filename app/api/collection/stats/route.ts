import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get collection items with sets
    const { data: items, error } = await supabase
      .from('user_collection_items')
      .select(
        `
        id,
        quantity,
        condition,
        acquisition_cost_cents,
        sets (
          id,
          set_number,
          name
        )
      `
      )
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate stats (placeholder - will be enhanced with real pricing in Milestone F)
    const totalSets = items?.reduce((sum, item) => sum + item.quantity, 0) || 0
    const sealedCount = items?.filter((item) => item.condition === 'SEALED').length || 0
    const usedCount = items?.filter((item) => item.condition === 'USED').length || 0
    const totalCostBasis =
      items?.reduce((sum, item) => {
        if (item.acquisition_cost_cents) {
          return sum + item.acquisition_cost_cents * item.quantity
        }
        return sum
      }, 0) || 0

    return NextResponse.json({
      totalSets,
      sealedCount,
      usedCount,
      totalCostBasis,
      totalEstimatedValue: 0, // Will be calculated in Milestone F
      todayChange: 0,
      thirtyDayChange: 0,
    })
  } catch (error) {
    console.error('Error fetching collection stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collection stats', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

