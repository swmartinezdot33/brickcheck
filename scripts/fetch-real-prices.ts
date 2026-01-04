import { config } from 'dotenv'
import { resolve } from 'path'
import { getPriceProvider } from '@/lib/providers'
import { createServiceClient } from '@/lib/supabase/service'

config({ path: resolve(process.cwd(), '.env.local') })

/**
 * Fetch REAL market pricing data for all sets
 */
async function fetchRealPrices() {
  const supabase = createServiceClient()
  
  console.log('📈 Fetching REAL market pricing data...\n')
  
  // Get all sets
  const { data: sets, error: setsError } = await supabase
    .from('sets')
    .select('id, set_number, name')
    .order('set_number', { ascending: true })
  
  if (setsError || !sets) {
    console.error('❌ Error fetching sets:', setsError)
    process.exit(1)
  }
  
  console.log(`📦 Found ${sets.length} sets\n`)
  
  // Get price provider
  let priceProvider
  try {
    priceProvider = getPriceProvider()
    console.log('✅ Price provider configured\n')
  } catch (error) {
    console.error('❌ Price API not configured:', error)
    process.exit(1)
  }
  
  let successful = 0
  let failed = 0
  
  console.log('🔍 Fetching pricing for each set:\n')
  
  for (const set of sets) {
    try {
      console.log(`   Fetching ${set.set_number}: ${set.name}...`)
      
      // Get prices for both conditions
      const sealedPrices = await priceProvider.getPrices(set.set_number, 'SEALED')
      const usedPrices = await priceProvider.getPrices(set.set_number, 'USED')
      
      if (sealedPrices.length > 0 || usedPrices.length > 0) {
        // Prepare snapshots to insert
        const snapshotsToInsert: any[] = []
        
        if (sealedPrices.length > 0) {
          const latest = sealedPrices[sealedPrices.length - 1]
          snapshotsToInsert.push({
            set_id: set.id,
            condition: 'SEALED',
            source: 'BRICKLINK',
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
          snapshotsToInsert.push({
            set_id: set.id,
            condition: 'USED',
            source: 'BRICKLINK',
            price_cents: latest.priceCents,
            currency: latest.currency || 'USD',
            timestamp: latest.timestamp,
            sample_size: latest.sampleSize,
            variance: latest.variance,
            metadata: latest.metadata,
          })
        }
        
        // Insert all snapshots
        if (snapshotsToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('price_snapshots')
            .insert(snapshotsToInsert)
          
          if (!insertError) {
            const sealedPrice = sealedPrices.length > 0 ? `$${(sealedPrices[sealedPrices.length - 1].priceCents / 100).toFixed(2)}` : 'N/A'
            const usedPrice = usedPrices.length > 0 ? `$${(usedPrices[usedPrices.length - 1].priceCents / 100).toFixed(2)}` : 'N/A'
            console.log(`      ✅ Sealed: ${sealedPrice} | Used: ${usedPrice}`)
            successful++
          } else {
            console.log(`      ⚠️  Failed to insert: ${insertError.message}`)
            failed++
          }
        } else {
          console.log(`      ⏭️  No price data available`)
          failed++
        }
      } else {
        console.log(`      ⏭️  No prices found`)
        failed++
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.log(`      ❌ Error: ${msg.substring(0, 100)}`)
      failed++
    }
    
    // Rate limiting - wait before next request
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  
  console.log(`\n✅ Pricing fetch complete!`)
  console.log(`   - Successfully fetched: ${successful}`)
  console.log(`   - Failed/No data: ${failed}`)
  console.log(`   - Total: ${sets.length}`)
}

fetchRealPrices().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})


