# Firebase Setup Walkthrough - Step by Step

This guide will walk you through setting up Firebase Cloud Messaging (FCM) for Android push notifications.

## Step 1: Go to Firebase Console

1. Open your web browser
2. Go to: https://console.firebase.google.com/
3. Sign in with your Google account

## Step 2: Create or Select a Project

### Option A: Create a New Project

1. Click "Add project" (or "Create a project")
2. Enter project name: `BrickCheck` (or your preferred name)
3. Click "Continue"
4. **Google Analytics** (optional):
   - You can enable or disable Google Analytics
   - For MVP, you can disable it (toggle it off)
   - Click "Continue"
5. Click "Create project"
6. Wait for project creation (usually 10-30 seconds)
7. Click "Continue" when it's ready

### Option B: Use Existing Project

If you already have a Firebase project:
1. Click on your project name in the top left
2. Select the project you want to use

## Step 3: Add Android App to Firebase

1. In your Firebase project dashboard, look for the center of the page
2. You should see icons for different platforms (Web, iOS, Android)
3. Click the **Android icon** (or click "Add app" → Android)

### Configure Android App

You'll see a form to register your Android app:

1. **Android package name**: Enter exactly: `com.brickcheck.app`
   - This MUST match the package name in your Android project

2. **App nickname (optional)**: Enter `BrickCheck` (or leave blank)

3. **Debug signing certificate SHA-1 (optional)**: 
   - Leave this blank for now
   - You can add this later for better debugging

4. Click **"Register app"**

## Step 4: Download google-services.json

1. After registering, you'll see a download button for `google-services.json`
2. Click **"Download google-services.json"**
3. Save the file somewhere you can find it (Downloads folder is fine)

## Step 5: Add google-services.json to Your Project

1. Move the downloaded `google-services.json` file to:
   ```
   android/app/google-services.json
   ```

   **On Mac/Linux**, you can do this in terminal:
   ```bash
   # Navigate to your project (if not already there)
   cd /Users/stevenmartinez/Cursor/brickcheck
   
   # Copy the file (replace ~/Downloads/google-services.json with your actual path)
   cp ~/Downloads/google-services.json android/app/google-services.json
   ```

   **Or manually:**
   - Open Finder
   - Navigate to your Downloads folder
   - Find `google-services.json`
   - Copy it
   - Navigate to `android/app/` in your project
   - Paste it there

2. Verify the file is in the right place:
   ```bash
   ls -la android/app/google-services.json
   ```
   
   You should see the file listed.

## Step 6: Get Firebase Service Account Key

This is needed for the backend to send push notifications.

1. In Firebase Console, click the **gear icon** (⚙️) next to "Project Overview" at the top left
2. Click **"Project settings"**
3. Click the **"Service accounts"** tab at the top
4. You should see "Firebase Admin SDK"
5. Click **"Generate new private key"** button
6. A dialog will appear warning you about keeping the key secure
7. Click **"Generate key"**
8. A JSON file will download (usually named something like `brickcheck-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`)
9. **Save this file securely** - you'll need it in the next step

## Step 7: Convert Service Account Key to Base64

The service account JSON needs to be converted to base64 for the environment variable.

**On Mac/Linux:**
```bash
# Replace the path with your actual downloaded file path
cat ~/Downloads/brickcheck-firebase-adminsdk-xxxxx-xxxxxxxxxx.json | base64
```

**Or if the file is in a different location:**
```bash
# Find where you saved it, then:
cat /path/to/your/service-account-key.json | base64
```

This will output a very long string of characters - that's your base64-encoded key.

**Copy this entire string** - you'll need it for the environment variable.

## Step 8: Verify Setup

Let's make sure everything is in place:

1. **Check google-services.json is in place:**
   ```bash
   ls android/app/google-services.json
   ```
   Should show the file exists.

2. **Verify the Android build files are ready:**
   The build files are already configured to use Google Services when the file is present.

## Next Steps

After completing this setup:

1. ✅ `google-services.json` should be in `android/app/`
2. ✅ Service account key downloaded (keep it safe!)
3. ✅ Base64-encoded service account key ready

**What's Next:**
- You'll need to add the base64-encoded service account key as an environment variable in Vercel:
  - Variable name: `FIREBASE_SERVICE_ACCOUNT_JSON`
  - Value: (the base64 string you generated)

## Troubleshooting

**"Package name already exists":**
- This means you've already added this Android app to Firebase
- You can download the `google-services.json` from Project Settings → Your apps → Android app → Download config

**Can't find Service Accounts tab:**
- Make sure you're in Project Settings (gear icon)
- The Service Accounts tab should be at the top of the settings page

**Base64 command not found:**
- On Mac/Linux, `base64` should be available by default
- On Windows, you might need to use PowerShell or WSL

Let me know when you've completed these steps and we can move on to the next part!


