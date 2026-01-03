import { CatalogProvider, PriceProvider } from './base'
import { BricksetProvider } from './brickset'
import { BrickLinkProvider } from './bricklink'
import { BrickEconomyProvider } from './brickeconomy'

// Factory function to get the appropriate provider
// NO MOCK DATA - throws error if APIs are not configured
export function getCatalogProvider(): CatalogProvider {
  // Try BrickEconomy first (if available)
  const brickEconomyKey = process.env.BRICKECONOMY_API_KEY
  if (brickEconomyKey) {
    return new BrickEconomyProvider(brickEconomyKey)
  }

  // Fall back to Brickset
  const bricksetKey = process.env.BRICKSET_API_KEY
  if (bricksetKey) {
    return new BricksetProvider(bricksetKey)
  }

  // NO MOCK - throw error
  throw new Error(
    'No catalog API configured. Set either BRICKECONOMY_API_KEY or BRICKSET_API_KEY environment variable.'
  )
}

export function getPriceProvider(): PriceProvider {
  // Try BrickEconomy first (if available)
  const brickEconomyKey = process.env.BRICKECONOMY_API_KEY
  if (brickEconomyKey) {
    return new BrickEconomyProvider(brickEconomyKey)
  }

  // Fall back to BrickLink
  const consumerKey = process.env.BRICKLINK_CONSUMER_KEY
  const consumerSecret = process.env.BRICKLINK_CONSUMER_SECRET
  const token = process.env.BRICKLINK_TOKEN
  const tokenSecret = process.env.BRICKLINK_TOKEN_SECRET

  if (consumerKey && consumerSecret && token && tokenSecret) {
    return new BrickLinkProvider()
  }

  // NO MOCK - throw error
  throw new Error(
    'No price API configured. Set either BRICKECONOMY_API_KEY or all BrickLink credentials (BRICKLINK_CONSUMER_KEY, BRICKLINK_CONSUMER_SECRET, BRICKLINK_TOKEN, BRICKLINK_TOKEN_SECRET) environment variables.'
  )
}

