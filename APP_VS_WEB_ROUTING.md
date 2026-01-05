# App vs Web Routing Solution

## Current Issue
When using `server.url` in Capacitor config for development, the app loads from the dev server, and detection of the native platform isn't working reliably.

## Options

### Option 1: Separate Route/Subdomain (Recommended for Production)
Create a separate route or subdomain for the app:
- **Web**: `www.brickcheck.app` → Landing page
- **App**: `app.brickcheck.app` → Direct to login/dashboard

**Pros:**
- Clean separation
- Easy to implement different behavior
- Can use different domains for web vs app

**Cons:**
- Need to configure different URLs
- More complex deployment

### Option 2: Query Parameter
Use a query parameter to indicate app usage:
- **Web**: `www.brickcheck.app` → Landing page
- **App**: `www.brickcheck.app?app=true` → Redirect to login

**Pros:**
- Simple to implement
- Same domain

**Cons:**
- Query parameter visible to users
- Less clean

### Option 3: Improved Detection (Current Attempt)
Better detection logic using multiple methods:
- Check `Capacitor.getPlatform()`
- Check User-Agent
- Check for Capacitor global

**Pros:**
- Works automatically
- No configuration needed

**Cons:**
- May still have issues with `server.url` in development

### Option 4: Build Separate Bundles
Build the app without `server.url` for production (bundle the web assets):
- Development: Use `server.url` (but detection still needed)
- Production: Bundle assets, no `server.url`

**Pros:**
- True native app behavior
- No remote loading

**Cons:**
- Need to rebuild for every change
- Slower development cycle

## Recommendation

For **development**, use improved detection (Option 3).

For **production**, consider:
1. Bundle the web assets (remove `server.url` in production config)
2. Use improved detection as fallback
3. Or use a separate route/subdomain if you want different behavior

## Next Steps

1. Test the improved detection logic
2. If it works, we're good!
3. If not, we can:
   - Use a query parameter approach
   - Or configure production to bundle assets (no `server.url`)


