import { createServiceClient } from '@/lib/supabase/service'
import { CatalogProvider, type SetMetadata } from './base'
import { CompositeCatalogProvider } from './composite'

/**
 * Local-first catalog provider
 * Queries local database first, falls back to API providers only if not found
 * Automatically caches all API results permanently
 */
export class LocalCatalogProvider implements CatalogProvider {
  private supabase = createServiceClient()
  private apiProvider: CompositeCatalogProvider

  constructor() {
    // Initialize API provider as fallback
    this.apiProvider = new CompositeCatalogProvider()
  }

  /**
   * Convert database row to SetMetadata
   */
  private dbRowToMetadata(row: any): SetMetadata {
    return {
      setNumber: row.set_number,
      name: row.name,
      theme: row.theme || undefined,
      year: row.year || undefined,
      pieceCount: row.piece_count || undefined,
      msrpCents: row.msrp_cents || undefined,
      imageUrl: row.image_url || undefined,
      retired: row.retired || false,
      bricksetId: row.brickset_id || undefined,
      bricklinkId: row.bricklink_id || undefined,
      gtin: undefined, // Will be fetched separately if needed
    }
  }

  /**
   * Cache API result to database
   */
  private async cacheSet(metadata: SetMetadata, source: string = 'API_CACHE'): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('sets')
        .upsert(
          {
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
            data_source: source,
            last_verified: new Date().toISOString(),
            data_quality_score: this.calculateQualityScore(metadata),
            scraped_at: new Date().toISOString(),
            external_urls: {},
          },
          {
            onConflict: 'set_number',
          }
        )

      if (error) {
        console.error('[LocalCatalogProvider] Failed to cache set:', error)
      }

      // Cache GTIN if available
      if (metadata.gtin) {
        const { data: setData } = await this.supabase
          .from('sets')
          .select('id')
          .eq('set_number', metadata.setNumber)
          .single()

        if (setData) {
          await this.supabase
            .from('set_identifiers')
            .upsert(
              {
                set_id: setData.id,
                identifier_type: 'GTIN',
                identifier_value: metadata.gtin,
                source: source,
              },
              {
                onConflict: 'identifier_value',
              }
            )
        }
      }
    } catch (error) {
      console.error('[LocalCatalogProvider] Error caching set:', error)
      // Don't throw - caching is best effort
    }
  }

  /**
   * Calculate quality score for a set
   */
  private calculateQualityScore(metadata: SetMetadata): number {
    let score = 0
    if (metadata.setNumber) score += 20
    if (metadata.name) score += 20
    if (metadata.imageUrl) score += 20
    if (metadata.theme) score += 10
    if (metadata.year) score += 10
    if (metadata.pieceCount) score += 10
    if (metadata.msrpCents) score += 5
    if (metadata.gtin) score += 3
    if (metadata.bricksetId || metadata.bricklinkId) score += 2
    return Math.min(score, 100)
  }

  async searchSets(query: string, limit: number = 100): Promise<SetMetadata[]> {
    // 1. Search local database first
    // 1. Search local database first - search name and set_number separately
    const { data: nameResults } = await this.supabase
      .from('sets')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(limit)
    
    const { data: numberResults } = await this.supabase
      .from('sets')
      .select('*')
      .ilike('set_number', `%${query}%`)
      .limit(limit)
    
    // Combine and deduplicate by id
    const allResults = [...(nameResults || []), ...(numberResults || [])]
    const uniqueResults = Array.from(
      new Map(allResults.map((item) => [item.id, item])).values()
    ).slice(0, limit)
    
    const dbResults = uniqueResults
    const error = null

    if (error) {
      console.error('[LocalCatalogProvider] Database search error:', error)
    }

    const localResults: SetMetadata[] = (dbResults || []).map((row) => this.dbRowToMetadata(row))

    // 2. If we found results, return them (local-first approach)
    if (localResults.length > 0) {
      console.log(`[LocalCatalogProvider] Found ${localResults.length} sets in local database`)
      return localResults
    }

    // 3. Fallback to API providers
    console.log(`[LocalCatalogProvider] No local results, querying API providers...`)
    try {
      const apiResults = await this.apiProvider.searchSets(query, limit)

      // 4. Cache all API results
      for (const result of apiResults) {
        await this.cacheSet(result, 'API_CACHE')
      }

      return apiResults
    } catch (error) {
      console.error('[LocalCatalogProvider] API search failed:', error)
      return []
    }
  }

  async getSetByNumber(setNumber: string): Promise<SetMetadata | null> {
    // 1. Check local database first
    const { data: dbSet, error } = await this.supabase
      .from('sets')
      .select('*')
      .eq('set_number', setNumber)
      .maybeSingle()

    if (error) {
      console.error('[LocalCatalogProvider] Database lookup error:', error)
    }

    if (dbSet) {
      console.log(`[LocalCatalogProvider] Found set ${setNumber} in local database`)
      return this.dbRowToMetadata(dbSet)
    }

    // 2. Fallback to API providers
    console.log(`[LocalCatalogProvider] Set ${setNumber} not in local database, querying API...`)
    try {
      const apiResult = await this.apiProvider.getSetByNumber(setNumber)

      if (apiResult) {
        // 3. Cache the result
        await this.cacheSet(apiResult, 'API_CACHE')
        return apiResult
      }

      return null
    } catch (error) {
      console.error('[LocalCatalogProvider] API lookup failed:', error)
      return null
    }
  }

  async getSetByGTIN(gtin: string): Promise<SetMetadata | null> {
    // 1. Look up GTIN in set_identifiers table
    const { data: identifier, error: identifierError } = await this.supabase
      .from('set_identifiers')
      .select('set_id, sets(*)')
      .eq('identifier_type', 'GTIN')
      .eq('identifier_value', gtin)
      .maybeSingle()

    if (identifierError) {
      console.error('[LocalCatalogProvider] GTIN lookup error:', identifierError)
    }

    if (identifier && identifier.sets) {
      console.log(`[LocalCatalogProvider] Found set by GTIN ${gtin} in local database`)
      return this.dbRowToMetadata(identifier.sets)
    }

    // 2. Fallback to API providers
    console.log(`[LocalCatalogProvider] GTIN ${gtin} not in local database, querying API...`)
    try {
      const apiResult = await this.apiProvider.getSetByGTIN(gtin)

      if (apiResult) {
        // 3. Cache the result
        await this.cacheSet(apiResult, 'API_CACHE')
        return apiResult
      }

      return null
    } catch (error) {
      console.error('[LocalCatalogProvider] API GTIN lookup failed:', error)
      return null
    }
  }
}

