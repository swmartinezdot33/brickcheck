import { BaseScraper } from './base-scraper'
import type { SetData } from '@/lib/catalog/importers/base-importer'

/**
 * Scraper for BrickLink.com public catalog pages
 * IMPORTANT: Check BrickLink's Terms of Service before using
 * Respects rate limits and robots.txt
 */
export class BrickLinkScraper extends BaseScraper {
  constructor() {
    super('https://www.bricklink.com', 3000) // 3 second delay - be conservative
  }

  /**
   * Scrape a set page from BrickLink
   */
  async scrapeSetPage(setNumber: string): Promise<SetData | null> {
    try {
      // BrickLink URL format: https://www.bricklink.com/v2/catalog/catalogitem.page?S={setNumber}
      const url = `https://www.bricklink.com/v2/catalog/catalogitem.page?S=${encodeURIComponent(setNumber)}`
      const $ = await this.fetchHTML(url)

      // Check if page exists
      if ($('h1').text().includes('Error') || $('.error').length > 0) {
        return null
      }

      // Extract set name
      const name = $('h1#item-name-title').text().trim() ||
                   $('h1').first().text().trim()
      if (!name) {
        return null
      }

      // Extract theme
      const theme = $('a[href*="/catalogList.asp?t="]').first().text().trim()

      // Extract year
      const yearText = $('td:contains("Year Released")').next('td').text().trim() ||
                       $('td:contains("Year")').next('td').text().trim()
      const year = yearText ? parseInt(yearText) : undefined

      // Extract piece count
      const piecesText = $('td:contains("Pieces")').next('td').text().trim()
      const pieceCount = piecesText ? parseInt(piecesText.replace(/,/g, '')) : undefined

      // Extract MSRP (if available)
      const msrpText = $('td:contains("MSRP")').next('td').text().trim() ||
                       $('td:contains("Retail")').next('td').text().trim()
      const msrp = msrpText ? parseFloat(msrpText.replace(/[^0-9.]/g, '')) : undefined

      // Extract image URL
      const imageUrl = $('img#id-main-image').attr('src') ||
                       $('img[alt*="' + name + '"]').first().attr('src') ||
                       $('.item-image img').first().attr('src')

      // Extract BrickLink ID
      const bricklinkId = setNumber // BrickLink uses set number as ID

      // Extract GTIN if available
      const gtin = $('td:contains("Barcode")').next('td').text().trim() ||
                   $('td:contains("UPC")').next('td').text().trim() ||
                   $('td:contains("EAN")').next('td').text().trim()

      return {
        setNumber,
        name,
        theme: theme || undefined,
        year,
        pieceCount,
        msrpCents: msrp ? Math.round(msrp * 100) : undefined,
        imageUrl: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `https://www.bricklink.com${imageUrl}`) : undefined,
        retired: false, // Would need to check availability status
        bricksetId: undefined,
        bricklinkId,
        gtin: gtin || undefined,
        dataSource: 'BRICKLINK_SCRAPE',
        externalUrls: {
          bricklink: url,
        },
        scrapedAt: new Date(),
      }
    } catch (error) {
      console.error(`[BrickLinkScraper] Error scraping set ${setNumber}:`, error)
      return null
    }
  }

  /**
   * Search for sets on BrickLink
   * Note: BrickLink search may require authentication or have restrictions
   */
  async searchSets(query: string): Promise<SetData[]> {
    try {
      // BrickLink search URL
      const url = `https://www.bricklink.com/v2/search.page?q=${encodeURIComponent(query)}&type=S`
      const $ = await this.fetchHTML(url)

      const results: SetData[] = []

      // Find set links in search results
      $('a[href*="/v2/catalog/catalogitem.page?S="]').each((_, element) => {
        const $el = $(element)
        const href = $el.attr('href')
        
        if (href) {
          const setNumberMatch = href.match(/S=([^&]+)/)
          if (setNumberMatch) {
            const setNumber = decodeURIComponent(setNumberMatch[1])
            const name = $el.text().trim() || $el.find('img').attr('alt') || ''
            
            if (name && setNumber) {
              results.push({
                setNumber,
                name,
                dataSource: 'BRICKLINK_SCRAPE',
                externalUrls: {
                  bricklink: `https://www.bricklink.com${href}`,
                },
                scrapedAt: new Date(),
              })
            }
          }
        }
      })

      return results.slice(0, 20) // Limit to 20 results
    } catch (error) {
      console.error(`[BrickLinkScraper] Error searching for "${query}":`, error)
      return []
    }
  }
}


