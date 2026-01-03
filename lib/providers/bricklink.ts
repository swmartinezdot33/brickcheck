import { PriceProvider, PriceData } from './base'
import * as crypto from 'crypto'

// BrickLink API v3 provider
// Documentation: https://www.bricklink.com/v3/api.page
// Uses OAuth 1.0a for authentication
export class BrickLinkProvider implements PriceProvider {
  private consumerKey?: string
  private consumerSecret?: string
  private token?: string
  private tokenSecret?: string
  private baseUrl = 'https://api.bricklink.com/api/store/v1'

  constructor() {
    this.consumerKey = process.env.BRICKLINK_CONSUMER_KEY
    this.consumerSecret = process.env.BRICKLINK_CONSUMER_SECRET
    this.token = process.env.BRICKLINK_TOKEN
    this.tokenSecret = process.env.BRICKLINK_TOKEN_SECRET
  }

  private generateOAuthSignature(
    method: string,
    url: string,
    params: Record<string, string>
  ): string {
    if (!this.consumerSecret || !this.tokenSecret) {
      throw new Error('BrickLink OAuth credentials not configured')
    }

    // Sort parameters
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')

    // Create signature base string
    const signatureBase = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`

    // Create signing key
    const signingKey = `${encodeURIComponent(this.consumerSecret)}&${encodeURIComponent(this.tokenSecret)}`

    // Generate signature
    const signature = crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64')

    return signature
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}) {
    if (!this.consumerKey || !this.consumerSecret || !this.token || !this.tokenSecret) {
      throw new Error(
        'BrickLink API credentials not configured. Set BRICKLINK_CONSUMER_KEY, BRICKLINK_CONSUMER_SECRET, BRICKLINK_TOKEN, and BRICKLINK_TOKEN_SECRET environment variables.'
      )
    }

    const url = `${this.baseUrl}${endpoint}`
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const nonce = crypto.randomBytes(16).toString('hex')

    // OAuth 1.0a parameters
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: this.consumerKey,
      oauth_token: this.token,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_nonce: nonce,
      oauth_version: '1.0',
    }

    // Merge all parameters
    const allParams = { ...oauthParams, ...params }

    // Generate signature
    const signature = this.generateOAuthSignature('GET', url, allParams)
    oauthParams.oauth_signature = signature

    // Create Authorization header
    const authHeader =
      'OAuth ' +
      Object.keys(oauthParams)
        .sort()
        .map((key) => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
        .join(', ')

    try {
      // Build query string for non-OAuth params
      const queryString = Object.keys(params)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
      const fullUrl = queryString ? `${url}?${queryString}` : url

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`BrickLink API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('BrickLink API request failed:', error)
      throw error
    }
  }

  async getPrices(setNumber: string, condition: 'SEALED' | 'USED'): Promise<PriceData[]> {
    try {
      // BrickLink API: /items/{type}/{no}/price_guide
      // For sets, type is 'SET' and no is the set number
      const guideType = condition === 'SEALED' ? 'sold' : 'stock' // Use 'sold' for sealed, 'stock' for used

      const data = await this.makeRequest(`/items/SET/${setNumber}/price_guide`, {
        guide_type: guideType,
        new_or_used: condition === 'SEALED' ? 'N' : 'U',
        currency_code: 'USD',
      })

      if (!data || !data.data) {
        return []
      }

      // BrickLink returns a single summary object, not entries
      const summary = data.data
      const prices: PriceData[] = []

      if (summary.avg_price || summary.max_price || summary.min_price) {
        const avgPrice = summary.avg_price || (summary.max_price + summary.min_price) / 2
        if (avgPrice && avgPrice > 0) {
          prices.push({
            priceCents: Math.round(avgPrice * 100),
            currency: 'USD',
            timestamp: new Date().toISOString(),
            condition,
            sampleSize: summary.total_quantity || 1,
            variance: summary.max_price && summary.min_price
              ? (summary.max_price - summary.min_price) / 2
              : undefined,
            metadata: summary,
          })
        }
      }

      return prices
    } catch (error) {
      console.error('Error fetching prices from BrickLink:', error)
      // Return empty array on error rather than throwing
      return []
    }
  }

  async refreshPrices(setNumber: string): Promise<PriceData[]> {
    try {
      // Get prices for both conditions
      const sealedPrices = await this.getPrices(setNumber, 'SEALED')
      const usedPrices = await this.getPrices(setNumber, 'USED')

      // Return latest prices
      return [...sealedPrices.slice(-1), ...usedPrices.slice(-1)]
    } catch (error) {
      console.error('Error refreshing prices from BrickLink:', error)
      return []
    }
  }
}
