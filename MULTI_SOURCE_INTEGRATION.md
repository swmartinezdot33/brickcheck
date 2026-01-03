# Multi-Source Data Integration

## Overview

BrickCheck now aggregates data from **ALL available sources** simultaneously to provide the most comprehensive and accurate LEGO set information.

## Data Sources

### Catalog Providers (Set Metadata)
1. **BrickEconomy** - Comprehensive set data, images, retired status
2. **Brickset** - Official LEGO set catalog with detailed metadata

### Price Providers (Pricing Data)
1. **BrickEconomy** - Market value estimates, price history, trends
2. **BrickLink** - Real marketplace pricing data, sold comps

## How It Works

### Composite Provider System

The app uses **composite providers** that automatically:
- ✅ Query ALL configured APIs simultaneously
- ✅ Merge and deduplicate results intelligently
- ✅ Prefer more complete data (non-null values)
- ✅ Combine price data from multiple sources
- ✅ Handle failures gracefully (if one API fails, others continue)

### Search Results

When searching for sets:
1. **BrickEconomy** searches its database
2. **Brickset** searches its database (if configured)
3. Results are merged and deduplicated by set number
4. More complete data is preferred (e.g., if one source has an image and another doesn't, the one with image is kept)
5. All unique results are returned

### Price Data

When fetching prices:
1. **BrickEconomy** provides price history and estimates
2. **BrickLink** provides marketplace sold comps (if configured)
3. Prices are merged by timestamp (within 1-hour windows)
4. Data with larger sample sizes is preferred
5. All prices are sorted by timestamp (newest first)

### Set Lookup

When looking up a specific set:
1. Tries **BrickEconomy** first
2. Falls back to **Brickset** if not found
3. Returns the first successful result
4. Combines metadata from both sources when available

## Benefits

### Comprehensive Coverage
- More sets found (combines databases from multiple sources)
- More complete data (fills gaps from one source with another)
- Better price accuracy (averages/combines multiple data sources)

### Reliability
- If one API is down, others continue working
- Rate limit issues with one API don't stop the app
- Automatic failover between providers

### Data Quality
- Prefers data with more metadata
- Prioritizes larger sample sizes for pricing
- Deduplicates intelligently to avoid duplicates

## Configuration

### Minimum Requirements
You need **at least one** catalog API and **at least one** price API:

**Catalog APIs:**
- `BRICKECONOMY_API_KEY` (recommended)
- OR `BRICKSET_API_KEY`

**Price APIs:**
- `BRICKECONOMY_API_KEY` (recommended)
- OR all BrickLink credentials:
  - `BRICKLINK_CONSUMER_KEY`
  - `BRICKLINK_CONSUMER_SECRET`
  - `BRICKLINK_TOKEN`
  - `BRICKLINK_TOKEN_SECRET`

### Optimal Configuration

For best results, configure **ALL APIs**:

```bash
# Catalog APIs
BRICKECONOMY_API_KEY=your_key
BRICKSET_API_KEY=your_key

# Price APIs
BRICKECONOMY_API_KEY=your_key  # (same as above)
BRICKLINK_CONSUMER_KEY=your_key
BRICKLINK_CONSUMER_SECRET=your_secret
BRICKLINK_TOKEN=your_token
BRICKLINK_TOKEN_SECRET=your_token_secret
```

## Data Source Tracking

Each price snapshot includes metadata about which provider(s) provided the data:
- `metadata.provider`: The specific API that provided this price
- `metadata.source`: Same as provider (for compatibility)
- Database `source` field: Shows combined sources like "BRICKECONOMY+BRICKLINK"

## Performance

- **Parallel Queries**: All APIs are queried simultaneously (not sequentially)
- **Smart Caching**: Database stores results to reduce API calls
- **Efficient Merging**: Deduplication happens in-memory for speed

## Error Handling

If an API fails:
- ✅ Other APIs continue working
- ✅ Error is logged but doesn't stop the request
- ✅ Partial results are returned (from working APIs)
- ✅ User sees data from available sources

## Example Scenarios

### Scenario 1: All APIs Configured
- Search "Millennium Falcon"
  - BrickEconomy returns 3 results
  - Brickset returns 2 results (1 duplicate, 1 new)
  - **Result**: 4 unique sets with merged data

### Scenario 2: BrickEconomy Down
- Search "Millennium Falcon"
  - BrickEconomy fails (logged)
  - Brickset returns 2 results
  - **Result**: 2 sets from Brickset (app continues working)

### Scenario 3: Price Data
- Get prices for set 75192
  - BrickEconomy returns 30 price points
  - BrickLink returns 15 price points
  - **Result**: 45 price points merged and sorted by date

## Best Practices

1. **Configure All APIs**: More sources = better data
2. **Monitor API Usage**: Each API has rate limits
3. **Check Logs**: See which APIs are being used successfully
4. **Database First**: App checks database before calling APIs (faster)

## Future Enhancements

- Weighted averaging of prices from multiple sources
- Confidence scores based on source reliability
- Automatic source selection based on data quality
- Real-time source health monitoring

