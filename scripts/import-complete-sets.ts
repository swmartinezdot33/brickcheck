import { config } from 'dotenv'
import { resolve } from 'path'
import { createServiceClient } from '@/lib/supabase/service'

config({ path: resolve(process.cwd(), '.env.local') })

/**
 * Import complete sets and minifigure series
 * These are collectible sets like Spider-Man minifigure series, Animals series, etc.
 * Data source: BrickEconomy and internal knowledge
 */
async function importCompleteSets() {
  const supabase = createServiceClient()

  console.log('📦 Importing complete sets and minifigure series...\n')

  try {
    // Complete sets from BrickEconomy (minifigure series, collectibles, etc.)
    const completeSets = [
      // Spider-Man Minifigure Series
      {
        set_number: '71031-1',
        name: 'Spider-Man: Across the Spider-Verse Minifigures Series',
        theme: 'Minifigure Series / Spider-Man: Across the Spider-Verse',
        year: 2025,
        piece_count: 12,
        minifigure_count: 12,
        set_type: 'MINIFIGURE_SERIES',
        is_complete_set: true,
        image_url: 'https://cdn.rebrickable.com/media/sets/71031-1.jpg',
      },
      // Animals Series 28
      {
        set_number: '71033-1',
        name: 'Animals Series 28 Complete Set',
        theme: 'Minifigure Series / Animals Series 28',
        year: 2026,
        piece_count: 12,
        minifigure_count: 12,
        set_type: 'MINIFIGURE_SERIES',
        is_complete_set: true,
        image_url: 'https://cdn.rebrickable.com/media/sets/71033-1.jpg',
      },
      // F1 Collectible Race Cars
      {
        set_number: '71034-1',
        name: 'F1 Collectible Race Cars Complete Set',
        theme: 'Minifigure Series / F1 Collectible Race Cars',
        year: 2025,
        piece_count: 12,
        minifigure_count: 12,
        set_type: 'MINIFIGURE_SERIES',
        is_complete_set: true,
        image_url: 'https://cdn.rebrickable.com/media/sets/71034-1.jpg',
      },
    ]

    console.log(`📊 Preparing to import ${completeSets.length} complete sets\n`)

    let inserted = 0
    let updated = 0
    let errors = 0

    for (const setData of completeSets) {
      try {
        // Check if set already exists
        const { data: existing } = await supabase
          .from('sets')
          .select('id')
          .eq('set_number', setData.set_number)
          .maybeSingle()

        if (existing) {
          // Update existing set with complete set info
          const { error: updateError } = await supabase
            .from('sets')
            .update({
              is_complete_set: setData.is_complete_set,
              minifigure_count: setData.minifigure_count,
              set_type: setData.set_type,
            })
            .eq('id', existing.id)

          if (updateError) {
            console.error(`  ❌ Error updating ${setData.set_number}:`, updateError.message)
            errors++
          } else {
            console.log(`  ✏️  Updated: ${setData.name}`)
            updated++
          }
        } else {
          // Insert new set
          const { error: insertError } = await supabase
            .from('sets')
            .insert({
              ...setData,
              retired: false,
            })

          if (insertError) {
            console.error(`  ❌ Error inserting ${setData.set_number}:`, insertError.message)
            errors++
          } else {
            console.log(`  ✨ Added: ${setData.name}`)
            inserted++
          }
        }
      } catch (error) {
        console.error(`  ❌ Exception for ${setData.set_number}:`, error)
        errors++
      }
    }

    console.log(`\n📊 Import Results:`)
    console.log(`   ✨ Inserted: ${inserted}`)
    console.log(`   ✏️  Updated: ${updated}`)
    console.log(`   ❌ Errors: ${errors}`)
    console.log(`\n✅ Complete sets import finished!\n`)

    // Show what was imported
    const { data: allCompleteSets, error: fetchError } = await supabase
      .from('sets')
      .select('set_number, name, set_type, minifigure_count')
      .eq('is_complete_set', true)

    if (!fetchError && allCompleteSets) {
      console.log(`📚 Complete Sets in Database: ${allCompleteSets.length}`)
      allCompleteSets.forEach((set) => {
        console.log(
          `   - ${set.set_number}: ${set.name} (${set.minifigure_count} minifigs)`
        )
      })
    }
  } catch (error) {
    console.error('❌ Fatal error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

importCompleteSets()

