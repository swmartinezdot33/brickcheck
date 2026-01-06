/**
 * Test script to debug search API issues
 * Run with: npx tsx test-search-api.ts
 */

async function testSearchAPI() {
  const query = process.argv[2] || '75192'
  console.log(`\n🔍 Testing search API with query: "${query}"\n`)

  try {
    const url = `http://localhost:3000/api/searchSets?q=${encodeURIComponent(query)}`
    console.log(`Making request to: ${url}\n`)

    const response = await fetch(url)
    const data = await response.json()

    console.log(`Response status: ${response.status}`)
    console.log(`Response OK: ${response.ok}\n`)

    if (data.results) {
      console.log(`✅ Found ${data.results.length} results:`)
      data.results.slice(0, 5).forEach((set: any, i: number) => {
        console.log(`  ${i + 1}. ${set.name} (#${set.set_number})`)
      })
      if (data.results.length > 5) {
        console.log(`  ... and ${data.results.length - 5} more`)
      }
    } else {
      console.log(`❌ No results in response`)
    }

    if (data.error) {
      console.log(`\n❌ Error: ${data.error}`)
    }
    if (data.warning) {
      console.log(`\n⚠️  Warning: ${data.warning}`)
    }
    if (data.message) {
      console.log(`\n📝 Message: ${data.message}`)
    }

    console.log(`\nFull response:`, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testSearchAPI()






