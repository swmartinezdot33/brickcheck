# APNs (iOS Push Notifications) Setup Walkthrough

Let's set up Apple Push Notification service for iOS. This involves:

1. Enabling Push Notifications in Xcode
2. Generating APNs key in Apple Developer Portal
3. Getting your Team ID
4. Converting key to base64
5. Adding environment variables to Vercel

## Step 1: Enable Push Notifications in Xcode

1. **Open the iOS project:**
   ```bash
   npm run cap:ios
   ```
   Or manually:
   ```bash
   open ios/App/App.xcworkspace
   ```

2. **In Xcode:**
   - Select the "App" target (left sidebar)
   - Go to "Signing & Capabilities" tab
   - Click the "+ Capability" button (top left)
   - Search for "Push Notifications"
   - Click to add it
   - It should appear in the capabilities list

## Step 2: Generate APNs Authentication Key

1. **Go to Apple Developer Portal:**
   - Visit: https://developer.apple.com/account/
   - Sign in with your Apple Developer account

2. **Navigate to Keys:**
   - Click: Certificates, Identifiers & Profiles
   - Click: Keys (in the left sidebar)

3. **Create New Key:**
   - Click the "+" button (top left)
   - Key Name: "BrickCheck Push Notifications Key" (or any name you prefer)
   - Enable checkbox: "Apple Push Notifications service (APNs)"
   - Click "Continue"
   - Click "Register"

4. **Download the Key:**
   - After creating, you'll see the key details
   - **IMPORTANT:** Click "Download" - you can only download this once!
   - Note the **Key ID** shown on the page (10-character string like: ABC123DEF4)
   - Save the `.p8` file (usually named: `AuthKey_KEYID.p8`)

5. **Get Your Team ID:**
   - In Apple Developer Portal, go to: Membership
   - Copy your **Team ID** (10-character string)

## Step 3: Convert Key to Base64

Once you have the `.p8` file:

```bash
cat ~/Downloads/AuthKey_KEYID.p8 | base64
```

Copy the entire output string.

## Step 4: Add Environment Variables to Vercel

You'll need these variables:
- `APNS_KEY_ID` = The Key ID from step 2
- `APNS_TEAM_ID` = Your Team ID from step 2
- `APNS_KEY` = The base64 string from step 3
- `APNS_BUNDLE_ID` = com.brickcheck.app (already set, but can be explicit)

Let's start with Step 1 - opening Xcode!

