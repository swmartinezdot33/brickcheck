# Quick Start: Google Play Store Setup

## 🚀 Account Registration (5 minutes)

1. **Visit:** https://play.google.com/console/signup
2. **Pay:** $25 one-time fee (lifetime access)
3. **Complete:** Account details and verification

That's it! Your account is ready.

## 📦 Prepare Your App (30 minutes)

### 1. Generate Signing Key

```bash
keytool -genkey -v -keystore android/brickcheck-release.keystore \
  -alias brickcheck -keyalg RSA -keysize 2048 -validity 10000
```

Save the password securely - you'll need it forever!

### 2. Configure Signing (I'll help set this up)

The build.gradle needs signing configuration - I can set this up for you.

### 3. Build App Bundle

```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### 4. Create App Listing

- App name: BrickCheck
- Short description: (80 chars max)
- Full description: (4000 chars max)
- Screenshots: At least 2 required
- App icon: 512x512 PNG
- Privacy policy: Required! (host on your website)

### 5. Upload & Submit

1. Upload the AAB file
2. Complete all sections (rating, privacy, etc.)
3. Submit for review (1-7 days)

## ✅ Checklist

- [ ] Google Play Developer account ($25)
- [ ] Signing key generated
- [ ] App bundle built (.aab file)
- [ ] Privacy policy hosted (public URL)
- [ ] App icon (512x512)
- [ ] Screenshots (at least 2)
- [ ] Store listing complete
- [ ] Content rating done
- [ ] Submit for review

## 📚 Full Guides

- **Complete setup:** `docs/GOOGLE_PLAY_SETUP.md`
- **Build instructions:** `docs/ANDROID_BUILD_SETUP.md`
- **Privacy policy template:** `docs/PRIVACY_POLICY.md`




