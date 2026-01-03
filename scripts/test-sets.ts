import { config } from 'dotenv'
import { resolve } from 'path'
import { createServiceClient } from '@/lib/supabase/service'

config({ path: resolve(process.cwd(), '.env.local') })

async function findValidSets() {
  const supabase = createServiceClient()
  
  const { data: sets, error } = await supabase
    .from('sets')
    .select('id, set_number, name')
    .limit(1000)
    .order('set_number', { ascending: true })
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log(`Total sets: ${sets?.length || 0}`)
  
  const validSetNumbers = sets?.filter(s => /^\d{4,7}$/.test(s.set_number)) || []
  console.log(`Valid set numbers (4-7 digits): ${validSetNumbers.length}`)
  
  if (validSetNumbers.length > 0) {
    console.log('\nFirst 10 valid sets:')
    validSetNumbers.slice(0, 10).forEach(s => {
      console.log(`  - ${s.set_number}: ${s.name}`)
    })
  }
}

findValidSets().catch(console.error)
