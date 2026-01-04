# BrickLink API Credentials

## Production Credentials (Added to Vercel)

✅ **Consumer Key**: `E86E1037D7BB4914BC22B2703F3732D4`
✅ **Consumer Secret**: `35A0D9ECFDB947D5B8DF923E15BF46A6`
✅ **Token**: `9B875751E44441A082AA0389C17F4985`
✅ **Token Secret**: `B359E15B6A47498C8F77A804DB76D5B1`

## Local Development Setup

Add these to your `.env.local` file:

```bash
BRICKLINK_CONSUMER_KEY=E86E1037D7BB4914BC22B2703F3732D4
BRICKLINK_CONSUMER_SECRET=35A0D9ECFDB947D5B8DF923E15BF46A6
BRICKLINK_TOKEN=9B875751E44441A082AA0389C17F4985
BRICKLINK_TOKEN_SECRET=B359E15B6A47498C8F77A804DB76D5B1
```

## Callback URL

✅ Configured: `https://www.brickcheck.app/api/webhooks/bricklink`

**Note:** You'll need to create this webhook endpoint in your app if you want to receive events from BrickLink.

## Access IP Configuration

- **Allowed IP**: `0.0.0.0` (access from anywhere)
- **Mask IP**: `0.0.0.0`

This allows your Vercel serverless functions to access the API from any IP address.

## Security Reminder

⚠️ **Never commit these credentials to git!**
- They are stored in environment variables only
- Keep `.env.local` in `.gitignore`
- These credentials are already in Vercel production environment

## Next Steps

1. ✅ Credentials added to Vercel
2. ⏳ Add to `.env.local` for local development
3. ⏳ Redeploy to Vercel (or it will auto-deploy on next push)
4. ⏳ Test the BrickLink API integration
5. ⏳ (Optional) Create webhook endpoint if needed

## Testing

After deployment, the app will automatically use the real BrickLink API instead of mock data for pricing information.



