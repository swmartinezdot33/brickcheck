import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

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
    // Log the token being searched for debugging
    console.log('[Share API] Looking up collection with token:', token)
    
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id, name, description, user_id, created_at, updated_at, share_token')
      .eq('share_token', token)
      .eq('is_public', true)
      .single()

    if (collectionError || !collection) {
      console.error('[Share API] Collection not found:', {
        token,
        error: collectionError?.message,
        code: collectionError?.code,
      })
      return NextResponse.json({ error: 'Collection not found or not shared' }, { status: 404 })
    }

    console.log('[Share API] Found collection:', {
      id: collection.id,
      name: collection.name,
      share_token: collection.share_token,
    })

    // Fetch the user's display name from their profile
    // Use service role client to bypass RLS since we've already verified the collection is public
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: userProfile, error: profileError } = await serviceClient
      .from('user_profiles')
      .select('display_name')
      .eq('user_id', collection.user_id)
      .single()

    if (profileError) {
      console.error('[Share API] Error fetching user profile:', profileError)
      console.error('[Share API] User ID:', collection.user_id)
      console.error('[Share API] Error code:', profileError.code)
      console.error('[Share API] Error message:', profileError.message)
    } else {
      console.log('[Share API] User profile fetched:', { 
        user_id: collection.user_id, 
        display_name: userProfile?.display_name || 'null' 
      })
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
        owner_display_name: userProfile?.display_name || null,
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

