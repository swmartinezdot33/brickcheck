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

    // ALWAYS call APIs first to get real data, then merge with database
    // This ensures we get fresh results from APIs, not just cached seed data
    console.log(`[searchSets] Searching for: "${query}"`)
    
    let apiResults: any[] = []
    let apiError: Error | null = null
    try {
      const catalogProvider = getCatalogProvider()
      console.log(`[searchSets] Calling API providers for query: "${query}"`)
      apiResults = await catalogProvider.searchSets(query)
      console.log(`[searchSets] ✅ API returned ${apiResults.length} results`)
      if (apiResults.length > 0) {
        console.log(`[searchSets] First result:`, JSON.stringify(apiResults[0], null, 2))
      }
    } catch (providerError) {
      apiError = providerError instanceof Error ? providerError : new Error(String(providerError))
      console.error('[searchSets] ❌ Catalog provider error:', apiError.message)
      console.error('[searchSets] Error stack:', apiError.stack)
      console.error('[searchSets] Full error:', apiError)
      // Continue to check database, but log the error clearly
    }

    // Also check database for any additional results
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

    // Merge API results with database results
    const allResults = new Map<string, any>()

    // Add API results first (preferred - they're fresh)
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

    // Add database results (only if not already in API results)
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
          gtin: undefined, // Will be looked up if needed
        })
      }
    }

    // Convert to array and upsert API results to database
    const resultsArray = Array.from(allResults.values())
    
    if (apiResults.length > 0) {
      // Upsert API results into database for future caching
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

      console.log(`[searchSets] Upserting ${setsToInsert.length} sets to database...`)
      const { data: upsertedSets, error: upsertError } = await supabase
        .from('sets')
        .upsert(setsToInsert, {
          onConflict: 'set_number',
          ignoreDuplicates: false,
        })
        .select()

      if (upsertError) {
        console.error('[searchSets] ❌ Failed to upsert sets to database:', upsertError)
        console.error('[searchSets] Error details:', JSON.stringify(upsertError, null, 2))
        // Continue with database results even if upsert failed
      } else if (upsertedSets && upsertedSets.length > 0) {
        console.log(`[searchSets] ✅ Successfully upserted ${upsertedSets.length} sets to database`)
        
        // Upsert GTINs if available
        for (const set of apiResults) {
          if (set.gtin) {
            const setData = upsertedSets.find((s) => s.set_number === set.setNumber)
            if (setData) {
              const { error: gtinError } = await supabase.from('set_identifiers').upsert(
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
              if (gtinError) {
                console.warn(`[searchSets] Failed to upsert GTIN for set ${set.setNumber}:`, gtinError)
              }
            }
          }
        }

        // Create a map of set_number to database set for quick lookup
        const dbSetMap = new Map(upsertedSets.map((s) => [s.set_number, s]))

        // Map results to include database IDs - prioritize database IDs
        const finalResults = resultsArray.map((result) => {
          const dbSet = dbSetMap.get(result.setNumber)
          if (dbSet) {
            console.log(`[searchSets] ✅ Mapped set ${result.setNumber} to database ID: ${dbSet.id}`)
            return dbSet
          } else {
            // This shouldn't happen if upsert was successful, but log it if it does
            console.warn(`[searchSets] ⚠️ Set ${result.setNumber} not found in upserted sets, using temp ID`)
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
          }
        })

        console.log(`[searchSets] ✅ Returning ${finalResults.length} results (${apiResults.length} from API, ${upsertedSets.length} saved to DB)`)
        return NextResponse.json({ results: finalResults })
      } else {
        console.warn('[searchSets] ⚠️ Upsert returned no data, but no error occurred')
      }
    }

    // If no API results, return database results (if any) with error info
    if (resultsArray.length > 0) {
      console.log(`[searchSets] ⚠️ No API results, returning ${resultsArray.length} cached results from database`)
      // Convert to database format
      const dbFormatted = resultsArray.map((result) => {
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
        results: dbFormatted,
        warning: apiError ? `API unavailable: ${apiError.message}. Showing cached results only.` : 'Using cached results only.'
      })
    }

    // No results at all - return error info
    console.log(`[searchSets] ❌ No results found from API or database`)
    return NextResponse.json({ 
      results: [],
      error: apiError ? `Search failed: ${apiError.message}` : 'No results found',
      message: apiError ? apiError.message : `No sets found for "${query}". Try searching by set number (e.g., 75192) or name.`
    })
  } catch (error) {
    console.error('[searchSets] Error searching sets:', error)
    return NextResponse.json(
      { error: 'Failed to search sets', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
