import { CatalogProvider, SetMetadata } from './base'

// Brickset API provider (placeholder for real implementation)
export class BricksetProvider implements CatalogProvider {
  private apiKey?: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BRICKSET_API_KEY
  }

  async searchSets(query: string): Promise<SetMetadata[]> {
    // TODO: Implement Brickset API integration
    // For now, return empty array
    if (!this.apiKey) {
      throw new Error('Brickset API key not configured')
    }
    return []
  }

  async getSetByNumber(setNumber: string): Promise<SetMetadata | null> {
    // TODO: Implement Brickset API integration
    if (!this.apiKey) {
      throw new Error('Brickset API key not configured')
    }
    return null
  }

  async getSetByGTIN(gtin: string): Promise<SetMetadata | null> {
    // TODO: Implement Brickset API integration
    if (!this.apiKey) {
      throw new Error('Brickset API key not configured')
    }
    return null
  }
}

