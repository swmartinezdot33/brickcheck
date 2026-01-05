import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Create an unauthenticated Supabase client for public access
    // We need to use the anon key but without user context
    const supabase = await createClient()

    // First, verify the collection exists and is public
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id, name, description, user_id, created_at, updated_at')
      .eq('share_token', token)
      .eq('is_public', true)
      .single()

    if (collectionError || !collection) {
      return NextResponse.json({ error: 'Collection not found or not shared' }, { status: 404 })
    }

    // Fetch collection items with set data
    // Filter out sensitive fields: acquisition_cost_cents, acquisition_date, notes
    const { data: items, error: itemsError } = await supabase
      .from('user_collection_items')
      .select(
        `
        id,
        collection_id,
        set_id,
        condition,
        condition_grade,
        quantity,
        created_at,
        updated_at,
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
      .eq('collection_id', collection.id)
      .order('created_at', { ascending: false })

    if (itemsError) {
      console.error('Error fetching shared collection items:', itemsError)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // Return collection data without sensitive information
    return NextResponse.json({
      collection: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        created_at: collection.created_at,
        updated_at: collection.updated_at,
      },
      items: items || [],
      itemCount: items?.length || 0,
    })
  } catch (error) {
    console.error('Error fetching shared collection:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shared collection' },
      { status: 500 }
    )
  }
}

