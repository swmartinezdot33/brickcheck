# Quick Guide: Test Android App Locally

## 🚀 Fastest Method: Android Studio

### Step 1: Start Next.js Dev Server
```bash
npm run dev
```
Keep this running in a terminal.

### Step 2: Open Android Studio
```bash
npx cap open android
```

### Step 3: Run the App
1. **Start an Emulator** (if you don't have one):
   - In Android Studio: Tools → Device Manager
   - Click "Create device" → Choose a device (e.g., Pixel 7)
   - Select system image (API 33 or 34 recommended)
   - Click "Finish" → Click the ▶️ play button to start it

2. **Run the App**:
   - Click the green "Run" button (▶️) in Android Studio
   - Or press `Shift+F10`
   - Select your emulator from the device list
   - The app will build and launch!

**Note:** The app loads from `http://localhost:3000` - your Next.js dev server must be running!

---

## 📱 Alternative: Physical Device

### Step 1: Enable Developer Mode on Your Phone
1. Go to **Settings → About phone**
2. Tap **Build number** 7 times
3. Go to **Settings → Developer options**
4. Enable **USB debugging**

### Step 2: Connect and Run
```bash
# Connect your phone via USB
# Then check connection:
$HOME/Library/Android/sdk/platform-tools/adb devices

# You should see your device listed
```

Then follow the Android Studio steps above - your phone will appear in the device list!

---

## 🔧 Build Debug APK (Manual Installation)

If you want to build and install manually:

```bash
# Build debug APK
cd android
./gradlew assembleDebug

# Install on connected device/emulator
$HOME/Library/Android/sdk/platform-tools/adb install app/build/outputs/apk/debug/app-debug.apk

# Launch the app
$HOME/Library/Android/sdk/platform-tools/adb shell am start -n com.brickcheck.app/.MainActivity
```

---

## 💡 Development Workflow

For daily development:

1. **Terminal 1**: Run `npm run dev` (keep it running)
2. **Terminal 2**: 
   ```bash
   # After making code changes:
   npx cap sync android  # Only needed if you changed native config
   npx cap open android  # Opens Android Studio
   ```
3. **Android Studio**: Click "Run" (or Shift+F10) to see changes

The app will reload from your local dev server automatically!

---

## 🐛 Troubleshooting

### "Device not found"
- Make sure emulator is running OR phone is connected via USB
- Check: `$HOME/Library/Android/sdk/platform-tools/adb devices`

### App won't connect to localhost
- **Emulator**: Uses `localhost:3000` automatically ✅
- **Physical Device**: Must be on same WiFi network and use your computer's IP
  - Find your IP: `ipconfig getifaddr en0` (macOS)
  - Update `capacitor.config.ts` temporarily: `url: 'http://YOUR_IP:3000'`

### Build errors
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

See `TEST_ANDROID_LOCALLY.md` for detailed troubleshooting!

