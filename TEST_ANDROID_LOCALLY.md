# Testing Android App Locally

There are several ways to test your Android app locally:

## Option 1: Run on Android Emulator (Recommended for Development)

### Step 1: Start Android Emulator

1. **Open Android Studio**
2. **Open AVD Manager:**
   - Click "More Actions" → "Virtual Device Manager"
   - Or Tools → Device Manager
3. **Create/Start an Emulator:**
   - If you don't have one, click "Create device"
   - Choose a device (e.g., Pixel 7)
   - Select a system image (recommend API 33 or 34)
   - Click "Finish" and then click the play button to start it

### Step 2: Build and Run from Android Studio

```bash
# First, build your Next.js app
npm run build

# Sync Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

Then in Android Studio:
- Click the green "Run" button (or press Shift+F10)
- Select your emulator from the device list
- The app will build and launch automatically

### Step 3: Run from Command Line (Alternative)

```bash
# Build debug APK
cd android
./gradlew installDebug

# Or run directly (requires emulator/device connected)
./gradlew installDebug && adb shell am start -n com.brickcheck.app/.MainActivity
```

## Option 2: Install on Physical Android Device

### Step 1: Enable Developer Options & USB Debugging

On your Android device:
1. Go to **Settings → About phone**
2. Tap **Build number** 7 times (you'll see "You are now a developer!")
3. Go back to **Settings → System → Developer options**
4. Enable **USB debugging**
5. Enable **Install via USB** (if available)

### Step 2: Connect Device

1. Connect your device via USB
2. On your device, when prompted, tap "Allow USB debugging" and check "Always allow from this computer"
3. Verify connection:
   ```bash
   adb devices
   ```
   You should see your device listed

### Step 3: Install and Run

```bash
# Build and install debug APK
cd android
./gradlew installDebug

# Launch the app
adb shell am start -n com.brickcheck.app/.MainActivity
```

Or use Android Studio (same as Option 1, Step 2) - your physical device will appear in the device list.

## Option 3: Build Debug APK and Install Manually

### Step 1: Build Debug APK

```bash
cd android
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 2: Install on Device

**Method A: Via ADB (USB connected)**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Method B: Manual Installation**
1. Transfer `app-debug.apk` to your Android device (email, cloud storage, etc.)
2. On your device, open the APK file
3. Allow installation from unknown sources if prompted
4. Install the app

## Option 4: Development Mode with Live Reload (Hot Reload)

For the best development experience with live reload:

### Step 1: Start Next.js Dev Server

```bash
npm run dev
```

### Step 2: Configure Capacitor for Development

Your `capacitor.config.ts` is already configured to use `http://localhost:3000` in development mode!

### Step 3: Run on Device/Emulator

```bash
# Sync (this detects development mode)
npx cap sync android

# Open in Android Studio and run
npx cap open android
```

The app will load from `http://localhost:3000` - you'll need to:
- **For Emulator**: Use `http://10.0.2.2:3000` (Android emulator's alias for localhost)
- **For Physical Device**: Make sure your device and computer are on the same WiFi network, then use your computer's local IP address

### Update Capacitor Config for Device IP

If testing on a physical device, you may need to update `capacitor.config.ts` temporarily:

```typescript
server: {
  url: 'http://YOUR_COMPUTER_IP:3000', // e.g., 'http://192.168.1.100:3000'
  cleartext: true,
}
```

Find your IP address:
```bash
# macOS
ipconfig getifaddr en0

# Or check network settings
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## Quick Testing Workflow

For quick iteration during development:

```bash
# Terminal 1: Run Next.js dev server
npm run dev

# Terminal 2: Sync and open (when you make changes)
npx cap sync android
npx cap open android

# Then click Run in Android Studio
```

## Troubleshooting

### "Device not found" or ADB issues
```bash
# Restart ADB server
adb kill-server
adb start-server
adb devices
```

### App won't connect to localhost
- **Emulator**: Use `http://10.0.2.2:3000` instead of `localhost:3000`
- **Physical Device**: Use your computer's local IP address, ensure same WiFi network
- Check that `cleartext` is enabled in `capacitor.config.ts` for HTTP

### Build errors
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
```

### App crashes on launch
- Check Android Studio's Logcat for error messages
- Ensure all permissions are granted (camera, etc.)
- Verify the build completed successfully

## Recommended Setup for Daily Development

1. **Keep Android Studio open** with the project
2. **Run `npm run dev`** in a terminal
3. **Keep an emulator running** or device connected
4. **After code changes:**
   - Make changes to your Next.js code
   - Run `npx cap sync android` (if you changed native code/config)
   - Click "Run" in Android Studio (or use Shift+F10)

This gives you the fastest iteration cycle!



