# Account Page Setup Guide

## Database Migrations

Run the following migrations to set up the account features:

```bash
# Apply migrations
npx supabase migration up
```

Or if using Supabase CLI:
```bash
supabase db push
```

## Storage Bucket Setup

Create a Supabase Storage bucket for user avatars:

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `avatars`
3. Set it to **Public** (or configure RLS policies)
4. Add RLS policy:

```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to avatars
CREATE POLICY "Avatars are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## Required Packages

Install the Google Play API package:

```bash
npm install googleapis
```

For Apple App Store API, you'll need a JWT library. Recommended:

```bash
npm install jsonwebtoken
# or
npm install @apple/app-store-server-library
```

## Environment Variables

### Apple App Store Server API

Add these to your `.env.local` and Vercel:

```
APPLE_KEY_ID=your_key_id
APPLE_ISSUER_ID=your_issuer_id
APPLE_BUNDLE_ID=com.brickcheck.app
APPLE_PRIVATE_KEY=your_base64_encoded_private_key
```

### Google Play Developer API

Add these to your `.env.local` and Vercel:

```
GOOGLE_PLAY_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_PLAY_PACKAGE_NAME=com.brickcheck.app
```

## Subscription Status

The subscription status API will:
- Cache results for 5 minutes to avoid rate limits
- Fall back to cached data if API calls fail
- Automatically refresh when cache expires

Users can manually refresh subscription status using the "Refresh" button.

## Notes

- Profile updates are immediate
- Avatar uploads require Supabase Storage bucket setup
- Subscription status requires proper API credentials
- The system gracefully handles missing API credentials

