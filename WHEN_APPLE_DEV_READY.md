# Quick Guide: Complete APNs Setup (When Apple Developer Account is Ready)

When your Apple Developer account is approved, follow these steps:

## Quick Steps

1. **Generate APNs Key:**
   - Go to: https://developer.apple.com/account/
   - Certificates, Identifiers & Profiles → Keys
   - Create new key → Enable "Apple Push Notifications service (APNs)"
   - Download .p8 file
   - Note Key ID (10 characters)
   - Get Team ID from Membership page (10 characters)

2. **Convert Key to Base64:**
   ```bash
   cat ~/Downloads/AuthKey_KEYID.p8 | base64
   ```

3. **Add to Vercel:**
   ```bash
   # Key ID
   echo "YOUR_KEY_ID" | npx vercel env add APNS_KEY_ID production
   
   # Team ID
   echo "YOUR_TEAM_ID" | npx vercel env add APNS_TEAM_ID production
   
   # Key (base64)
   cat ~/Downloads/AuthKey_KEYID.p8 | base64 | npx vercel env add APNS_KEY production
   
   # Bundle ID (optional)
   echo "com.brickcheck.app" | npx vercel env add APNS_BUNDLE_ID production
   ```

Or just let me know when you have the account and I'll help you do it!

## Current Status

- ✅ Android push notifications: **WORKING**
- ⏳ iOS push notifications: **Waiting for Apple Developer account**



