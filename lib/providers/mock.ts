import { CatalogProvider, PriceProvider, SetMetadata, PriceData } from './base'

// Mock catalog provider for development
export class MockCatalogProvider implements CatalogProvider {
  private mockSets: SetMetadata[] = [
    {
      setNumber: '75192',
      name: 'Millennium Falcon',
      theme: 'Star Wars',
      year: 2017,
      pieceCount: 7541,
      msrpCents: 84999,
      retired: false,
      imageUrl: undefined,
      gtin: '57020161175192',
    },
    {
      setNumber: '71040',
      name: 'Disney Castle',
      theme: 'Disney',
      year: 2016,
      pieceCount: 4080,
      msrpCents: 34999,
      retired: true,
      imageUrl: undefined,
      gtin: '57020161171040',
    },
    {
      setNumber: '10294',
      name: 'Titanic',
      theme: 'Icons',
      year: 2021,
      pieceCount: 9090,
      msrpCents: 67999,
      retired: false,
      imageUrl: undefined,
      gtin: '57020161110294',
    },
    {
      setNumber: '21327',
      name: 'Typewriter',
      theme: 'Ideas',
      year: 2021,
      pieceCount: 2079,
      msrpCents: 19999,
      retired: true,
      imageUrl: undefined,
      gtin: '57020161121327',
    },
    {
      setNumber: '10279',
      name: 'Volkswagen T2 Camper Van',
      theme: 'Icons',
      year: 2021,
      pieceCount: 2207,
      msrpCents: 17999,
      retired: false,
      imageUrl: undefined,
      gtin: '57020161110279',
    },
  ]

  async searchSets(query: string): Promise<SetMetadata[]> {
    const lowerQuery = query.toLowerCase()
    return this.mockSets.filter(
      (set) =>
        set.setNumber.toLowerCase().includes(lowerQuery) ||
        set.name.toLowerCase().includes(lowerQuery) ||
        set.theme?.toLowerCase().includes(lowerQuery)
    )
  }

  async getSetByNumber(setNumber: string): Promise<SetMetadata | null> {
    return this.mockSets.find((set) => set.setNumber === setNumber) || null
  }

  async getSetByGTIN(gtin: string): Promise<SetMetadata | null> {
    return this.mockSets.find((set) => set.gtin === gtin) || null
  }
}

// Mock price provider for development
export class MockPriceProvider implements PriceProvider {
  async getPrices(setNumber: string, condition: 'SEALED' | 'USED'): Promise<PriceData[]> {
    // Generate mock price data for the last 90 days
    const prices: PriceData[] = []
    const basePrice = condition === 'SEALED' ? 100000 : 70000 // $1000 sealed, $700 used
    const now = new Date()

    for (let i = 90; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      // Add some random variation
      const variation = (Math.random() - 0.5) * 0.2 // ±10%
      const price = Math.round(basePrice * (1 + variation))
      
      prices.push({
        priceCents: price,
        currency: 'USD',
        timestamp: date.toISOString(),
        condition,
        sampleSize: Math.floor(Math.random() * 20) + 5,
        variance: Math.random() * 0.1,
      })
    }

    return prices
  }

  async refreshPrices(setNumber: string): Promise<PriceData[]> {
    // Return current prices for both conditions
    const sealed = await this.getPrices(setNumber, 'SEALED')
    const used = await this.getPrices(setNumber, 'USED')
    return [...sealed.slice(-1), ...used.slice(-1)]
  }
}

