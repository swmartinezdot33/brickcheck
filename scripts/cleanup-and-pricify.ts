import { config } from 'dotenv'
import { resolve } from 'path'
import { createServiceClient } from '@/lib/supabase/service'
import { getPriceProvider } from '@/lib/providers'

config({ path: resolve(process.cwd(), '.env.local') })

/**
 * Script to clean up invalid sets and populate pricing for valid ones
 */
async function cleanupAndPricify() {
  const supabase = createServiceClient()
  
  console.log('🔄 Starting cleanup and pricing process...\n')
  
  // 1. Get all sets
  const { data: allSets, error: setsError } = await supabase
    .from('sets')
    .select('id, set_number, name')
    .order('set_number', { ascending: true })
  
  if (setsError) {
    console.error('❌ Error fetching sets:', setsError)
    process.exit(1)
  }
  
  if (!allSets) {
    console.log('ℹ️  No sets found in database')
    process.exit(0)
  }
  
  console.log(`📦 Total sets in database: ${allSets.length}\n`)
  
  // 2. Separate valid and invalid sets
  const validSets = allSets.filter(s => /^\d{4,7}$/.test(s.set_number))
  const invalidSets = allSets.filter(s => !/^\d{4,7}$/.test(s.set_number))
  
  console.log(`✅ Valid set numbers (4-7 digits): ${validSets.length}`)
  console.log(`❌ Invalid set numbers: ${invalidSets.length}\n`)
  
  // 3. Show stats on invalid sets
  if (invalidSets.length > 0) {
    console.log('📊 Sample of invalid sets:')
    invalidSets.slice(0, 10).forEach(s => {
      console.log(`  - "${s.set_number}": ${s.name}`)
    })
    console.log()
  }
  
  // 4. Get price provider
  let priceProvider
  try {
    priceProvider = getPriceProvider()
    console.log('✅ Price provider configured\n')
  } catch (error) {
    console.error('❌ Price API not configured:', error)
    console.error('\nPlease configure:')
    console.error('  - BRICKECONOMY_API_KEY (recommended)')
    console.error('  - OR all BrickLink credentials (BRICKLINK_CONSUMER_KEY, etc.)')
    process.exit(1)
  }
  
  // 5. Try to fetch pricing for valid sets
  console.log(`📈 Attempting to fetch pricing for ${validSets.length} valid sets...\n`)
  
  let successful = 0
  let failed = 0
  
  for (const set of validSets) {
    try {
      const sealedPrices = await priceProvider.getPrices(set.set_number, 'SEALED')
      const usedPrices = await priceProvider.getPrices(set.set_number, 'USED')
      
      if (sealedPrices.length > 0 || usedPrices.length > 0) {
        const sources: string[] = []
        if (process.env.BRICKECONOMY_API_KEY) sources.push('BRICKECONOMY')
        if (
          process.env.BRICKLINK_CONSUMER_KEY &&
          process.env.BRICKLINK_CONSUMER_SECRET &&
          process.env.BRICKLINK_TOKEN &&
          process.env.BRICKLINK_TOKEN_SECRET
        ) {
          sources.push('BRICKLINK')
        }
        const source = sources.join('+')
        
        // Insert price snapshots
        const snapshotsToInsert = [
          ...sealedPrices.slice(-1).map((p) => ({
            set_id: set.id,
            condition: 'SEALED' as const,
            source,
            price_cents: p.priceCents,
            currency: p.currency || 'USD',
            timestamp: p.timestamp,
            sample_size: p.sampleSize,
            variance: p.variance,
            metadata: p.metadata,
          })),
          ...usedPrices.slice(-1).map((p) => ({
            set_id: set.id,
            condition: 'USED' as const,
            source,
            price_cents: p.priceCents,
            currency: p.currency || 'USD',
            timestamp: p.timestamp,
            sample_size: p.sampleSize,
            variance: p.variance,
            metadata: p.metadata,
          })),
        ]
        
        if (snapshotsToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('price_snapshots')
            .insert(snapshotsToInsert)
          
          if (!insertError) {
            const sealedPrice = sealedPrices.length > 0 ? `$${(sealedPrices[sealedPrices.length - 1].priceCents / 100).toFixed(2)}` : 'N/A'
            const usedPrice = usedPrices.length > 0 ? `$${(usedPrices[usedPrices.length - 1].priceCents / 100).toFixed(2)}` : 'N/A'
            console.log(`✅ ${set.set_number}: ${set.name} - Sealed: ${sealedPrice}, Used: ${usedPrice}`)
            successful++
          } else {
            console.log(`⚠️  ${set.set_number}: Failed to insert prices - ${insertError.message}`)
            failed++
          }
        }
      } else {
        console.log(`⏭️  ${set.set_number}: No price data available`)
        failed++
      }
    } catch (error) {
      console.log(`❌ ${set.set_number}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      failed++
    }
    
    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  
  console.log(`\n✅ Cleanup and pricing complete!`)
  console.log(`   - Successfully fetched: ${successful}`)
  console.log(`   - Failed: ${failed}`)
  console.log(`   - Valid sets processed: ${successful + failed}`)
}

cleanupAndPricify().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})


