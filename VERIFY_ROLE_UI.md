# Verify Your Role in Google Cloud Console

Since the CLI shows permission errors, let's verify your role in the UI:

## Steps to Check/Add Organization Policy Administrator Role:

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/

2. **Switch to Organization Level:**
   - Click the project/organization dropdown at the top
   - Select your **Organization** (earnyour.com), NOT the project

3. **Go to IAM:**
   - Navigate to: **IAM & Admin** → **IAM**

4. **Find Your Account:**
   - Search for: `steven@earnyour.com`
   - Or scroll to find your account

5. **Check Your Roles:**
   - Look at the roles column for your account
   - You need: **Organization Policy Administrator** (`roles/orgpolicy.policyAdmin`)
   - OR: **Organization Administrator** (should also work)

6. **If You Don't Have It, Add It:**
   - Click the pencil/edit icon next to your account
   - Click "Add another role"
   - Search for: `Organization Policy Administrator`
   - Select: `Organization Policy Administrator` (roles/orgpolicy.policyAdmin)
   - Click "Save"

7. **Wait 5-10 Minutes:**
   - Permissions can take a few minutes to propagate
   - Sign out and sign back in
   - Try the policy modification again

## Important Note:

"Organization Admin" in Google Workspace is different from "Organization Administrator" in Google Cloud. You need the Google Cloud IAM role, not just the Workspace admin status.

Can you check your roles in the UI and let me know what you see?


