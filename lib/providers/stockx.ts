import { PriceSnapshot } from '@/types'
import { PriceProvider, PriceData } from './base'

interface StockxProduct {
  id: string
  title: string
  subtitle: string
  productCategory: string
  lowestAsk: number
  highestBid: number
  lastSale: number
  volatility: number
  listingCount: number
}

interface StockxMarketData {
  lowestAsk: number
  highestBid: number
  lastSale: number
  numberOfAsks: number
  numberOfBids: number
}

/**
 * StockX provider for premium/collectible LEGO set pricing
 * Focuses on resale market data for high-value and collectible sets
 * Note: StockX API requires authentication and has rate limits
 */
export class StockxProvider implements PriceProvider {
  private apiKey: string
  private apiUrl = 'https://api.stockx.com'

  constructor() {
    this.apiKey = process.env.STOCKX_API_KEY || ''
  }

  /**
   * Search for LEGO set on StockX
   */
  async searchSet(setNumber: string, setName?: string): Promise<PriceSnapshot[]> {
    if (!this.apiKey) {
      console.warn('[StockX] API key not configured')
      return []
    }

    try {
      // StockX search endpoint
      const query = setName ? `${setNumber} ${setName}` : setNumber
      const response = await fetch(`${this.apiUrl}/v2/search`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'BrickCheck/1.0',
        },
        body: JSON.stringify({
          query,
          productCategory: 'lego',
          limit: 10,
        }),
      })

      if (!response.ok) {
        console.error('[StockX] API error:', response.status)
        return []
      }

      const data = await response.json()

      if (!data.results || data.results.length === 0) {
        return []
      }

      // Use the first (most relevant) result
      const product = data.results[0] as StockxProduct

      return this.convertProductToPriceSnapshots(product)
    } catch (error) {
      console.error('[StockX] Search error:', error)
      return []
    }
  }

  /**
   * Get market data for a LEGO set
   */
  async getMarketData(productId: string): Promise<PriceSnapshot[]> {
    if (!this.apiKey) {
      return []
    }

    try {
      const response = await fetch(`${this.apiUrl}/v2/products/${productId}/market`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        return []
      }

      const data: StockxMarketData = await response.json()

      const snapshots: PriceSnapshot[] = []

      // Add last sale price
      if (data.lastSale) {
        snapshots.push({
          id: Math.random().toString(),
          set_id: '',
          condition: 'USED',
          source: 'STOCKX',
          price_cents: Math.round(data.lastSale * 100),
          currency: 'USD',
          timestamp: new Date().toISOString(),
          sample_size: data.numberOfBids + data.numberOfAsks,
          variance: 0,
          metadata: {
            stockx_product_id: productId,
            highest_bid: data.highestBid,
            lowest_ask: data.lowestAsk,
            listing_count: data.numberOfAsks + data.numberOfBids,
          },
          created_at: new Date().toISOString(),
        })
      }

      // Add ask/bid spread
      if (data.lowestAsk) {
        snapshots.push({
          id: Math.random().toString(),
          set_id: '',
          condition: 'SEALED',
          source: 'STOCKX_ASK',
          price_cents: Math.round(data.lowestAsk * 100),
          currency: 'USD',
          timestamp: new Date().toISOString(),
          sample_size: data.numberOfAsks,
          variance: 0,
          metadata: {
            stockx_product_id: productId,
            list_type: 'LOWEST_ASK',
            number_of_asks: data.numberOfAsks,
          },
          created_at: new Date().toISOString(),
        })
      }

      return snapshots
    } catch (error) {
      console.error('[StockX] Market data error:', error)
      return []
    }
  }

  /**
   * Convert StockX product to price snapshots
   */
  private convertProductToPriceSnapshots(product: StockxProduct): PriceSnapshot[] {
    const snapshots: PriceSnapshot[] = []

    // Last sale price (most recent transaction)
    if (product.lastSale) {
      snapshots.push({
        id: Math.random().toString(),
        set_id: '',
        condition: 'USED',
        source: 'STOCKX',
        price_cents: Math.round(product.lastSale * 100),
        currency: 'USD',
        timestamp: new Date().toISOString(),
        sample_size: product.listingCount,
        variance: product.volatility,
        metadata: {
          stockx_product_id: product.id,
          stockx_title: product.title,
          highest_bid: product.highestBid,
          lowest_ask: product.lowestAsk,
          volatility: product.volatility,
        },
        created_at: new Date().toISOString(),
      })
    }

    // Lowest ask price (current market offer)
    if (product.lowestAsk) {
      snapshots.push({
        id: Math.random().toString(),
        set_id: '',
        condition: 'SEALED',
        source: 'STOCKX_ASK',
        price_cents: Math.round(product.lowestAsk * 100),
        currency: 'USD',
        timestamp: new Date().toISOString(),
        sample_size: 1,
        variance: 0,
        metadata: {
          stockx_product_id: product.id,
          list_type: 'LOWEST_ASK',
        },
        created_at: new Date().toISOString(),
      })
    }

    // Highest bid price (best buy offer)
    if (product.highestBid) {
      snapshots.push({
        id: Math.random().toString(),
        set_id: '',
        condition: 'SEALED',
        source: 'STOCKX_BID',
        price_cents: Math.round(product.highestBid * 100),
        currency: 'USD',
        timestamp: new Date().toISOString(),
        sample_size: 1,
        variance: 0,
        metadata: {
          stockx_product_id: product.id,
          list_type: 'HIGHEST_BID',
        },
        created_at: new Date().toISOString(),
      })
    }

    return snapshots
  }

  /**
   * Implement PriceProvider interface
   */
  async getPrices(setNumber: string, condition: 'SEALED' | 'USED'): Promise<PriceData[]> {
    const snapshots = await this.searchSet(setNumber)
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
    return this.getPrices(setNumber, 'SEALED')
  }
}

export default StockxProvider

