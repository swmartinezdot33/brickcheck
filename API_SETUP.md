# API Setup Guide

## Real API Integration Only

**⚠️ IMPORTANT: This app NO LONGER uses mock data. You MUST configure at least one API to use the app.**

The app supports multiple APIs with automatic fallback between them, but requires at least one to be configured.

## BrickEconomy API Setup (Recommended)

BrickEconomy provides both catalog (set metadata) and pricing data in one API.

1. **Get API Key**:
   - Visit https://www.brickeconomy.com/premium
   - Subscribe to Premium membership (includes API access with 100 daily requests)
   - Get your API key from your account

2. **Add to Environment Variables**:
   ```bash
   # In .env.local (local development)
   BRICKECONOMY_API_KEY=your_brickeconomy_api_key_here
   
   # In Vercel (production)
   npx vercel env add BRICKECONOMY_API_KEY production
   # Enter your API key when prompted
   ```

3. **Benefits**:
   - ✅ Provides both set metadata AND pricing data
   - ✅ Comprehensive price history
   - ✅ Market value estimates
   - ✅ Retired status tracking

See `BRICKECONOMY_API_SETUP.md` for detailed documentation.

## Brickset API Setup (Alternative Catalog)

1. **Get API Key**:
   - Go to https://brickset.com/article/52664/api-version-3-documentation
   - Register for an API key (if required)
   - Copy your API key

2. **Add to Environment Variables**:
   ```bash
   # In .env.local (local development)
   BRICKSET_API_KEY=your_brickset_api_key_here
   
   # In Vercel (production)
   npx vercel env add BRICKSET_API_KEY production
   ```

3. **Note**: Brickset API requires userHash for full functionality (see BRICKSET_API_NOTE.md)

## BrickLink API Setup

1. **Get API Credentials**:
   - Go to https://www.bricklink.com/v3/api.page
   - Register for API access
   - Create an application to get:
     - Consumer Key
     - Consumer Secret
     - Token
     - Token Secret

2. **Add to Environment Variables**:
   ```bash
   # In .env.local (local development)
   BRICKLINK_CONSUMER_KEY=your_consumer_key
   BRICKLINK_CONSUMER_SECRET=your_consumer_secret
   BRICKLINK_TOKEN=your_token
   BRICKLINK_TOKEN_SECRET=your_token_secret
   
   # In Vercel (production)
   # Add all four variables in the Vercel dashboard
   ```

3. **Test**:
   - Price refresh should now fetch real prices from BrickLink
   - Nightly cron job will use real BrickLink data

## Current Status

- ✅ **BrickEconomy Integration**: Implemented and ready (needs API key)
- ✅ **Brickset Integration**: Implemented and ready (needs API key + userHash)
- ✅ **BrickLink Integration**: Implemented with OAuth 1.0a (needs credentials)
- ❌ **NO MOCK DATA**: App requires real APIs to function
- ✅ **Barcode Scanner**: Improved with better detection

## API Priority

### Catalog Provider (Set Metadata):
1. **BrickEconomy** (if `BRICKECONOMY_API_KEY` is set) - Preferred
2. **Brickset** (if `BRICKSET_API_KEY` is set) - Alternative
3. **Error** if neither is configured

### Price Provider (Pricing Data):
1. **BrickEconomy** (if `BRICKECONOMY_API_KEY` is set) - Preferred
2. **BrickLink** (if all credentials are set) - Alternative
3. **Error** if neither is configured

## Required Configuration

**You MUST configure at least:**
- One catalog API (BrickEconomy OR Brickset)
- One price API (BrickEconomy OR BrickLink)

**Recommended**: Use BrickEconomy for both (simplest setup)

## Next Steps

1. Get BrickEconomy Premium subscription (recommended)
2. OR get Brickset API key + BrickLink credentials
3. Add API keys to environment variables
4. Restart dev server or redeploy
5. Test with real data

**Note**: The app will show clear error messages if APIs are not configured. No mock data will be used.

