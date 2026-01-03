# API Setup Guide

## Real API Integration

The app now supports real Brickset and BrickLink APIs. If API keys are not configured, it will automatically fall back to mock data.

## Brickset API Setup

1. **Get API Key**:
   - Go to https://brickset.com/article/52664/api-version-3-documentation
   - Register for an API key (if required)
   - Copy your API key

2. **Add to Environment Variables**:
   ```bash
   # In .env.local (local development)
   BRICKSET_API_KEY=your_brickset_api_key_here
   
   # In Vercel (production)
   # Go to: https://vercel.com/ultimateagent/brickcheck/settings/environment-variables
   # Add: BRICKSET_API_KEY = your_brickset_api_key_here
   ```

3. **Test**:
   - Search for sets should now return real data from Brickset
   - Barcode scanning will lookup sets using Brickset API

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

- ✅ **Brickset Integration**: Implemented and ready (needs API key)
- ✅ **BrickLink Integration**: Implemented with OAuth 1.0a (needs credentials)
- ✅ **Fallback**: Automatically uses mock data if APIs are not configured
- ✅ **Barcode Scanner**: Improved with better detection

## Testing Without API Keys

The app will work with mock data if API keys are not set. This allows you to:
- Test the UI and functionality
- Develop features
- Use the app while waiting for API access

## Next Steps

1. Get Brickset API key (if available)
2. Get BrickLink API credentials
3. Add them to environment variables
4. Restart dev server or redeploy
5. Test with real data

