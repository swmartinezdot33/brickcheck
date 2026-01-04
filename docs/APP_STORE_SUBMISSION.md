# App Store Submission Guide

This guide covers the steps needed to submit BrickCheck to the Apple App Store and Google Play Store.

## Prerequisites

### iOS (App Store)
- Apple Developer Account ($99/year)
- Xcode installed (Mac required)
- iOS device for testing
- App Store Connect access

### Android (Play Store)
- Google Play Developer Account ($25 one-time)
- Android Studio installed (optional, can use command line)
- Android device for testing
- Google Play Console access

## iOS App Store Submission

### 1. Configure Xcode Project

1. Open the iOS project:
   ```bash
   npm run cap:ios
   ```
   Or manually:
   ```bash
   open ios/App/App.xcworkspace
   ```

2. In Xcode:
   - Select the "App" target
   - Go to "Signing & Capabilities"
   - Select your Team (requires Apple Developer account)
   - Ensure Bundle Identifier matches: `com.brickcheck.app`
   - Xcode will automatically manage provisioning profiles

3. Configure App Icons:
   - Replace icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
   - Required sizes: See [Apple's icon requirements](https://developer.apple.com/design/human-interface-guidelines/app-icons)

4. Configure Version and Build:
   - Version: e.g., "1.0.0"
   - Build: e.g., "1"

### 2. Test on Device

1. Connect an iOS device via USB
2. Select the device in Xcode
3. Click Run (or press Cmd+R)
4. Test all features, especially:
   - Camera/barcode scanning
   - Authentication
   - Collection management
   - Push notifications (if configured)

### 3. Create Archive

1. In Xcode, select "Any iOS Device" as the target
2. Product → Archive
3. Wait for the archive to build
4. Organizer window will open

### 4. Upload to App Store Connect

1. In Xcode Organizer:
   - Select your archive
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Follow the wizard to upload

2. Alternatively, use command line:
   ```bash
   xcodebuild -workspace ios/App/App.xcworkspace \
     -scheme App \
     -configuration Release \
     -archivePath build/App.xcarchive \
     archive
   
   xcodebuild -exportArchive \
     -archivePath build/App.xcarchive \
     -exportOptionsPlist ExportOptions.plist \
     -exportPath build/
   ```

### 5. Configure App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app (if not already created):
   - Name: BrickCheck
   - Primary Language: English
   - Bundle ID: com.brickcheck.app
   - SKU: brickcheck-app

3. Fill out app information:
   - Description
   - Keywords
   - Support URL
   - Privacy Policy URL (required)

4. Upload screenshots:
   - iPhone 6.7" (iPhone 14 Pro Max)
   - iPhone 6.5" (iPhone 11 Pro Max)
   - iPhone 5.5" (iPhone 8 Plus)
   - iPad Pro 12.9" (if supporting iPad)

5. Set up app preview videos (optional but recommended)

6. Configure App Privacy:
   - Camera usage: Required (for barcode scanning)
   - Photos usage: Optional (for saving scanned images)
   - User data collection: See Privacy Policy

### 6. Submit for Review

1. In App Store Connect, go to your app version
2. Select "Submit for Review"
3. Answer the export compliance questions
4. Submit

### 7. Wait for Review

- Typical review time: 1-3 days
- You'll receive email notifications about status
- If rejected, address issues and resubmit

## Android Play Store Submission

### 1. Configure Android Project

1. Open the Android project:
   ```bash
   npm run cap:android
   ```
   Or manually open `android/` in Android Studio

2. Configure signing:
   - Create a keystore file (if not already created):
     ```bash
     keytool -genkey -v -keystore brickcheck-release.keystore \
       -alias brickcheck -keyalg RSA -keysize 2048 -validity 10000
     ```
   - Store keystore securely (do NOT commit to git)
   - Configure `android/app/build.gradle` with signing config

3. Configure version:
   - Update `versionCode` and `versionName` in `android/app/build.gradle`

### 2. Build Release APK/AAB

1. Generate a release build:
   ```bash
   cd android
   ./gradlew bundleRelease  # For AAB (recommended)
   # OR
   ./gradlew assembleRelease  # For APK
   ```

2. Output location:
   - AAB: `android/app/build/outputs/bundle/release/app-release.aab`
   - APK: `android/app/build/outputs/apk/release/app-release.apk`

### 3. Test Release Build

1. Install on device:
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

2. Test all features

### 4. Create Google Play Console Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app:
   - App name: BrickCheck
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free

3. Fill out store listing:
   - Short description (80 characters)
   - Full description (4000 characters)
   - Screenshots (required):
     - Phone: At least 2, up to 8
     - Tablet: At least 2 (if supporting tablets)
   - Feature graphic (1024x500)
   - App icon (512x512)

4. Complete content rating questionnaire

5. Set up Data safety:
   - Declare data collection and usage
   - Camera: Required (for barcode scanning)
   - Photos: Optional

### 5. Upload APK/AAB

1. Go to Production (or Internal Testing/Closed Testing)
2. Create a new release
3. Upload the AAB file (recommended) or APK
4. Add release notes
5. Review and publish

### 6. Complete Store Listing

1. Ensure all required sections are completed:
   - Store listing
   - Content rating
   - Privacy policy
   - Data safety
   - App access (if applicable)

2. Submit for review

### 7. Wait for Review

- Typical review time: 1-7 days
- You'll receive email notifications
- If rejected, address issues and resubmit

## Post-Submission

### Monitoring

- Monitor App Store Connect / Play Console for updates
- Respond to user reviews
- Monitor crash reports (consider integrating Crashlytics/Sentry)

### Updates

1. Update version number
2. Build new release
3. Upload to stores
4. Submit for review

## Troubleshooting

### iOS Common Issues

- **Signing errors**: Ensure Team is selected and certificates are valid
- **Missing permissions**: Check Info.plist for required usage descriptions
- **Archive fails**: Clean build folder (Product → Clean Build Folder)

### Android Common Issues

- **Signing errors**: Ensure keystore file exists and is correctly configured
- **Build fails**: Run `./gradlew clean` and try again
- **Permission errors**: Check AndroidManifest.xml

## Resources

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
- [Capacitor iOS Guide](https://capacitorjs.com/docs/ios)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)


