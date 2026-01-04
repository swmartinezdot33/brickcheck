# Next Steps: Create Your App in Play Console

Now that your Google Play Console is set up, here's what to do next:

## Step 1: Generate Signing Key (5 minutes)

I've already configured your `build.gradle` for signing. Now you need to create the keystore:

```bash
keytool -genkey -v -keystore android/brickcheck-release.keystore \
  -alias brickcheck -keyalg RSA -keysize 2048 -validity 10000
```

Then create `android/key.properties` with your passwords. See `CREATE_ANDROID_KEY.md` for detailed instructions.

## Step 2: Create App in Play Console

In your Play Console (where you see "Create your first app"):

1. **Click "Create app"**

2. **Fill in App Details:**
   - **App name:** BrickCheck
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free (or Paid if you want to charge)
   - **Declarations:** Check all that apply:
     - ✅ Contains ads (if you plan to have ads)
     - ✅ Uses in-app products (if you plan to have in-app purchases)
     - ✅ Collects user data (you do - for collection tracking)
     - ✅ Uses Play App Signing (recommended - let Google manage your key)

3. **Click "Create app"**

## Step 3: Build Your App Bundle

Once you have the signing key set up:

```bash
cd android
./gradlew bundleRelease
```

The `.aab` file will be at:
`android/app/build/outputs/bundle/release/app-release.aab`

## Step 4: Upload to Play Console

1. In Play Console, go to: **Release → Production** (or **Testing → Internal testing** for testing first)

2. Click **"Create new release"**

3. Upload your `app-release.aab` file

4. Add release notes (e.g., "Initial release of BrickCheck")

5. Click **"Save"** and then **"Review release"**

## Step 5: Complete Store Listing

Before you can publish, you need to complete:

- ✅ **Store presence** → **Main store listing**
  - App name
  - Short description (80 chars)
  - Full description (4000 chars)
  - App icon (512x512 PNG)
  - Feature graphic (1024x500 PNG)
  - Screenshots (at least 2)

- ✅ **Store presence** → **App content**
  - Privacy policy URL (REQUIRED)
  - Target audience
  - Content rating questionnaire

- ✅ **Policy** → **Data safety**
  - What data you collect
  - How data is used
  - Data security

## Step 6: Testing (Recommended)

Before going to production, test your app:

1. **Internal testing track:**
   - Upload your AAB to Internal testing
   - Add yourself as a tester
   - Test the app thoroughly

2. **Once satisfied, promote to Production**

## Current Status

- ✅ Google Play Console account set up
- ✅ Android signing configuration added to build.gradle
- ⏳ Generate signing key (run keytool command)
- ⏳ Create key.properties file
- ⏳ Build app bundle
- ⏳ Create app in Play Console
- ⏳ Upload app bundle
- ⏳ Complete store listing
- ⏳ Submit for review

## Quick Commands

```bash
# 1. Generate key (from project root)
keytool -genkey -v -keystore android/brickcheck-release.keystore \
  -alias brickcheck -keyalg RSA -keysize 2048 -validity 10000

# 2. Create key.properties (edit the file manually after generating key)
# See CREATE_ANDROID_KEY.md for contents

# 3. Build bundle
cd android && ./gradlew bundleRelease

# 4. Find your AAB file
ls -lh android/app/build/outputs/bundle/release/app-release.aab
```

Let me know when you've created the signing key and we can build the app bundle!


