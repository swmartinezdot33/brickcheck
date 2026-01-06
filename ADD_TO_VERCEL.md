# Add Firebase Service Account Key to Vercel

Perfect! Your Firebase service account key is ready. Here's how to add it to Vercel:

## Step 1: Copy the Base64 String

The base64-encoded key is in:
```
~/Downloads/firebase-key-base64-final.txt
```

You can copy it with:
```bash
cat ~/Downloads/firebase-key-base64-final.txt | pbcopy
```

Or open the file and copy all the text.

## Step 2: Add to Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your BrickCheck project

2. **Go to Environment Variables:**
   - Settings → Environment Variables

3. **Add New Variable:**
   - **Key**: `FIREBASE_SERVICE_ACCOUNT_JSON`
   - **Value**: (paste the entire base64 string from the file)
   - **Environment**: Select "Production" (and optionally Preview/Development)
   - Click "Save"

4. **Redeploy:**
   - After adding the variable, you may need to redeploy
   - Go to Deployments → Click "..." on latest deployment → Redeploy
   - Or push a commit to trigger a new deployment

## Step 3: Verify

After deployment, push notifications for Android should work!

## Next Steps

You'll also need to set up APNs for iOS push notifications (separate process). But Firebase/FCM for Android is now configured!





