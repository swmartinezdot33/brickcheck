/**
 * Seed script for local development
 * Run with: npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const sampleSets = [
  {
    set_number: '75192',
    name: 'Millennium Falcon',
    theme: 'Star Wars',
    year: 2017,
    piece_count: 7541,
    msrp_cents: 84999,
    retired: false,
    image_url: null,
    brickset_id: null,
    bricklink_id: null,
  },
  {
    set_number: '71040',
    name: 'Disney Castle',
    theme: 'Disney',
    year: 2016,
    piece_count: 4080,
    msrp_cents: 34999,
    retired: true,
    image_url: null,
    brickset_id: null,
    bricklink_id: null,
  },
  {
    set_number: '10294',
    name: 'Titanic',
    theme: 'Icons',
    year: 2021,
    piece_count: 9090,
    msrp_cents: 67999,
    retired: false,
    image_url: null,
    brickset_id: null,
    bricklink_id: null,
  },
  {
    set_number: '21327',
    name: 'Typewriter',
    theme: 'Ideas',
    year: 2021,
    piece_count: 2079,
    msrp_cents: 19999,
    retired: true,
    image_url: null,
    brickset_id: null,
    bricklink_id: null,
  },
  {
    set_number: '10279',
    name: 'Volkswagen T2 Camper Van',
    theme: 'Icons',
    year: 2021,
    piece_count: 2207,
    msrp_cents: 17999,
    retired: false,
    image_url: null,
    brickset_id: null,
    bricklink_id: null,
  },
]

async function seed() {
  console.log('Seeding database...')

  // Insert sets
  const { data: insertedSets, error: setsError } = await supabase
    .from('sets')
    .upsert(sampleSets, { onConflict: 'set_number' })
    .select()

  if (setsError) {
    console.error('Error inserting sets:', setsError)
    return
  }

  console.log(`Inserted ${insertedSets?.length || 0} sets`)

  // Insert GTINs
  if (insertedSets) {
    for (const set of insertedSets) {
      const gtin = `570201611${set.set_number}`
      await supabase.from('set_identifiers').upsert(
        {
          set_id: set.id,
          identifier_type: 'GTIN',
          identifier_value: gtin,
          source: 'MANUAL',
        },
        { onConflict: 'identifier_value' }
      )
    }
    console.log('Inserted GTINs')
  }

  // Generate mock price data for last 90 days
  if (insertedSets) {
    const snapshots = []
    const now = new Date()

    for (const set of insertedSets) {
      const basePriceSealed = set.msrp_cents ? set.msrp_cents * 1.2 : 100000
      const basePriceUsed = basePriceSealed * 0.7

      for (let i = 90; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)

        // Add some random variation
        const variation = (Math.random() - 0.5) * 0.2 // ±10%
        const sealedPrice = Math.round(basePriceSealed * (1 + variation))
        const usedPrice = Math.round(basePriceUsed * (1 + variation))

        snapshots.push(
          {
            set_id: set.id,
            condition: 'SEALED',
            source: 'BRICKLINK',
            price_cents: sealedPrice,
            currency: 'USD',
            timestamp: date.toISOString(),
            sample_size: Math.floor(Math.random() * 20) + 5,
            variance: Math.random() * 0.1,
            metadata: null,
          },
          {
            set_id: set.id,
            condition: 'USED',
            source: 'BRICKLINK',
            price_cents: usedPrice,
            currency: 'USD',
            timestamp: date.toISOString(),
            sample_size: Math.floor(Math.random() * 15) + 3,
            variance: Math.random() * 0.15,
            metadata: null,
          }
        )
      }
    }

    // Insert in batches
    const batchSize = 100
    for (let i = 0; i < snapshots.length; i += batchSize) {
      const batch = snapshots.slice(i, i + batchSize)
      await supabase.from('price_snapshots').insert(batch)
    }

    console.log(`Inserted ${snapshots.length} price snapshots`)
  }

  console.log('Seed completed!')
}

seed().catch(console.error)

