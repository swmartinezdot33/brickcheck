/**
 * Test script to verify API integrations are working
 * Run with: npx tsx test-apis.ts
 */

import { BricksetProvider } from './lib/providers/brickset'
import { BrickEconomyProvider } from './lib/providers/brickeconomy'
import { BrickLinkProvider } from './lib/providers/bricklink'

async function testBrickset() {
  console.log('\n=== Testing Brickset API ===')
  const provider = new BricksetProvider(process.env.BRICKSET_API_KEY)
  
  try {
    console.log('API Key:', process.env.BRICKSET_API_KEY ? '✅ Set' : '❌ Missing')
    const results = await provider.searchSets('75192')
    console.log('Search results:', results.length)
    if (results.length > 0) {
      console.log('First result:', JSON.stringify(results[0], null, 2))
    } else {
      console.log('⚠️ No results returned')
    }
  } catch (error) {
    console.error('❌ Brickset API Error:', error instanceof Error ? error.message : error)
  }
}

async function testBrickEconomy() {
  console.log('\n=== Testing BrickEconomy API ===')
  const provider = new BrickEconomyProvider(process.env.BRICKECONOMY_API_KEY)
  
  try {
    console.log('API Key:', process.env.BRICKECONOMY_API_KEY ? '✅ Set' : '❌ Missing')
    const results = await provider.searchSets('75192')
    console.log('Search results:', results.length)
    if (results.length > 0) {
      console.log('First result:', JSON.stringify(results[0], null, 2))
    } else {
      console.log('⚠️ No results returned')
    }
  } catch (error) {
    console.error('❌ BrickEconomy API Error:', error instanceof Error ? error.message : error)
  }
}

async function testBrickLink() {
  console.log('\n=== Testing BrickLink API ===')
  const hasCredentials = 
    process.env.BRICKLINK_CONSUMER_KEY &&
    process.env.BRICKLINK_CONSUMER_SECRET &&
    process.env.BRICKLINK_TOKEN &&
    process.env.BRICKLINK_TOKEN_SECRET
  
  console.log('Credentials:', hasCredentials ? '✅ All set' : '❌ Missing')
  
  if (hasCredentials) {
    try {
      const provider = new BrickLinkProvider()
      const prices = await provider.getPrices('75192', 'SEALED')
      console.log('Price results:', prices.length)
      if (prices.length > 0) {
        console.log('First price:', JSON.stringify(prices[0], null, 2))
      } else {
        console.log('⚠️ No prices returned')
      }
    } catch (error) {
      console.error('❌ BrickLink API Error:', error instanceof Error ? error.message : error)
    }
  }
}

async function main() {
  console.log('🔍 Testing API Integrations...\n')
  console.log('Environment variables:')
  console.log('BRICKSET_API_KEY:', process.env.BRICKSET_API_KEY ? '✅' : '❌')
  console.log('BRICKECONOMY_API_KEY:', process.env.BRICKECONOMY_API_KEY ? '✅' : '❌')
  console.log('BRICKLINK_CONSUMER_KEY:', process.env.BRICKLINK_CONSUMER_KEY ? '✅' : '❌')
  
  await testBrickset()
  await testBrickEconomy()
  await testBrickLink()
  
  console.log('\n✅ Testing complete!')
}

main().catch(console.error)

