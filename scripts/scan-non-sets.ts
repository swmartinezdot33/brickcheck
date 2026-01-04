import { config } from 'dotenv'
import { resolve } from 'path'
import { createServiceClient } from '@/lib/supabase/service'

config({ path: resolve(process.cwd(), '.env.local') })

/**
 * Scan database for non-set items that should be removed
 * Shows examples of items that might not be actual LEGO building sets
 */
async function scanNonSets() {
  const supabase = createServiceClient()
  
  console.log('🔍 Scanning for non-set items in database...\n')
  
  try {
    // Keywords that indicate non-buildable or non-set items
    const nonSetKeywords = [
      'Storage',
      'Box',
      'Case',
      'Organizer',
      'Carry',
      'Bag',
      'Display',
      'Stand',
      'Shelf',
      'Motor',
      'Battery',
      'Adapter',
      'Cable',
      'Charger',
      'Light',
      'Battery Box',
      'Power',
      'Electric',
      'Track',
      'Rail',
      'Wheel',
      'Tire',
      'Gear',
      'Axle',
      'Hinge',
      'Minifigure',
      'Polybag',
      'Blind Bag',
      'Pack',
      'Bulk',
      'Lot',
      'Assortment',
      'Service',
      'Parts',
      'Brickarms',
      'Custom',
      'Clone',
      'Counterfeit',
      'Knockoff',
      'Generic',
    ]
    
    const results: { [key: string]: any[] } = {}
    
    for (const keyword of nonSetKeywords) {
      const { data } = await supabase
        .from('sets')
        .select('id, set_number, name, year')
        .ilike('name', `%${keyword}%`)
        .limit(5)
      
      if (data && data.length > 0) {
        results[keyword] = data
      }
    }
    
    // Show results
    const categoriesFound = Object.keys(results)
    console.log(`📊 Found ${categoriesFound.length} categories with potential non-set items:\n`)
    
    let totalCount = 0
    for (const category of categoriesFound) {
      const items = results[category]
      console.log(`\n📌 "${category}" (${items.length}+ items found):`)
      items.slice(0, 3).forEach(item => {
        console.log(`   - ${item.set_number}: ${item.name}`)
      })
      if (items.length > 3) {
        console.log(`   ... and more`)
      }
      totalCount += items.length
    }
    
    console.log(`\n\n📈 Total potential non-set items: ${totalCount}+`)
    console.log(`\n💡 These categories contain items that might not be actual LEGO building sets.`)
    console.log(`   Would you like to remove any of these categories?`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

scanNonSets()

