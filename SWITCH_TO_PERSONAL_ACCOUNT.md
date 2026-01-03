# Quick Guide: Switching to Personal Google Account

If you want to proceed quickly without waiting for admin approval:

## Quick Steps

1. **Sign out of Firebase Console**
   - Click your profile icon (top right) → Sign out

2. **Sign in with personal Gmail**
   - Go to: https://console.firebase.google.com/
   - Sign in with a personal Gmail account (create one if needed)

3. **Create new Firebase project**
   - Click "Add project"
   - Name: `BrickCheck`
   - Continue through setup

4. **Add Android app**
   - Package name: `com.brickcheck.app`
   - Download new `google-services.json`

5. **Replace the file**
   ```bash
   # Copy new file to project
   cp ~/Downloads/google-services.json android/app/google-services.json
   ```

6. **Get service account key**
   - Project Settings → Service Accounts
   - Generate new private key (should work!)
   - Convert to base64

This takes about 5-10 minutes and avoids waiting for admin approval.

Let me know if you want to proceed this way!

