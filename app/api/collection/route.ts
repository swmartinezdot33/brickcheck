import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { getCatalogProvider } from '@/lib/providers'

const collectionItemSchema = z.object({
  set_id: z.string().uuid(),
  collection_id: z.string().uuid().optional().nullable(),
  condition: z.enum(['SEALED', 'USED']),
  condition_grade: z.string().optional().nullable(),
  quantity: z.number().int().positive().default(1),
  acquisition_cost_cents: z.number().int().nonnegative().optional().nullable(), // Allow 0
  acquisition_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

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

    let query = supabase
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

    if (collectionId) {
      query = query.eq('collection_id', collectionId)
    }

    const { data, error } = await query

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

    // Validates the incoming body, but allows set_id to be a temporary string initially
    const rawBody = await request.json();
    
    // Manual validation for set_id since Zod schema expects UUID
    let setId = rawBody.set_id;
    
    if (setId && setId.startsWith('temp-')) {
      const setNumber = setId.replace('temp-', '')
      
      // 1. Try to find in DB
      const { data: dbSet, error: dbError } = await supabase
        .from('sets')
        .select('id')
        .eq('set_number', setNumber)
        .maybeSingle()
      
      if (dbSet) {
        setId = dbSet.id
      } else {
        // 2. If not in DB, fetch from Provider and Upsert
        console.log(`[collection/post] Set ${setNumber} not found in DB, fetching from provider...`)
        try {
          const catalogProvider = getCatalogProvider()
          const metadata = await catalogProvider.getSetByNumber(setNumber)
          
          if (metadata) {
             const { data: newSet, error: upsertError } = await supabase
              .from('sets')
              .upsert({
                set_number: metadata.setNumber,
                name: metadata.name,
                theme: metadata.theme || null,
                year: metadata.year || null,
                piece_count: metadata.pieceCount || null,
                msrp_cents: metadata.msrpCents || null,
                image_url: metadata.imageUrl || null,
                retired: metadata.retired || false,
                brickset_id: metadata.bricksetId || null,
                bricklink_id: metadata.bricklinkId || null,
              }, { onConflict: 'set_number' })
              .select('id')
              .single()

             if (newSet && !upsertError) {
                setId = newSet.id
             } else {
                 console.error('[collection/post] Failed to upsert set:', upsertError)
             }
          }
        } catch (e) {
          console.error('[collection/post] Provider lookup failed:', e)
        }
      }
      
      // If we still don't have a valid ID (lookup failed), return 404
      if (!setId || setId.startsWith('temp-')) {
         return NextResponse.json(
          { error: `Set with number ${setNumber} not found in database. The set may need to be saved first. Please try searching for the set again to ensure it's saved.` },
          { status: 404 }
        )
      }
    }

    // Now validate with Zod, using the resolved UUID
    const bodyToValidate = { ...rawBody, set_id: setId };
    const validated = collectionItemSchema.parse(bodyToValidate)

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
      console.error('Zod validation error:', JSON.stringify(error.issues, null, 2))
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
    }
    console.error('Error creating collection item:', error)
    return NextResponse.json(
      { error: 'Failed to create collection item', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
