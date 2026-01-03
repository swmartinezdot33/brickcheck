import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const collectionItemSchema = z.object({
  set_id: z.string().uuid(),
  condition: z.enum(['SEALED', 'USED']),
  condition_grade: z.string().optional().nullable(),
  quantity: z.number().int().positive().default(1),
  acquisition_cost_cents: z.number().int().positive().optional().nullable(),
  acquisition_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
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
      .from('user_collection_items')
      .select(
        `
        *,
        sets (
          id,
          set_number,
          name,
          theme,
          year,
          piece_count,
          msrp_cents,
          image_url,
          retired
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ items: data || [] })
  } catch (error) {
    console.error('Error fetching collection:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collection', message: error instanceof Error ? error.message : 'Unknown error' },
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
    const validated = collectionItemSchema.parse(body)

    const { data, error } = await supabase
      .from('user_collection_items')
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
          name,
          theme,
          year,
          piece_count,
          msrp_cents,
          image_url,
          retired
        )
      `
      )
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item: data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
    }
    console.error('Error creating collection item:', error)
    return NextResponse.json(
      { error: 'Failed to create collection item', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

