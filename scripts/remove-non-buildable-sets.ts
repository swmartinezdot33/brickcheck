import { config } from 'dotenv'
import { resolve } from 'path'
import { createServiceClient } from '@/lib/supabase/service'

config({ path: resolve(process.cwd(), '.env.local') })

/**
 * Remove non-buildable LEGO items
 * Removes accessories, parts, storage, batteries, lights, etc.
 * Keeps only complete buildable sets
 */
async function removeNonBuildableSets() {
  const supabase = createServiceClient()
  
  console.log('🧹 Removing non-buildable LEGO items from database...\n')
  
  try {
    // Keywords for non-buildable items
    const nonBuildableKeywords = [
      // Storage and organization
      'Storage',
      'Organizer',
      'Carry Case',
      'Carrying Case',
      'ZipBin',
      'Storage Cloth',
      'Storage Folder',
      
      // Accessories and non-sets
      'Bag',
      'Shoulder Bag',
      'Backpack',
      'Lunch Bag',
      'Key Light',
      'Keychain',
      'Key Chain',
      'Pen',
      'Pencil',
      'Pouch',
      'Wallet',
      'Belt',
      'Costume',
      'Mask',
      
      // Electrical components
      'Battery Box',
      'Battery Case',
      'Motor',
      'Power Adapter',
      'USB Adapter',
      'Power Unit',
      'Charger',
      'Battery Cable',
      'Replacement Motor',
      
      // Non-set parts and accessories
      'Axle',
      'Wheel',
      'Tire',
      'Gear',
      'Hinge',
      'Propeller',
      'Track',
      'Rail',
      'Cable Kit',
      'Adapter',
      'Light Set',
      'Lightsaber',
      
      // Bulk and assortment packs
      'Bulk Bucket',
      'Bulk Box',
      'Bulk Pack',
      'Parts Assortment',
      'Assortment Pack',
      'Polybag',
      'Parts Pack',
      'Mixed Plates',
      'Technic Parts',
      'Part Variety',
      
      // Replacements and extras
      'Replacement',
      'Extra',
      'Spare',
      'Duplicate',
      
      // Non-buildable branded items
      'Shelf',
      'Display Case',
      'Brick Shelf',
      'Minifigure Display',
      'Stand Set',
      'Minifigure Costume',
      'Costume Parts',
      'Wooden Minifigure',
      
      // Service/Parts
      'Service Pack',
      'Service Team',
      'Connector Pack',
    ]
    
    console.log('🔍 Finding non-buildable items...\n')
    
    let totalFound = 0
    const allIds: string[] = []
    
    for (const keyword of nonBuildableKeywords) {
      const { data } = await supabase
        .from('sets')
        .select('id')
        .ilike('name', `%${keyword}%`)
      
      if (data && data.length > 0) {
        console.log(`📌 "${keyword}": ${data.length} items`)
        allIds.push(...data.map(d => d.id))
        totalFound += data.length
      }
    }
    
    // Remove duplicates
    const uniqueIds = Array.from(new Set(allIds))
    
    console.log(`\n📊 Total unique non-buildable items found: ${uniqueIds.length}\n`)
    
    if (uniqueIds.length === 0) {
      console.log('✅ No non-buildable items found!')
      return
    }
    
    // Delete in batches
    console.log(`🗑️  Removing ${uniqueIds.length} non-buildable items in batches...\n`)
    
    const BATCH_SIZE = 100
    let totalDeleted = 0
    
    for (let i = 0; i < uniqueIds.length; i += BATCH_SIZE) {
      const batch = uniqueIds.slice(i, i + BATCH_SIZE)
      
      try {
        const { error: deleteError } = await supabase
          .from('sets')
          .delete()
          .in('id', batch)
        
        if (deleteError) {
          console.error(`  ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, deleteError.message)
        } else {
          totalDeleted += batch.length
          const progress = Math.min(i + BATCH_SIZE, uniqueIds.length)
          const percent = ((progress / uniqueIds.length) * 100).toFixed(1)
          const bar = '█'.repeat(Math.floor(+percent / 5)) + '░'.repeat(20 - Math.floor(+percent / 5))
          console.log(`  [${bar}] ${percent}% (${progress}/${uniqueIds.length})`)
        }
      } catch (err) {
        console.error(`  ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} exception:`, err)
      }
      
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    console.log()
    console.log(`✅ Successfully removed ${totalDeleted} non-buildable items!\n`)
    
    // Show updated statistics
    const { count: totalSets } = await supabase
      .from('sets')
      .select('*', { count: 'exact', head: true })
    
    console.log('📊 Updated Database Statistics:')
    console.log(`   - Total LEGO sets remaining: ${totalSets?.toLocaleString() || 0}`)
    console.log(`   - ONLY complete buildable LEGO sets\n`)
    
  } catch (error) {
    console.error('❌ Fatal error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

removeNonBuildableSets()

