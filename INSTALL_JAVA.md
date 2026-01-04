# Install Java for Android Key Generation

You need Java to run the `keytool` command. Here are the easiest ways to install it on macOS:

## Option 1: Install Java via Homebrew (Recommended)

If you have Homebrew installed:

```bash
# Install OpenJDK (Java 17 or newer)
brew install openjdk@17

# Link it so it's available system-wide
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk

# Add to your PATH (add this to ~/.zshrc for permanent)
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

# Verify installation
java -version
keytool -version
```

**Note:** If you're on an Intel Mac, use `/usr/local` instead of `/opt/homebrew`:
```bash
sudo ln -sfn /usr/local/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
export PATH="/usr/local/opt/openjdk@17/bin:$PATH"
```

## Option 2: Install Homebrew + Java

If you don't have Homebrew:

1. **Install Homebrew:**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Then follow Option 1 above**

## Option 3: Download from Oracle/OpenJDK Directly

1. **Download OpenJDK:**
   - Visit: https://adoptium.net/
   - Download macOS .pkg installer (LTS version - Java 17 or 21)
   - Install the package

2. **Verify:**
   ```bash
   java -version
   ```

## Option 4: Use Android Studio's Java (If Installed)

If you have Android Studio installed, it comes with Java:

```bash
# Find Android Studio's Java
ls -la "/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin/"

# Add to PATH temporarily
export PATH="/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin:$PATH"

# Or create a symlink
sudo ln -sfn "/Applications/Android Studio.app/Contents/jbr" /Library/Java/JavaVirtualMachines/android-studio-jdk.jdk
```

## Quick Test After Installation

Once Java is installed, test `keytool`:

```bash
keytool -version
```

You should see something like:
```
keytool version "17.0.x"
```

## After Installing Java

Once Java is installed, you can generate your signing key:

```bash
keytool -genkey -v -keystore android/brickcheck-release.keystore \
  -alias brickcheck -keyalg RSA -keysize 2048 -validity 10000
```

## Troubleshooting

### "Command not found" after installation

Make sure Java is in your PATH. Add to `~/.zshrc`:

```bash
# For Homebrew OpenJDK
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
```

Then reload:
```bash
source ~/.zshrc
```

### Check which Java is being used

```bash
which java
java -version
```

### Multiple Java versions

If you have multiple Java versions:
```bash
/usr/libexec/java_home -V  # List all versions
export JAVA_HOME=$(/usr/libexec/java_home -v 17)  # Use Java 17
```


