# Quick Start: Development Environment

## 🚀 Easiest Option: Web Development

```bash
npm run dev
```

Then open: **http://localhost:3000**

This is the fastest way to develop and test your app!

## 📱 For Mobile App Testing

### Option A: iOS Simulator

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Edit `capacitor.config.ts` - change line 14 to:
   ```typescript
   url: 'http://localhost:3000',
   ```
   And uncomment lines 10-11:
   ```typescript
   cleartext: true,
   ```

3. Open in Xcode:
   ```bash
   npm run cap:sync
   npm run cap:ios
   ```

4. In Xcode: Select simulator → Click Run (⌘R)

### Option B: Android Emulator

1. Start dev server (same as iOS)

2. Edit `capacitor.config.ts` (same as iOS)

3. Open in Android Studio:
   ```bash
   npm run cap:sync
   npm run cap:android
   ```

4. In Android Studio: Select emulator → Click Run

## ⚡ Quick Tips

- **For most development**: Just use `npm run dev` and open in browser
- **For mobile testing**: Use simulator/emulator when needed
- **For production testing**: Keep capacitor.config.ts pointing to https://www.brickcheck.app
