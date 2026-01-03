import { CatalogProvider, PriceProvider } from './base'
import { CompositeCatalogProvider, CompositePriceProvider } from './composite'
import { LocalCatalogProvider } from './local-catalog'

/**
 * Factory function to get a local-first catalog provider
 * Checks local database first, falls back to API providers only if not found
 * Automatically caches all API results permanently
 */
export function getCatalogProvider(): CatalogProvider {
  return new LocalCatalogProvider()
}

/**
 * Factory function to get a composite price provider
 * Aggregates data from ALL available sources (BrickEconomy, BrickLink)
 * NO MOCK DATA - throws error if no APIs are configured
 */
export function getPriceProvider(): PriceProvider {
  return new CompositePriceProvider()
}

