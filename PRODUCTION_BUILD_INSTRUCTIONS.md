# Production Build Instructions

## The Problem
When using `server.url` in Capacitor config, the app loads from a remote URL, making it hard to detect if it's the native app vs web browser.

## The Solution
For **production builds**, bundle the web assets directly into the app (remove `server.url`).

## How to Build for Production

### 1. Build the Next.js App
```bash
npm run build
```

### 2. Sync Capacitor (bundles assets)
```bash
npx cap sync android
# or
npx cap sync ios
```

### 3. Build the Native App
```bash
cd android
./gradlew bundleRelease  # For Android
```

The app will now load from bundled assets, and detection will work reliably.

## Development vs Production

### Development (with live reload)
If you want to use the dev server for live reload:
```bash
CAPACITOR_DEV=true npx cap sync android
```

This sets `server.url` to your dev server.

### Production (bundled assets)
Just run:
```bash
npm run build
npx cap sync android
```

This bundles assets directly (no `server.url`).

## Testing Production Build Locally

1. Build and sync:
   ```bash
   npm run build
   npx cap sync android
   ```

2. Open in Android Studio:
   ```bash
   npx cap open android
   ```

3. Run the app - it should:
   - Load from bundled assets (no network needed)
   - Detect as native app correctly
   - Redirect to `/login` immediately

## Key Points

- **Production**: Always bundle assets (no `server.url`)
- **Development**: Can use `server.url` for live reload, but detection is tricky
- **Detection works reliably** when assets are bundled because the app is truly native



