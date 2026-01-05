import { config } from 'dotenv'
import { resolve } from 'path'
import { createServiceClient } from '@/lib/supabase/service'
import { getPriceProvider } from '@/lib/providers'

config({ path: resolve(process.cwd(), '.env.local') })

/**
 * Script to refresh prices for all sets in the database
 * Run with: npx tsx scripts/refresh-all-prices.ts
 */
async function refreshAllPrices() {
  console.log('🔄 Starting bulk price refresh for all sets...\n')

  const supabase = createServiceClient()

  // Get ALL sets from database
  const { data: allSets, error: setsError } = await supabase
    .from('sets')
    .select('id, set_number, name')
    .order('set_number', { ascending: true })

  if (setsError) {
    console.error('❌ Error fetching sets:', setsError)
    process.exit(1)
  }

  if (!allSets || allSets.length === 0) {
    console.log('ℹ️  No sets found in database')
    process.exit(0)
  }

  console.log(`📦 Found ${allSets.length} sets to process\n`)

  // Get price provider
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

  // Determine source(s)
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
  const source = sources.join('+') || 'UNKNOWN'
  console.log(`📊 Using price sources: ${source}\n`)

  let refreshed = 0
  let errors = 0
  let skipped = 0
  const batchSize = 5 // Smaller batches for CLI to respect rate limits

  // Process sets in batches
  for (let i = 0; i < allSets.length; i += batchSize) {
    const batch = allSets.slice(i, i + batchSize)
    
    await Promise.all(
      batch.map(async (set) => {
        try {
          // Check if we already have recent price data (within last 24 hours)
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          
          const { data: recentSnapshots } = await supabase
            .from('price_snapshots')
            .select('id')
            .eq('set_id', set.id)
            .gte('timestamp', yesterday.toISOString())
            .limit(1)

          // Skip if we have recent data
          if (recentSnapshots && recentSnapshots.length > 0) {
            skipped++
            return
          }

          // Fetch prices from provider
          const sealedPrices = await priceProvider.getPrices(set.set_number, 'SEALED')
          const usedPrices = await priceProvider.getPrices(set.set_number, 'USED')

          // Store latest price snapshots
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

            if (insertError) {
              console.error(`  ❌ ${set.set_number}: ${insertError.message}`)
              errors++
            } else {
              refreshed++
              const sealedPrice = sealedPrices.length > 0 ? `$${(sealedPrices[sealedPrices.length - 1].priceCents / 100).toFixed(2)}` : 'N/A'
              const usedPrice = usedPrices.length > 0 ? `$${(usedPrices[usedPrices.length - 1].priceCents / 100).toFixed(2)}` : 'N/A'
              console.log(`  ✅ ${set.set_number}: ${set.name.substring(0, 40)} - Sealed: ${sealedPrice}, Used: ${usedPrice}`)
            }
          } else {
            skipped++
            console.log(`  ⏭️  ${set.set_number}: No price data available`)
          }

          // Small delay to respect rate limits
          await new Promise((resolve) => setTimeout(resolve, 200))
        } catch (error) {
          console.error(`  ❌ ${set.set_number}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          errors++
        }
      })
    )

    // Progress update
    const progress = Math.min(i + batchSize, allSets.length)
    console.log(`\n📊 Progress: ${progress}/${allSets.length} (${refreshed} refreshed, ${skipped} skipped, ${errors} errors)\n`)

    // Delay between batches to respect rate limits
    if (i + batchSize < allSets.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }

  console.log('\n✅ Bulk price refresh complete!')
  console.log(`   - Refreshed: ${refreshed}`)
  console.log(`   - Skipped: ${skipped}`)
  console.log(`   - Errors: ${errors}`)
  console.log(`   - Total: ${allSets.length}`)
}

refreshAllPrices().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})



