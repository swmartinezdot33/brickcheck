# Admin Guide: Enabling Service Account Key Creation

Since you're the workspace admin, you can change the organization policy. Here's how:

## Option 1: Add Exception for Your Project (Recommended)

This allows key creation for your specific project while keeping the policy active for others.

### Steps:

1. **Go to Organization Policies:**
   - Visit: https://console.cloud.google.com/iam-admin/orgpolicies?project=brickcheck-86fcb
   - Or navigate: IAM & Admin → Organization Policies

2. **Find the Policy:**
   - Search for: `disableServiceAccountKeyCreation`
   - Or look for: "Disable service account key creation"
   - Click on it

3. **Manage the Policy:**
   - Click the **"Manage policy"** button
   - You should see options to modify the policy

4. **Add Exception:**
   - Look for options to add exceptions or custom values
   - Add your project: `brickcheck-86fcb`
   - Or set the policy to "Not enforced" for this specific project
   - Save the changes

## Option 2: Disable the Policy Entirely (Less Secure)

If you want to allow service account key creation for ALL projects:

1. **Go to Organization Policies:**
   - https://console.cloud.google.com/iam-admin/orgpolicies

2. **Find the Policy:**
   - Search: `disableServiceAccountKeyCreation`
   - Click on it

3. **Edit Policy:**
   - Click "Manage policy"
   - Change enforcement to "Not enforced" or "Custom"
   - Save

**Note:** This removes the security restriction for all projects, which may not be ideal.

## Option 3: Use Project-Level Override

1. **Go to your project's Organization Policies:**
   - https://console.cloud.google.com/iam-admin/orgpolicies?project=brickcheck-86fcb

2. **Find the Policy:**
   - Search: `disableServiceAccountKeyCreation`
   - Click on it

3. **Override at Project Level:**
   - Click "Manage policy"
   - Set to "Not enforced" for this project only
   - This overrides the organization policy for just this project

## Recommended: Option 3 (Project-Level Override)

This is the safest approach - it allows key creation for your project while keeping the organization policy active for other projects.

### Quick Steps for Option 3:

1. Go to: https://console.cloud.google.com/iam-admin/orgpolicies/iam.disableServiceAccountKeyCreation?project=brickcheck-86fcb

2. Click "Manage policy"

3. Select "Not enforced" or "Custom" → "Allow"

4. Save

5. Wait a few minutes for the policy to propagate

6. Try creating the service account key again

Let me know which approach you want to take, or if you need help finding the right settings!


