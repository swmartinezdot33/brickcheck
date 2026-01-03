import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCatalogProvider } from '@/lib/providers'

const catalogProvider = getCatalogProvider()

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

    // Upsert sets and get back the database records
    let dbSets: any[] = []
    if (setsToInsert.length > 0) {
      const { data: upsertedSets, error } = await supabase
        .from('sets')
        .upsert(setsToInsert, {
          onConflict: 'set_number',
          ignoreDuplicates: false,
        })
        .select()

      if (error) {
        console.error('Error upserting sets:', error)
        // If upsert fails, try to fetch existing sets
        const setNumbers = setsToInsert.map((s) => s.set_number)
        const { data: existingSets } = await supabase
          .from('sets')
          .select('*')
          .in('set_number', setNumbers)
        dbSets = existingSets || []
      } else {
        dbSets = upsertedSets || []
      }

      // Upsert GTINs if available
      for (const set of results) {
        if (set.gtin) {
          const setData = dbSets.find((s) => s.set_number === set.setNumber)
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

    // Return database records (with IDs) instead of mock data
    return NextResponse.json({ results: dbSets })
  } catch (error) {
    console.error('Error searching sets:', error)
    return NextResponse.json(
      { error: 'Failed to search sets', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

