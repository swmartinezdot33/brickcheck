# Enabling Service Account Key Creation

## Understanding What You're Seeing

You're looking at an organization policy page. The key information:
- **Status**: "Not enforced" (at the project level)
- **Policy source**: "Inherit parent's policy"

This means:
- Your project itself allows key creation
- BUT if your organization (parent) has it enforced, that takes precedence
- You likely don't have permission to change organization-level policies

## Solution: Try Creating Key in Service Accounts (Recommended First Step)

Even though the policy exists, try creating the key directly. Sometimes it works despite the policy:

1. **Go directly to Service Accounts:**
   - Click on "Service Accounts" in the left sidebar (under IAM & Admin)
   - Or go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=brickcheck-86fcb

2. **Find the Firebase service account:**
   - Look for: `firebase-adminsdk-fbsvc@brickcheck-86fcb.iam.gserviceaccount.com`
   - Click on it

3. **Try to create a key:**
   - Go to the "Keys" tab
   - Click "Add Key" → "Create new key"
   - Select "JSON"
   - Try to create it

**If this works**, you're done! Continue with the base64 encoding.

**If you get an error**, proceed to the options below.

## If Key Creation Still Fails: Your Options

### Option 1: Contact Your Organization Admin (If Using Workspace Account)

Since this is an organization policy, you need someone with organization admin permissions:

1. Contact your Google Workspace/Organization administrator
2. Ask them to either:
   - Allow service account key creation for your account
   - Or whitelist your Firebase project
   - Or grant you the "Organization Policy Administrator" role

### Option 2: Use a Personal Google Account (Easier for Personal Projects)

For personal projects, using a personal Gmail account is often easier:

1. **Sign out of your current Google account**
2. **Sign in with a personal Gmail account** (not a workspace account)
3. **Create a new Firebase project** with that personal account
4. **Add the Android app** again (package name: `com.brickcheck.app`)
5. **Generate the service account key** (should work without restrictions)

Then update your project to use the new Firebase project's credentials.

### Option 3: Use Application Default Credentials (Advanced)

This is more complex and requires setting up authentication differently. Not recommended unless you have specific requirements.

## Recommended Action Plan

**Step 1:** Try creating the key in Service Accounts directly (link above)
- If it works → Great! Continue with setup
- If it fails → Go to Step 2

**Step 2:** Decide:
- Personal/side project → Use Option 2 (personal Gmail account)
- Work/organization project → Use Option 1 (contact admin)

Let me know what happens when you try to create the key in Service Accounts!

