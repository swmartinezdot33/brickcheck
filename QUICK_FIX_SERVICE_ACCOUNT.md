# Quick Fix: Try This First

Since the policy shows "Not enforced" at the project level, let's try creating the key directly:

## Step 1: Go to Service Accounts

Click this link or navigate manually:
👉 **https://console.cloud.google.com/iam-admin/serviceaccounts?project=brickcheck-86fcb**

## Step 2: Open the Firebase Service Account

1. Find: `firebase-adminsdk-fbsvc@brickcheck-86fcb.iam.gserviceaccount.com`
2. Click on it (the email address)

## Step 3: Create the Key

1. Click the **"Keys"** tab at the top
2. Click **"Add Key"** button
3. Select **"Create new key"**
4. Choose **"JSON"** format
5. Click **"Create"**

## What to Expect

**If it works:**
- A JSON file will download
- You can convert it to base64 and continue setup

**If you get an error:**
- The organization policy is blocking it from the parent level
- You'll need to use a personal Google account instead (easier for personal projects)

Try it now and let me know what happens!




