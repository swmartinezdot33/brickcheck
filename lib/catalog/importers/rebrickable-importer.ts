import { parse } from 'csv-parse/sync'
import { gunzipSync } from 'zlib'
import { BaseImporter, type SetData } from './base-importer'

interface RebrickableSetRow {
  set_num: string
  name: string
  year?: string
  theme_id?: string
  num_parts?: string
  set_img_url?: string
  set_url?: string
  last_modified_dt?: string
}

/**
 * Importer for Rebrickable CSV data
 * Downloads and imports sets from Rebrickable's public CSV files
 */
export class RebrickableImporter extends BaseImporter {
  private csvUrl = 'https://cdn.rebrickable.com/media/downloads/sets.csv.gz'
  private themesUrl = 'https://cdn.rebrickable.com/media/downloads/themes.csv.gz'

  /**
   * Download and parse CSV file
   * Handles gzip decompression manually since the file is .gz
   */
  private async downloadAndParseCSV(url: string): Promise<any[]> {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to download CSV: ${response.status} ${response.statusText}`)
      }

      // Get the response as an ArrayBuffer for binary data
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Decompress gzip
      const decompressed = gunzipSync(buffer)
      const text = decompressed.toString('utf-8')
      
      if (!text || text.length === 0) {
        throw new Error('Downloaded CSV is empty after decompression')
      }

      const records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      })

      return records
    } catch (error) {
      console.error(`Error downloading/parsing CSV from ${url}:`, error)
      throw error
    }
  }

  /**
   * Fetch theme name by theme_id
   * Rebrickable themes.csv has columns: id, name, parent_id
   */
  private async getThemeMap(): Promise<Map<string, string>> {
    try {
      const themes = await this.downloadAndParseCSV(this.themesUrl)
      const themeMap = new Map<string, string>()

      for (const theme of themes) {
        // Handle both 'id' and 'theme_id' column names
        const themeId = theme.id || theme.theme_id
        const themeName = theme.name || theme.theme_name
        
        if (themeId && themeName) {
          themeMap.set(String(themeId), String(themeName))
        }
      }

      return themeMap
    } catch (error) {
      console.warn('Failed to load themes, continuing without theme names:', error)
      return new Map()
    }
  }

  /**
   * Fetch set data from Rebrickable CSV
   */
  async fetchData(): Promise<SetData[]> {
    console.log('[RebrickableImporter] Downloading sets.csv...')
    const sets = await this.downloadAndParseCSV(this.csvUrl)
    console.log(`[RebrickableImporter] Loaded ${sets.length} sets from CSV`)

    console.log('[RebrickableImporter] Loading themes...')
    const themeMap = await this.getThemeMap()
    console.log(`[RebrickableImporter] Loaded ${themeMap.size} themes`)

    const setData: SetData[] = []

    for (const row of sets as RebrickableSetRow[]) {
      const theme = row.theme_id ? themeMap.get(row.theme_id) : undefined

      setData.push({
        setNumber: row.set_num,
        name: row.name,
        theme: theme,
        year: row.year ? parseInt(row.year) : undefined,
        pieceCount: row.num_parts ? parseInt(row.num_parts) : undefined,
        imageUrl: row.set_img_url || undefined,
        retired: false, // Rebrickable doesn't provide retired status
        dataSource: 'REBRICKABLE',
        externalUrls: {
          rebrickable: row.set_url || `https://rebrickable.com/sets/${row.set_num}/`,
        },
        scrapedAt: new Date(),
      })
    }

    console.log(`[RebrickableImporter] Processed ${setData.length} sets`)
    return setData
  }
}

