# BrickEconomy API Setup

## Overview

BrickEconomy API provides comprehensive LEGO set data including:
- Set metadata (name, theme, year, pieces, MSRP)
- Price history and trends
- Retired status
- Market value estimates

## Getting API Access

1. **Sign up for BrickEconomy Premium**:
   - Visit: https://www.brickeconomy.com/premium
   - Premium membership includes API access with 100 daily requests
   - Pricing and details available on their website

2. **Get Your API Key**:
   - After subscribing, you'll receive an API key
   - Keep this key secure

3. **API Documentation**:
   - Reference: https://www.brickeconomy.com/api-reference
   - Review available endpoints and data formats

## Configuration

### Environment Variables

Add to `.env.local` (local development):
```bash
BRICKECONOMY_API_KEY=your_api_key_here
```

Add to Vercel (production):
```bash
npx vercel env add BRICKECONOMY_API_KEY production
# Enter your API key when prompted
```

## API Priority

The app uses APIs in this priority order:

### Catalog Provider (Set Metadata):
1. **BrickEconomy** (if `BRICKECONOMY_API_KEY` is set)
2. **Brickset** (if `BRICKSET_API_KEY` is set)
3. **Error** if neither is configured

### Price Provider (Pricing Data):
1. **BrickEconomy** (if `BRICKECONOMY_API_KEY` is set)
2. **BrickLink** (if all BrickLink credentials are set)
3. **Error** if neither is configured

## Features

BrickEconomy API provides:
- ✅ Set search by name, number, or theme
- ✅ Detailed set information
- ✅ Price history data
- ✅ Market value estimates
- ✅ Retired status tracking

## Rate Limits

- **100 requests per day** (Premium membership)
- Plan your API usage accordingly
- Consider caching frequently accessed data

## Error Handling

If the API is not configured:
- The app will return clear error messages
- No mock data will be used
- Users will see helpful messages about API configuration

## Next Steps

1. Subscribe to BrickEconomy Premium
2. Get your API key
3. Add `BRICKECONOMY_API_KEY` to environment variables
4. Restart dev server or redeploy
5. Test the integration




