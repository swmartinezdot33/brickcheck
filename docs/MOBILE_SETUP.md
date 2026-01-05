# Mobile App Setup Guide

This guide explains how to set up and build the BrickCheck mobile apps for iOS and Android using Capacitor.

## Architecture

BrickCheck uses a hybrid approach:
- **Web App**: Continues to run on Vercel (https://www.brickcheck.app)
- **Mobile Apps**: Use Capacitor to wrap the web app with native capabilities
- **API Routes**: Continue to work via the Vercel deployment
- **Native Features**: Camera, push notifications, etc. via Capacitor plugins

## Prerequisites

### For iOS Development
- Mac computer
- Xcode (latest version)
- Apple Developer Account ($99/year)
- iOS device for testing (recommended)

### For Android Development
- Android Studio (optional, can use command line)
- Java Development Kit (JDK)
- Android device for testing (recommended)

## Development Setup

### 1. Install Dependencies

All Capacitor dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Configure Capacitor

The `capacitor.config.ts` file is already configured. For local development, you can modify it to point to your local server:

```typescript
server: {
  url: 'http://localhost:3000',
  cleartext: true,
}
```

For production builds, it points to the Vercel URL.

### 3. Build Scripts

We've added convenient npm scripts:

```bash
# Sync Capacitor with web assets
npm run cap:sync

# Open iOS project in Xcode
npm run cap:ios

# Open Android project in Android Studio
npm run cap:android

# Build and open iOS
npm run ios

# Build and open Android
npm run android
```

## iOS Development

### 1. Open iOS Project

```bash
npm run cap:ios
```

Or manually:
```bash
open ios/App/App.xcworkspace
```

### 2. Configure Signing

1. In Xcode, select the "App" target
2. Go to "Signing & Capabilities"
3. Select your Team (requires Apple Developer account)
4. Xcode will automatically manage certificates and provisioning profiles

### 3. Run on Simulator or Device

1. Select a simulator or connected device
2. Click Run (⌘R) or press the Play button
3. The app will build and launch

### 4. Permissions

Camera permissions are already configured in `ios/App/App/Info.plist`:
- `NSCameraUsageDescription`: Required for barcode scanning
- `NSPhotoLibraryUsageDescription`: Optional, for saving images

## Android Development

### 1. Open Android Project

```bash
npm run cap:android
```

Or manually open `android/` in Android Studio.

### 2. Configure Signing (for Release Builds)

Create a keystore for release builds:

```bash
keytool -genkey -v -keystore brickcheck-release.keystore \
  -alias brickcheck -keyalg RSA -keysize 2048 -validity 10000
```

**Important**: Store the keystore file securely and never commit it to git.

Configure signing in `android/app/build.gradle`:

```gradle
android {
  signingConfigs {
    release {
      storeFile file('brickcheck-release.keystore')
      storePassword 'YOUR_STORE_PASSWORD'
      keyAlias 'brickcheck'
      keyPassword 'YOUR_KEY_PASSWORD'
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
    }
  }
}
```

### 3. Run on Emulator or Device

Using Android Studio:
1. Open the project
2. Click Run or press Shift+F10
3. Select an emulator or connected device

Using command line:
```bash
cd android
./gradlew installDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

### 4. Permissions

Camera permissions are already configured in `android/app/src/main/AndroidManifest.xml`.

## Native Features

### Camera

The barcode scanner uses the web camera API, which works in Capacitor's WebView. Camera permissions are configured for both iOS and Android.

### Push Notifications

Push notifications are set up but require additional configuration:

#### iOS (APNs)
1. Enable Push Notifications capability in Xcode
2. Generate APNs key in Apple Developer account
3. Configure in your backend/push notification service

#### Android (FCM)
1. Create a Firebase project
2. Download `google-services.json`
3. Place it in `android/app/`
4. Configure in your backend/push notification service

The push notification infrastructure is in place:
- `lib/services/push-notifications.ts`: Registration and management
- `app/api/push/register/route.ts`: API endpoint for token registration
- `supabase/migrations/006_push_tokens.sql`: Database table for tokens

## Building for Release

### iOS

1. In Xcode, select "Any iOS Device" as target
2. Product → Archive
3. Distribute App → App Store Connect
4. Follow the wizard

See `docs/APP_STORE_SUBMISSION.md` for detailed instructions.

### Android

```bash
cd android
./gradlew bundleRelease  # For AAB (recommended for Play Store)
# OR
./gradlew assembleRelease  # For APK
```

Output:
- AAB: `app/build/outputs/bundle/release/app-release.aab`
- APK: `app/build/outputs/apk/release/app-release.apk`

See `docs/APP_STORE_SUBMISSION.md` for detailed instructions.

## Troubleshooting

### iOS Issues

**"Missing out directory" warning**
- This is normal when using `server.url` configuration
- The app loads from the configured URL, not from bundled files

**Signing errors**
- Ensure you have an Apple Developer account
- Select your Team in Xcode Signing & Capabilities
- Check that certificates are valid

**Camera not working**
- Check that permissions are granted in device Settings
- Verify `Info.plist` has camera usage description

### Android Issues

**Build fails**
```bash
cd android
./gradlew clean
./gradlew build
```

**Signing errors**
- Ensure keystore file exists and path is correct
- Check passwords in `build.gradle`

**Camera not working**
- Check that permissions are granted
- Verify `AndroidManifest.xml` has camera permission

### General Issues

**Plugins not working**
- Run `npm run cap:sync` after installing new plugins
- Ensure plugins are installed: `npm install @capacitor/plugin-name`

**API calls failing**
- Check that `capacitor.config.ts` has correct `server.url`
- Verify the web app is accessible at that URL
- Check network permissions in AndroidManifest.xml

## Next Steps

1. Test on physical devices
2. Configure push notifications (FCM/APNs)
3. Create app icons and splash screens
4. Prepare screenshots for app stores
5. Submit to App Store and Play Store

See `docs/APP_STORE_SUBMISSION.md` for submission guidelines.




