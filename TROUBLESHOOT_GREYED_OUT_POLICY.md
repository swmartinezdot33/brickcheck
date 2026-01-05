# Troubleshooting: Greyed Out "Manage Policy" Button

If the "Manage policy" button is greyed out, here are the common causes and solutions:

## Issue: You Need Specific IAM Permissions

Even as an admin, you might need the specific role to edit organization policies.

### Check Your Permissions:

1. **Go to IAM & Admin → IAM:**
   - https://console.cloud.google.com/iam-admin/iam?project=brickcheck-86fcb

2. **Check if you have one of these roles:**
   - `Organization Policy Administrator` (`roles/orgpolicy.policyAdmin`)
   - `Organization Administrator` (full org admin)
   - `Owner` role on the organization

### Add the Role to Yourself:

If you don't have the role, add it to yourself:

1. In IAM page, find your account
2. Click the pencil/edit icon
3. Click "Add another role"
4. Add: **Organization Policy Administrator** (`roles/orgpolicy.policyAdmin`)
5. Save

**Note:** You might need another admin to do this, or you might need to do it at the organization level, not project level.

## Issue: Policy is Set at Organization Level (Not Project Level)

If you're viewing the policy at the project level but it's inherited from organization level, you need to edit it at the organization level.

### Steps:

1. **Go to Organization Policies at Organization Level:**
   - Click on the project dropdown (top of page) → Select your organization (not the project)
   - Or go to: https://console.cloud.google.com/iam-admin/orgpolicies (without project parameter)

2. **Find the policy:**
   - Search: `disableServiceAccountKeyCreation`
   - Look for BOTH:
     - `iam.disableServiceAccountKeyCreation` (legacy)
     - `iam.managed.disableServiceAccountKeyCreation` (new)

3. **Edit at organization level:**
   - Click on the policy
   - Click "Manage policy"
   - This should work if you have org-level permissions

## Issue: Legacy vs New Constraint

There are TWO constraints that might be blocking you:
- Legacy: `iam.disableServiceAccountKeyCreation`
- New: `iam.managed.disableServiceAccountKeyCreation`

You might need to modify BOTH, or the legacy one might be the one actually blocking.

### Check Both:

1. Go to Organization Policies
2. Search for: `disableServiceAccountKeyCreation`
3. Check BOTH the legacy and managed versions
4. Try to modify the legacy one first: `iam.disableServiceAccountKeyCreation`

## Issue: Policy is Managed by Another Admin/System

If the policy shows it's managed by a specific service account or another admin, you might need to:
- Contact that admin
- Or remove that management assignment first

## Quick Test: Check Your Roles

Run this in Cloud Shell or check your permissions:

```bash
# In Google Cloud Console, open Cloud Shell (top right icon)
# Then run:
gcloud projects get-iam-policy brickcheck-86fcb --flatten="bindings[].members" --filter="bindings.members:YOUR_EMAIL"
```

Replace `YOUR_EMAIL` with your Google account email.

## Alternative: Use Service Account Impersonation

If you can't modify the policy directly, you might be able to:
1. Create a service account with the right permissions
2. Impersonate it to create keys
3. But this is more complex and might not work if keys are blocked entirely

## Recommended Next Steps:

1. **Try organization-level policy edit:**
   - Go to org-level policies (not project-level)
   - Edit the constraint there

2. **Add the Organization Policy Administrator role:**
   - Add `roles/orgpolicy.policyAdmin` to your account
   - You might need to do this at the organization level

3. **Check if there's a legacy constraint:**
   - Look for `iam.disableServiceAccountKeyCreation` (without "managed")
   - Try editing that one

Let me know what you find when you check your IAM roles or try the organization-level edit!




