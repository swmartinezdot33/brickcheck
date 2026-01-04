# Create Android Signing Key

Follow these steps to generate your signing key for Google Play Store:

## Step 1: Generate the Keystore

Run this command in your terminal from the project root:

```bash
keytool -genkey -v -keystore android/brickcheck-release.keystore \
  -alias brickcheck -keyalg RSA -keysize 2048 -validity 10000
```

**You'll be prompted for:**

1. **Keystore password:** 
   - Create a strong password
   - ⚠️ **SAVE THIS PASSWORD!** You'll need it forever for app updates
   
2. **Re-enter password:** Type it again

3. **Key password:** 
   - Press Enter to use the same password as keystore
   - Or enter a different password (also save it!)

4. **Your name:** Enter your name or organization name

5. **Organizational unit:** Optional (press Enter to skip)

6. **Organization:** Your company name (optional, press Enter to skip)

7. **City:** Your city

8. **State/Province:** Your state or province

9. **Country code:** Two-letter code (e.g., US, GB, CA)

10. **Confirm:** Type "yes" to confirm

## Step 2: Create key.properties File

After generating the keystore, create this file:

**File:** `android/key.properties`

```properties
storePassword=YOUR_KEYSTORE_PASSWORD_HERE
keyPassword=YOUR_KEY_PASSWORD_HERE
keyAlias=brickcheck
storeFile=../brickcheck-release.keystore
```

**Replace:**
- `YOUR_KEYSTORE_PASSWORD_HERE` with the password you used
- `YOUR_KEY_PASSWORD_HERE` with the key password (same as keystore if you pressed Enter)

## Step 3: Verify Setup

The `key.properties` file is already in `.gitignore`, so it won't be committed to git.

Your keystore file (`brickcheck-release.keystore`) is also ignored.

## ⚠️ Important Security Notes

1. **Never commit the keystore or key.properties to git**
2. **Backup your keystore file** to a secure location (password manager, encrypted drive, etc.)
3. **Save your passwords securely** - if you lose them, you can't update your app!
4. The keystore file is already in `.gitignore`, so it won't be accidentally committed

## Next Steps

Once you've created the keystore and `key.properties` file:

1. ✅ Run the keytool command above
2. ✅ Create `android/key.properties` with your passwords
3. ✅ Build your app bundle: `cd android && ./gradlew bundleRelease`
4. ✅ Upload to Play Console

Let me know when you've created the keystore and I can help you build the app bundle!

