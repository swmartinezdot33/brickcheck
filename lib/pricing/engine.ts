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

export interface PriceForecast {
  predictedValue: number
  confidence: number // R-squared
  slope: number // Daily price change in cents
  forecastDate: string
  trend: 'UP' | 'DOWN' | 'STABLE'
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

/**
 * Calculate price forecast using Linear Regression
 * @param snapshots Price history
 * @param condition Set condition
 * @param daysToForecast Number of days to forecast into the future
 */
export function calculateForecast(
  snapshots: PriceSnapshot[],
  condition: 'SEALED' | 'USED',
  daysToForecast: number = 180 // Default 6 months
): PriceForecast | null {
  const filtered = snapshots
    .filter((s) => s.condition === condition)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  if (filtered.length < 5) { // Need minimum samples for meaningful regression
    return null
  }

  // Convert timestamps to days from start (x) and prices to cents (y)
  const startTime = new Date(filtered[0].timestamp).getTime()
  const data = filtered.map(s => ({
    x: (new Date(s.timestamp).getTime() - startTime) / (24 * 60 * 60 * 1000), // days
    y: s.price_cents
  }))

  const n = data.length
  const sumX = data.reduce((acc, p) => acc + p.x, 0)
  const sumY = data.reduce((acc, p) => acc + p.y, 0)
  const sumXY = data.reduce((acc, p) => acc + p.x * p.y, 0)
  const sumXX = data.reduce((acc, p) => acc + p.x * p.x, 0)

  // Linear regression formulas: y = mx + b
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Calculate R-squared (Coefficient of Determination)
  const meanY = sumY / n
  const ssTot = data.reduce((acc, p) => acc + Math.pow(p.y - meanY, 2), 0)
  const ssRes = data.reduce((acc, p) => {
    const predictedY = slope * p.x + intercept
    return acc + Math.pow(p.y - predictedY, 2)
  }, 0)
  const rSquared = ssTot === 0 ? 0 : 1 - (ssRes / ssTot)

  // Predict future value
  const lastDay = data[data.length - 1].x
  const futureDay = lastDay + daysToForecast
  const predictedValue = Math.round(slope * futureDay + intercept)

  const trend = slope > 5 ? 'UP' : slope < -5 ? 'DOWN' : 'STABLE'

  return {
    predictedValue,
    confidence: Math.max(0, rSquared), // R-squared is 0-1
    slope,
    forecastDate: new Date(startTime + futureDay * 24 * 60 * 60 * 1000).toISOString(),
    trend
  }
}
