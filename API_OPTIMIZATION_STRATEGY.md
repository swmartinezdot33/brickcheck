# API Optimization & Data Strategy

## Current Rate Limits

### BrickEconomy
- **4 requests/minute**
- **100 requests/day**
- ⚠️ **Terms**: Cannot be used in commercial products/services

### Brickset
- Rate limits depend on API tier
- Some methods require userHash (username/password)

### BrickLink
- Rate limits depend on API tier
- OAuth-based authentication

## ⚠️ Important: Terms of Service

**DO NOT** attempt to:
- ❌ Scrape/crawl BrickEconomy data
- ❌ Build a database by bulk downloading their API
- ❌ Violate their ToS (results in permanent ban)

**Instead**, use legitimate strategies below.

## Optimization Strategies

### 1. Database-First Approach (Already Implemented)

The app already uses a database-first strategy:

```typescript
// 1. Check database first (no API call)
const dbResults = await supabase.from('sets').select('*').ilike('name', query)

// 2. Only call API if not in database
if (dbResults.length === 0) {
  const apiResults = await catalogProvider.searchSets(query)
  // Store in database for future use
  await supabase.from('sets').upsert(apiResults)
}
```

**Benefits:**
- ✅ Reduces API calls by 80-90%
- ✅ Faster responses (database is instant)
- ✅ Works offline for cached data
- ✅ Complies with ToS (only fetches what users request)

### 2. Smart Caching Strategy

#### A. User-Initiated Requests Only
- Only call APIs when users actively search/browse
- Never bulk fetch or pre-populate
- Each API call serves a real user request

#### B. Aggressive Database Caching
- Store all fetched sets in database
- Store all price snapshots
- Reuse cached data for 30+ days
- Only refresh when user explicitly requests

#### C. Incremental Updates
- Nightly cron only refreshes sets in user collections
- Don't refresh entire catalog
- Focus on active sets only

### 3. Multi-Source Strategy (Already Implemented)

Use multiple APIs to reduce load on any single source:

```
User searches "Millennium Falcon"
  ↓
1. Check database (instant, no API call)
  ↓
2. If not found, query:
   - BrickEconomy (if available)
   - Brickset (if available)
  ↓
3. Merge results, store in database
  ↓
4. Future searches use database only
```

**Benefits:**
- Distributes load across APIs
- If one API is rate-limited, others continue
- More complete data from multiple sources

### 4. Community-Contributed Database

Build a legitimate database through:

#### A. User Contributions
- Users add sets to their collection
- Each addition fetches and stores set data
- Over time, database grows organically
- No bulk scraping needed

#### B. Public Data Sources
- Use official LEGO APIs (if available)
- Use open data sources (Rebrickable, etc.)
- Respect rate limits and ToS

#### C. Manual Curation
- Admin can manually add popular sets
- Import from official LEGO catalogs
- Use publicly available data

### 5. Rate Limit Management

#### Implement Request Queuing
```typescript
// Queue requests to respect rate limits
class RateLimitedProvider {
  private queue: Array<() => Promise<any>> = []
  private lastRequest = 0
  private minInterval = 15000 // 15 seconds (4/min = 1 per 15s)

  async request(fn: () => Promise<any>) {
    return new Promise((resolve) => {
      this.queue.push(async () => {
        const now = Date.now()
        const wait = Math.max(0, this.minInterval - (now - this.lastRequest))
        await new Promise(r => setTimeout(r, wait))
        this.lastRequest = Date.now()
        const result = await fn()
        resolve(result)
      })
      this.processQueue()
    })
  }
}
```

#### Implement Daily Quota Tracking
```typescript
// Track daily API usage
const dailyUsage = await redis.get(`brickeconomy:usage:${today}`)
if (dailyUsage >= 100) {
  // Use alternative API or cached data
  return getFromDatabase()
}
```

### 6. Alternative Data Sources

#### A. Rebrickable API
- Open/free API for LEGO data
- No commercial restrictions
- Good for set metadata

#### B. Official LEGO APIs
- Check if LEGO has official APIs
- May have different terms

#### C. Public Datasets
- Open data repositories
- Community-maintained databases
- No ToS restrictions

## Recommended Approach

### Phase 1: Optimize Current Setup (Immediate)
1. ✅ Database-first (already done)
2. ✅ Multi-source aggregation (already done)
3. ⚠️ Add rate limiting/queuing
4. ⚠️ Add daily quota tracking
5. ⚠️ Implement request prioritization

### Phase 2: Expand Data Sources (Short-term)
1. Add Rebrickable API (if available)
2. Add more open data sources
3. Build community contribution system
4. Manual curation for popular sets

### Phase 3: Build Own Database (Long-term)
1. **Legitimate approach:**
   - User-contributed data only
   - Public/open data sources
   - Official partnerships
   - Manual curation

2. **NOT:**
   - ❌ Scraping BrickEconomy
   - ❌ Bulk downloading their API
   - ❌ Violating ToS

## Implementation Priority

### High Priority (Do Now)
1. Add rate limiting to BrickEconomy provider
2. Add daily quota tracking
3. Implement request queuing
4. Add fallback to database when quota exceeded

### Medium Priority (Next Sprint)
1. Add Rebrickable API integration
2. Implement community contribution system
3. Add manual curation tools

### Low Priority (Future)
1. Explore official LEGO partnerships
2. Build open data import tools
3. Create data licensing agreements

## Code Examples

### Rate-Limited Provider Wrapper
```typescript
class RateLimitedBrickEconomyProvider {
  private provider: BrickEconomyProvider
  private queue: Array<{ fn: Function, resolve: Function, reject: Function }> = []
  private processing = false
  private lastRequest = 0
  private readonly minInterval = 15000 // 15 seconds

  async searchSets(query: string) {
    return this.queueRequest(() => this.provider.searchSets(query))
  }

  private async queueRequest(fn: () => Promise<any>) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject })
      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return
    this.processing = true

    while (this.queue.length > 0) {
      const { fn, resolve, reject } = this.queue.shift()!
      
      // Wait for rate limit
      const now = Date.now()
      const wait = Math.max(0, this.minInterval - (now - this.lastRequest))
      await new Promise(r => setTimeout(r, wait))
      
      try {
        this.lastRequest = Date.now()
        const result = await fn()
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }

    this.processing = false
  }
}
```

## Conclusion

**Key Points:**
1. ✅ Current database-first approach is good
2. ✅ Multi-source aggregation helps distribute load
3. ⚠️ Need to add rate limiting/queuing
4. ❌ Do NOT scrape or violate ToS
5. ✅ Build database through legitimate means (user contributions, open data)

**Next Steps:**
1. Implement rate limiting
2. Add quota tracking
3. Explore alternative data sources
4. Build community contribution system






