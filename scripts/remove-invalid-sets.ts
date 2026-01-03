import { config } from 'dotenv'
import { resolve } from 'path'
import { createServiceClient } from '@/lib/supabase/service'

config({ path: resolve(process.cwd(), '.env.local') })

/**
 * Script to remove invalid LEGO set numbers from the database
 * LEGO set numbers are 4-7 digits only
 */
async function removeInvalidSets() {
  const supabase = createServiceClient()
  
  console.log('🔄 Removing invalid LEGO set numbers...\n')
  
  // Get all invalid sets (not 4-7 digit numbers)
  const { data: invalidSets, error: fetchError } = await supabase
    .from('sets')
    .select('id, set_number, name')
    .order('set_number', { ascending: true })
  
  if (fetchError) {
    console.error('❌ Error fetching sets:', fetchError)
    process.exit(1)
  }
  
  if (!invalidSets) {
    console.log('ℹ️  No sets found')
    process.exit(0)
  }
  
  const invalid = invalidSets.filter(s => !/^\d{4,7}$/.test(s.set_number))
  const valid = invalidSets.filter(s => /^\d{4,7}$/.test(s.set_number))
  
  console.log(`📊 Set Analysis:`)
  console.log(`   - Valid LEGO set numbers (4-7 digits): ${valid.length}`)
  console.log(`   - Invalid set numbers: ${invalid.length}`)
  console.log(`   - Total: ${invalidSets.length}\n`)
  
  if (invalid.length === 0) {
    console.log('✅ All sets have valid LEGO set numbers!')
    process.exit(0)
  }
  
  // Show sample of invalid sets
  console.log('📋 Sample of invalid sets being removed:')
  invalid.slice(0, 10).forEach(s => {
    console.log(`   - "${s.set_number}": ${s.name}`)
  })
  if (invalid.length > 10) {
    console.log(`   ... and ${invalid.length - 10} more`)
  }
  console.log()
  
  // Delete invalid sets (they will cascade delete related data)
  const { error: deleteError } = await supabase
    .from('sets')
    .delete()
    .not('id', 'is', null)
    .not('set_number', 'ilike', '%0%')  // Keep anything with 0
    .not('set_number', 'ilike', '%1%') // Keep anything with 1
    .not('set_number', 'ilike', '%2%') // Keep anything with 2
    .not('set_number', 'ilike', '%3%') // Keep anything with 3
    .not('set_number', 'ilike', '%4%') // Keep anything with 4
    .not('set_number', 'ilike', '%5%') // Keep anything with 5
    .not('set_number', 'ilike', '%6%') // Keep anything with 6
    .not('set_number', 'ilike', '%7%') // Keep anything with 7
    .not('set_number', 'ilike', '%8%') // Keep anything with 8
    .not('set_number', 'ilike', '%9%') // Keep anything with 9
  
  // Alternative: manually delete each invalid set
  console.log('🗑️  Deleting invalid sets...\n')
  
  let deleted = 0
  let errors = 0
  
  for (const set of invalid) {
    try {
      // Delete price snapshots first (due to foreign key)
      await supabase
        .from('price_snapshots')
        .delete()
        .eq('set_id', set.id)
      
      // Delete collection items
      await supabase
        .from('collection_items')
        .delete()
        .eq('set_id', set.id)
      
      // Delete the set
      await supabase
        .from('sets')
        .delete()
        .eq('id', set.id)
      
      deleted++
      if (deleted % 50 === 0) {
        console.log(`  🗑️  Deleted ${deleted}/${invalid.length}...`)
      }
    } catch (err) {
      console.error(`  ❌ Failed to delete ${set.set_number}:`, err)
      errors++
    }
  }
  
  console.log(`\n✅ Cleanup complete!`)
  console.log(`   - Deleted: ${deleted}`)
  console.log(`   - Errors: ${errors}`)
  console.log(`   - Remaining valid sets: ${valid.length}`)
}

removeInvalidSets().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

