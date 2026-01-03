#!/usr/bin/env tsx
/**
 * Catalog synchronization script
 * Downloads latest Rebrickable CSVs and updates local database
 * Can be run manually or via cron job
 */

// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { RebrickableImporter } from '@/lib/catalog/importers/rebrickable-importer'
import { BricksetScraper } from '@/lib/scrapers/brickset-scraper'
import { BrickLinkScraper } from '@/lib/scrapers/bricklink-scraper'
import { LEGOcomScraper } from '@/lib/scrapers/lego-scraper'
import { createServiceClient } from '@/lib/supabase/service'
import type { SetData } from '@/lib/catalog/importers/base-importer'

async function syncRebrickable() {
  console.log('🔄 Starting Rebrickable CSV import...')
  try {
    const importer = new RebrickableImporter()
    const result = await importer.import()
    console.log(`✅ Rebrickable import complete:`)
    console.log(`   - Imported: ${result.imported}`)
    console.log(`   - Updated: ${result.updated}`)
    console.log(`   - Skipped: ${result.skipped}`)
    console.log(`   - Errors: ${result.errors.length}`)
    if (result.errors.length > 0) {
      console.log(`   - First 5 errors:`, result.errors.slice(0, 5))
    }
    return result
  } catch (error) {
    console.error('❌ Rebrickable import failed:', error)
    throw error
  }
}

async function findStaleSets() {
  const supabase = createServiceClient()
  
  // Find sets that haven't been verified in 30+ days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { data: staleSets, error } = await supabase
    .from('sets')
    .select('set_number, last_verified, data_quality_score')
    .or(`last_verified.is.null,last_verified.lt.${thirtyDaysAgo.toISOString()}`)
    .order('data_quality_score', { ascending: true })
    .limit(100) // Process 100 at a time
    
  if (error) {
    console.error('Error finding stale sets:', error)
    return []
  }
  
  return staleSets || []
}

async function enrichStaleSets() {
  console.log('🔄 Enriching stale sets with scrapers...')
  const staleSets = await findStaleSets()
  
  if (staleSets.length === 0) {
    console.log('✅ No stale sets found')
    return
  }
  
  console.log(`Found ${staleSets.length} stale sets to enrich`)
  
  const scrapers = [
    new BricksetScraper(),
    new BrickLinkScraper(),
    new LEGOcomScraper(),
  ]
  
  let enriched = 0
  let errors = 0
  
  for (const set of staleSets.slice(0, 20)) { // Limit to 20 per run
    console.log(`Enriching set ${set.set_number}...`)
    
    for (const scraper of scrapers) {
      try {
        const data = await scraper.scrapeSetPage(set.set_number)
        if (data) {
          // Import the enriched data
          const importer = new (class extends RebrickableImporter {
            async fetchData(): Promise<SetData[]> {
              return [data]
            }
          })()
          await importer.import()
          enriched++
          break // Found data, move to next set
        }
      } catch (error) {
        console.warn(`Scraper ${scraper.constructor.name} failed for ${set.set_number}:`, error)
        errors++
      }
      
      // Rate limiting between scrapers
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  console.log(`✅ Enrichment complete: ${enriched} enriched, ${errors} errors`)
}

async function mergeDataSources() {
  console.log('🔄 Merging data from multiple sources...')
  const supabase = createServiceClient()
  
  // Find sets with low quality scores that might benefit from merging
  const { data: lowQualitySets, error } = await supabase
    .from('sets')
    .select('set_number, data_quality_score, data_source')
    .lt('data_quality_score', 70)
    .limit(50)
  
  if (error) {
    console.error('Error finding low-quality sets:', error)
    return
  }
  
  if (!lowQualitySets || lowQualitySets.length === 0) {
    console.log('✅ No low-quality sets found')
    return
  }
  
  console.log(`Found ${lowQualitySets.length} sets with low quality scores`)
  // The BaseImporter.resolveConflict logic will handle merging when new data is imported
  console.log('✅ Merge will happen automatically on next import')
}

async function main() {
  console.log('🚀 Starting catalog synchronization...\n')
  
  try {
    // 1. Sync Rebrickable CSV (primary source)
    await syncRebrickable()
    
    // 2. Enrich stale sets with scrapers
    await enrichStaleSets()
    
    // 3. Merge data from multiple sources
    await mergeDataSources()
    
    console.log('\n✅ Catalog synchronization complete!')
  } catch (error) {
    console.error('\n❌ Catalog synchronization failed:', error)
    process.exit(1)
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

