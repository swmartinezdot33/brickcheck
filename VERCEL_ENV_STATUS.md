# Vercel Environment Variables Status

## ✅ Currently Configured

All required environment variables are set **except** `BRICKECONOMY_API_KEY`:

### Supabase (All Environments)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Production, Preview, Development
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Production, Preview, Development
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Production, Preview, Development

### APIs (Production)
- ✅ `BRICKSET_API_KEY` - Production
- ✅ `BRICKLINK_CONSUMER_KEY` - Production
- ✅ `BRICKLINK_CONSUMER_SECRET` - Production
- ✅ `BRICKLINK_TOKEN` - Production
- ✅ `BRICKLINK_TOKEN_SECRET` - Production

### App Configuration
- ✅ `NEXT_PUBLIC_APP_URL` - Production, Preview, Development
- ✅ `VERCEL_CRON_SECRET` - Production, Preview

## ❌ Missing

### BrickEconomy API Key
- ❌ `BRICKECONOMY_API_KEY` - **NOT SET** (needed for multi-source integration)

## How to Add Missing Variable

### Option 1: Using Vercel CLI (Recommended)

```bash
# Add to Production
npx vercel env add BRICKECONOMY_API_KEY production

# Add to Preview (optional, for preview deployments)
npx vercel env add BRICKECONOMY_API_KEY preview

# Add to Development (optional, for local development)
npx vercel env add BRICKECONOMY_API_KEY development
```

When prompted, enter your BrickEconomy API key.

### Option 2: Using Vercel Dashboard

1. Go to: https://vercel.com/ultimateagent/brickcheck/settings/environment-variables
2. Click "Add New"
3. Name: `BRICKECONOMY_API_KEY`
4. Value: Your BrickEconomy API key
5. Select environments: Production (and optionally Preview, Development)
6. Click "Save"

## Getting Your BrickEconomy API Key

1. Visit: https://www.brickeconomy.com/premium
2. Subscribe to Premium membership
3. Go to: https://www.brickeconomy.com/me/api-access
4. Copy your API key (format: `f05a4c43-fcbc-4689-8b44-27f39da51345`)

## After Adding

Once you've added `BRICKECONOMY_API_KEY`:
- The app will automatically use BrickEconomy for both catalog and pricing
- Multi-source aggregation will be fully enabled
- You'll get data from BrickEconomy + Brickset + BrickLink simultaneously

## Verify Configuration

Run this to check all variables:
```bash
npx vercel env ls
```

You should see `BRICKECONOMY_API_KEY` listed for the environments you added it to.


