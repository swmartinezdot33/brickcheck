# Quick Admin Fix

As the workspace admin, here's the fastest way to fix this:

## Direct Link to Policy

👉 **https://console.cloud.google.com/iam-admin/orgpolicies/iam.disableServiceAccountKeyCreation?project=brickcheck-86fcb**

## Quick Steps:

1. **Click the link above** (or navigate: IAM & Admin → Organization Policies → Search "disableServiceAccountKeyCreation")

2. **Click "Manage policy"** button

3. **Set to "Not enforced"** (or "Custom" → "Allow")

4. **Save** the changes

5. **Wait 2-3 minutes** for the policy to propagate

6. **Try creating the service account key again:**
   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=brickcheck-86fcb
   - Click on `firebase-adminsdk-fbsvc@brickcheck-86fcb.iam.gserviceaccount.com`
   - Keys tab → Add Key → Create new key → JSON

## Alternative: Project-Level Override

If you want to keep the org policy but allow it for this project:

1. On the policy page, look for "Policy source: Inherit parent's policy"
2. Click "Manage policy"
3. Choose to override at project level
4. Set to "Not enforced"
5. Save

This keeps the restriction for other projects but allows this one.

Try it and let me know if it works!

