import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCatalogProvider } from '@/lib/providers'

/**
 * Simplified search route that uses LocalCatalogProvider
 * LocalCatalogProvider already handles:
 * - Checking database first
 * - Falling back to APIs only when needed
 * - Automatically caching API results
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const limitParam = searchParams.get('limit')

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
  }

  // Parse limit, default to 100, max 1000 (frontend handles pagination)
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 100, 1), 1000) : 100

  try {
    const supabase = await createClient()
    console.log(`[searchSets] Searching for: "${query}" (limit: ${limit})`)

    // Use LocalCatalogProvider - it handles local-first logic automatically
    const catalogProvider = getCatalogProvider()
    const results = await catalogProvider.searchSets(query, limit)

    console.log(`[searchSets] Found ${results.length} results`)

    if (results.length === 0) {
      return NextResponse.json({
        results: [],
        message: `No sets found for "${query}". Try searching by set number (e.g., 75192) or name.`,
      })
    }

    // Convert SetMetadata to database format and fetch full records with IDs
    // This ensures we return database IDs for proper linking
    const setNumbers = results.map((r) => r.setNumber)
    const { data: dbSets, error: dbError } = await supabase
      .from('sets')
      .select('*')
      .in('set_number', setNumbers)

    if (dbError) {
      console.error('[searchSets] Error fetching database records:', dbError)
    }

    // Create a map of set_number to database record
    const dbSetMap = new Map((dbSets || []).map((s) => [s.set_number, s]))

    // Merge results with database records to get IDs
    const finalResults = results.map((result) => {
      const dbSet = dbSetMap.get(result.setNumber)
      if (dbSet) {
        // Return full database record
        return dbSet
      } else {
        // Set not in database yet (shouldn't happen with LocalCatalogProvider, but handle it)
        console.warn(`[searchSets] Set ${result.setNumber} not found in database after provider lookup`)
        return {
          id: `temp-${result.setNumber}`,
          set_number: result.setNumber,
          name: result.name,
          theme: result.theme || null,
          year: result.year || null,
          piece_count: result.pieceCount || null,
          msrp_cents: result.msrpCents || null,
          image_url: result.imageUrl || null,
          retired: result.retired || false,
          brickset_id: result.bricksetId || null,
          bricklink_id: result.bricklinkId || null,
        }
      }
    })

    console.log(`[searchSets] ✅ Returning ${finalResults.length} results`)
    return NextResponse.json({ results: finalResults })
  } catch (error) {
    console.error('[searchSets] Critical error:', error)
    return NextResponse.json(
      { error: 'Failed to search sets', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

import { getCatalogProvider } from '@/lib/providers'

/**
 * Simplified search route that uses LocalCatalogProvider
 * LocalCatalogProvider already handles:
 * - Checking database first
 * - Falling back to APIs only when needed
 * - Automatically caching API results
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const limitParam = searchParams.get('limit')

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
  }

  // Parse limit, default to 100, max 1000 (frontend handles pagination)
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 100, 1), 1000) : 100

  try {
    const supabase = await createClient()
    console.log(`[searchSets] Searching for: "${query}" (limit: ${limit})`)

    // Use LocalCatalogProvider - it handles local-first logic automatically
    const catalogProvider = getCatalogProvider()
    const results = await catalogProvider.searchSets(query, limit)

    console.log(`[searchSets] Found ${results.length} results`)

    if (results.length === 0) {
      return NextResponse.json({
        results: [],
        message: `No sets found for "${query}". Try searching by set number (e.g., 75192) or name.`,
      })
    }

    // Convert SetMetadata to database format and fetch full records with IDs
    // This ensures we return database IDs for proper linking
    const setNumbers = results.map((r) => r.setNumber)
    const { data: dbSets, error: dbError } = await supabase
      .from('sets')
      .select('*')
      .in('set_number', setNumbers)

    if (dbError) {
      console.error('[searchSets] Error fetching database records:', dbError)
    }

    // Create a map of set_number to database record
    const dbSetMap = new Map((dbSets || []).map((s) => [s.set_number, s]))

    // Merge results with database records to get IDs
    const finalResults = results.map((result) => {
      const dbSet = dbSetMap.get(result.setNumber)
      if (dbSet) {
        // Return full database record
        return dbSet
      } else {
        // Set not in database yet (shouldn't happen with LocalCatalogProvider, but handle it)
        console.warn(`[searchSets] Set ${result.setNumber} not found in database after provider lookup`)
        return {
          id: `temp-${result.setNumber}`,
          set_number: result.setNumber,
          name: result.name,
          theme: result.theme || null,
          year: result.year || null,
          piece_count: result.pieceCount || null,
          msrp_cents: result.msrpCents || null,
          image_url: result.imageUrl || null,
          retired: result.retired || false,
          brickset_id: result.bricksetId || null,
          bricklink_id: result.bricklinkId || null,
        }
      }
    })

    console.log(`[searchSets] ✅ Returning ${finalResults.length} results`)
    return NextResponse.json({ results: finalResults })
  } catch (error) {
    console.error('[searchSets] Critical error:', error)
    return NextResponse.json(
      { error: 'Failed to search sets', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

import { getCatalogProvider } from '@/lib/providers'

/**
 * Simplified search route that uses LocalCatalogProvider
 * LocalCatalogProvider already handles:
 * - Checking database first
 * - Falling back to APIs only when needed
 * - Automatically caching API results
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const limitParam = searchParams.get('limit')

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
  }

  // Parse limit, default to 100, max 1000 (frontend handles pagination)
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 100, 1), 1000) : 100

  try {
    const supabase = await createClient()
    console.log(`[searchSets] Searching for: "${query}" (limit: ${limit})`)

    // Use LocalCatalogProvider - it handles local-first logic automatically
    const catalogProvider = getCatalogProvider()
    const results = await catalogProvider.searchSets(query, limit)

    console.log(`[searchSets] Found ${results.length} results`)

    if (results.length === 0) {
      return NextResponse.json({
        results: [],
        message: `No sets found for "${query}". Try searching by set number (e.g., 75192) or name.`,
      })
    }

    // Convert SetMetadata to database format and fetch full records with IDs
    // This ensures we return database IDs for proper linking
    const setNumbers = results.map((r) => r.setNumber)
    const { data: dbSets, error: dbError } = await supabase
      .from('sets')
      .select('*')
      .in('set_number', setNumbers)

    if (dbError) {
      console.error('[searchSets] Error fetching database records:', dbError)
    }

    // Create a map of set_number to database record
    const dbSetMap = new Map((dbSets || []).map((s) => [s.set_number, s]))

    // Merge results with database records to get IDs
    const finalResults = results.map((result) => {
      const dbSet = dbSetMap.get(result.setNumber)
      if (dbSet) {
        // Return full database record
        return dbSet
      } else {
        // Set not in database yet (shouldn't happen with LocalCatalogProvider, but handle it)
        console.warn(`[searchSets] Set ${result.setNumber} not found in database after provider lookup`)
        return {
          id: `temp-${result.setNumber}`,
          set_number: result.setNumber,
          name: result.name,
          theme: result.theme || null,
          year: result.year || null,
          piece_count: result.pieceCount || null,
          msrp_cents: result.msrpCents || null,
          image_url: result.imageUrl || null,
          retired: result.retired || false,
          brickset_id: result.bricksetId || null,
          bricklink_id: result.bricklinkId || null,
        }
      }
    })

    console.log(`[searchSets] ✅ Returning ${finalResults.length} results`)
    return NextResponse.json({ results: finalResults })
  } catch (error) {
    console.error('[searchSets] Critical error:', error)
    return NextResponse.json(
      { error: 'Failed to search sets', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
