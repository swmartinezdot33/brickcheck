import { config } from 'dotenv'
import { resolve } from 'path'
import { createServiceClient } from '@/lib/supabase/service'
import { getPriceProvider } from '@/lib/providers'

config({ path: resolve(process.cwd(), '.env.local') })

/**
 * Fetch prices for ALL LEGO sets in batches
 * Prioritizes popular sets first (by piece count)
 */
async function fetchPricesForAllSets() {
  const supabase = createServiceClient()
  
  console.log('💰 Fetching market prices for all LEGO sets...\n')
  
  // Get price provider
  let priceProvider
  try {
    priceProvider = getPriceProvider()
    console.log('✅ Price provider configured\n')
  } catch (error) {
    console.error('❌ Price API not configured:', error)
    console.error('\nConfigure BrickLink or BrickEconomy API keys')
    process.exit(1)
  }
  
  // Get all sets, ordered by piece count (descending - most valuable first)
  const { count: totalCount } = await supabase
    .from('sets')
    .select('*', { count: 'exact', head: true })
  
  console.log(`📦 Total sets to process: ${totalCount?.toLocaleString()}\n`)
  
  if (!totalCount) {
    console.log('No sets found in database')
    process.exit(0)
  }
  
  const BATCH_SIZE = 100
  let processed = 0
  let pricesAdded = 0
  let skipped = 0
  let errors = 0
  
  for (let offset = 0; offset < totalCount; offset += BATCH_SIZE) {
    const { data: sets, error: fetchError } = await supabase
      .from('sets')
      .select('id, set_number, name, piece_count')
      .order('piece_count', { ascending: false })
      .range(offset, offset + BATCH_SIZE - 1)
    
    if (fetchError || !sets) {
      console.error(`Error fetching batch at offset ${offset}:`, fetchError)
      break
    }
    
    console.log(`\n📊 Processing batch ${Math.floor(offset / BATCH_SIZE) + 1}/${Math.ceil(totalCount / BATCH_SIZE)}`)
    
    for (const set of sets) {
      try {
        // Skip sets that already have recent pricing (within 24 hours)
        const { data: recentPrices } = await supabase
          .from('price_snapshots')
          .select('id', { count: 'exact', head: true })
          .eq('set_id', set.id)
          .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        
        if (recentPrices && recentPrices.length > 0) {
          skipped++
          continue
        }
        
        // Try to fetch prices
        const sealedPrices = await priceProvider.getPrices(set.set_number, 'SEALED').catch(() => [])
        const usedPrices = await priceProvider.getPrices(set.set_number, 'USED').catch(() => [])
        
        if (sealedPrices.length > 0 || usedPrices.length > 0) {
          const snapshots: any[] = []
          
          if (sealedPrices.length > 0) {
            const latest = sealedPrices[sealedPrices.length - 1]
            snapshots.push({
              set_id: set.id,
              condition: 'SEALED',
              source: 'MARKET_API',
              price_cents: latest.priceCents,
              currency: latest.currency || 'USD',
              timestamp: latest.timestamp,
              sample_size: latest.sampleSize,
              variance: latest.variance,
              metadata: latest.metadata,
            })
          }
          
          if (usedPrices.length > 0) {
            const latest = usedPrices[usedPrices.length - 1]
            snapshots.push({
              set_id: set.id,
              condition: 'USED',
              source: 'MARKET_API',
              price_cents: latest.priceCents,
              currency: latest.currency || 'USD',
              timestamp: latest.timestamp,
              sample_size: latest.sampleSize,
              variance: latest.variance,
              metadata: latest.metadata,
            })
          }
          
          if (snapshots.length > 0) {
            await supabase
              .from('price_snapshots')
              .insert(snapshots)
              .catch(() => {}) // Silently ignore duplicates
            
            pricesAdded++
            const sealed = sealedPrices.length > 0 ? `$${(sealedPrices[sealedPrices.length - 1].priceCents / 100).toFixed(2)}` : 'N/A'
            const used = usedPrices.length > 0 ? `$${(usedPrices[usedPrices.length - 1].priceCents / 100).toFixed(2)}` : 'N/A'
            process.stdout.write('.')
          }
        } else {
          process.stdout.write('-')
        }
      } catch (error) {
        errors++
        process.stdout.write('!')
      }
      
      processed++
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    const percent = ((processed / totalCount) * 100).toFixed(1)
    console.log(`\n  Progress: ${processed}/${totalCount} (${percent}%) | Prices added: ${pricesAdded} | Skipped: ${skipped} | Errors: ${errors}`)
  }
  
  console.log(`\n\n✅ Completed!`)
  console.log(`   - Total processed: ${processed}`)
  console.log(`   - Prices added: ${pricesAdded}`)
  console.log(`   - Skipped (recent): ${skipped}`)
  console.log(`   - Errors: ${errors}`)
}

fetchPricesForAllSets().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

