# Next Steps in Android Studio

## Current Status
✅ Android Studio is open
⏳ Gradle is importing (wait for this to finish - you'll see it in the bottom status bar)

## Once Gradle Import Completes:

### Step 1: Start an Android Emulator (or connect a device)

**Option A: Create/Start an Emulator**
1. Click **Tools → Device Manager** (or the device icon in the toolbar)
2. If you don't have an emulator:
   - Click **"Create device"**
   - Choose a device (e.g., **Pixel 7** or **Pixel 8**)
   - Click **Next**
   - Select a system image (recommend **API 34** or **API 33** - download if needed)
   - Click **Next** → **Finish**
3. Click the ▶️ **Play button** next to your emulator to start it

**Option B: Connect a Physical Device**
1. Enable Developer Mode on your Android phone:
   - Settings → About phone → Tap "Build number" 7 times
   - Settings → Developer options → Enable "USB debugging"
2. Connect your phone via USB
3. Accept the USB debugging prompt on your phone
4. Your device will appear in the device list when you try to run

### Step 2: Start Your Next.js Dev Server

**IMPORTANT:** Before running the app, start your Next.js dev server in a terminal:

```bash
npm run dev
```

Keep this running! The Android app loads from `http://localhost:3000`

### Step 3: Run the App

Once Gradle sync completes and you have a device/emulator:

1. **Click the green "Run" button** (▶️) in the toolbar
   - Or press `Shift+F10` (Mac) / `Shift+F10` (Windows/Linux)
   
2. **Select your device/emulator** from the dropdown that appears

3. **Click "OK"** - Android Studio will:
   - Build the app
   - Install it on your device/emulator
   - Launch it automatically

4. **The app will open** and load from your local dev server!

## Quick Troubleshooting

### Gradle sync fails?
- Check the "Build" tool window at the bottom for error messages
- Try: **File → Sync Project with Gradle Files**

### No devices found?
- Make sure emulator is running (check Device Manager)
- Or connect a physical device with USB debugging enabled
- Check: **Run → Select Device** to see available devices

### App won't connect to localhost?
- Make sure `npm run dev` is running
- For emulator: Uses `localhost:3000` automatically ✅
- For physical device: Must be on same WiFi (see TEST_ANDROID_LOCALLY.md for details)

### App crashes or has errors?
- Check the **Logcat** tab at the bottom for error messages
- Make sure all dependencies are installed: `npm install`

## Development Workflow

For ongoing development:

1. Keep `npm run dev` running in a terminal
2. Make code changes in your editor
3. In Android Studio, click **Run** (▶️) again to see changes
4. The app will reload automatically from your dev server

Happy testing! 🚀

