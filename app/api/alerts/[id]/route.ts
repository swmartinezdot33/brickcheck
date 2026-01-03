import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateAlertSchema = z.object({
  alert_type: z.enum(['THRESHOLD', 'PERCENT_CHANGE']).optional(),
  condition: z.enum(['SEALED', 'USED']).optional().nullable(),
  threshold_cents: z.number().int().positive().optional().nullable(),
  percent_change: z.number().optional().nullable(),
  window_days: z.number().int().positive().optional(),
  direction: z.enum(['ABOVE', 'BELOW', 'EITHER']).optional(),
  enabled: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateAlertSchema.parse(body)

    const { data, error } = await supabase
      .from('alerts')
      .update(validated)
      .eq('id', id)
      .eq('user_id', user.id)
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

    if (!data) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    return NextResponse.json({ alert: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
    }
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Failed to update alert', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase.from('alerts').delete().eq('id', id).eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

