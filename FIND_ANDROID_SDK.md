# Find Your Android SDK Location

If Android Studio is installed but the SDK isn't at the default location, here's how to find it:

## Method 1: Check Android Studio Settings

1. **Open Android Studio**
2. **Go to:** Android Studio → Settings (or Preferences on Mac)
3. **Navigate to:** Appearance & Behavior → System Settings → Android SDK
4. **Look for "Android SDK Location"** at the top of the window
5. **Copy that path**

## Method 2: Check Common Locations

The SDK might be in one of these locations:

```bash
# Check these locations:
ls -la ~/Library/Android/sdk
ls -la ~/Android/Sdk
ls -la /Users/$USER/Android/Sdk
ls -la /Applications/Android\ Studio.app/Contents/jre/jdk/Contents/Home
```

## Method 3: Use Android Studio to Install SDK

If the SDK isn't installed yet:

1. **Open Android Studio**
2. **Open any project or click "More Actions" → "SDK Manager"**
3. **In the SDK Manager:**
   - Check "Android SDK Location" at the top
   - Make sure "Android SDK" is checked
   - Click "Apply" to install if needed
4. **Copy the SDK location path**

## After Finding the SDK Location

Once you have the SDK path, create the `local.properties` file:

```bash
# Replace /path/to/sdk with your actual SDK path
echo "sdk.dir=/path/to/sdk" > android/local.properties
```

For example, if your SDK is at `/Users/yourname/Android/Sdk`:
```bash
echo "sdk.dir=/Users/yourname/Android/Sdk" > android/local.properties
```

Or if it's at the default location after setup:
```bash
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
```

## Quick Command to Try Common Locations

Run this to check common locations:

```bash
for dir in "$HOME/Library/Android/sdk" "$HOME/Android/Sdk" "/Users/$USER/Android/Sdk"; do
  if [ -d "$dir" ]; then
    echo "✅ Found SDK at: $dir"
    echo "sdk.dir=$dir" > android/local.properties
    echo "✅ Created local.properties"
    break
  fi
done
```





