# APNs Setup - Step by Step

## Step 1: Enable Push Notifications in Xcode

I've opened Xcode for you. Now:

1. **In Xcode:**
   - Look at the left sidebar - you should see "App" (the project/target)
   - Click on "App" (the blue icon at the top, not the folder)
   - Click the "Signing & Capabilities" tab at the top
   - You should see "Signing" and capabilities listed
   - Click the "+ Capability" button (top left, next to "Signing & Capabilities" title)
   - In the search box, type: "Push Notifications"
   - Click "Push Notifications" to add it
   - It should appear in the capabilities list below

2. **Verify it's added:**
   - You should see "Push Notifications" in the capabilities list
   - If you see any errors (red), let me know

**Once you've added Push Notifications capability, let me know and we'll move to Step 2!**

## Step 2: Generate APNs Key (After Step 1 is done)

We'll need to:
1. Go to Apple Developer Portal
2. Create an APNs key
3. Download the .p8 file
4. Get Key ID and Team ID
5. Convert to base64
6. Add to Vercel

Let me know when Step 1 is complete!





