import { Set } from '@/types'

export interface SetMetadata {
  setNumber: string
  name: string
  theme?: string
  year?: number
  pieceCount?: number
  msrpCents?: number
  imageUrl?: string
  retired?: boolean
  bricksetId?: string
  bricklinkId?: string
  gtin?: string
}

export interface PriceData {
  priceCents: number
  currency: string
  timestamp: string
  condition: 'SEALED' | 'USED'
  sampleSize?: number
  variance?: number
  metadata?: Record<string, unknown>
}

export interface CatalogProvider {
  searchSets(query: string): Promise<SetMetadata[]>
  getSetByNumber(setNumber: string): Promise<SetMetadata | null>
  getSetByGTIN(gtin: string): Promise<SetMetadata | null>
}

export interface PriceProvider {
  getPrices(setNumber: string, condition: 'SEALED' | 'USED'): Promise<PriceData[]>
  refreshPrices(setNumber: string): Promise<PriceData[]>
}


