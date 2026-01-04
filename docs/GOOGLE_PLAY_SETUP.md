# Google Play Store Publishing Setup

Complete guide to set up your Google Play Developer account and prepare your app for publishing.

## Step 1: Create Google Play Developer Account

### Prerequisites
- Google account (personal or organization)
- One-time registration fee: **$25 USD** (one-time, lifetime)
- Valid payment method (credit card)

### Registration Process

1. **Go to Google Play Console:**
   - Visit: https://play.google.com/console/signup
   - Sign in with your Google account

2. **Accept Developer Agreement:**
   - Read and accept the Google Play Developer Distribution Agreement
   - Review policies and terms

3. **Complete Account Details:**
   - **Account type:** Choose Individual or Organization
     - **Individual:** For personal apps
     - **Organization:** For business/company apps (recommended if you have one)
   - **Developer name:** This will be displayed on the Play Store
   - **Email address:** Use an email you check regularly
   - **Phone number:** For account verification

4. **Pay Registration Fee:**
   - One-time payment of $25 USD
   - Payment is processed immediately
   - Account is activated right away

5. **Complete Account Verification:**
   - Verify your email address
   - Verify your phone number
   - Complete identity verification if required

## Step 2: Complete Your Developer Profile

1. **Account Settings:**
   - Go to: Settings → Account details
   - Complete all required information:
     - Developer name (appears on Play Store)
     - Email address
     - Website (optional)
     - Phone number

2. **App Access:**
   - Go to: Settings → App access
   - Choose who can access your app:
     - Everyone (public)
     - Restricted (testing/internal)

## Step 3: Prepare Your App for Publishing

### Android App Requirements

1. **App Bundle (AAB) Format:**
   - Google Play requires Android App Bundle (.aab) format
   - Not APK files (APK is only for testing)

2. **App Signing:**
   - You'll need to create a signing key
   - Google Play can manage your app signing key for you (recommended)

3. **Target SDK Version:**
   - Must target recent Android SDK (currently Android 14 / API 34 or higher)

### Steps to Build Your App Bundle

1. **Generate a Keystore (if you don't have one):**
   ```bash
   # Create a keystore file
   keytool -genkey -v -keystore brickcheck-release.keystore \
     -alias brickcheck -keyalg RSA -keysize 2048 -validity 10000
   ```
   
   You'll be prompted for:
   - Keystore password (remember this!)
   - Key password (can be same as keystore password)
   - Your name/organization details
   - Certificate validity (10000 days = ~27 years)

2. **Configure Gradle for Signing:**
   - Create `android/key.properties` (add to .gitignore!):
   ```properties
   storePassword=YOUR_KEYSTORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=brickcheck
   storeFile=../brickcheck-release.keystore
   ```

3. **Update `android/app/build.gradle`:**
   ```gradle
   // At the top
   def keystorePropertiesFile = rootProject.file("key.properties")
   def keystoreProperties = new Properties()
   if (keystorePropertiesFile.exists()) {
       keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
   }

   android {
       // ... existing config ...
       
       signingConfigs {
           release {
               if (keystorePropertiesFile.exists()) {
                   keyAlias keystoreProperties['keyAlias']
                   keyPassword keystoreProperties['keyPassword']
                   storeFile file(keystoreProperties['storeFile'])
                   storePassword keystoreProperties['storePassword']
               }
           }
       }
       
       buildTypes {
           release {
               signingConfig signingConfigs.release
               // ... other release config ...
           }
       }
   }
   ```

4. **Build the App Bundle:**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   
   The AAB file will be at:
   `android/app/build/outputs/bundle/release/app-release.aab`

## Step 4: Create Your App Listing in Play Console

1. **Create New App:**
   - Go to: Play Console → All apps → Create app
   - Fill in:
     - **App name:** BrickCheck
     - **Default language:** English (United States)
     - **App or game:** App
     - **Free or paid:** Free (or Paid if you want to charge)
     - **Declarations:** Check all that apply

2. **Complete App Information:**
   - **App name:** BrickCheck
   - **Short description:** (80 characters max)
     - Example: "Track your LEGO collection, monitor prices, and get alerts when sets go on sale."
   - **Full description:** (4000 characters max)
     - Detailed description of features, benefits, etc.
   - **App icon:** 512x512 PNG (high-res icon)
   - **Feature graphic:** 1024x500 PNG (banner image)
   - **Screenshots:** At least 2, up to 8
     - Required for phone (16:9 or 9:16)
     - Optional: Tablet, TV, Wear OS screenshots
   - **Category:** Lifestyle or Shopping
   - **Tags:** (up to 5 relevant keywords)
   - **Contact email:** Support email
   - **Website:** https://www.brickcheck.app
   - **Privacy policy URL:** Required! (see Privacy Policy section)

## Step 5: App Content Rating

1. **Content Rating:**
   - Go to: Store presence → Content rating
   - Complete questionnaire about your app content
   - Get rating from IARC (International Age Rating Coalition)
   - Rating will be based on app content

## Step 6: Privacy Policy

**REQUIRED:** You must provide a privacy policy URL.

1. **Create Privacy Policy:**
   - Must be publicly accessible URL
   - Should cover:
     - What data you collect
     - How you use the data
     - Third-party services (Supabase, Firebase, etc.)
     - User rights

2. **Host Privacy Policy:**
   - You can host it on your website: https://www.brickcheck.app/privacy
   - Or use a free hosting service
   - Make sure it's accessible without login

3. **Add Privacy Policy URL:**
   - Go to: Store presence → App content
   - Add your privacy policy URL

## Step 7: Set Up App Signing

1. **Upload Your First AAB:**
   - Go to: Release → Production → Create new release
   - Upload your `app-release.aab` file
   - Add release notes

2. **App Signing:**
   - Google Play will ask about app signing
   - **Recommended:** Let Google manage your app signing key
     - More secure
     - Easier key management
     - Better for key recovery
   - Or upload your own signing key

## Step 8: Complete Store Listing

1. **Graphics Assets:**
   - **App icon:** 512x512 PNG (no transparency)
   - **Feature graphic:** 1024x500 PNG
   - **Screenshots:** At least 2 phone screenshots
     - Minimum: 16:9 or 9:16 aspect ratio
     - Minimum: 320px short side
   - **Promo video (optional):** YouTube video URL

2. **Categorization:**
   - **Category:** Lifestyle or Shopping
   - **Tags:** LEGO, collection, tracking, price alerts, etc.

## Step 9: Pricing and Distribution

1. **Pricing:**
   - Set app as Free or Paid
   - If paid, set price per country

2. **Countries/Regions:**
   - Choose where to distribute your app
   - Can select all countries or specific ones

## Step 10: Content Rating and Target Audience

1. **Target Audience:**
   - Select age groups
   - Answer content rating questionnaire

2. **Data Safety:**
   - Declare what data you collect
   - How data is used
   - Data sharing practices
   - Security practices

## Step 11: Submit for Review

1. **Review Checklist:**
   - ✅ App bundle uploaded
   - ✅ Store listing complete
   - ✅ Privacy policy added
   - ✅ Content rating complete
   - ✅ Graphics uploaded
   - ✅ All required information filled

2. **Submit:**
   - Go to: Release → Production
   - Review all information
   - Click "Start rollout to Production"
   - Or create a testing track first (recommended)

## Step 12: Testing Before Production

**Recommended:** Test your app before production release

1. **Internal Testing:**
   - Create internal test track
   - Upload AAB
   - Share with testers (up to 100)

2. **Closed Testing:**
   - Create closed test track
   - Add testers via email or Google Groups
   - Test for a few days/weeks

3. **Open Testing:**
   - Public testing (optional)
   - Anyone can join and test

## Review Time

- **First app submission:** 1-7 days typically
- **Updates:** Usually faster (hours to days)
- **Review status:** Check in Play Console

## Common Requirements Checklist

Before submitting, make sure:

- [ ] App uses Android App Bundle (.aab) format
- [ ] App targets recent SDK version (API 34+)
- [ ] Privacy policy URL is provided and accessible
- [ ] App icon and graphics meet requirements
- [ ] App description is complete
- [ ] Content rating questionnaire completed
- [ ] Data safety section filled out
- [ ] App signing configured
- [ ] Store listing is complete
- [ ] App has been tested

## Important Notes

1. **One-time Fee:** $25 USD registration fee (lifetime)
2. **Review Process:** Can take up to 7 days for first submission
3. **Privacy Policy:** Must be publicly accessible
4. **App Bundle:** Only AAB format accepted (not APK)
5. **Target SDK:** Must meet current requirements
6. **Data Safety:** Must accurately declare data practices

## Next Steps After Account Setup

1. ✅ Complete Google Play Developer account registration
2. ⏳ Generate signing key and configure Gradle
3. ⏳ Build Android App Bundle
4. ⏳ Create app listing in Play Console
5. ⏳ Upload app bundle
6. ⏳ Complete all required sections
7. ⏳ Submit for review

## Resources

- **Play Console:** https://play.google.com/console
- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **App Signing:** https://support.google.com/googleplay/android-developer/answer/7384423
- **Content Rating:** https://support.google.com/googleplay/android-developer/answer/188189
- **Privacy Policy Requirements:** https://support.google.com/googleplay/android-developer/answer/10787469

