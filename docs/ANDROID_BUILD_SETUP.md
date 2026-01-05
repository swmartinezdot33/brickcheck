# Android Build Setup for Google Play Store

Step-by-step guide to build and sign your Android app for Play Store submission.

## Step 1: Generate Signing Key

### Create Keystore File

```bash
# Run this command in the project root
keytool -genkey -v -keystore android/brickcheck-release.keystore \
  -alias brickcheck -keyalg RSA -keysize 2048 -validity 10000
```

**You'll be prompted for:**
- **Keystore password:** Create a strong password (save it securely!)
- **Key password:** Can be same as keystore password
- **Your name:** Your name or organization
- **Organizational unit:** Optional
- **Organization:** Your company name (optional)
- **City:** Your city
- **State:** Your state/province
- **Country code:** Two-letter code (e.g., US, GB)

**Important:** 
- Save the keystore file securely
- Never commit it to git!
- Keep the passwords safe - you'll need them for updates

## Step 2: Configure Gradle Signing

### Create Key Properties File

Create `android/key.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=brickcheck
storeFile=../brickcheck-release.keystore
```

**Replace:**
- `YOUR_KEYSTORE_PASSWORD` with your keystore password
- `YOUR_KEY_PASSWORD` with your key password

### Update .gitignore

Make sure `android/key.properties` and `*.keystore` are in `.gitignore`:

```bash
# Add to .gitignore if not already there
echo "android/key.properties" >> .gitignore
echo "*.keystore" >> .gitignore
echo "android/*.keystore" >> .gitignore
```

## Step 3: Update build.gradle

The build.gradle needs to be updated to use the signing config. Let me check the current setup and update it.

## Step 4: Build the App Bundle

```bash
# Navigate to android directory
cd android

# Build the release bundle
./gradlew bundleRelease
```

The AAB file will be created at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## Step 5: Verify the Bundle

You can verify the bundle was created correctly:

```bash
# Check the file exists
ls -lh android/app/build/outputs/bundle/release/app-release.aab

# Should show file size (typically 10-50MB)
```

## Step 6: Test the Bundle (Optional)

Before uploading to Play Store, you can test it:

```bash
# Build a release APK for local testing
cd android
./gradlew assembleRelease

# Install on device (replace with your device path)
adb install app/build/outputs/apk/release/app-release.apk
```

## Step 7: Upload to Play Console

1. Go to: https://play.google.com/console
2. Select your app (or create new)
3. Go to: Release → Production (or Testing → Internal testing)
4. Click "Create new release"
5. Upload `app-release.aab`
6. Add release notes
7. Review and roll out

## Troubleshooting

### "keystore file not found"
- Make sure the path in `key.properties` is correct
- Use relative path from `android/` directory: `../brickcheck-release.keystore`

### "Password incorrect"
- Double-check passwords in `key.properties`
- Make sure no extra spaces or quotes

### "Gradle build failed"
- Make sure you have the Android SDK installed
- Run `./gradlew --version` to check Gradle installation
- Check Android Studio is properly configured

## Security Best Practices

1. **Never commit keystore or key.properties to git**
2. **Store passwords securely** (use a password manager)
3. **Backup your keystore** (store in secure location)
4. **Consider Google Play App Signing** (they manage the key for you)

## Google Play App Signing (Recommended)

Instead of managing your own key, you can let Google manage it:

1. When you upload your first AAB, Google will offer to manage signing
2. You upload your key once, then Google manages it
3. Benefits:
   - More secure
   - Easier key recovery
   - Better for large teams

## Next Steps

After building your AAB:
1. ✅ Upload to Play Console
2. ⏳ Complete store listing
3. ⏳ Add screenshots and graphics
4. ⏳ Fill out content rating
5. ⏳ Submit for review




