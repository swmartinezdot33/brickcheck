import { config } from 'dotenv'
import { resolve } from 'path'
import { createServiceClient } from '@/lib/supabase/service'

config({ path: resolve(process.cwd(), '.env.local') })

async function checkGames() {
  const supabase = createServiceClient()
  
  console.log('🎮 Checking for remaining video game items...\n')
  
  try {
    // Search for Nintendo, Switch, PlayStation, Xbox, gaming, game
    const keywords = ['Nintendo', 'Switch', 'PlayStation', 'PS4', 'PS5', 'Xbox', 'gaming', 'game console', 'Wii', 'Game Boy', 'Steam', 'Epic Games']
    
    for (const keyword of keywords) {
      const { data, error } = await supabase
        .from('sets')
        .select('id, set_number, name, year')
        .ilike('name', `%${keyword}%`)
        .limit(15)
      
      if (data && data.length > 0) {
        console.log(`\n📌 Items matching "${keyword}":`)
        data.forEach(item => {
          console.log(`   - ${item.set_number}: ${item.name} (${item.year})`)
        })
        console.log(`   (found matching items)`)
      }
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkGames()


