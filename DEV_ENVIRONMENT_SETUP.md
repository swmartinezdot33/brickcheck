# Development Environment Setup

Here are the ways you can run and test the app in development:

## Option 1: Web Development (Easiest - Recommended for Development)

This is the fastest way to develop and test:

```bash
# Start the Next.js dev server
npm run dev
```

Then open: http://localhost:3000

This runs the web version which works great for most development. The mobile apps will load from this URL when configured.

## Option 2: Mobile App Development (iOS/Android)

For testing the mobile app experience:

### iOS Simulator

1. **Start the Next.js dev server:**
   ```bash
   npm run dev
   ```

2. **Configure Capacitor to use local server:**
   - Edit `capacitor.config.ts`
   - Uncomment the local server URL:
   ```typescript
   server: {
     url: 'http://localhost:3000',
     cleartext: true,
   },
   ```

3. **Sync and open iOS:**
   ```bash
   npm run cap:sync
   npm run cap:ios
   ```

4. **In Xcode:**
   - Select a simulator (iPhone 15, etc.)
   - Click Run (⌘R)

### Android Emulator

1. **Start the Next.js dev server:**
   ```bash
   npm run dev
   ```

2. **Configure Capacitor for local server** (same as iOS)

3. **Sync and open Android:**
   ```bash
   npm run cap:sync
   npm run cap:android
   ```

4. **In Android Studio:**
   - Select an emulator
   - Click Run

## Option 3: Physical Device Testing

For testing on real devices:

### iOS Device

1. Connect iPhone/iPad via USB
2. Configure Capacitor for local server (see Option 2)
3. **Important:** Change URL to your computer's local IP:
   ```typescript
   server: {
     url: 'http://YOUR_LOCAL_IP:3000',
     cleartext: true,
   },
   ```
   Find your IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`

4. Run: `npm run cap:ios`
5. In Xcode, select your device and run

### Android Device

Same as iOS, but use Android Studio.

## Quick Development Workflow

For fastest development iteration:

1. **Run web version:**
   ```bash
   npm run dev
   ```
   Visit: http://localhost:3000

2. **For mobile testing:**
   - Use web version for most development
   - Test on mobile devices/simulators when needed
   - Use production URL for final testing

## Configuration Notes

The `capacitor.config.ts` currently points to production:
```typescript
server: {
  url: 'https://www.brickcheck.app',
}
```

For local development, you can:
- Use web version directly (easiest)
- Or change the URL to `http://localhost:3000` temporarily
- Or create separate configs for dev/prod

Would you like me to set up a development configuration?



