import { gunzipSync } from 'zlib'
import { parse } from 'csv-parse/sync'

/**
 * Check Rebrickable CSV format
 */
async function checkFormat() {
  console.log('📥 Downloading and checking format...')
  
  const response = await fetch('https://cdn.rebrickable.com/media/downloads/sets.csv.gz')
  const buffer = await response.arrayBuffer()
  const decompressed = gunzipSync(Buffer.from(buffer))
  const csvText = decompressed.toString('utf-8')
  
  // Get first few lines
  const lines = csvText.split('\n').slice(0, 5)
  console.log('First 5 lines:')
  lines.forEach((line, i) => {
    console.log(`${i}: ${line.substring(0, 150)}`)
  })
  
  // Parse first record
  const records: any[] = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
  })
  
  console.log(`\nFirst record keys:`, Object.keys(records[0]))
  console.log('\nFirst record:', records[0])
}

checkFormat().catch(console.error)



