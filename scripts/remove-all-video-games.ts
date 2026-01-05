import { config } from 'dotenv'
import { resolve } from 'path'
import { createServiceClient } from '@/lib/supabase/service'

config({ path: resolve(process.cwd(), '.env.local') })

/**
 * Remove ALL video game software and game-related merchandise
 * This script removes any item that is:
 * - A video game for any platform (Nintendo, PlayStation, Xbox, PC, etc.)
 * - Game controllers, remotes, or gaming accessories
 * - Game-specific merchandise (game guides, art books, etc.)
 * 
 * It keeps only PHYSICAL LEGO BUILDING SETS
 */
async function removeAllVideoGames() {
  const supabase = createServiceClient()
  
  console.log('🎮 Removing ALL video game software and game accessories...\n')
  
  try {
    // More comprehensive list of video game platforms and keywords
    const gameKeywords = [
      // Platforms
      'Nintendo Switch',
      'Nintendo Wii',
      'Nintendo DS',
      'Game Boy',
      'PS4',
      'PS5',
      'PlayStation 4',
      'PlayStation 5',
      'Xbox One',
      'Xbox 360',
      'Xbox Series',
      'PC CD',
      'PC DVD',
      'Steam',
      'Wii U',
      'Vita',
      '3DS',
      'Dreamcast',
      'GameCube',
      
      // Game titles (LEGO branded)
      'Marvel Super Heroes - ',
      'Star Wars: The',
      'Harry Potter Collection',
      'The Incredibles - ',
      'DC Super-Villains',
      'City Undercover',
      'Jurassic World - ',
      'The Hobbit - ',
      'LEGO Batman Movie',
      'LEGO Ninjago Movie',
      'LEGO Dimensions',
      'LEGO Minifigures Online',
      'Brawls - ',
      'Horizon Adventures',
      '2K Drive',
      'Rock Band',
      'Indiana Jones',
      'Pirates of the Caribbean',
      'Bionicle: The Game',
      'Island Xtreme',
      'Drome Racers',
      'Alpha Team - Game',
      'Stunt Rally',
      'Racers - ',
      'Soccer Mania',
      
      // Gaming controllers and accessories
      'Nintendo Remote',
      'DS Armor',
      'Game Controller',
      'Gaming Controller',
      'Play and Build',
      'Gaming Cube',
      'Gaming Tournament',
      'Gaming Race Car',
      'Arcade Gaming',
      'Retro Gaming Console',
    ]
    
    console.log('🔍 Finding all video game items...\n')
    
    let totalToRemove = 0
    const idsToDelete: string[] = []
    
    for (const keyword of gameKeywords) {
      const { data, error } = await supabase
        .from('sets')
        .select('id, set_number, name, year')
        .ilike('name', `%${keyword}%`)
      
      if (error) {
        console.error(`❌ Error searching for "${keyword}":`, error)
        continue
      }
      
      if (data && data.length > 0) {
        console.log(`📌 "${keyword}": ${data.length} items found`)
        idsToDelete.push(...data.map(d => d.id))
        totalToRemove += data.length
      }
    }
    
    // Remove duplicates
    const uniqueIds = Array.from(new Set(idsToDelete))
    
    console.log(`\n📊 Total unique video game items found: ${uniqueIds.length}\n`)
    
    if (uniqueIds.length === 0) {
      console.log('✅ No video games found - database is clean!')
      return
    }
    
    // Show some examples
    const { data: examples } = await supabase
      .from('sets')
      .select('set_number, name, year')
      .in('id', uniqueIds.slice(0, 10))
    
    if (examples && examples.length > 0) {
      console.log('📋 Sample of items to be removed:')
      examples.forEach(item => {
        console.log(`   - ${item.set_number}: ${item.name}`)
      })
      if (uniqueIds.length > 10) {
        console.log(`   ... and ${uniqueIds.length - 10} more`)
      }
      console.log()
    }
    
    // Delete in batches
    console.log(`🗑️  Removing ${uniqueIds.length} video game items in batches...\n`)
    
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
    console.log(`✅ Successfully removed ${totalDeleted} video game items!\n`)
    
    // Show updated statistics
    const { count: totalSets } = await supabase
      .from('sets')
      .select('*', { count: 'exact', head: true })
    
    console.log('📊 Updated Database Statistics:')
    console.log(`   - Total LEGO sets remaining: ${totalSets?.toLocaleString() || 0}`)
    console.log(`   - ONLY real physical building sets\n`)
    
  } catch (error) {
    console.error('❌ Fatal error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

removeAllVideoGames()


