import { CatalogProvider, SetMetadata } from './base'

// Brickset API v3 provider
// Documentation: https://brickset.com/article/52664/api-version-3-documentation
export class BricksetProvider implements CatalogProvider {
  private apiKey?: string
  private baseUrl = 'https://brickset.com/api/v3.asmx'
  private userHash?: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BRICKSET_API_KEY
  }

  private async getUserHash(): Promise<string | null> {
    // Brickset API requires userHash for most methods
    // The login method requires username/password, which we don't have
    // However, some methods might work with just apiKey
    // For now, we'll try without userHash and handle errors gracefully
    return null
  }

  private async makeRequest(method: string, params: Record<string, string> = {}) {
    if (!this.apiKey) {
      throw new Error('Brickset API key not configured. Set BRICKSET_API_KEY environment variable.')
    }

    // Brickset API v3 uses SOAP-style endpoints
    // Format: https://brickset.com/api/v3.asmx/{method}?apiKey=xxx&userHash=xxx&param1=value1...
    const url = new URL(`${this.baseUrl}/${method}`)
    url.searchParams.set('apiKey', this.apiKey)
    
    // Add userHash if available (required for most methods)
    // Note: userHash is obtained via login method, which requires username/password
    // For public data access, we may need to use a different approach
    if (this.userHash) {
      url.searchParams.set('userHash', this.userHash)
    } else {
      // Try with empty userHash - some methods might work
      url.searchParams.set('userHash', '')
    }
    
    // For getSets, we need to pass a JSON string in the 'params' query parameter
    if (method === 'getSets') {
      url.searchParams.set('params', JSON.stringify(params))
    } else {
      // For other methods, parameters might be direct
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          url.searchParams.set(key, value)
        }
      })
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      const responseText = await response.text()
      console.log(`[BricksetProvider] API Response status: ${response.status}`)
      console.log(`[BricksetProvider] API Response preview: ${responseText.substring(0, 200)}`)

      if (!response.ok) {
        console.error('Brickset API error response:', responseText)
        // If it's a userHash error, log it but don't fail completely
        if (responseText.includes('userHash') || responseText.includes('userHash')) {
          throw new Error('Brickset API requires userHash. Some methods may need user authentication via login.')
        }
        throw new Error(`Brickset API error: ${response.status} ${response.statusText}`)
      }

      // Brickset API v3 returns XML (SOAP), not JSON
      // We need to parse XML or use a different approach
      // For now, check if it's XML and log the structure
      if (responseText.trim().startsWith('<?xml') || responseText.trim().startsWith('<')) {
        console.warn('[BricksetProvider] API returned XML (SOAP) format. XML parsing not yet implemented.')
        console.log('[BricksetProvider] XML response structure:', responseText.substring(0, 500))
        // Try to extract basic info from XML using regex (temporary solution)
        const setNumberMatch = responseText.match(/<number>(.*?)<\/number>/)
        const nameMatch = responseText.match(/<name>(.*?)<\/name>/)
        
        if (setNumberMatch && nameMatch) {
          // Return a basic result from XML
          return {
            sets: [{
              number: setNumberMatch[1],
              name: nameMatch[1],
            }]
          }
        }
        
        throw new Error('Brickset API returned XML format. XML parsing needs to be implemented.')
      }

      // Try to parse as JSON
      try {
        const data = JSON.parse(responseText)
        return data
      } catch (parseError) {
        console.error('[BricksetProvider] Failed to parse response as JSON:', parseError)
        throw new Error('Brickset API returned unexpected format: ' + responseText.substring(0, 200))
      }
    } catch (error) {
      console.error('Brickset API request failed:', error)
      throw error
    }
  }

  async searchSets(query: string): Promise<SetMetadata[]> {
    try {
      console.log(`[BricksetProvider] Searching for: "${query}"`)
      const data = await this.makeRequest('getSets', {
        query: query,
        orderBy: 'Number',
        pageSize: '50',
      })

      console.log(`[BricksetProvider] Raw API response:`, JSON.stringify(data).substring(0, 500))

      if (!data.sets || !Array.isArray(data.sets)) {
        console.log(`[BricksetProvider] No sets in response or invalid format`)
        return []
      }
      
      console.log(`[BricksetProvider] Found ${data.sets.length} sets`)

      return data.sets.map((set: any) => {
        // Handle nested barcode object (EAN/UPC)
        let gtin: string | undefined = undefined
        if (set.barcode) {
          if (typeof set.barcode === 'string') gtin = set.barcode
          else if (typeof set.barcode === 'object') gtin = set.barcode.EAN || set.barcode.UPC
        } else {
          gtin = set.EAN || set.UPC
        }

        // Determine retired status
        let retired = false
        if (set.retired !== undefined) {
          retired = set.retired === 'true' || set.retired === true
        } else if (set.exitDate) {
          // If exit date is in the past, it's retired
          retired = new Date(set.exitDate) < new Date()
        }

        return {
          setNumber: set.number || '',
          name: set.name || '',
          theme: set.theme || undefined,
          year: set.year ? parseInt(set.year) : undefined,
          pieceCount: set.pieces ? parseInt(set.pieces) : undefined,
          msrpCents: set.USRetailPrice ? Math.round(parseFloat(set.USRetailPrice) * 100) : undefined,
          imageUrl: set.imageURL || undefined,
          retired: retired,
          bricksetId: set.setID?.toString() || undefined,
          bricklinkId: undefined, // Brickset doesn't provide BrickLink IDs directly
          gtin: gtin,
        }
      })
    } catch (error) {
      console.error('Error searching Brickset:', error)
      // Return empty array on error rather than throwing
      return []
    }
  }

  async getSetByNumber(setNumber: string): Promise<SetMetadata | null> {
    try {
      // 1. Try exact match first
      let data = await this.makeRequest('getSets', {
        setNumber: setNumber,
      })

      // 2. If no results, and setNumber doesn't have a variant, try appending '-1'
      if ((!data.sets || data.sets.length === 0) && !setNumber.includes('-')) {
        console.log(`[BricksetProvider] No exact match for ${setNumber}, trying ${setNumber}-1`)
        data = await this.makeRequest('getSets', {
          setNumber: `${setNumber}-1`,
        })
      }

      // 3. If still no results, try using 'query' instead of 'setNumber'
      if (!data.sets || data.sets.length === 0) {
        console.log(`[BricksetProvider] No match by setNumber for ${setNumber}, trying query`)
        data = await this.makeRequest('getSets', {
          query: setNumber,
          pageSize: '1'
        })
      }

      if (!data.sets || !Array.isArray(data.sets) || data.sets.length === 0) {
        return null
      }

      const set = data.sets[0]

      // Handle nested barcode object (EAN/UPC)
      let gtin: string | undefined = undefined
      if (set.barcode) {
        if (typeof set.barcode === 'string') gtin = set.barcode
        else if (typeof set.barcode === 'object') gtin = set.barcode.EAN || set.barcode.UPC
      } else {
        gtin = set.EAN || set.UPC
      }

      // Determine retired status
      let retired = false
      if (set.retired !== undefined) {
        retired = set.retired === 'true' || set.retired === true
      } else if (set.exitDate) {
        // If exit date is in the past, it's retired
        retired = new Date(set.exitDate) < new Date()
      }

      return {
        setNumber: set.number || setNumber,
        name: set.name || '',
        theme: set.theme || undefined,
        year: set.year ? parseInt(set.year) : undefined,
        pieceCount: set.pieces ? parseInt(set.pieces) : undefined,
        msrpCents: set.USRetailPrice ? Math.round(parseFloat(set.USRetailPrice) * 100) : undefined,
        imageUrl: set.imageURL || undefined,
        retired: retired,
        bricksetId: set.setID?.toString() || undefined,
        bricklinkId: undefined,
        gtin: gtin,
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

      // Handle nested barcode object (EAN/UPC)
      let gtinVal: string | undefined = undefined
      if (set.barcode) {
        if (typeof set.barcode === 'string') gtinVal = set.barcode
        else if (typeof set.barcode === 'object') gtinVal = set.barcode.EAN || set.barcode.UPC
      } else {
        gtinVal = set.EAN || set.UPC
      }

      // Determine retired status
      let retired = false
      if (set.retired !== undefined) {
        retired = set.retired === 'true' || set.retired === true
      } else if (set.exitDate) {
        // If exit date is in the past, it's retired
        retired = new Date(set.exitDate) < new Date()
      }

      return {
        setNumber: set.number || '',
        name: set.name || '',
        theme: set.theme || undefined,
        year: set.year ? parseInt(set.year) : undefined,
        pieceCount: set.pieces ? parseInt(set.pieces) : undefined,
        msrpCents: set.USRetailPrice ? Math.round(parseFloat(set.USRetailPrice) * 100) : undefined,
        imageUrl: set.imageURL || undefined,
        retired: retired,
        bricksetId: set.setID?.toString() || undefined,
        bricklinkId: undefined,
        gtin: gtinVal || gtin,
      }
    } catch (error) {
      console.error('Error fetching set by GTIN from Brickset:', error)
      return null
    }
  }
}
