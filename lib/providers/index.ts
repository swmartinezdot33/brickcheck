import { CatalogProvider, PriceProvider } from './base'
import { BricksetProvider } from './brickset'
import { BrickLinkProvider } from './bricklink'
import { MockCatalogProvider, MockPriceProvider } from './mock'

// Factory function to get the appropriate provider
// Falls back to mock if API keys are not configured
export function getCatalogProvider(): CatalogProvider {
  const apiKey = process.env.BRICKSET_API_KEY
  if (apiKey) {
    return new BricksetProvider(apiKey)
  }
  console.warn('BRICKSET_API_KEY not set, using mock provider')
  return new MockCatalogProvider()
}

export function getPriceProvider(): PriceProvider {
  const consumerKey = process.env.BRICKLINK_CONSUMER_KEY
  const consumerSecret = process.env.BRICKLINK_CONSUMER_SECRET
  const token = process.env.BRICKLINK_TOKEN
  const tokenSecret = process.env.BRICKLINK_TOKEN_SECRET

  if (consumerKey && consumerSecret && token && tokenSecret) {
    return new BrickLinkProvider()
  }
  console.warn('BrickLink API credentials not set, using mock provider')
  return new MockPriceProvider()
}

