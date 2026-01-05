import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateForecast } from '@/lib/pricing/engine'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { setId } = await params
    const { searchParams } = new URL(request.url)
    const condition = (searchParams.get('condition') || 'SEALED').toUpperCase() as 'SEALED' | 'USED'

    // Fetch price history (all time or last X years)
    // For regression, more data is usually better, but recent trend is more relevant.
    // Let's fetch last 2 years.
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

    const { data: snapshots, error } = await supabase
      .from('price_snapshots')
      .select('*')
      .eq('set_id', setId)
      .eq('condition', condition)
      .gte('timestamp', twoYearsAgo.toISOString())
      .order('timestamp', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!snapshots || snapshots.length < 5) {
      return NextResponse.json({ 
        error: 'Insufficient data for forecast',
        details: 'Need at least 5 price points' 
      }, { status: 400 })
    }

    const forecast = calculateForecast(snapshots, condition)

    if (!forecast) {
      return NextResponse.json({ 
        error: 'Could not calculate forecast' 
      }, { status: 500 })
    }

    return NextResponse.json(forecast)
  } catch (error) {
    console.error('Error calculating forecast:', error)
    return NextResponse.json(
      { error: 'Failed to calculate forecast' },
      { status: 500 }
    )
  }
}




