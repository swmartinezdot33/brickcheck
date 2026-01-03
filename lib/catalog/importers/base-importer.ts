import { createServiceClient } from '@/lib/supabase/service'
import type { SetMetadata } from '@/lib/providers/base'

export type DataSource = 
  | 'REBRICKABLE' 
  | 'BRICKSET_SCRAPE' 
  | 'BRICKLINK_SCRAPE' 
  | 'LEGO_COM_SCRAPE' 
  | 'API_CACHE' 
  | 'MANUAL'

export interface ImportResult {
  imported: number
  updated: number
  skipped: number
  errors: Array<{ setNumber: string; error: string }>
}

export interface SetData extends SetMetadata {
  dataSource: DataSource
  externalUrls?: Record<string, string>
  scrapedAt?: Date
}

/**
 * Base class for all catalog importers
 * Provides common functionality for data normalization, deduplication, and quality scoring
 */
export abstract class BaseImporter {
  protected supabase = createServiceClient()

  /**
   * Calculate data quality score (0-100) based on available fields
   */
  protected calculateQualityScore(data: SetData): number {
    let score = 0
    const maxScore = 100

    // Essential fields (60 points)
    if (data.setNumber) score += 20
    if (data.name) score += 20
    if (data.imageUrl) score += 20

    // Important fields (30 points)
    if (data.theme) score += 10
    if (data.year) score += 10
    if (data.pieceCount) score += 10

    // Additional fields (10 points)
    if (data.msrpCents) score += 5
    if (data.gtin) score += 3
    if (data.bricksetId || data.bricklinkId) score += 2

    return Math.min(score, maxScore)
  }

  /**
   * Normalize set data to standard format
   */
  protected normalizeSetData(data: Partial<SetData>): SetData | null {
    if (!data.setNumber || !data.name) {
      return null // Essential fields missing
    }

    // Normalize set number (remove spaces, uppercase)
    const setNumber = data.setNumber.trim().toUpperCase()

    // Normalize name (trim, fix encoding)
    const name = data.name.trim()

    return {
      setNumber,
      name,
      theme: data.theme?.trim() || undefined,
      year: data.year ? parseInt(String(data.year)) : undefined,
      pieceCount: data.pieceCount ? parseInt(String(data.pieceCount)) : undefined,
      msrpCents: data.msrpCents ? Math.round(Number(data.msrpCents) * 100) : undefined,
      imageUrl: data.imageUrl?.trim() || undefined,
      retired: data.retired ?? false,
      bricksetId: data.bricksetId?.toString() || undefined,
      bricklinkId: data.bricklinkId?.toString() || undefined,
      gtin: data.gtin?.trim() || undefined,
      dataSource: data.dataSource || 'MANUAL',
      externalUrls: data.externalUrls || {},
      scrapedAt: data.scrapedAt || new Date(),
    }
  }

  /**
   * Resolve conflicts when multiple sources have data for the same set
   * Prefers data with higher quality score
   */
  protected resolveConflict(
    existing: SetData,
    incoming: SetData
  ): SetData {
    const existingScore = this.calculateQualityScore(existing)
    const incomingScore = this.calculateQualityScore(incoming)

    // Prefer higher quality score
    if (incomingScore > existingScore) {
      return incoming
    }

    // If scores are equal, merge data (prefer non-null values)
    const merged: SetData = { ...existing }

    if (!merged.theme && incoming.theme) merged.theme = incoming.theme
    if (!merged.year && incoming.year) merged.year = incoming.year
    if (!merged.pieceCount && incoming.pieceCount) merged.pieceCount = incoming.pieceCount
    if (!merged.msrpCents && incoming.msrpCents) merged.msrpCents = incoming.msrpCents
    if (!merged.imageUrl && incoming.imageUrl) merged.imageUrl = incoming.imageUrl
    if (!merged.gtin && incoming.gtin) merged.gtin = incoming.gtin
    if (!merged.bricksetId && incoming.bricksetId) merged.bricksetId = incoming.bricksetId
    if (!merged.bricklinkId && incoming.bricklinkId) merged.bricklinkId = incoming.bricklinkId

    // Merge external URLs
    merged.externalUrls = {
      ...merged.externalUrls,
      ...incoming.externalUrls,
    }

    // Update last verified if incoming is newer
    if (incoming.scrapedAt && (!merged.scrapedAt || incoming.scrapedAt > merged.scrapedAt)) {
      merged.scrapedAt = incoming.scrapedAt
    }

    return merged
  }

  /**
   * Import sets into database
   */
  protected async importSets(sets: SetData[]): Promise<ImportResult> {
    const result: ImportResult = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    }

    for (const setData of sets) {
      try {
        const normalized = this.normalizeSetData(setData)
        if (!normalized) {
          result.skipped++
          continue
        }

        // Check if set exists
        const { data: existing } = await this.supabase
          .from('sets')
          .select('*')
          .eq('set_number', normalized.setNumber)
          .maybeSingle()

        const qualityScore = this.calculateQualityScore(normalized)

        if (existing) {
          // Resolve conflicts
          const existingData: SetData = {
            setNumber: existing.set_number,
            name: existing.name,
            theme: existing.theme || undefined,
            year: existing.year || undefined,
            pieceCount: existing.piece_count || undefined,
            msrpCents: existing.msrp_cents || undefined,
            imageUrl: existing.image_url || undefined,
            retired: existing.retired,
            bricksetId: existing.brickset_id || undefined,
            bricklinkId: existing.bricklink_id || undefined,
            dataSource: (existing.data_source as DataSource) || 'MANUAL',
            externalUrls: (existing.external_urls as Record<string, string>) || {},
            scrapedAt: existing.scraped_at ? new Date(existing.scraped_at) : undefined,
          }

          const resolved = this.resolveConflict(existingData, normalized)

          // Only update if data changed or quality improved
          if (
            JSON.stringify(resolved) !== JSON.stringify(existingData) ||
            qualityScore > (existing.data_quality_score || 0)
          ) {
            const { error } = await this.supabase
              .from('sets')
              .update({
                name: resolved.name,
                theme: resolved.theme || null,
                year: resolved.year || null,
                piece_count: resolved.pieceCount || null,
                msrp_cents: resolved.msrpCents || null,
                image_url: resolved.imageUrl || null,
                retired: resolved.retired,
                brickset_id: resolved.bricksetId || null,
                bricklink_id: resolved.bricklinkId || null,
                data_source: resolved.dataSource,
                last_verified: new Date().toISOString(),
                data_quality_score: this.calculateQualityScore(resolved),
                scraped_at: resolved.scrapedAt?.toISOString() || null,
                external_urls: resolved.externalUrls,
                updated_at: new Date().toISOString(),
              })
              .eq('set_number', normalized.setNumber)

            if (error) throw error
            result.updated++
          } else {
            result.skipped++
          }
        } else {
          // Insert new set
          const { data: insertedSet, error } = await this.supabase
            .from('sets')
            .insert({
              set_number: normalized.setNumber,
              name: normalized.name,
              theme: normalized.theme || null,
              year: normalized.year || null,
              piece_count: normalized.pieceCount || null,
              msrp_cents: normalized.msrpCents || null,
              image_url: normalized.imageUrl || null,
              retired: normalized.retired,
              brickset_id: normalized.bricksetId || null,
              bricklink_id: normalized.bricklinkId || null,
              data_source: normalized.dataSource,
              last_verified: new Date().toISOString(),
              data_quality_score: qualityScore,
              scraped_at: normalized.scrapedAt?.toISOString() || null,
              external_urls: normalized.externalUrls,
            })
            .select()
            .single()

          if (error) throw error
          result.imported++

          // Save GTIN if available
          if (normalized.gtin && insertedSet) {
            await this.supabase
              .from('set_identifiers')
              .upsert({
                set_id: insertedSet.id,
                identifier_type: 'GTIN',
                identifier_value: normalized.gtin,
                source: normalized.dataSource,
              }, {
                onConflict: 'identifier_value',
              })
          }
        }
      } catch (error) {
        result.errors.push({
          setNumber: setData.setNumber || 'UNKNOWN',
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return result
  }

  /**
   * Abstract method to be implemented by subclasses
   * Should fetch and return set data from the source
   */
  abstract fetchData(): Promise<SetData[]>

  /**
   * Main import method
   */
  async import(): Promise<ImportResult> {
    const sets = await this.fetchData()
    return this.importSets(sets)
  }
}

