import { config } from 'dotenv'
import { resolve } from 'path'
import { createServiceClient } from '@/lib/supabase/service'

config({ path: resolve(process.cwd(), '.env.local') })

async function checkImport() {
  const supabase = createServiceClient()
  
  // Get total count
  const { count, error: countError } = await supabase
    .from('sets')
    .select('*', { count: 'exact', head: true })
  
  if (countError) {
    console.error('Error getting count:', countError)
    return
  }
  
  console.log(`\n📊 Total sets in database: ${count}\n`)
  
  // Get sample sets by data source
  const { data: samples, error } = await supabase
    .from('sets')
    .select('set_number, name, data_source, data_quality_score')
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (error) {
    console.error('Error getting samples:', error)
    return
  }
  
  if (samples && samples.length > 0) {
    console.log('📦 Sample sets (most recent):')
    samples.forEach(s => {
      console.log(`  - ${s.set_number}: ${s.name}`)
      console.log(`    Source: ${s.data_source || 'N/A'}, Quality: ${s.data_quality_score || 0}/100`)
    })
  } else {
    console.log('⚠️  No sets found in database')
  }
  
  // Count by data source
  const { data: bySource } = await supabase
    .from('sets')
    .select('data_source')
  
  if (bySource) {
    const sourceCounts = new Map<string, number>()
    bySource.forEach(s => {
      const source = s.data_source || 'UNKNOWN'
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1)
    })
    
    console.log('\n📈 Sets by data source:')
    Array.from(sourceCounts.entries()).forEach(([source, count]) => {
      console.log(`  - ${source}: ${count}`)
    })
  }
}

checkImport().catch(console.error)

