# Fixing "Key creation is not allowed" Error

## Problem

You're seeing a red banner that says:
> "Key creation is not allowed on this service account. Please check if service account key creation is restricted by organization policies."

This happens when your Google account is part of an organization (Google Workspace) that has restricted service account key creation.

## Solutions

### Solution 1: Use Google Cloud Console (Recommended - Easiest)

Even though Firebase blocks it, you can create the key directly in Google Cloud Console:

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Make sure you're in the same project: `brickcheck-86fcb`

2. **Navigate to Service Accounts:**
   - In the left sidebar, go to: **IAM & Admin** → **Service Accounts**
   - Or go directly to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=brickcheck-86fcb

3. **Find the Firebase Service Account:**
   - Look for: `firebase-adminsdk-fbsvc@brickcheck-86fcb.iam.gserviceaccount.com`
   - Click on it

4. **Create Key:**
   - Click the **"Keys"** tab at the top
   - Click **"Add Key"** → **"Create new key"**
   - Choose **"JSON"** format
   - Click **"Create"**
   - The JSON file will download

5. **Continue with base64 encoding:**
   ```bash
   cat ~/Downloads/your-service-account-key.json | base64
   ```

### Solution 2: Use a Personal Google Account (Alternative)

If Solution 1 doesn't work, create a new Firebase project with a personal Gmail account:

1. **Sign out of your current Google account in Firebase**
2. **Sign in with a personal Gmail account** (not workspace/organization)
3. **Create a new Firebase project** with that account
4. **Add the Android app** again with package name `com.brickcheck.app`
5. **Generate the service account key** (should work without restrictions)

### Solution 3: Request Admin Access (If you have admin contact)

If you need to use the workspace account, contact your Google Workspace admin to:
- Allow service account key creation for your account
- Or whitelist your Firebase project

This is usually not recommended for personal projects.

## Recommended: Solution 1 (Google Cloud Console)

Since you already have the Firebase project set up, Solution 1 is the easiest - just create the key through Google Cloud Console instead of Firebase Console.

### Quick Steps for Solution 1:

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=brickcheck-86fcb
2. Click on `firebase-adminsdk-fbsvc@brickcheck-86fcb.iam.gserviceaccount.com`
3. Go to "Keys" tab → "Add Key" → "Create new key" → "JSON"
4. Download the file
5. Convert to base64 as shown above

Let me know which solution you'd like to use, or if you need help with any step!


