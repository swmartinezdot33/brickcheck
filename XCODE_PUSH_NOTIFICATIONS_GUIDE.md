# Enable Push Notifications in Xcode - Visual Guide

## Step 1: Open the Project

I've opened Xcode for you. Here's what you should see:

## Step 2: Enable Push Notifications Capability

1. **In Xcode's left sidebar:**
   - You should see "App" with a blue icon at the top (this is the project/target)
   - Click on "App" (the blue icon, not any folders below it)

2. **In the main area:**
   - You should see tabs at the top: "General", "Signing & Capabilities", "Info", etc.
   - Click on the **"Signing & Capabilities"** tab

3. **Add the Capability:**
   - Look for a button that says **"+ Capability"** (usually near the top, next to "Signing & Capabilities")
   - Click it
   - A dialog/popup will appear with a search box
   - Type: **"Push Notifications"**
   - You should see "Push Notifications" in the results
   - Click on it to add it

4. **Verify:**
   - After clicking, "Push Notifications" should appear in the capabilities list below
   - You might see it listed under "Signing & Capabilities"

## Troubleshooting

**Can't find "+ Capability" button?**
- Make sure you clicked on "App" (the blue icon/target), not a folder
- Make sure you're on the "Signing & Capabilities" tab

**Xcode didn't open?**
- Try running: `open ios/App/App.xcworkspace` in terminal
- Or manually: Finder → Navigate to `ios/App/` → Double-click `App.xcworkspace`

**See any errors?**
- If you see red errors about signing, we'll need to configure your Apple Developer account
- But first, let's just add the capability

Once you've added "Push Notifications" to the capabilities list, let me know!

