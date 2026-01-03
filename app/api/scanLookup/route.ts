import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCatalogProvider } from '@/lib/providers'

const catalogProvider = getCatalogProvider()

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const gtin = searchParams.get('gtin')

  if (!gtin || gtin.trim().length === 0) {
    return NextResponse.json({ error: 'Query parameter "gtin" is required' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    // Clean the GTIN (remove spaces, ensure it's numeric)
    const cleanGtin = gtin.replace(/\s+/g, '').trim()

    // First, check database for existing mapping (try both original and cleaned)
    const { data: identifier } = await supabase
      .from('set_identifiers')
      .select('set_id, sets(*)')
      .or(`identifier_value.eq.${gtin},identifier_value.eq.${cleanGtin}`)
      .maybeSingle()

    if (identifier && identifier.sets) {
      return NextResponse.json({ set: identifier.sets })
    }

    // If not found, try provider lookup
    const setMetadata = await catalogProvider.getSetByGTIN(cleanGtin)
    
    // If still not found with cleaned GTIN, try original
    const finalMetadata = setMetadata || await catalogProvider.getSetByGTIN(gtin)

    if (!finalMetadata) {
      return NextResponse.json({ 
        error: 'Set not found for this barcode',
        message: `No LEGO set found for barcode: ${cleanGtin}. Try searching manually or check if the barcode is correct.`
      }, { status: 404 })
    }

    // Upsert set into database
    const { data: setData, error: setError } = await supabase
      .from('sets')
      .upsert(
        {
          set_number: finalMetadata.setNumber,
          name: finalMetadata.name,
          theme: finalMetadata.theme || null,
          year: finalMetadata.year || null,
          piece_count: finalMetadata.pieceCount || null,
          msrp_cents: finalMetadata.msrpCents || null,
          image_url: finalMetadata.imageUrl || null,
          retired: finalMetadata.retired || false,
          brickset_id: finalMetadata.bricksetId || null,
          bricklink_id: finalMetadata.bricklinkId || null,
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

    // Save GTIN mapping (use cleaned GTIN and original)
    const gtinToSave = finalMetadata.gtin || cleanGtin
    if (gtinToSave) {
      // Save both cleaned and original if different
      const identifiers = [gtinToSave]
      if (gtin !== cleanGtin && gtin !== gtinToSave) {
        identifiers.push(gtin)
      }

      for (const identifierValue of identifiers) {
        await supabase.from('set_identifiers').upsert(
          {
            set_id: setData.id,
            identifier_type: 'GTIN',
            identifier_value: identifierValue,
            source: 'BRICKSET',
          },
          {
            onConflict: 'identifier_value',
          }
        )
      }
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

