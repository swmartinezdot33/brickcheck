# Quick Checks for Greyed Out Policy

Since "Manage policy" is greyed out, try these:

## Check 1: Are you at Organization Level?

The policy is likely set at the **organization level**, not project level. You need to edit it there.

1. **Look at the top of the page** - what does it say?
   - Does it show "Project: BrickCheck" or "Organization: [Your Org Name]"?
   
2. **Click the project/organization dropdown** (top of page, next to "Google Cloud")
   - Select your **Organization** (not the project)
   - Then go to: IAM & Admin → Organization Policies
   - Search for: `disableServiceAccountKeyCreation`
   - Try "Manage policy" at the organization level

## Check 2: Do You Have the Right Role?

Even as admin, you might need the specific role:

1. Go to: IAM & Admin → IAM
2. At the top, switch to **Organization** level (not project)
3. Find your email
4. Check if you have:
   - `Organization Policy Administrator` (roles/orgpolicy.policyAdmin)
   - `Organization Administrator`
   - `Owner`

## Check 3: Legacy Constraint

There might be TWO policies blocking you:

1. Legacy: `iam.disableServiceAccountKeyCreation`
2. New: `iam.managed.disableServiceAccountKeyCreation`

Try editing the **legacy** one first (the one WITHOUT "managed" in the name).

## Quick Test:

1. **Go to organization level:**
   - Click dropdown → Select your organization
   - Go to: IAM & Admin → Organization Policies
   - Search: `iam.disableServiceAccountKeyCreation` (legacy, no "managed")
   
2. **Try to edit that one**

If that's also greyed out, you might need to grant yourself the Organization Policy Administrator role first (at the organization level, not project level).

What do you see when you check the organization-level policies?



