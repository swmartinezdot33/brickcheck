import { gunzipSync } from 'zlib'
import { parse } from 'csv-parse/sync'

/**
 * Check Rebrickable set number patterns
 */
async function checkPatterns() {
  console.log('📥 Downloading and analyzing set patterns...\n')
  
  const response = await fetch('https://cdn.rebrickable.com/media/downloads/sets.csv.gz')
  const buffer = await response.arrayBuffer()
  const decompressed = gunzipSync(Buffer.from(buffer))
  const csvText = decompressed.toString('utf-8')
  
  const records: any[] = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
  })
  
  // Get unique set_num patterns
  const patterns = new Map<string, number>()
  records.forEach(r => {
    const num = r.set_num || ''
    const pattern = num.replace(/\d/g, 'N').replace(/[a-z]/g, 'x').replace(/[A-Z]/g, 'X')
    patterns.set(pattern, (patterns.get(pattern) || 0) + 1)
  })
  
  console.log('Set number patterns found (top 20):')
  Array.from(patterns.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([pattern, count]) => {
      console.log(`  ${pattern}: ${count}`)
    })
  
  // Show sample sets with their patterns
  console.log('\nSample set numbers:')
  records.slice(0, 50).forEach((r, i) => {
    const pattern = r.set_num.replace(/\d/g, 'N').replace(/[a-z]/g, 'x').replace(/[A-Z]/g, 'X')
    if (i < 30) {
      console.log(`  "${r.set_num}" (pattern: ${pattern}) -> ${r.name}`)
    }
  })
}

checkPatterns().catch(console.error)



