import { BaseScraper } from './base-scraper'
import type { SetData } from '@/lib/catalog/importers/base-importer'

/**
 * Scraper for official LEGO.com set pages
 * Uses official LEGO website for high-quality data
 */
export class LEGOcomScraper extends BaseScraper {
  constructor() {
    super('https://www.lego.com', 2000) // 2 second delay
  }

  /**
   * Scrape a set page from LEGO.com
   * Note: LEGO.com URLs can vary, this is a simplified implementation
   */
  async scrapeSetPage(setNumber: string): Promise<SetData | null> {
    try {
      // LEGO.com URL format varies - try common patterns
      const possibleUrls = [
        `https://www.lego.com/en-us/product/${setNumber}`,
        `https://www.lego.com/en-us/product/${setNumber.replace('-', '-')}`,
        `https://www.lego.com/product/${setNumber}`,
      ]

      let $: any = null
      let finalUrl: string | null = null

      for (const url of possibleUrls) {
        try {
          $ = await this.fetchHTML(url)
          // Check if we got a valid page (not 404)
          if ($('h1').length > 0 && !$('h1').text().includes('404')) {
            finalUrl = url
            break
          }
        } catch (error) {
          // Try next URL
          continue
        }
      }

      if (!$ || !finalUrl) {
        return null
      }

      // Extract set name
      const name = $('h1[data-test="product-overview-name"]').text().trim() ||
                   $('h1.product-overview__name').text().trim() ||
                   $('h1').first().text().trim()
      if (!name) {
        return null
      }

      // Extract theme
      const theme = $('a[data-test="product-overview-theme-link"]').text().trim() ||
                    $('.product-overview__theme a').text().trim()

      // Extract year (from product info)
      const yearText = $('[data-test="product-overview-year"]').text().trim() ||
                       $('.product-info__year').text().trim()
      const year = yearText ? parseInt(yearText) : undefined

      // Extract piece count
      const piecesText = $('[data-test="product-overview-piece-count"]').text().trim() ||
                         $('.product-info__pieces').text().trim()
      const pieceCount = piecesText ? parseInt(piecesText.replace(/[^0-9]/g, '')) : undefined

      // Extract MSRP
      const msrpText = $('[data-test="product-overview-price"]').text().trim() ||
                       $('.product-price').text().trim()
      const msrp = msrpText ? parseFloat(msrpText.replace(/[^0-9.]/g, '')) : undefined

      // Extract image URL (LEGO.com has high-quality images)
      const imageUrl = $('img[data-test="product-image"]').attr('src') ||
                       $('img.product-image').first().attr('src') ||
                       $('meta[property="og:image"]').attr('content')

      // Extract GTIN if available
      const gtin = $('meta[property="product:gtin"]').attr('content') ||
                   $('[data-test="product-gtin"]').text().trim()

      return {
        setNumber,
        name,
        theme: theme || undefined,
        year,
        pieceCount,
        msrpCents: msrp ? Math.round(msrp * 100) : undefined,
        imageUrl: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `https://www.lego.com${imageUrl}`) : undefined,
        retired: false, // Would need to check availability
        bricksetId: undefined,
        bricklinkId: undefined,
        gtin: gtin || undefined,
        dataSource: 'LEGO_COM_SCRAPE',
        externalUrls: {
          lego_com: finalUrl,
        },
        scrapedAt: new Date(),
      }
    } catch (error) {
      console.error(`[LEGOcomScraper] Error scraping set ${setNumber}:`, error)
      return null
    }
  }

  /**
   * Search for sets on LEGO.com
   * Note: LEGO.com search may require handling dynamic content
   */
  async searchSets(query: string): Promise<SetData[]> {
    try {
      // LEGO.com search URL
      const url = `https://www.lego.com/en-us/search?q=${encodeURIComponent(query)}`
      const $ = await this.fetchHTML(url)

      const results: SetData[] = []

      // Find product links in search results
      $('a[href*="/product/"]').each((_, element) => {
        const $el = $(element)
        const href = $el.attr('href')
        
        if (href) {
          const setNumberMatch = href.match(/\/product\/([^\/\?]+)/)
          if (setNumberMatch) {
            const setNumber = setNumberMatch[1]
            const name = $el.find('[data-test="product-tile-name"]').text().trim() ||
                         $el.text().trim()
            
            if (name && setNumber) {
              results.push({
                setNumber,
                name,
                dataSource: 'LEGO_COM_SCRAPE',
                externalUrls: {
                  lego_com: `https://www.lego.com${href}`,
                },
                scrapedAt: new Date(),
              })
            }
          }
        }
      })

      return results.slice(0, 20) // Limit to 20 results
    } catch (error) {
      console.error(`[LEGOcomScraper] Error searching for "${query}":`, error)
      return []
    }
  }
}

