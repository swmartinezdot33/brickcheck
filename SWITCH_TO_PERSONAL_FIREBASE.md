# Quick Solution: Switch to Personal Google Account

Given the permission issues with your workspace account, using a personal Google account is the fastest solution.

## Steps (Takes ~5 minutes):

1. **Sign out of Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Click your profile icon → Sign out

2. **Sign in with Personal Gmail**
   - Sign in with a personal Gmail account (create one if needed at accounts.google.com/signup)

3. **Create New Firebase Project**
   - Click "Add project"
   - Name: `BrickCheck`
   - Follow the wizard

4. **Add Android App**
   - Package name: `com.brickcheck.app` (must match exactly!)
   - Download `google-services.json`

5. **Replace the File**
   ```bash
   cp ~/Downloads/google-services.json android/app/google-services.json
   ```

6. **Get Service Account Key**
   - Project Settings → Service Accounts
   - Click "Generate new private key" (this will work!)
   - Download the JSON file

7. **Convert to Base64**
   ```bash
   cat ~/Downloads/your-service-account-file.json | base64
   ```

8. **Add to Vercel**
   - Environment variable: `FIREBASE_SERVICE_ACCOUNT_JSON`
   - Value: (the base64 string from step 7)

This avoids all the organization policy issues and gets you up and running quickly!

Would you like to proceed with this approach?

