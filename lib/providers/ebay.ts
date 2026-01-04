import { PriceSnapshot } from '@/types'
import { PriceProvider, PriceData } from './base'

interface EbayItem {
  itemId: string
  title: string
  price: {
    value: string
    currency: string
  }
  condition: string
  seller?: {
    sellerAccountType: string
  }
}

interface EbaySearchResponse {
  itemSummaries: EbayItem[]
  total: number
}

/**
 * eBay provider for LEGO set pricing
 * Uses eBay Browse API to fetch current market listings
 * Supports searching and getting price data
 */
export class EbayProvider implements PriceProvider {
  private apiKey: string
  private apiUrl = 'https://api.ebay.com/buy/browse/v1'

  constructor() {
    this.apiKey = process.env.EBAY_API_KEY || ''
  }

  /**
   * Search for LEGO sets on eBay
   */
  async searchSets(query: string, limit: number = 10): Promise<PriceSnapshot[]> {
    if (!this.apiKey) {
      console.warn('[eBay] API key not configured')
      return []
    }

    try {
      const encodedQuery = encodeURIComponent(`${query} LEGO`)
      const url = `${this.apiUrl}/item_summary/search?q=${encodedQuery}&limit=${limit}&filter=buyingOptions:{FIXED_PRICE}`

      const response = await fetch(url, {
        headers: {
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          'X-EBAY-C-ENDUSERID': 'brickcheck',
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('[eBay] API error:', response.status)
        return []
      }

      const data: EbaySearchResponse = await response.json()

      // Convert eBay items to PriceSnapshots
      return data.itemSummaries
        .filter((item) => item.price)
        .map((item) => ({
          id: Math.random().toString(),
          set_id: '', // Will be populated by caller
          condition: this.mapCondition(item.condition),
          source: 'EBAY',
          price_cents: Math.round(parseFloat(item.price.value) * 100),
          currency: item.price.currency || 'USD',
          timestamp: new Date().toISOString(),
          sample_size: 1,
          variance: 0,
          metadata: {
            ebay_item_id: item.itemId,
            ebay_title: item.title,
            ebay_seller_type: item.seller?.sellerAccountType,
          },
          created_at: new Date().toISOString(),
        }))
    } catch (error) {
      console.error('[eBay] Search error:', error)
      return []
    }
  }

  /**
   * Get recent sold listings for a LEGO set
   * This gives better price data than active listings
   */
  async getSoldListings(setNumber: string): Promise<PriceSnapshot[]> {
    if (!this.apiKey) {
      console.warn('[eBay] API key not configured')
      return []
    }

    try {
      const encodedQuery = encodeURIComponent(`${setNumber}`)
      // Filter for sold items
      const url = `${this.apiUrl}/item_summary/search?q=${encodedQuery}%20LEGO&filter=buyingOptions:{AUCTION},conditions:{USED|NEW}&sort=-endDate&limit=20`

      const response = await fetch(url, {
        headers: {
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          'X-EBAY-C-ENDUSERID': 'brickcheck',
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        return []
      }

      const data: EbaySearchResponse = await response.json()

      return data.itemSummaries
        .filter((item) => item.price)
        .map((item) => ({
          id: Math.random().toString(),
          set_id: '',
          condition: this.mapCondition(item.condition),
          source: 'EBAY_SOLD',
          price_cents: Math.round(parseFloat(item.price.value) * 100),
          currency: item.price.currency || 'USD',
          timestamp: new Date().toISOString(),
          sample_size: 1,
          variance: 0,
          metadata: {
            ebay_item_id: item.itemId,
            ebay_title: item.title,
            listing_type: 'SOLD',
          },
          created_at: new Date().toISOString(),
        }))
    } catch (error) {
      console.error('[eBay] Sold listings error:', error)
      return []
    }
  }

  /**
   * Map eBay condition strings to our standard conditions
   */
  private mapCondition(ebayCondition: string): 'SEALED' | 'USED' {
    const condition = ebayCondition?.toLowerCase() || 'used'

    if (
      condition.includes('new') ||
      condition.includes('sealed') ||
      condition.includes('factory')
    ) {
      return 'SEALED'
    }

    return 'USED'
  }

  /**
   * Implement PriceProvider interface
   */
  async getPrices(setNumber: string, condition: 'SEALED' | 'USED'): Promise<PriceData[]> {
    const snapshots = await this.searchSets(setNumber)
    return snapshots
      .filter((s) => s.condition === condition)
      .map((s) => ({
        priceCents: s.price_cents,
        currency: s.currency,
        timestamp: s.timestamp,
        condition: s.condition,
        sampleSize: s.sample_size || undefined,
        variance: s.variance || undefined,
        metadata: s.metadata || undefined,
      }))
  }

  async refreshPrices(setNumber: string): Promise<PriceData[]> {
    // Get both sold and current listings
    const [current, sold] = await Promise.all([
      this.searchSets(setNumber),
      this.getSoldListings(setNumber),
    ])

    const allSnapshots = [...current, ...sold]
    return allSnapshots.map((s) => ({
      priceCents: s.price_cents,
      currency: s.currency,
      timestamp: s.timestamp,
      condition: s.condition,
      sampleSize: s.sample_size || undefined,
      variance: s.variance || undefined,
      metadata: s.metadata || undefined,
    }))
  }
}

export default EbayProvider

