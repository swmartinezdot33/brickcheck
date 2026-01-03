import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCatalogProvider } from '@/lib/providers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    console.log(`[searchSets] Searching for: "${query}"`)
    
    let apiResults: any[] = []
    let apiError: Error | null = null
    
    // 1. Call API Providers
    try {
      const catalogProvider = getCatalogProvider()
      console.log(`[searchSets] Calling API providers for query: "${query}"`)
      apiResults = await catalogProvider.searchSets(query)
      console.log(`[searchSets] ✅ API returned ${apiResults.length} results`)
    } catch (providerError) {
      apiError = providerError instanceof Error ? providerError : new Error(String(providerError))
      console.error('[searchSets] ❌ Catalog provider error:', apiError.message)
    }

    // 2. Search Database
    const searchPattern = `%${query}%`
    const [nameResults, numberResults, themeResults] = await Promise.all([
      supabase.from('sets').select('*').ilike('name', searchPattern).limit(50),
      supabase.from('sets').select('*').ilike('set_number', searchPattern).limit(50),
      supabase.from('sets').select('*').ilike('theme', searchPattern).limit(50),
    ])

    const dbResults = [
      ...(nameResults.data || []),
      ...(numberResults.data || []),
      ...(themeResults.data || []),
    ]

    // 3. Merge Results
    const allResults = new Map<string, any>()

    // Add API results first
    for (const set of apiResults) {
      allResults.set(set.setNumber, {
        setNumber: set.setNumber,
        name: set.name,
        theme: set.theme,
        year: set.year,
        pieceCount: set.pieceCount,
        msrpCents: set.msrpCents,
        imageUrl: set.imageUrl,
        retired: set.retired,
        bricksetId: set.bricksetId,
        bricklinkId: set.bricklinkId,
        gtin: set.gtin,
      })
    }

    // Add database results
    for (const set of dbResults) {
      if (!allResults.has(set.set_number)) {
        allResults.set(set.set_number, {
          setNumber: set.set_number,
          name: set.name,
          theme: set.theme,
          year: set.year,
          pieceCount: set.piece_count,
          msrpCents: set.msrp_cents,
          imageUrl: set.image_url,
          retired: set.retired,
          bricksetId: set.brickset_id,
          bricklinkId: set.bricklink_id,
          gtin: undefined, 
        })
      }
    }

    // 4. Prepare Results for Response
    const resultsArray = Array.from(allResults.values())
    
    // Only attempt database upsert if we actually have API results to save
    if (apiResults.length > 0) {
      const setsToInsert = apiResults.map((set) => ({
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

      // Background the upsert if possible, or await it but handle errors gracefully
      // We'll await it to try and get real IDs, but fallback to temp IDs on failure
      const { data: upsertedSets, error: upsertError } = await supabase
        .from('sets')
        .upsert(setsToInsert, {
          onConflict: 'set_number',
          ignoreDuplicates: false,
        })
        .select()

      if (!upsertError && upsertedSets) {
        // Map results to include database IDs
        const dbSetMap = new Map(upsertedSets.map((s) => [s.set_number, s]))
        
        const finalResults = resultsArray.map((result) => {
          const dbSet = dbSetMap.get(result.setNumber)
          if (dbSet) {
            return dbSet // Use the full DB object which has the correct UUID 'id'
          }
          // If upsert worked but this specific set isn't in the returned list (unlikely), fallback
          return {
            id: `temp-${result.setNumber}`,
            set_number: result.setNumber,
            name: result.name,
            theme: result.theme,
            year: result.year,
            piece_count: result.pieceCount,
            msrp_cents: result.msrpCents,
            image_url: result.imageUrl,
            retired: result.retired,
            brickset_id: result.bricksetId,
            bricklink_id: result.bricklinkId,
          }
        })
        return NextResponse.json({ results: finalResults })
      } else {
          console.error('[searchSets] Upsert failed:', upsertError)
      }
    }

    // Fallback: If no API results or upsert failed, return what we have with temp IDs for non-DB items
    const fallbackResults = resultsArray.map((result) => {
        const dbSet = dbResults.find((s) => s.set_number === result.setNumber)
        return dbSet || {
          id: `temp-${result.setNumber}`,
          set_number: result.setNumber,
          name: result.name,
          theme: result.theme,
          year: result.year,
          piece_count: result.pieceCount,
          msrp_cents: result.msrpCents,
          image_url: result.imageUrl,
          retired: result.retired,
          brickset_id: result.bricksetId,
          bricklink_id: result.bricklinkId,
        }
    })

    return NextResponse.json({ 
        results: fallbackResults,
        warning: apiError ? `API partial failure: ${apiError.message}` : undefined
    })

  } catch (error) {
    console.error('[searchSets] Critical error:', error)
    return NextResponse.json(
      { error: 'Failed to search sets', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
