# Try Organization Level

The screenshot shows you're at the **PROJECT level**. Organization policies need to be managed at the **ORGANIZATION level**.

## Steps:

1. **Click the dropdown at the top** that says "BrickCheck"
2. **Select your Organization** (should be "earnyour.com" or similar)
3. **Then go to:** IAM & Admin → IAM
4. **Check your roles there** (at organization level)
5. **If you don't have Organization Policy Administrator, add it:**
   - Click edit (pencil icon) next to your account
   - Add role: `Organization Policy Administrator` (roles/orgpolicy.policyAdmin)
   - Save

But first, let me try creating the key directly - you have "Service Account Key Admin" role which might work!


