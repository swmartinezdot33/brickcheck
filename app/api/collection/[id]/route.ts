import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateCollectionItemSchema = z.object({
  condition: z.enum(['SEALED', 'USED']).optional(),
  condition_grade: z.string().optional().nullable(),
  quantity: z.number().int().positive().optional(),
  acquisition_cost_cents: z.number().int().positive().optional().nullable(),
  acquisition_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
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
    const validated = updateCollectionItemSchema.parse(body)

    const { data, error } = await supabase
      .from('user_collection_items')
      .update(validated)
      .eq('id', id)
      .eq('user_id', user.id)
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

    if (!data) {
      return NextResponse.json({ error: 'Collection item not found' }, { status: 404 })
    }

    return NextResponse.json({ item: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Error updating collection item:', error)
    return NextResponse.json(
      { error: 'Failed to update collection item', message: error instanceof Error ? error.message : 'Unknown error' },
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

    const { error } = await supabase
      .from('user_collection_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting collection item:', error)
    return NextResponse.json(
      { error: 'Failed to delete collection item', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

