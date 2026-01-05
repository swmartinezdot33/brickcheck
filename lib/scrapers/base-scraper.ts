import * as cheerio from 'cheerio'
import type { SetData } from '@/lib/catalog/importers/base-importer'

/**
 * Base scraper class with rate limiting and retry logic
 */
export abstract class BaseScraper {
  protected baseUrl: string
  protected rateLimitDelay: number = 1000 // 1 second between requests
  protected maxRetries: number = 3
  protected lastRequestTime: number = 0

  constructor(baseUrl: string, rateLimitDelay: number = 1000) {
    this.baseUrl = baseUrl
    this.rateLimitDelay = rateLimitDelay
  }

  /**
   * Rate-limited fetch with retry logic
   */
  protected async fetchWithRateLimit(url: string, options: RequestInit = {}): Promise<Response> {
    // Enforce rate limiting
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise((resolve) => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest))
    }

    let lastError: Error | null = null
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        this.lastRequestTime = Date.now()
        const response = await fetch(url, {
          ...options,
          headers: {
            'User-Agent': 'BrickCheck/1.0 (LEGO Collection Tracker)',
            ...options.headers,
          },
        })

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited - wait longer
            const retryAfter = parseInt(response.headers.get('Retry-After') || '60')
            await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000))
            continue
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return response
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        if (attempt < this.maxRetries - 1) {
          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    throw lastError || new Error('Failed to fetch after retries')
  }

  /**
   * Fetch and parse HTML
   */
  protected async fetchHTML(url: string): Promise<cheerio.CheerioAPI> {
    const response = await this.fetchWithRateLimit(url)
    const html = await response.text()
    return cheerio.load(html)
  }

  /**
   * Check robots.txt (simplified - in production, use a proper robots.txt parser)
   */
  protected async checkRobotsTxt(): Promise<boolean> {
    try {
      const robotsUrl = new URL('/robots.txt', this.baseUrl).toString()
      const response = await this.fetchWithRateLimit(robotsUrl)
      const robotsTxt = await response.text()

      // Simple check - don't crawl if explicitly disallowed
      if (robotsTxt.includes('User-agent: *') && robotsTxt.includes('Disallow: /')) {
        console.warn(`[BaseScraper] robots.txt may disallow crawling for ${this.baseUrl}`)
        return false
      }

      return true
    } catch (error) {
      console.warn(`[BaseScraper] Could not fetch robots.txt for ${this.baseUrl}:`, error)
      // Assume allowed if we can't check
      return true
    }
  }

  /**
   * Abstract method to scrape a set page
   */
  abstract scrapeSetPage(setNumber: string): Promise<SetData | null>

  /**
   * Abstract method to search for sets
   */
  abstract searchSets(query: string): Promise<SetData[]>
}



