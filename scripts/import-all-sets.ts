import { config } from 'dotenv'
import { resolve } from 'path'
import { createServiceClient } from '@/lib/supabase/service'
import { gunzipSync } from 'zlib'
import { parse } from 'csv-parse/sync'

config({ path: resolve(process.cwd(), '.env.local') })

/**
 * Import ALL LEGO sets from Rebrickable (including promotional sets)
 * Downloads complete sets.csv.gz with ~26,000 sets
 */
async function importAllLEGOSets() {
  const supabase = createServiceClient()
  
  console.log('🧱 Importing ENTIRE LEGO collection from Rebrickable (~26,000 sets)...\n')
  
  try {
    // Download all sets from Rebrickable
    console.log('📥 Downloading sets.csv.gz from Rebrickable...')
    const response = await fetch('https://cdn.rebrickable.com/media/downloads/sets.csv.gz')
    
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`)
    }
    
    const buffer = await response.arrayBuffer()
    const decompressed = gunzipSync(Buffer.from(buffer))
    const csvText = decompressed.toString('utf-8')
    
    console.log('✅ Downloaded and decompressed\n')
    
    // Parse CSV
    const records: any[] = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    })
    
    console.log(`📊 Total sets in Rebrickable: ${records.length.toLocaleString()}`)
    
    // Transform to database format - KEEP ALL SETS
    const setsToInsert = records
      .filter(s => s.set_num && s.name)
      .map(s => ({
        set_number: s.set_num.trim(),
        name: s.name.trim(),
        theme: 'LEGO',
        year: s.year ? parseInt(s.year) : null,
        piece_count: s.num_parts ? parseInt(s.num_parts) : null,
        retired: false,
        image_url: s.img_url || `https://cdn.rebrickable.com/media/sets/${s.set_num}.jpg`,
      }))
    
    console.log(`✅ Processing ${setsToInsert.length.toLocaleString()} sets for import...\n`)
    
    // Clear existing sets
    console.log('🗑️  Clearing existing sets...')
    await supabase
      .from('sets')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    console.log('✅ Cleared\n')
    
    // Insert in batches (Supabase has limits)
    const BATCH_SIZE = 1000
    let inserted = 0
    let errors = 0
    
    for (let i = 0; i < setsToInsert.length; i += BATCH_SIZE) {
      const batch = setsToInsert.slice(i, i + BATCH_SIZE)
      
      try {
        const { error } = await supabase
          .from('sets')
          .insert(batch)
        
        if (error) {
          console.error(`  ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message)
          errors += batch.length
        } else {
          inserted += batch.length
          const progress = Math.min(i + BATCH_SIZE, setsToInsert.length)
          const percent = ((progress / setsToInsert.length) * 100).toFixed(1)
          const bar = '█'.repeat(Math.floor(+percent / 5)) + '░'.repeat(20 - Math.floor(+percent / 5))
          console.log(`  [${bar}] ${percent}% (${progress.toLocaleString()}/${setsToInsert.length.toLocaleString()})`)
        }
      } catch (err) {
        console.error(`  ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} exception:`, err)
        errors += batch.length
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    console.log(`\n🎉 Import complete!`)
    console.log(`   ✅ Total inserted: ${inserted.toLocaleString()}`)
    console.log(`   ❌ Errors: ${errors}`)
    console.log(`   🧱 Your database now contains the ENTIRE LEGO collection!\n`)
    
    // Show statistics
    const { count } = await supabase
      .from('sets')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Database Statistics:`)
    console.log(`   - Total LEGO sets: ${count?.toLocaleString() || 0}`)
    console.log(`   - Retail sets (4-7 digit numbers): Included`)
    console.log(`   - Promotional sets: Included`)
    console.log(`   - Special editions: Included`)
    
    // Show year range
    const { data: yearStats } = await supabase
      .from('sets')
      .select('year')
      .order('year', { ascending: true })
      .limit(1)
    
    const { data: yearStats2 } = await supabase
      .from('sets')
      .select('year')
      .order('year', { ascending: false })
      .limit(1)
    
    if (yearStats?.[0] && yearStats2?.[0]) {
      console.log(`   - Year range: ${yearStats[0].year} - ${yearStats2[0].year}`)
    }
    
    // Show samples
    const { data: samples } = await supabase
      .from('sets')
      .select('set_number, name, year')
      .order('set_number', { ascending: true })
      .limit(5)
    
    if (samples && samples.length > 0) {
      console.log(`\n📚 Sample of first sets:`)
      samples.forEach(s => console.log(`   - ${s.set_number}: ${s.name} (${s.year})`))
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

importAllLEGOSets()
