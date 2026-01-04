# Step 2: Generate APNs Key in Apple Developer Portal

Now we need to create an APNs authentication key. Here's how:

## Step 1: Go to Apple Developer Portal

1. **Open your browser** and go to:
   - https://developer.apple.com/account/
   - Sign in with your Apple Developer account

## Step 2: Navigate to Keys

1. Once signed in, you should see a dashboard
2. Look for **"Certificates, Identifiers & Profiles"** (usually in the top menu or main area)
3. Click on it
4. In the left sidebar, click on **"Keys"**

## Step 3: Create a New Key

1. Click the **"+" button** (top left, next to "Keys")
2. **Key Name:** Enter: `BrickCheck Push Notifications Key` (or any name you like)
3. **Enable:** Check the box for **"Apple Push Notifications service (APNs)"**
4. Click **"Continue"**
5. Review and click **"Register"**

## Step 4: Download the Key

**⚠️ IMPORTANT: You can only download this key ONCE!**

1. After creating, you'll see the key details page
2. **Note the Key ID** - it's a 10-character string (like: `ABC123DEF4`) - **COPY THIS!**
3. Click the **"Download"** button
4. The file will download (usually named: `AuthKey_KEYID.p8`)
5. **Save this file safely** - you'll need it in the next step

## Step 5: Get Your Team ID

1. In Apple Developer Portal, go to: **Membership** (in the left sidebar or top menu)
2. Find your **Team ID** (10-character string)
3. **COPY THIS** - you'll need it!

Once you have:
- ✅ The .p8 key file downloaded
- ✅ The Key ID (10 characters)
- ✅ Your Team ID (10 characters)

Let me know and we'll convert the key to base64 and add everything to Vercel!


