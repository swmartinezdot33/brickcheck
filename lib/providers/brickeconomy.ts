import { CatalogProvider, PriceProvider, SetMetadata, PriceData } from './base'

// BrickEconomy API provider
// Documentation: https://www.brickeconomy.com/api-reference
// Requires Premium membership with API key
export class BrickEconomyProvider implements CatalogProvider, PriceProvider {
  private apiKey?: string
  private baseUrl = 'https://www.brickeconomy.com/api/v1'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BRICKECONOMY_API_KEY
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}) {
    if (!this.apiKey) {
      throw new Error('BrickEconomy API key not configured. Set BRICKECONOMY_API_KEY environment variable.')
    }

    const url = new URL(`${this.baseUrl}${endpoint}`)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-apikey': this.apiKey,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('BrickEconomy API error:', response.status, errorText)
        throw new Error(`BrickEconomy API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('BrickEconomy API request failed:', error)
      throw error
    }
  }

  // CatalogProvider methods
  async searchSets(query: string): Promise<SetMetadata[]> {
    try {
      // BrickEconomy API search endpoint
      const data = await this.makeRequest('/sets/search', {
        q: query,
        limit: '50',
      })

      if (!data.sets || !Array.isArray(data.sets)) {
        return []
      }

      return data.sets.map((set: any) => ({
        setNumber: set.set_number || set.number || '',
        name: set.name || '',
        theme: set.theme || undefined,
        year: set.year ? parseInt(set.year) : undefined,
        pieceCount: set.pieces ? parseInt(set.pieces) : undefined,
        msrpCents: set.msrp ? Math.round(parseFloat(set.msrp) * 100) : undefined,
        imageUrl: set.image_url || set.imageURL || undefined,
        retired: set.retired === true || set.retired === 'true' || set.status === 'retired',
        bricksetId: set.brickset_id?.toString() || undefined,
        bricklinkId: set.bricklink_id?.toString() || undefined,
        gtin: set.gtin || set.barcode || undefined,
      }))
    } catch (error) {
      console.error('Error searching BrickEconomy:', error)
      throw error // Don't return empty array, throw so caller knows API failed
    }
  }

  async getSetByNumber(setNumber: string): Promise<SetMetadata | null> {
    try {
      const data = await this.makeRequest(`/sets/${setNumber}`)

      if (!data || !data.set_number) {
        return null
      }

      return {
        setNumber: data.set_number || data.number || setNumber,
        name: data.name || '',
        theme: data.theme || undefined,
        year: data.year ? parseInt(data.year) : undefined,
        pieceCount: data.pieces ? parseInt(data.pieces) : undefined,
        msrpCents: data.msrp ? Math.round(parseFloat(data.msrp) * 100) : undefined,
        imageUrl: data.image_url || data.imageURL || undefined,
        retired: data.retired === true || data.retired === 'true' || data.status === 'retired',
        bricksetId: data.brickset_id?.toString() || undefined,
        bricklinkId: data.bricklink_id?.toString() || undefined,
        gtin: data.gtin || data.barcode || undefined,
      }
    } catch (error) {
      console.error('Error fetching set from BrickEconomy:', error)
      return null
    }
  }

  async getSetByGTIN(gtin: string): Promise<SetMetadata | null> {
    try {
      // BrickEconomy may not have direct GTIN lookup, try search
      const data = await this.makeRequest('/sets/search', {
        barcode: gtin,
        limit: '1',
      })

      if (!data.sets || !Array.isArray(data.sets) || data.sets.length === 0) {
        return null
      }

      const set = data.sets[0]
      return {
        setNumber: set.set_number || set.number || '',
        name: set.name || '',
        theme: set.theme || undefined,
        year: set.year ? parseInt(set.year) : undefined,
        pieceCount: set.pieces ? parseInt(set.pieces) : undefined,
        msrpCents: set.msrp ? Math.round(parseFloat(set.msrp) * 100) : undefined,
        imageUrl: set.image_url || set.imageURL || undefined,
        retired: set.retired === true || set.retired === 'true' || set.status === 'retired',
        bricksetId: set.brickset_id?.toString() || undefined,
        bricklinkId: set.bricklink_id?.toString() || undefined,
        gtin: set.gtin || set.barcode || gtin,
      }
    } catch (error) {
      console.error('Error fetching set by GTIN from BrickEconomy:', error)
      return null
    }
  }

  // PriceProvider methods
  async getPrices(setNumber: string, condition: 'SEALED' | 'USED'): Promise<PriceData[]> {
    try {
      // Get price history from BrickEconomy
      const data = await this.makeRequest(`/sets/${setNumber}/prices`, {
        condition: condition.toLowerCase(),
      })

      if (!data.prices || !Array.isArray(data.prices)) {
        return []
      }

      return data.prices.map((price: any) => ({
        priceCents: Math.round(parseFloat(price.price || price.value || 0) * 100),
        currency: price.currency || 'USD',
        timestamp: price.date || price.timestamp || new Date().toISOString(),
        condition,
        sampleSize: price.sample_size || price.count || null,
        variance: price.variance || null,
        metadata: {
          source: 'BRICKECONOMY',
          ...price,
        },
      }))
    } catch (error) {
      console.error('Error fetching prices from BrickEconomy:', error)
      throw error // Don't return empty array, throw so caller knows API failed
    }
  }

  async refreshPrices(setNumber: string): Promise<PriceData[]> {
    try {
      // Get current prices for both conditions
      const [sealedPrices, usedPrices] = await Promise.all([
        this.getPrices(setNumber, 'SEALED').catch(() => []),
        this.getPrices(setNumber, 'USED').catch(() => []),
      ])

      // Return latest price for each condition
      return [
        ...(sealedPrices.length > 0 ? [sealedPrices[sealedPrices.length - 1]] : []),
        ...(usedPrices.length > 0 ? [usedPrices[usedPrices.length - 1]] : []),
      ]
    } catch (error) {
      console.error('Error refreshing prices from BrickEconomy:', error)
      throw error
    }
  }
}

