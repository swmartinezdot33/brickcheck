import { BaseScraper } from './base-scraper'
import type { SetData } from '@/lib/catalog/importers/base-importer'

/**
 * Scraper for Brickset.com public pages
 * Respects rate limits and robots.txt
 */
export class BricksetScraper extends BaseScraper {
  constructor() {
    super('https://brickset.com', 2000) // 2 second delay between requests
  }

  /**
   * Scrape a set page from Brickset
   */
  async scrapeSetPage(setNumber: string): Promise<SetData | null> {
    try {
      // Brickset URL format: https://brickset.com/sets/{setNumber}
      const url = `https://brickset.com/sets/${encodeURIComponent(setNumber)}`
      const $ = await this.fetchHTML(url)

      // Check if page exists (404 or redirect)
      if ($('h1').text().includes('404') || $('title').text().includes('404')) {
        return null
      }

      // Extract set data from page
      const name = $('h1 a').first().text().trim() || $('h1').first().text().trim()
      if (!name) {
        return null // Invalid page
      }

      // Extract theme
      const theme = $('dt:contains("Theme")').next('dd').text().trim() ||
                    $('a[href*="/themes/"]').first().text().trim()

      // Extract year
      const yearText = $('dt:contains("Year")').next('dd').text().trim() ||
                       $('a[href*="/years/"]').first().text().trim()
      const year = yearText ? parseInt(yearText) : undefined

      // Extract piece count
      const piecesText = $('dt:contains("Pieces")').next('dd').text().trim() ||
                         $('dt:contains("Pieces:")').next('dd').text().trim()
      const pieceCount = piecesText ? parseInt(piecesText.replace(/,/g, '')) : undefined

      // Extract MSRP
      const msrpText = $('dt:contains("RRP")').next('dd').text().trim() ||
                       $('dt:contains("US RRP")').next('dd').text().trim()
      const msrp = msrpText ? parseFloat(msrpText.replace(/[^0-9.]/g, '')) : undefined

      // Extract image URL
      const imageUrl = $('img.set-main-image').attr('src') ||
                       $('img[alt*="' + name + '"]').first().attr('src') ||
                       $('.set-image img').first().attr('src')

      // Extract retired status
      const retired = $('dt:contains("Availability")').next('dd').text().toLowerCase().includes('retired') ||
                      $('.retired').length > 0 ||
                      $('span:contains("Retired")').length > 0

      // Extract Brickset ID from URL or data attributes
      const bricksetIdMatch = url.match(/\/sets\/(\d+)/)
      const bricksetId = bricksetIdMatch ? bricksetIdMatch[1] : undefined

      // Extract GTIN/barcode if available
      const gtin = $('dt:contains("Barcode")').next('dd').text().trim() ||
                   $('dt:contains("EAN")').next('dd').text().trim() ||
                   $('dt:contains("UPC")').next('dd').text().trim()

      return {
        setNumber,
        name,
        theme: theme || undefined,
        year,
        pieceCount,
        msrpCents: msrp ? Math.round(msrp * 100) : undefined,
        imageUrl: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `https://brickset.com${imageUrl}`) : undefined,
        retired,
        bricksetId,
        bricklinkId: undefined, // Would need to scrape BrickLink separately
        gtin: gtin || undefined,
        dataSource: 'BRICKSET_SCRAPE',
        externalUrls: {
          brickset: url,
        },
        scrapedAt: new Date(),
      }
    } catch (error) {
      console.error(`[BricksetScraper] Error scraping set ${setNumber}:`, error)
      return null
    }
  }

  /**
   * Search for sets on Brickset
   * Note: Brickset search requires API or specific search page structure
   * This is a simplified implementation
   */
  async searchSets(query: string): Promise<SetData[]> {
    try {
      // Brickset search URL
      const url = `https://brickset.com/sets/search/${encodeURIComponent(query)}`
      const $ = await this.fetchHTML(url)

      const results: SetData[] = []

      // Find set links in search results
      $('article.set, .set, a[href*="/sets/"]').each((_, element) => {
        const $el = $(element)
        const setLink = $el.attr('href') || $el.find('a').attr('href')
        
        if (setLink) {
          const setNumberMatch = setLink.match(/\/sets\/([^\/]+)/)
          if (setNumberMatch) {
            const setNumber = setNumberMatch[1]
            // For now, return basic info - full scrape would require individual page visits
            const name = $el.find('h1, .set-name, a').first().text().trim()
            
            if (name && setNumber) {
              results.push({
                setNumber,
                name,
                dataSource: 'BRICKSET_SCRAPE',
                externalUrls: {
                  brickset: `https://brickset.com${setLink}`,
                },
                scrapedAt: new Date(),
              })
            }
          }
        }
      })

      return results.slice(0, 20) // Limit to 20 results
    } catch (error) {
      console.error(`[BricksetScraper] Error searching for "${query}":`, error)
      return []
    }
  }
}

