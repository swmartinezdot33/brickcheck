import { config } from 'dotenv'
import { resolve } from 'path'
import { createServiceClient } from '@/lib/supabase/service'

config({ path: resolve(process.cwd(), '.env.local') })

/**
 * Remove final remaining video game software
 * These are legacy items that didn't match the broader pattern
 */
async function removeFinalVideoGames() {
  const supabase = createServiceClient()
  
  console.log('🎮 Removing final legacy video game software...\n')
  
  try {
    // Target specific remaining video games
    const finalGames = [
      'Rock Raiders - Playstation',
      'Island 2: The Brickster\'s Revenge - Playstation',
      'My Nintendo LEGO Super Mario Sweepstakes'
    ]
    
    console.log('🔍 Finding final video game items...\n')
    
    let totalToRemove = 0
    const idsToDelete: string[] = []
    
    for (const gameName of finalGames) {
      const { data } = await supabase
        .from('sets')
        .select('id, set_number, name, year')
        .ilike('name', `%${gameName}%`)
      
      if (data && data.length > 0) {
        console.log(`📌 "${gameName}": ${data.length} items found`)
        data.forEach(item => {
          console.log(`     - ${item.set_number}: ${item.name}`)
        })
        idsToDelete.push(...data.map(d => d.id))
        totalToRemove += data.length
      }
    }
    
    // Remove duplicates
    const uniqueIds = Array.from(new Set(idsToDelete))
    
    console.log(`\n📊 Total items to remove: ${uniqueIds.length}\n`)
    
    if (uniqueIds.length === 0) {
      console.log('✅ No legacy video games found!')
      return
    }
    
    // Delete
    console.log(`🗑️  Removing ${uniqueIds.length} items...\n`)
    
    const { error: deleteError } = await supabase
      .from('sets')
      .delete()
      .in('id', uniqueIds)
    
    if (deleteError) {
      console.error('❌ Error deleting items:', deleteError)
      return
    }
    
    console.log(`✅ Successfully removed ${uniqueIds.length} legacy video game items!\n`)
    
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

removeFinalVideoGames()

