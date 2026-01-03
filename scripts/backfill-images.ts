import { config } from 'dotenv'
import { resolve } from 'path'
import { createServiceClient } from '@/lib/supabase/service'

config({ path: resolve(process.cwd(), '.env.local') })

/**
 * Backfill image URLs for sets that don't have them
 * Uses Rebrickable CDN format: https://cdn.rebrickable.com/media/sets/{set_num}.jpg
 */
async function backfillImages() {
  const supabase = createServiceClient()
  
  console.log('🖼️  Starting image URL backfill...\n')
  
  // Process in batches
  let totalUpdated = 0
  let totalErrors = 0
  let offset = 0
  const batchSize = 1000
  
  while (true) {
    // Get sets without images
    const { data: setsWithoutImages, error } = await supabase
      .from('sets')
      .select('set_number, name, image_url, data_source')
      .or('image_url.is.null,image_url.eq.')
      .range(offset, offset + batchSize - 1)
  
    if (error) {
      console.error('Error fetching sets:', error)
      break
    }
    
    if (!setsWithoutImages || setsWithoutImages.length === 0) {
      break // No more sets to process
    }
    
    if (offset === 0) {
      console.log(`Found sets without images (processing in batches of ${batchSize})...`)
      console.log('Updating with Rebrickable CDN URLs...\n')
    }
    
    let updated = 0
    let errors = 0
    
    for (const set of setsWithoutImages) {
      // Construct Rebrickable image URL
      const imageUrl = `https://cdn.rebrickable.com/media/sets/${set.set_number}.jpg`
      
      const { error: updateError } = await supabase
        .from('sets')
        .update({ image_url: imageUrl })
        .eq('set_number', set.set_number)
      
      if (updateError) {
        console.error(`Error updating ${set.set_number}:`, updateError.message)
        errors++
        totalErrors++
      } else {
        updated++
        totalUpdated++
      }
    }
    
    console.log(`  Batch ${Math.floor(offset / batchSize) + 1}: Updated ${updated} sets (${errors} errors)`)
    
    if (setsWithoutImages.length < batchSize) {
      break // Last batch
    }
    
    offset += batchSize
  }
  
  console.log(`\n✅ Backfill complete!`)
  console.log(`   - Total Updated: ${totalUpdated}`)
  console.log(`   - Total Errors: ${totalErrors}`)
  console.log(`\nNote: Some image URLs may not exist on Rebrickable CDN.`)
  console.log(`The frontend will handle missing images gracefully.`)
}

backfillImages().catch(console.error)

