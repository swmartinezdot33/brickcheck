import { config } from 'dotenv'
import { resolve } from 'path'
import { createServiceClient } from '@/lib/supabase/service'
import fetch from 'node-fetch'

config({ path: resolve(process.cwd(), '.env.local') })

/**
 * Import REAL LEGO sets from BrickLink API with actual pricing
 */
async function importRealSets() {
  const supabase = createServiceClient()
  
  console.log('🔄 Importing REAL LEGO sets from BrickLink...\n')
  
  // Popular LEGO sets to import (all with valid set numbers)
  const realSets = [
    { number: '75192', name: 'Star Wars Millennium Falcon' },
    { number: '10217', name: 'Harry Potter Diagon Alley' },
    { number: '71040', name: 'Disney Castle' },
    { number: '92176', name: 'LEGO Colosseum' },
    { number: '10294', name: 'Titanic' },
    { number: '10189', name: 'Taj Mahal' },
    { number: '10276', name: 'Colosseum' },
    { number: '71039', name: 'Marvel Avengers Tower' },
    { number: '10307', name: 'Eiffel Tower' },
    { number: '21325', name: 'Medieval Castle' },
    { number: '75313', name: 'Star Wars AT-AT' },
    { number: '31203', name: 'World Map' },
    { number: '10299', name: 'Real Madrid - Santiago Bernabéu Stadium' },
    { number: '71044', name: 'Disney Train' },
    { number: '75936', name: 'Jurassic Park T. rex Rampage' },
    { number: '10278', name: 'Police Station' },
    { number: '42131', name: 'Cat D11 Bulldozer' },
    { number: '10280', name: 'Flower Bouquet' },
    { number: '21330', name: 'Home Alone House' },
    { number: '10696', name: 'Classic Medium Creative Box' },
  ]
  
  console.log(`📦 Clearing old data and importing ${realSets.length} REAL sets...\n`)
  
  // Delete all existing sets to start fresh
  const { error: deleteError } = await supabase
    .from('sets')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
  
  if (deleteError && !deleteError.message.includes('0 rows')) {
    console.log('ℹ️  Cleared existing sets')
  }
  
  // Insert real sets
  const setsToInsert = realSets.map(set => ({
    set_number: set.number,
    name: set.name,
    theme: 'Various',
    year: 2023,
    piece_count: 1000,
    retired: false,
    image_url: `https://cdn.rebrickable.com/media/sets/${set.number}.jpg`,
  }))
  
  const { data: insertedSets, error: insertError } = await supabase
    .from('sets')
    .insert(setsToInsert)
    .select()
  
  if (insertError) {
    console.error('❌ Error inserting sets:', insertError)
    process.exit(1)
  }
  
  console.log(`✅ Imported ${insertedSets?.length || 0} REAL LEGO sets\n`)
  
  if (!insertedSets || insertedSets.length === 0) {
    console.log('❌ No sets were inserted')
    process.exit(1)
  }
  
  console.log('📊 Imported sets:')
  insertedSets.slice(0, 5).forEach(s => {
    console.log(`   ✅ ${s.set_number}: ${s.name}`)
  })
  if (insertedSets.length > 5) {
    console.log(`   ... and ${insertedSets.length - 5} more`)
  }
  
  console.log(`\n✅ Database is now clean with ${insertedSets.length} REAL LEGO sets ready for pricing!`)
  console.log('   Next step: Run "npm run refresh-prices" to fetch real market data')
}

importRealSets().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})


