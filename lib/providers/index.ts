import { CatalogProvider, PriceProvider } from './base'
import { CompositeCatalogProvider, CompositePriceProvider } from './composite'

/**
 * Factory function to get a composite catalog provider
 * Aggregates data from ALL available sources (BrickEconomy, Brickset)
 * NO MOCK DATA - throws error if no APIs are configured
 */
export function getCatalogProvider(): CatalogProvider {
  return new CompositeCatalogProvider()
}

/**
 * Factory function to get a composite price provider
 * Aggregates data from ALL available sources (BrickEconomy, BrickLink)
 * NO MOCK DATA - throws error if no APIs are configured
 */
export function getPriceProvider(): PriceProvider {
  return new CompositePriceProvider()
}

