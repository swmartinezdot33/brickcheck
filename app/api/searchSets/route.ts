import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MockCatalogProvider } from '@/lib/providers/mock'

const catalogProvider = new MockCatalogProvider()

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
  }

  try {
    // Search using mock provider (will be replaced with Brickset in Milestone D)
    const results = await catalogProvider.searchSets(query)

    // Upsert sets into database
    const supabase = await createClient()
    const setsToInsert = results.map((set) => ({
      set_number: set.setNumber,
      name: set.name,
      theme: set.theme || null,
      year: set.year || null,
      piece_count: set.pieceCount || null,
      msrp_cents: set.msrpCents || null,
      image_url: set.imageUrl || null,
      retired: set.retired || false,
      brickset_id: set.bricksetId || null,
      bricklink_id: set.bricklinkId || null,
    }))

    // Upsert sets
    if (setsToInsert.length > 0) {
      const { error } = await supabase.from('sets').upsert(setsToInsert, {
        onConflict: 'set_number',
        ignoreDuplicates: false,
      })

      if (error) {
        console.error('Error upserting sets:', error)
      }

      // Upsert GTINs if available
      for (const set of results) {
        if (set.gtin) {
          const { data: setData } = await supabase
            .from('sets')
            .select('id')
            .eq('set_number', set.setNumber)
            .single()

          if (setData) {
            await supabase.from('set_identifiers').upsert(
              {
                set_id: setData.id,
                identifier_type: 'GTIN',
                identifier_value: set.gtin,
                source: 'BRICKSET',
              },
              {
                onConflict: 'identifier_value',
                ignoreDuplicates: false,
              }
            )
          }
        }
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error searching sets:', error)
    return NextResponse.json(
      { error: 'Failed to search sets', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

