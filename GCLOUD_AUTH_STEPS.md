# gcloud Authentication Steps

We need to authenticate gcloud CLI. Here's what we'll do:

## Step 1: Authenticate

Run this command - it will give you a URL to visit and a code to enter:

```bash
export PATH=/opt/homebrew/share/google-cloud-sdk/bin:$PATH
gcloud auth login
```

This will:
1. Open your browser (or give you a URL)
2. Ask you to sign in with your Google account
3. Grant permissions to gcloud CLI

## Step 2: Set the Project

After authentication:

```bash
gcloud config set project brickcheck-86fcb
```

## Step 3: Find Organization ID

We'll need your organization ID to modify the policy:

```bash
gcloud organizations list
```

Or we can get it from the project:

```bash
gcloud projects describe brickcheck-86fcb --format="value(parent.id)"
```

## Step 4: Modify the Organization Policy

Once we have the org ID, we can modify the policy using gcloud commands.

Let me help you authenticate first!

