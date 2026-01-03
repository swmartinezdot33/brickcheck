import { CatalogProvider, SetMetadata } from './base'

// Brickset API v3 provider
// Documentation: https://brickset.com/article/52664/api-version-3-documentation
export class BricksetProvider implements CatalogProvider {
  private apiKey?: string
  private baseUrl = 'https://brickset.com/api/v3.asmx'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BRICKSET_API_KEY
  }

  private async makeRequest(method: string, params: Record<string, string> = {}) {
    if (!this.apiKey) {
      throw new Error('Brickset API key not configured. Set BRICKSET_API_KEY environment variable.')
    }

    const url = new URL(this.baseUrl)
    url.searchParams.set('apiKey', this.apiKey)
    url.searchParams.set('method', method)
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Brickset API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Brickset API request failed:', error)
      throw error
    }
  }

  async searchSets(query: string): Promise<SetMetadata[]> {
    try {
      const data = await this.makeRequest('getSets', {
        query: query,
        orderBy: 'Number',
        pageSize: '50',
      })

      if (!data.sets || !Array.isArray(data.sets)) {
        return []
      }

      return data.sets.map((set: any) => ({
        setNumber: set.number || '',
        name: set.name || '',
        theme: set.theme || undefined,
        year: set.year ? parseInt(set.year) : undefined,
        pieceCount: set.pieces ? parseInt(set.pieces) : undefined,
        msrpCents: set.USRetailPrice ? Math.round(parseFloat(set.USRetailPrice) * 100) : undefined,
        imageUrl: set.imageURL || undefined,
        retired: set.retired === 'true' || set.retired === true,
        bricksetId: set.setID?.toString() || undefined,
        bricklinkId: undefined, // Brickset doesn't provide BrickLink IDs directly
        gtin: set.barcode || set.EAN || undefined,
      }))
    } catch (error) {
      console.error('Error searching Brickset:', error)
      // Return empty array on error rather than throwing
      return []
    }
  }

  async getSetByNumber(setNumber: string): Promise<SetMetadata | null> {
    try {
      const data = await this.makeRequest('getSets', {
        setNumber: setNumber,
      })

      if (!data.sets || !Array.isArray(data.sets) || data.sets.length === 0) {
        return null
      }

      const set = data.sets[0]
      return {
        setNumber: set.number || setNumber,
        name: set.name || '',
        theme: set.theme || undefined,
        year: set.year ? parseInt(set.year) : undefined,
        pieceCount: set.pieces ? parseInt(set.pieces) : undefined,
        msrpCents: set.USRetailPrice ? Math.round(parseFloat(set.USRetailPrice) * 100) : undefined,
        imageUrl: set.imageURL || undefined,
        retired: set.retired === 'true' || set.retired === true,
        bricksetId: set.setID?.toString() || undefined,
        bricklinkId: undefined,
        gtin: set.barcode || set.EAN || undefined,
      }
    } catch (error) {
      console.error('Error fetching set from Brickset:', error)
      return null
    }
  }

  async getSetByGTIN(gtin: string): Promise<SetMetadata | null> {
    try {
      // Brickset API doesn't have direct GTIN lookup, so we search by barcode
      const data = await this.makeRequest('getSets', {
        barcode: gtin,
      })

      if (!data.sets || !Array.isArray(data.sets) || data.sets.length === 0) {
        return null
      }

      const set = data.sets[0]
      return {
        setNumber: set.number || '',
        name: set.name || '',
        theme: set.theme || undefined,
        year: set.year ? parseInt(set.year) : undefined,
        pieceCount: set.pieces ? parseInt(set.pieces) : undefined,
        msrpCents: set.USRetailPrice ? Math.round(parseFloat(set.USRetailPrice) * 100) : undefined,
        imageUrl: set.imageURL || undefined,
        retired: set.retired === 'true' || set.retired === true,
        bricksetId: set.setID?.toString() || undefined,
        bricklinkId: undefined,
        gtin: set.barcode || set.EAN || gtin,
      }
    } catch (error) {
      console.error('Error fetching set by GTIN from Brickset:', error)
      return null
    }
  }
}
