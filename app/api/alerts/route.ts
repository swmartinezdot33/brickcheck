import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const alertSchema = z.object({
  set_id: z.string().uuid().optional().nullable(),
  alert_type: z.enum(['THRESHOLD', 'PERCENT_CHANGE']),
  condition: z.enum(['SEALED', 'USED']).optional().nullable(),
  threshold_cents: z.number().int().positive().optional().nullable(),
  percent_change: z.number().optional().nullable(),
  window_days: z.number().int().positive().default(30),
  direction: z.enum(['ABOVE', 'BELOW', 'EITHER']),
})

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('alerts')
      .select(
        `
        *,
        sets (
          id,
          set_number,
          name
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ alerts: data || [] })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = alertSchema.parse(body)

    // Validate that required fields are present based on alert type
    if (validated.alert_type === 'THRESHOLD' && !validated.threshold_cents) {
      return NextResponse.json({ error: 'threshold_cents is required for THRESHOLD alerts' }, { status: 400 })
    }
    if (validated.alert_type === 'PERCENT_CHANGE' && !validated.percent_change) {
      return NextResponse.json({ error: 'percent_change is required for PERCENT_CHANGE alerts' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        ...validated,
        user_id: user.id,
      })
      .select(
        `
        *,
        sets (
          id,
          set_number,
          name
        )
      `
      )
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ alert: data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
    }
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

