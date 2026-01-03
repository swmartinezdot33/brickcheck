# BrickLink API Setup Guide

## Registration Form Fields

When registering for BrickLink Store API access at https://bricklink.com/v2/api/register_consumer.page:

### For Vercel/Serverless Deployment:

**IP Address:**
- Enter: `0.0.0.0` (allows access from anywhere)
- **Why?** Vercel uses serverless functions that run from multiple IP addresses across different regions. Using 0.0.0.0 allows your API to work regardless of which Vercel region handles the request.
- **Security Note:** While this is less secure than restricting to specific IPs, it's necessary for serverless deployments. Make sure to keep your API credentials secure and never expose them to the client.

**IP Mask:**
- Enter: `0.0.0.0` (to match the 0.0.0.0 IP address)

**Callback URL:**
- Option 1: Leave as `http://` or blank (if you don't need webhooks)
- Option 2: Set to `https://www.brickcheck.app/api/webhooks/bricklink` (if you want to receive events from BrickLink)
- **Note:** You'll need to create the webhook endpoint in your app if you use this

**Terms:**
- ✅ Check "I Agree" checkbox (after reading the API Terms of Use)

### After Registration

Once you submit the form, BrickLink will provide you with:
1. **Consumer Key** - Store in `BRICKLINK_CONSUMER_KEY`
2. **Consumer Secret** - Store in `BRICKLINK_CONSUMER_SECRET`

### Getting Token & Token Secret

After getting Consumer Key/Secret, you'll need to:
1. Use OAuth 1.0a flow to get a Token and Token Secret
2. Store these in:
   - `BRICKLINK_TOKEN`
   - `BRICKLINK_TOKEN_SECRET`

See the BrickLink API documentation for OAuth flow details.

## Adding to Environment Variables

Once you have all four values, add them to:

**Local (.env.local):**
```bash
BRICKLINK_CONSUMER_KEY=your_consumer_key
BRICKLINK_CONSUMER_SECRET=your_consumer_secret
BRICKLINK_TOKEN=your_token
BRICKLINK_TOKEN_SECRET=your_token_secret
```

**Vercel:**
```bash
npx vercel env add BRICKLINK_CONSUMER_KEY production
npx vercel env add BRICKLINK_CONSUMER_SECRET production
npx vercel env add BRICKLINK_TOKEN production
npx vercel env add BRICKLINK_TOKEN_SECRET production
```

Or add them via Vercel Dashboard → Settings → Environment Variables

## Security Best Practices

- ✅ Never commit API keys to git
- ✅ Use environment variables only
- ✅ Rotate keys if compromised
- ✅ Use server-side API calls only (never expose keys to client)


