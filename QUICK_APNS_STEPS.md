# Quick APNs Setup Steps

## Step 1: Enable in Xcode (Do this first)

```bash
npm run cap:ios
```

Then in Xcode:
- Select "App" target
- Signing & Capabilities tab
- + Capability → Push Notifications

## Step 2: Get APNs Key from Apple Developer

1. Go to: https://developer.apple.com/account/
2. Certificates, Identifiers & Profiles → Keys
3. Create new key with "Apple Push Notifications service (APNs)"
4. Download the .p8 file (only once!)
5. Note the Key ID
6. Get Team ID from Membership page

## Step 3: Convert to Base64

```bash
cat ~/Downloads/AuthKey_KEYID.p8 | base64
```

## Step 4: Add to Vercel

We'll use the CLI to add:
- APNS_KEY_ID
- APNS_TEAM_ID  
- APNS_KEY
- APNS_BUNDLE_ID (optional, defaults to com.brickcheck.app)

Ready to start? Let me know when you've enabled Push Notifications in Xcode!



