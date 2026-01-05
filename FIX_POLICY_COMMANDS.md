# Commands to Fix Organization Policy

Once we have your organization ID, we'll use these commands to modify the policy.

## Step 1: Get Organization ID

We need to find your organization ID first.

## Step 2: List Current Policy

Check the current policy status:

```bash
gcloud resource-manager org-policies describe \
  iam.disableServiceAccountKeyCreation \
  --organization=YOUR_ORG_ID
```

## Step 3: Delete/Modify the Policy

We have a few options:

### Option A: Delete the Policy (Allows key creation)

```bash
gcloud resource-manager org-policies delete \
  iam.disableServiceAccountKeyCreation \
  --organization=YOUR_ORG_ID
```

### Option B: Set Policy to Allow (More controlled)

Create a policy file that allows key creation, then set it.

Let me run the commands to get your org ID first!




