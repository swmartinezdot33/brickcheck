/**
 * Rate limiter for API providers
 * Ensures we respect API rate limits (e.g., BrickEconomy: 4 req/min, 100/day)
 */

interface RateLimitConfig {
  requestsPerMinute: number
  requestsPerDay: number
  providerName: string
}

interface QueuedRequest {
  fn: () => Promise<any>
  resolve: (value: any) => void
  reject: (error: any) => void
  timestamp: number
}

export class RateLimiter {
  private config: RateLimitConfig
  private queue: QueuedRequest[] = []
  private processing = false
  private lastRequestTime = 0
  private requestCounts: Map<string, number> = new Map() // date -> count

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  /**
   * Queue a request to be executed respecting rate limits
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        fn,
        resolve,
        reject,
        timestamp: Date.now(),
      })
      this.processQueue()
    })
  }

  /**
   * Check if we can make a request (not exceeding daily quota)
   */
  private canMakeRequest(): boolean {
    const today = new Date().toISOString().split('T')[0]
    const todayCount = this.requestCounts.get(today) || 0

    if (todayCount >= this.config.requestsPerDay) {
      console.warn(
        `[${this.config.providerName}] Daily quota exceeded: ${todayCount}/${this.config.requestsPerDay}`
      )
      return false
    }

    return true
  }

  /**
   * Process the request queue
   */
  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true

    while (this.queue.length > 0) {
      // Check daily quota
      if (!this.canMakeRequest()) {
        // Reject remaining requests in queue
        const remaining = this.queue.splice(0)
        remaining.forEach((req) => {
          req.reject(
            new Error(
              `[${this.config.providerName}] Daily quota exceeded (${this.config.requestsPerDay} requests/day)`
            )
          )
        })
        break
      }

      const request = this.queue.shift()!
      const now = Date.now()

      // Calculate minimum interval between requests (to respect per-minute limit)
      const minInterval = (60 * 1000) / this.config.requestsPerMinute // e.g., 15000ms for 4/min
      const timeSinceLastRequest = now - this.lastRequestTime
      const waitTime = Math.max(0, minInterval - timeSinceLastRequest)

      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }

      try {
        this.lastRequestTime = Date.now()
        const today = new Date().toISOString().split('T')[0]
        const todayCount = (this.requestCounts.get(today) || 0) + 1
        this.requestCounts.set(today, todayCount)

        const result = await request.fn()
        request.resolve(result)
      } catch (error) {
        request.reject(error)
      }
    }

    this.processing = false
  }

  /**
   * Get current usage stats
   */
  getUsageStats(): { today: number; limit: number; remaining: number } {
    const today = new Date().toISOString().split('T')[0]
    const todayCount = this.requestCounts.get(today) || 0
    return {
      today: todayCount,
      limit: this.config.requestsPerDay,
      remaining: Math.max(0, this.config.requestsPerDay - todayCount),
    }
  }

  /**
   * Reset daily counter (useful for testing)
   */
  resetDailyCounter() {
    this.requestCounts.clear()
  }
}

/**
 * Factory function to create rate limiters for different providers
 */
export function createRateLimiter(providerName: string): RateLimiter {
  const configs: Record<string, RateLimitConfig> = {
    BRICKECONOMY: {
      requestsPerMinute: 4,
      requestsPerDay: 100,
      providerName: 'BrickEconomy',
    },
    BRICKSET: {
      requestsPerMinute: 10, // Adjust based on actual limits
      requestsPerDay: 1000, // Adjust based on actual limits
      providerName: 'Brickset',
    },
    BRICKLINK: {
      requestsPerMinute: 10, // Adjust based on actual limits
      requestsPerDay: 1000, // Adjust based on actual limits
      providerName: 'BrickLink',
    },
  }

  const config = configs[providerName] || {
    requestsPerMinute: 10,
    requestsPerDay: 1000,
    providerName,
  }

  return new RateLimiter(config)
}





