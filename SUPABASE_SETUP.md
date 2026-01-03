# Supabase Setup Guide

## Step 1: Login to Supabase CLI

Run this command in your terminal (it will open a browser for authentication):

```bash
supabase login
```

## Step 2: Create a New Supabase Project

You have two options:

### Option A: Create via Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name**: `brickcheck` (or your preferred name)
   - **Database Password**: (generate a strong password and save it)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for MVP
4. Click "Create new project"
5. Wait for the project to be provisioned (2-3 minutes)

### Option B: Create via CLI (if available)

```bash
supabase projects create brickcheck --org-id YOUR_ORG_ID --region us-east-1 --db-password YOUR_PASSWORD
```

## Step 3: Link Local Project to Cloud Project

After creating the project, link it:

```bash
cd /Users/stevenmartinez/Cursor/brickcheck
supabase link --project-ref YOUR_PROJECT_REF
```

You can find your Project Ref in the Supabase dashboard URL:
- URL format: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
- Or in Project Settings → General → Reference ID

## Step 4: Run Migrations

Once linked, run the migrations:

```bash
supabase db push
```

This will apply all migrations in `supabase/migrations/`:
- `001_initial_schema.sql`
- `002_rls_policies.sql`
- `003_indexes.sql`

## Step 5: Get Your Credentials

After linking, get your project credentials:

```bash
supabase status
```

Or from the Supabase Dashboard:
1. Go to Project Settings → API
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

## Step 6: Add Environment Variables to Vercel

1. Go to https://vercel.com/ultimateagent/brickcheck/settings/environment-variables
2. Add all the environment variables from Step 5
3. Also add:
   - `NEXT_PUBLIC_APP_URL=https://brickcheck-six.vercel.app`
   - `VERCEL_CRON_SECRET=<generate with: openssl rand -hex 32>`
4. Redeploy the application

## Step 7: (Optional) Seed the Database

To add sample data for testing:

```bash
# First, make sure you have the service role key set locally
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run the seed script
npx tsx scripts/seed.ts
```

Or manually run the seed SQL:

```bash
supabase db execute --file supabase/seed.sql
```

## Troubleshooting

### "Cannot connect to Docker daemon"
- This is normal if you're not running local Supabase
- Use `supabase link` to connect to cloud project instead

### "Project not found"
- Make sure you're logged in: `supabase login`
- Verify the project ref is correct
- Check you have access to the organization

### Migration errors
- Check that migrations are in the correct order
- Verify RLS policies are set up correctly
- Check Supabase logs in the dashboard

## Quick Reference

```bash
# Login
supabase login

# Link to existing project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push

# Check status
supabase status

# View logs
supabase logs
```

