# ✅ Development Environment Setup Complete!

## 🌐 Web Development Server

The dev server is now running! Open in your browser:

**http://localhost:3000**

The server is running in the background. To stop it, use `Ctrl+C` or find the process.

## 📱 Mobile Development Configuration

I've updated `capacitor.config.ts` to automatically use:
- **Development mode**: `http://localhost:3000` (when NODE_ENV=development)
- **Production mode**: `https://www.brickcheck.app` (for builds)

### To Test on iOS Simulator:

1. **Make sure dev server is running** (it is!)
   ```bash
   # Check if running:
   curl http://localhost:3000
   ```

2. **Sync and open iOS:**
   ```bash
   npm run cap:sync
   npm run cap:ios
   ```

3. **In Xcode:**
   - Wait for project to load
   - Select a simulator (iPhone 15, etc.)
   - Click Run (⌘R) or press `Cmd+R`

### To Test on Android Emulator:

1. **Make sure dev server is running** (it is!)

2. **Sync and open Android:**
   ```bash
   npm run cap:sync
   npm run cap:android
   ```

3. **In Android Studio:**
   - Wait for project to load
   - Select an emulator (or create one)
   - Click Run

## 🔄 Switching Between Dev and Production

The config automatically detects the environment:
- When you run `npm run dev` → Uses `http://localhost:3000`
- When you build for production → Uses `https://www.brickcheck.app`

No manual changes needed!

## 📝 Notes

- The dev server runs on port 3000
- For mobile testing on real devices, you'll need to use your computer's IP address (10.0.0.17)
- To test production builds, just build the app normally - it will use the production URL

## 🛑 Stopping the Dev Server

To stop the background dev server:
```bash
# Find the process
lsof -ti:3000

# Kill it
kill $(lsof -ti:3000)
```

Or just look for the node process and kill it manually.


