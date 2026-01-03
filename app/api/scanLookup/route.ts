import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCatalogProvider } from '@/lib/providers'

// Helper to extract potential set number from a URL or string
function extractSetNumber(input: string): string | null {
  // Check for common LEGO URLs from QR codes
  // https://www.lego.com/bi/review?set=75192
  // https://www.lego.com/en-us/product/75192
  // https://conf.lego.com/en-us/instructions/75333
  // https://www.lego.com/r/www/r/insiders/-/insiders-claim?setNumber=75192
  // lego.com URLs with set numbers
  
  // Try to extract from URL parameters first
  const urlParamMatch = input.match(/[?&](?:set|setNumber|set_number)=([0-9]{4,7})/i)
  if (urlParamMatch && urlParamMatch[1]) {
    return urlParamMatch[1]
  }
  
  // Try to extract from URL path (e.g., /product/75192, /instructions/75333)
  const pathMatch = input.match(/\/(?:product|instructions|set)\/([0-9]{4,7})/i)
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1]
  }
  
  // Fallback: look for 4-7 digit number surrounded by non-digits
  const matches = input.match(/\b([0-9]{4,7})\b/)
  if (matches && matches[1]) {
    return matches[1]
  }
  return null
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('gtin') || searchParams.get('code') // Support both

  if (!code || code.trim().length === 0) {
    return NextResponse.json({ error: 'Query parameter "code" or "gtin" is required' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const cleanCode = code.trim() // Don't remove spaces yet, URLs need them

    let finalMetadata = null
    let lookupMethod = 'GTIN'
    let lookupValue = cleanCode.replace(/\s+/g, '') // Default for GTIN is no spaces

    // 1. Check if it's a URL or contains a Set Number
    const extractedSetNumber = extractSetNumber(cleanCode)
    
    // If it looks like a URL (QR codes from LEGO boxes contain URLs)
    const isUrl = cleanCode.toLowerCase().startsWith('http') || cleanCode.toLowerCase().startsWith('www') || cleanCode.includes('lego.com')
    const isShortNumber = /^\d{4,7}$/.test(lookupValue)
    
    // Priority for QR codes (which contain URLs):
    // 1. If URL (from QR code), extract set number and use Set Number Lookup
    // 2. If Short Number (4-7 digits), try Set Number Lookup first
    // 3. Otherwise, try GTIN Lookup (but QR codes shouldn't reach here)
    
    if (isUrl) {
        if (extractedSetNumber) {
            console.log(`[scanLookup] Detected LEGO QR code URL with set number: ${extractedSetNumber} from ${cleanCode.substring(0, 50)}...`)
            lookupMethod = 'SET_NUMBER'
            lookupValue = extractedSetNumber
        } else {
            // URL but no set number found - might be a different type of LEGO QR code
            console.log(`[scanLookup] Detected URL but no set number found: ${cleanCode.substring(0, 50)}...`)
            // Still try to lookup by the URL itself or return error
            return NextResponse.json({ error: 'QR code URL does not contain a recognizable set number' }, { status: 404 })
        }
    } else if (isShortNumber) {
        console.log(`[scanLookup] Detected short number (likely Set Number): ${lookupValue}`)
        lookupMethod = 'SET_NUMBER'
    } else {
        // This shouldn't happen for QR codes, but handle it
        console.log(`[scanLookup] Treating as GTIN/Barcode: ${lookupValue}`)
        lookupMethod = 'GTIN'
    }

    // --- LOOKUP LOGIC ---

    if (lookupMethod === 'GTIN') {
        // A. Try Database GTIN
        const { data: identifier } = await supabase
            .from('set_identifiers')
            .select('set_id, sets(*)')
            .eq('identifier_value', lookupValue)
            .maybeSingle()

        if (identifier && identifier.sets) {
             console.log(`[scanLookup] Found in DB via GTIN: ${lookupValue}`)
             return NextResponse.json({ set: identifier.sets })
        }

        // B. Try Provider GTIN
        try {
            const catalogProvider = getCatalogProvider()
            finalMetadata = await catalogProvider.getSetByGTIN(lookupValue)
        } catch (e) {
            console.warn('[scanLookup] Provider GTIN lookup failed:', e)
        }
        
        // C. Fallback: If GTIN lookup failed, maybe it's a Set Number disguised as a barcode?
        if (!finalMetadata && extractSetNumber(lookupValue)) {
            const potentialSetNum = extractSetNumber(lookupValue)!
            console.log(`[scanLookup] GTIN failed, trying as Set Number: ${potentialSetNum}`)
            lookupMethod = 'SET_NUMBER'
            lookupValue = potentialSetNum
            // Continue to SET_NUMBER logic below...
        }
    }

    if (lookupMethod === 'SET_NUMBER' && !finalMetadata) {
        // A. Try Database Set Number
        const { data: dbSet } = await supabase
            .from('sets')
            .select('*')
            .eq('set_number', lookupValue)
            .maybeSingle()
        
        if (dbSet) {
            console.log(`[scanLookup] Found in DB via Set Number: ${lookupValue}`)
            return NextResponse.json({ set: dbSet })
        }

        // B. Try Provider Set Number
        try {
            const catalogProvider = getCatalogProvider()
            finalMetadata = await catalogProvider.getSetByNumber(lookupValue)
        } catch (e) {
            console.warn('[scanLookup] Provider Set Number lookup failed:', e)
        }
    }

    // --- RESULT PROCESSING ---

    if (!finalMetadata) {
      return NextResponse.json({ 
        error: 'Set not found',
        message: `No LEGO set found for code: ${code}. Try searching manually.`
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
      console.error('[scanLookup] Failed to save set:', setError)
      return NextResponse.json({ error: 'Failed to save set' }, { status: 500 })
    }

    // Save GTIN mapping ONLY if we actually looked it up via GTIN
    // If we looked up via Set Number (from URL or direct), we shouldn't save the URL as a GTIN
    if (lookupMethod === 'GTIN' && finalMetadata.gtin) {
      const identifiers = [finalMetadata.gtin]
      if (lookupValue !== finalMetadata.gtin) {
          identifiers.push(lookupValue)
      }

      for (const identifierValue of identifiers) {
        await supabase.from('set_identifiers').upsert(
          {
            set_id: setData.id,
            identifier_type: 'GTIN',
            identifier_value: identifierValue,
            source: 'BRICKSET',
          },
          { onConflict: 'identifier_value' }
        )
      }
    }

    return NextResponse.json({ set: setData })
  } catch (error) {
    console.error('Error looking up code:', error)
    return NextResponse.json(
      { error: 'Failed to lookup code', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
