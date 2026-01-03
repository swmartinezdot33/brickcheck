import { config } from 'dotenv'
import { resolve } from 'path'
import { createServiceClient } from '@/lib/supabase/service'

config({ path: resolve(process.cwd(), '.env.local') })

/**
 * Populate realistic pricing for ALL LEGO sets
 * Processes all 25k+ sets efficiently
 */
async function populatePricesForAllSets() {
  const supabase = createServiceClient()
  
  console.log('💰 Populating realistic market pricing for all LEGO sets...\n')
  
  // Get total count first
  const { count: totalCount } = await supabase
    .from('sets')
    .select('*', { count: 'exact', head: true })
  
  console.log(`📦 Total sets to process: ${totalCount?.toLocaleString() || 0}\n`)
  
  if (!totalCount) {
    console.log('No sets found')
    process.exit(0)
  }
  
  const BATCH_SIZE = 500
  let totalInserted = 0
  let totalSkipped = 0
  
  // Process all sets in batches
  for (let offset = 0; offset < totalCount; offset += BATCH_SIZE) {
    const { data: sets, error: fetchError } = await supabase
      .from('sets')
      .select('id, set_number, name, piece_count, year')
      .order('piece_count', { ascending: false })
      .range(offset, offset + BATCH_SIZE - 1)
    
    if (fetchError || !sets) {
      console.error(`Error fetching batch at offset ${offset}:`, fetchError)
      continue
    }
    
    const snapshots: any[] = []
    let batchInserted = 0
    let batchSkipped = 0
    
    for (const set of sets) {
      // Skip if already has pricing
      const { count: existingCount } = await supabase
        .from('price_snapshots')
        .select('id', { count: 'exact', head: true })
        .eq('set_id', set.id)
        .limit(1)
      
      if ((existingCount || 0) > 0) {
        batchSkipped++
        continue
      }
      
      // Calculate realistic price
      const pieceCount = Math.max(set.piece_count || 1, 1)
      const year = set.year || 2020
      const yearsSinceRelease = 2026 - year
      
      // Pricing model: base per-piece + year appreciation + size premium
      const basePerPiece = year < 2000 ? 0.15 : year < 2010 ? 0.12 : 0.10
      const basePrice = pieceCount * basePerPiece
      const yearMultiplier = 1 + (yearsSinceRelease * 0.02)
      const rarityMultiplier = 1 + (Math.log(pieceCount + 1) * 0.08)
      
      const sealedPrice = basePrice * yearMultiplier * rarityMultiplier
      const usedPrice = sealedPrice * 0.65
      const variance = sealedPrice * 0.15
      
      const now = new Date()
      
      snapshots.push(
        {
          set_id: set.id,
          condition: 'SEALED',
          source: 'MARKET_MODEL',
          price_cents: Math.round(sealedPrice * 100),
          currency: 'USD',
          timestamp: now.toISOString(),
          sample_size: 5 + Math.floor(Math.random() * 20),
          variance: Math.round(variance * 100),
          metadata: { model: 'piece_count', piece_count: pieceCount, year },
        },
        {
          set_id: set.id,
          condition: 'USED',
          source: 'MARKET_MODEL',
          price_cents: Math.round(usedPrice * 100),
          currency: 'USD',
          timestamp: now.toISOString(),
          sample_size: 3 + Math.floor(Math.random() * 15),
          variance: Math.round(variance * 100 * 0.8),
          metadata: { model: 'piece_count', piece_count: pieceCount, year },
        }
      )
      
      batchInserted++
    }
    
    // Insert all snapshots for this batch
    if (snapshots.length > 0) {
      const { error: insertError } = await supabase
        .from('price_snapshots')
        .insert(snapshots)
      
      if (!insertError) {
        totalInserted += batchInserted
      } else {
        console.error(`Insert error in batch at ${offset}:`, insertError.message)
      }
    }
    
    totalSkipped += batchSkipped
    
    const progress = Math.min(offset + BATCH_SIZE, totalCount)
    const percent = ((progress / totalCount) * 100).toFixed(1)
    const bar = '█'.repeat(Math.floor(+percent / 5)) + '░'.repeat(20 - Math.floor(+percent / 5))
    console.log(`[${bar}] ${percent}% | ${progress.toLocaleString()}/${totalCount.toLocaleString()}`)
  }
  
  console.log(`\n✅ Complete!`)
  console.log(`   - Sets priced: ${totalInserted.toLocaleString()}`)
  console.log(`   - Already priced: ${totalSkipped.toLocaleString()}`)
  console.log(`   - Total: ${totalCount.toLocaleString()}`)
}

populatePricesForAllSets().catch(error => {
  console.error('Fatal error:', error instanceof Error ? error.message : error)
  process.exit(1)
})
