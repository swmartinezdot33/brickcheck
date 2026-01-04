import { config } from 'dotenv'
import { resolve } from 'path'
import { createServiceClient } from '@/lib/supabase/service'

config({ path: resolve(process.cwd(), '.env.local') })

/**
 * Remove non-physical LEGO items from database
 * Removes:
 * - Video games and video game merchandise
 * - Books, posters, calendars, stationery (non-buildable)
 * - Clothing, backpacks, lunch bags
 * - DVDs, digital media
 * - Ornaments and gift items
 * 
 * Keeps only real physical LEGO building sets and minifigures
 */
async function removeNonPhysicalItems() {
  const supabase = createServiceClient()
  
  console.log('🧹 Removing non-physical LEGO items from database...\n')
  
  try {
    // Define keywords that indicate non-buildable items
    const nonBuildableKeywords = [
      // Video games
      'Video Game',
      'Video-Game',
      'Videogame',
      'LEGO Dimensions',
      'LEGO Movie 2 Video Game',
      'LEGO Star Wars',
      'LEGO Harry Potter',
      'LEGO Lord of the Rings',
      'LEGO Marvel',
      'LEGO DC',
      'LEGO Batman',
      'LEGO Ninjago Movie Video Game',
      'LEGO Worlds',
      'LEGO Minifigures Online',
      'The LEGO Movie Video Game',
      'LEGO Games',
      // Media
      'DVD',
      'Blu-ray',
      'CD-Rom',
      'PC CD-ROM',
      // Books and reading
      'Book',
      'Junior Novel',
      'Activity Book',
      'Activity Journal',
      'Coloring Book',
      'Doodle Book',
      'Novel',
      'Guide',
      'Handbook',
      'Essential Guide',
      'Making of the Movie',
      'Sticker Collection',
      'DK Reader',
      'Readers Level',
      // Stationery and paper goods
      'Stationery',
      'Eraser',
      'Pencil',
      'Book Marker',
      'Bookmark',
      'Journal',
      'Notebook',
      'Calendar',
      'Poster',
      // Wearables
      'Backpack',
      'Lunch Bag',
      'T-Shirt',
      'Shirt',
      'Jersey',
      'Hat',
      'Cap',
      'Watch',
      // Accessories and decorative
      'Ornament',
      'Christmas',
      'Keepsake',
      'Key Chain',
      'Key Light',
      'Light',
      'Display Case',
      'Collector Frame',
      'Frame',
      '3D Backpack',
      // Merchandise
      'Merchandise',
      'Merchandise Box',
      'Collector Box',
      'Sealed Box',
      'Collector Edition',
    ]
    
    console.log('🔍 Finding non-buildable LEGO items...\n')
    
    // Get items matching non-buildable keywords
    const { data: nonBuildables, error: fetchError } = await supabase
      .from('sets')
      .select('id, set_number, name, year')
      .or(
        nonBuildableKeywords
          .map(keyword => `name.ilike.%${keyword}%`)
          .join(',')
      )
    
    if (fetchError) {
      console.error('❌ Error fetching non-buildable items:', fetchError)
      return
    }
    
    console.log(`📊 Found ${nonBuildables?.length || 0} non-buildable items\n`)
    
    if (nonBuildables && nonBuildables.length > 0) {
      // Show first 20 items that will be removed
      console.log('📋 Sample of items to be removed:')
      nonBuildables.slice(0, 20).forEach(item => {
        console.log(`   - ${item.set_number}: ${item.name} (${item.year})`)
      })
      if (nonBuildables.length > 20) {
        console.log(`   ... and ${nonBuildables.length - 20} more items`)
      }
      console.log()
      
      // Delete the items in batches to avoid "Bad Request" error
      const idsToDelete = nonBuildables.map(s => s.id)
      const BATCH_SIZE = 100
      let totalDeleted = 0
      
      console.log(`🗑️  Removing ${idsToDelete.length} non-buildable items in batches...\n`)
      
      for (let i = 0; i < idsToDelete.length; i += BATCH_SIZE) {
        const batch = idsToDelete.slice(i, i + BATCH_SIZE)
        
        try {
          const { error: deleteError, count } = await supabase
            .from('sets')
            .delete()
            .in('id', batch)
          
          if (deleteError) {
            console.error(`  ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, deleteError.message)
          } else {
            totalDeleted += batch.length
            const progress = Math.min(i + BATCH_SIZE, idsToDelete.length)
            const percent = ((progress / idsToDelete.length) * 100).toFixed(1)
            const bar = '█'.repeat(Math.floor(+percent / 5)) + '░'.repeat(20 - Math.floor(+percent / 5))
            console.log(`  [${bar}] ${percent}% (${progress}/${idsToDelete.length})`)
          }
        } catch (err) {
          console.error(`  ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} exception:`, err)
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      
      console.log()
      console.log(`✅ Successfully removed ${totalDeleted} non-buildable items!\n`)
    } else {
      console.log('✅ No non-buildable items found - database is clean!\n')
    }
    
    // Show updated statistics
    const { count: totalSets } = await supabase
      .from('sets')
      .select('*', { count: 'exact', head: true })
    
    console.log('📊 Updated Database Statistics:')
    console.log(`   - Total LEGO sets remaining: ${totalSets?.toLocaleString() || 0}`)
    console.log(`   - Only real physical building sets and minifigures\n`)
    
  } catch (error) {
    console.error('❌ Fatal error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

removeNonPhysicalItems()

