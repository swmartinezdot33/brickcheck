# Enabling Service Account Key Creation in Your Workspace

## The Issue

Your Google Workspace organization has a policy (`iam.disableServiceAccountKeyCreation`) that blocks service account key creation for security reasons. This is common in enterprise/organization accounts.

## You Cannot Enable This Yourself

As a regular user, you **cannot** change organization policies. You need someone with:
- **Organization Policy Administrator** role (`roles/orgpolicy.policyAdmin`)
- Or **Organization Admin** permissions

## Option 1: Request Access from Your Admin (For Work Projects)

If this is a work/organization project:

1. **Contact your Google Workspace administrator**
   - This is usually your IT department or the person who manages your Google Workspace
   - If you're not sure who this is, ask your manager or HR

2. **Request they either:**
   - **Option A (Recommended):** Temporarily allow service account key creation for your specific project
     - They need to: Go to Organization Policies → `iam.disableServiceAccountKeyCreation` → Add exception for your project `brickcheck-86fcb`
   
   - **Option B:** Grant you the "Organization Policy Administrator" role (gives you more permissions than you might need)
   
   - **Option C:** Create the service account key for you and share it (they can create it, then give you the JSON file)

3. **What to tell them:**
   ```
   Hi [Admin Name],
   
   I'm working on a Firebase project (brickcheck-86fcb) and need to create a 
   service account key for push notifications. The organization policy 
   "iam.disableServiceAccountKeyCreation" is currently blocking this.
   
   Could you either:
   1. Add an exception for project "brickcheck-86fcb" to allow service account key creation, OR
   2. Create the service account key for me and share the JSON file?
   
   The service account is: firebase-adminsdk-fbsvc@brickcheck-86fcb.iam.gserviceaccount.com
   
   Thanks!
   ```

## Option 2: Use a Personal Google Account (Recommended for Personal Projects)

If this is a **personal/side project**, using a personal Gmail account is much easier:

### Steps to Switch to Personal Account:

1. **Sign out of your workspace account:**
   - In Firebase Console, click your profile icon (top right)
   - Click "Sign out"

2. **Sign in with a personal Gmail account:**
   - Use a personal Gmail account (not a workspace account)
   - If you don't have one, create one at https://accounts.google.com/signup

3. **Create a new Firebase project:**
   - Go to: https://console.firebase.google.com/
   - Click "Add project"
   - Name it: `BrickCheck` (or whatever you prefer)
   - Follow the setup wizard

4. **Add Android app again:**
   - Click "Add app" → Android
   - Package name: `com.brickcheck.app` (must match exactly)
   - Download the new `google-services.json`
   - Replace the old one in `android/app/google-services.json`

5. **Generate service account key:**
   - Project Settings → Service Accounts
   - Click "Generate new private key"
   - This should work without restrictions!

6. **Update your code if needed:**
   - You'll have new Firebase project credentials
   - The app code will work the same way

## Which Option Should You Choose?

**Use Option 1 (Request Admin)** if:
- This is a work/company project
- Your organization needs to manage it
- You have good access to your admin

**Use Option 2 (Personal Account)** if:
- This is a personal/side project
- You want to move quickly
- You don't want to wait for admin approval
- You want full control

## My Recommendation

For a personal project like BrickCheck, **Option 2 (Personal Account)** is usually the fastest and easiest path. You'll be up and running in minutes instead of waiting for admin approval.

Would you like to proceed with Option 2, or do you need to contact your admin for Option 1?

