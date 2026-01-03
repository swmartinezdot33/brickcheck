import { CatalogProvider, PriceProvider, SetMetadata, PriceData } from './base'
import { BricksetProvider } from './brickset'
import { BrickLinkProvider } from './bricklink'
import { BrickEconomyProvider } from './brickeconomy'

/**
 * Composite provider that aggregates data from all available sources
 * Tries multiple providers and merges results for comprehensive data
 */
export class CompositeCatalogProvider implements CatalogProvider {
  private providers: CatalogProvider[] = []

  constructor() {
    // Add all available providers
    // Prioritize BrickEconomy (better rate limits) over Brickset (100/day limit)
    if (process.env.BRICKECONOMY_API_KEY) {
      this.providers.push(new BrickEconomyProvider(process.env.BRICKECONOMY_API_KEY))
    }
    if (process.env.BRICKSET_API_KEY) {
      this.providers.push(new BricksetProvider(process.env.BRICKSET_API_KEY))
    }

    if (this.providers.length === 0) {
      throw new Error(
        'No catalog API configured. Set BRICKECONOMY_API_KEY or BRICKSET_API_KEY environment variable.'
      )
    }
  }

  async searchSets(query: string): Promise<SetMetadata[]> {
    const allResults: SetMetadata[] = []
    const seenSetNumbers = new Set<string>()

    // Try all providers and merge results
    for (const provider of this.providers) {
      try {
        console.log(`[CompositeCatalogProvider] Searching with ${provider.constructor.name} for: "${query}"`)
        const results = await provider.searchSets(query)
        console.log(`[CompositeCatalogProvider] ${provider.constructor.name} returned ${results.length} results`)
        for (const result of results) {
          // Deduplicate by set number, prefer more complete data
          if (!seenSetNumbers.has(result.setNumber)) {
            allResults.push(result)
            seenSetNumbers.add(result.setNumber)
          } else {
            // Merge with existing result if this one has more data
            const existing = allResults.find((r) => r.setNumber === result.setNumber)
            if (existing) {
              // Prefer non-null/undefined values
              if (!existing.name && result.name) existing.name = result.name
              if (!existing.theme && result.theme) existing.theme = result.theme
              if (!existing.year && result.year) existing.year = result.year
              if (!existing.pieceCount && result.pieceCount) existing.pieceCount = result.pieceCount
              if (!existing.msrpCents && result.msrpCents) existing.msrpCents = result.msrpCents
              if (!existing.imageUrl && result.imageUrl) existing.imageUrl = result.imageUrl
              if (result.retired !== undefined) existing.retired = result.retired
              if (!existing.bricksetId && result.bricksetId) existing.bricksetId = result.bricksetId
              if (!existing.bricklinkId && result.bricklinkId) existing.bricklinkId = result.bricklinkId
              if (!existing.gtin && result.gtin) existing.gtin = result.gtin
            }
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error(`[CompositeCatalogProvider] Provider ${provider.constructor.name} failed for search:`, errorMsg)
        // If it's a rate limit, log it but continue with other providers
        if (errorMsg.includes('rate limit') || errorMsg.includes('limit exceeded')) {
          console.warn(`[CompositeCatalogProvider] ${provider.constructor.name} hit rate limit, trying other providers...`)
        }
        // Continue with other providers
      }
    }

    return allResults
  }

  async getSetByNumber(setNumber: string): Promise<SetMetadata | null> {
    // Try all providers, return first successful result
    for (const provider of this.providers) {
      try {
        const result = await provider.getSetByNumber(setNumber)
        if (result) {
          return result
        }
      } catch (error) {
        console.warn(`Provider ${provider.constructor.name} failed for set number ${setNumber}:`, error)
        // Continue with next provider
      }
    }

    return null
  }

  async getSetByGTIN(gtin: string): Promise<SetMetadata | null> {
    // Try all providers, return first successful result
    for (const provider of this.providers) {
      try {
        const result = await provider.getSetByGTIN(gtin)
        if (result) {
          return result
        }
      } catch (error) {
        console.warn(`Provider ${provider.constructor.name} failed for GTIN ${gtin}:`, error)
        // Continue with next provider
      }
    }

    return null
  }
}

/**
 * Composite price provider that aggregates data from all available sources
 * Combines price data from multiple providers for better accuracy
 */
export class CompositePriceProvider implements PriceProvider {
  private providers: PriceProvider[] = []

  constructor() {
    // Add all available providers
    if (process.env.BRICKECONOMY_API_KEY) {
      this.providers.push(new BrickEconomyProvider(process.env.BRICKECONOMY_API_KEY))
    }
    if (
      process.env.BRICKLINK_CONSUMER_KEY &&
      process.env.BRICKLINK_CONSUMER_SECRET &&
      process.env.BRICKLINK_TOKEN &&
      process.env.BRICKLINK_TOKEN_SECRET
    ) {
      this.providers.push(new BrickLinkProvider())
    }

    if (this.providers.length === 0) {
      throw new Error(
        'No price API configured. Set BRICKECONOMY_API_KEY or all BrickLink credentials (BRICKLINK_CONSUMER_KEY, BRICKLINK_CONSUMER_SECRET, BRICKLINK_TOKEN, BRICKLINK_TOKEN_SECRET) environment variables.'
      )
    }
  }

  async getPrices(setNumber: string, condition: 'SEALED' | 'USED'): Promise<PriceData[]> {
    const allPrices: PriceData[] = []
    const seenTimestamps = new Set<string>()

    // Try all providers and merge results
    for (const provider of this.providers) {
      try {
        const providerName = provider.constructor.name.replace('Provider', '').toUpperCase()
        const prices = await provider.getPrices(setNumber, condition)
        for (const price of prices) {
          // Add provider source to metadata
          const enrichedPrice: PriceData = {
            ...price,
            metadata: {
              ...price.metadata,
              provider: providerName,
              source: providerName,
            },
          }

          // Deduplicate by timestamp (within 1 hour tolerance)
          const timestamp = new Date(price.timestamp).toISOString()
          const hourKey = timestamp.substring(0, 13) // YYYY-MM-DDTHH

          if (!seenTimestamps.has(hourKey)) {
            allPrices.push(enrichedPrice)
            seenTimestamps.add(hourKey)
          } else {
            // If we have duplicate timestamps, prefer data with more metadata
            const existing = allPrices.find((p) => {
              const existingHour = new Date(p.timestamp).toISOString().substring(0, 13)
              return existingHour === hourKey
            })
            if (existing && enrichedPrice.metadata && !existing.metadata) {
              // Replace with more complete data
              const index = allPrices.indexOf(existing)
              allPrices[index] = enrichedPrice
            } else if (existing && enrichedPrice.sampleSize && (!existing.sampleSize || enrichedPrice.sampleSize > existing.sampleSize)) {
              // Prefer data with larger sample size
              const index = allPrices.indexOf(existing)
              allPrices[index] = enrichedPrice
            }
          }
        }
      } catch (error) {
        console.warn(`Provider ${provider.constructor.name} failed for prices:`, error)
        // Continue with other providers
      }
    }

    // Sort by timestamp (newest first)
    return allPrices.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
  }

  async refreshPrices(setNumber: string): Promise<PriceData[]> {
    const allPrices: PriceData[] = []

    // Try all providers and get latest prices
    for (const provider of this.providers) {
      try {
        const providerName = provider.constructor.name.replace('Provider', '').toUpperCase()
        const prices = await provider.refreshPrices(setNumber)
        // Add provider source to metadata
        const enrichedPrices = prices.map((price) => ({
          ...price,
          metadata: {
            ...price.metadata,
            provider: providerName,
            source: providerName,
          },
        }))
        allPrices.push(...enrichedPrices)
      } catch (error) {
        console.warn(`Provider ${provider.constructor.name} failed for refresh:`, error)
        // Continue with other providers
      }
    }

    // Deduplicate by condition and return latest (prefer larger sample sizes)
    const sealed = allPrices
      .filter((p) => p.condition === 'SEALED')
      .sort((a, b) => {
        // Prefer larger sample size, then newer timestamp
        if (a.sampleSize && b.sampleSize && a.sampleSize !== b.sampleSize) {
          return b.sampleSize - a.sampleSize
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })[0]

    const used = allPrices
      .filter((p) => p.condition === 'USED')
      .sort((a, b) => {
        // Prefer larger sample size, then newer timestamp
        if (a.sampleSize && b.sampleSize && a.sampleSize !== b.sampleSize) {
          return b.sampleSize - a.sampleSize
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })[0]

    return [sealed, used].filter(Boolean) as PriceData[]
  }
}

