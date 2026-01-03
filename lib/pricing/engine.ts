import { PriceSnapshot } from '@/types'

export interface PriceEstimate {
  estimatedValue: number // in cents
  confidence: number // 0-1
  sampleSize: number
  priceRange: {
    min: number
    max: number
  }
  lastUpdated: string
  medianPrice: number
  trimmedMean: number
  variance: number
}

/**
 * Calculate estimated value from price snapshots using median, trimmed mean, and confidence scoring
 */
export function calculatePriceEstimate(
  snapshots: PriceSnapshot[],
  condition: 'SEALED' | 'USED'
): PriceEstimate | null {
  // Filter by condition
  const filtered = snapshots.filter((s) => s.condition === condition)

  if (filtered.length === 0) {
    return null
  }

  // Normalize prices to USD (assuming all are already in USD for MVP)
  const prices = filtered.map((s) => s.price_cents).sort((a, b) => a - b)

  // Calculate median
  const medianPrice =
    prices.length % 2 === 0
      ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
      : prices[Math.floor(prices.length / 2)]

  // Calculate trimmed mean (drop top and bottom 10%)
  const trimCount = Math.floor(prices.length * 0.1)
  const trimmedPrices = prices.slice(trimCount, prices.length - trimCount)
  const trimmedMean =
    trimmedPrices.reduce((sum, price) => sum + price, 0) / trimmedPrices.length

  // Calculate variance (standard deviation)
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length
  const variance =
    prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length
  const stdDev = Math.sqrt(variance)

  // Calculate confidence score
  // Confidence = min(1.0, (sampleSize / 10) * (1 / (1 + variance/medianPrice)))
  const sampleSize = prices.length
  const coefficientOfVariation = stdDev / medianPrice
  const confidence = Math.min(1.0, (sampleSize / 10) * (1 / (1 + coefficientOfVariation)))

  // Final estimated value: weighted blend of median and trimmed mean
  // Weights can be adjusted based on confidence
  const medianWeight = 0.6
  const trimmedMeanWeight = 0.4
  const estimatedValue = Math.round(medianPrice * medianWeight + trimmedMean * trimmedMeanWeight)

  // Get price range
  const priceRange = {
    min: prices[0],
    max: prices[prices.length - 1],
  }

  // Get most recent timestamp
  const lastUpdated = filtered
    .map((s) => s.timestamp)
    .sort()
    .reverse()[0]

  return {
    estimatedValue,
    confidence,
    sampleSize,
    priceRange,
    lastUpdated,
    medianPrice,
    trimmedMean,
    variance: stdDev,
  }
}

/**
 * Calculate trend (percentage change) over a time window
 */
export function calculateTrend(
  snapshots: PriceSnapshot[],
  condition: 'SEALED' | 'USED',
  windowDays: number
): { change: number; percentChange: number } | null {
  const filtered = snapshots
    .filter((s) => s.condition === condition)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  if (filtered.length < 2) {
    return null
  }

  const now = new Date()
  const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000)

  const recent = filtered.filter((s) => new Date(s.timestamp) >= windowStart)
  const older = filtered.filter((s) => new Date(s.timestamp) < windowStart)

  if (recent.length === 0 || older.length === 0) {
    return null
  }

  const recentAvg =
    recent.reduce((sum, s) => sum + s.price_cents, 0) / recent.length
  const olderAvg = older.reduce((sum, s) => sum + s.price_cents, 0) / older.length

  const change = recentAvg - olderAvg
  const percentChange = (change / olderAvg) * 100

  return { change, percentChange }
}

