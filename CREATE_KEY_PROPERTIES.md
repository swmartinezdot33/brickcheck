# Create key.properties File

Now that you've generated your keystore, you need to create the `key.properties` file.

## Step 1: Create the File

Create a new file at: `android/key.properties`

## Step 2: Add Your Configuration

Add this content to the file (replace the passwords with your actual passwords):

```properties
storePassword=YOUR_KEYSTORE_PASSWORD_HERE
keyPassword=YOUR_KEY_PASSWORD_HERE
keyAlias=brickcheck
storeFile=../brickcheck-release.keystore
```

**Replace:**
- `YOUR_KEYSTORE_PASSWORD_HERE` with the password you used when creating the keystore
- `YOUR_KEY_PASSWORD_HERE` with your key password (same as keystore password if you pressed Enter)

## Example

If your keystore password is `MySecurePassword123!`, your file would look like:

```properties
storePassword=MySecurePassword123!
keyPassword=MySecurePassword123!
keyAlias=brickcheck
storeFile=../brickcheck-release.keystore
```

## Important Notes

- ✅ The file is already in `.gitignore`, so it won't be committed to git
- ✅ Keep your passwords secure - never share them or commit them
- ✅ The `storeFile` path is relative to the `android/` directory
- ✅ The `keyAlias` must match what you used in the keytool command (`brickcheck`)

## After Creating key.properties

Once you've created the file, we can build your app bundle!

```bash
cd android
./gradlew bundleRelease
```

