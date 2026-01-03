import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MockCatalogProvider } from '@/lib/providers/mock'

const catalogProvider = new MockCatalogProvider()

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const gtin = searchParams.get('gtin')

  if (!gtin || gtin.trim().length === 0) {
    return NextResponse.json({ error: 'Query parameter "gtin" is required' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    // First, check database for existing mapping
    const { data: identifier } = await supabase
      .from('set_identifiers')
      .select('set_id, sets(*)')
      .eq('identifier_value', gtin)
      .single()

    if (identifier && identifier.sets) {
      return NextResponse.json({ set: identifier.sets })
    }

    // If not found, try provider lookup
    const setMetadata = await catalogProvider.getSetByGTIN(gtin)

    if (!setMetadata) {
      return NextResponse.json({ error: 'Set not found for this barcode' }, { status: 404 })
    }

    // Upsert set into database
    const { data: setData, error: setError } = await supabase
      .from('sets')
      .upsert(
        {
          set_number: setMetadata.setNumber,
          name: setMetadata.name,
          theme: setMetadata.theme || null,
          year: setMetadata.year || null,
          piece_count: setMetadata.pieceCount || null,
          msrp_cents: setMetadata.msrpCents || null,
          image_url: setMetadata.imageUrl || null,
          retired: setMetadata.retired || false,
          brickset_id: setMetadata.bricksetId || null,
          bricklink_id: setMetadata.bricklinkId || null,
        },
        {
          onConflict: 'set_number',
        }
      )
      .select()
      .single()

    if (setError || !setData) {
      return NextResponse.json({ error: 'Failed to save set' }, { status: 500 })
    }

    // Save GTIN mapping
    if (setMetadata.gtin) {
      await supabase.from('set_identifiers').upsert(
        {
          set_id: setData.id,
          identifier_type: 'GTIN',
          identifier_value: setMetadata.gtin,
          source: 'BRICKSET',
        },
        {
          onConflict: 'identifier_value',
        }
      )
    }

    return NextResponse.json({ set: setData })
  } catch (error) {
    console.error('Error looking up barcode:', error)
    return NextResponse.json(
      { error: 'Failed to lookup barcode', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

