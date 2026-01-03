# Push Notifications Setup Guide

This guide covers setting up push notifications for iOS (APNs) and Android (FCM) for BrickCheck.

## Overview

BrickCheck uses:
- **Firebase Cloud Messaging (FCM)** for Android devices
- **Apple Push Notification service (APNs)** for iOS devices

## Prerequisites

- Firebase project (for Android)
- Apple Developer Account (for iOS)
- Environment variables configured in Vercel

## Part 1: Firebase Cloud Messaging (FCM) for Android

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard
4. Enable Google Analytics (optional)

### Step 2: Add Android App to Firebase

1. In Firebase Console, click "Add app" → Android
2. Register app:
   - **Package name**: `com.brickcheck.app`
   - **App nickname**: BrickCheck (optional)
   - **Debug signing certificate SHA-1**: (optional, for testing)
3. Download `google-services.json`
4. Place it in `android/app/` directory

### Step 3: Configure Android Project

The `google-services.json` file should be placed at:
```
android/app/google-services.json
```

**Important**: The file is safe to commit to git (it's not sensitive).

### Step 4: Update Android Build Files

You'll need to manually update these files after creating the Firebase project:

#### android/build.gradle (project level)

Add to the `buildscript.dependencies` section:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
        // ... other dependencies
    }
}
```

#### android/app/build.gradle

Add at the very bottom of the file (after all other `apply plugin` statements):
```gradle
apply plugin: 'com.google.gms.google-services'
```

### Step 5: Get Firebase Service Account Key

1. In Firebase Console, go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Convert to base64 (for environment variable):
   ```bash
   cat path/to/service-account-key.json | base64
   ```
5. Save the base64 string - you'll need it for `FIREBASE_SERVICE_ACCOUNT_JSON`

## Part 2: Apple Push Notification service (APNs) for iOS

### Step 1: Enable Push Notifications Capability in Xcode

1. Open the iOS project:
   ```bash
   npm run cap:ios
   ```

2. In Xcode:
   - Select the "App" target
   - Go to "Signing & Capabilities"
   - Click "+ Capability"
   - Add "Push Notifications"

### Step 2: Generate APNs Authentication Key

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to Certificates, Identifiers & Profiles → Keys
3. Click the "+" button to create a new key
4. Enter key name: "BrickCheck Push Notifications Key"
5. Enable "Apple Push Notifications service (APNs)"
6. Click "Continue" → "Register"
7. Download the `.p8` key file (you can only download it once!)
8. Note the **Key ID** (shown after creation)

### Step 3: Get Your Team ID

1. In Apple Developer Portal, go to Membership
2. Copy your **Team ID** (10-character string)

### Step 4: Prepare APNs Key for Environment Variable

Convert the `.p8` key file to base64:
```bash
cat path/to/AuthKey_KEYID.p8 | base64
```

Save:
- The base64-encoded key
- The Key ID
- Your Team ID

## Part 3: Configure Environment Variables

Add these environment variables to Vercel:

### Firebase (FCM)

```bash
# Firebase Service Account JSON (base64 encoded)
FIREBASE_SERVICE_ACCOUNT_JSON=<base64-encoded-service-account-json>
```

### Apple (APNs)

```bash
# APNs Key ID (10-character string from Apple Developer)
APNS_KEY_ID=<your-key-id>

# APNs Team ID (10-character string from Apple Developer)
APNS_TEAM_ID=<your-team-id>

# APNs Key (base64-encoded .p8 file)
APNS_KEY=<base64-encoded-p8-key>

# Bundle ID (default: com.brickcheck.app)
APNS_BUNDLE_ID=com.brickcheck.app
```

### Adding to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your BrickCheck project
3. Go to Settings → Environment Variables
4. Add each variable for Production (and Preview/Development if needed)
5. Redeploy the application

## Part 4: Test Push Notifications

### Testing Setup

1. Build and install the app on a physical device
2. Log in to the app
3. The app should automatically register for push notifications
4. Check the `push_tokens` table in Supabase to verify tokens are being stored

### Manual Test

You can manually send a test notification using the API:

```bash
curl -X POST https://www.brickcheck.app/api/push/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VERCEL_CRON_SECRET" \
  -d '{
    "user_id": "USER_UUID",
    "title": "Test Notification",
    "body": "This is a test push notification",
    "data": {
      "type": "test"
    }
  }'
```

## Troubleshooting

### Android (FCM)

**Notifications not received:**
- Verify `google-services.json` is in `android/app/`
- Check that Google Services plugin is applied in build.gradle files
- Verify Firebase Service Account JSON is correctly base64 encoded
- Check device logs: `adb logcat | grep -i fcm`

**Build errors:**
- Ensure Google Services plugin is in project-level `build.gradle`
- Clean and rebuild: `cd android && ./gradlew clean build`

### iOS (APNs)

**Notifications not received:**
- Verify APNs key is correctly base64 encoded
- Check Key ID and Team ID are correct
- Ensure Push Notifications capability is enabled in Xcode
- Check device logs in Xcode Console

**Invalid credentials:**
- Verify the `.p8` key file is correctly base64 encoded
- Ensure you're using the correct Key ID and Team ID
- Check that the key has APNs enabled in Apple Developer Portal

### General

**Token registration fails:**
- Check that the app has permission to send notifications
- Verify the push notification service is properly initialized
- Check server logs for errors

**Notifications not sending:**
- Verify environment variables are set correctly
- Check Vercel logs for errors
- Verify user has registered push tokens in database

## Security Notes

- The `google-services.json` file is safe to commit (it's public configuration)
- Never commit `.p8` keys or service account JSON files to git
- Store environment variables securely in Vercel
- Use service role keys or API keys to secure the `/api/push/send` endpoint
- Regularly rotate credentials if compromised

## Next Steps

After setup:
1. Test push notifications on both platforms
2. Verify notifications are sent when alerts trigger (during nightly refresh)
3. Monitor notification delivery rates
4. Consider adding notification preferences/settings in the app
