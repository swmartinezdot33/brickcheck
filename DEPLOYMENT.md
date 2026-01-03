# Deployment Guide

## GitHub Repository

✅ Repository created: https://github.com/swmartinezdot33/brickcheck

The code has been pushed to GitHub and is ready for deployment.

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to [Vercel](https://vercel.com)** and sign in with your GitHub account

2. **Click "Add New Project"**

3. **Import your repository**:
   - Select `swmartinezdot33/brickcheck` from the list
   - Click "Import"

4. **Configure the project**:
   - Framework Preset: **Next.js** (should auto-detect)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. **Add Environment Variables**:
   Click "Environment Variables" and add:

   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # APIs (optional for MVP)
   BRICKSET_API_KEY=
   BRICKLINK_CONSUMER_KEY=
   BRICKLINK_CONSUMER_SECRET=
   BRICKLINK_TOKEN=
   BRICKLINK_TOKEN_SECRET=

   # App
   NEXT_PUBLIC_APP_URL=https://www.brickcheck.app
   VERCEL_CRON_SECRET=generate_a_random_secret_here

   # Optional
   SENTRY_DSN=
   ```

   **Important**: Generate a random secret for `VERCEL_CRON_SECRET` (e.g., use `openssl rand -hex 32`)

6. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

7. **Configure Cron Job**:
   - The cron job is already configured in `vercel.json`
   - Vercel will automatically set it up
   - It runs daily at 2 AM UTC
   - Make sure `VERCEL_CRON_SECRET` is set for authentication

### Option 2: Deploy via Vercel CLI

If you prefer using the CLI:

```bash
# Install Vercel CLI (if not already installed)
npm install -D vercel

# Login to Vercel
npx vercel login

# Deploy
npx vercel

# Follow the prompts to:
# - Link to existing project or create new
# - Add environment variables
# - Deploy to production
```

### Post-Deployment Steps

1. **Set up Supabase**:
   - Create a Supabase project at https://supabase.com
   - Run the migrations in `supabase/migrations/` in order:
     - `001_initial_schema.sql`
     - `002_rls_policies.sql`
     - `003_indexes.sql`
   - Update the Supabase environment variables in Vercel

2. **Test the deployment**:
   - Visit your Vercel URL
   - Test signup/login
   - Test adding a set to collection
   - Test barcode scanning (requires HTTPS for camera access)

3. **Verify Cron Job**:
   - Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
   - Verify the nightly refresh job is scheduled
   - Check logs after it runs

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase service role key (for cron jobs) |
| `BRICKSET_API_KEY` | ⚠️ Optional | Brickset API key (for real API integration) |
| `BRICKLINK_CONSUMER_KEY` | ⚠️ Optional | BrickLink OAuth consumer key |
| `BRICKLINK_CONSUMER_SECRET` | ⚠️ Optional | BrickLink OAuth consumer secret |
| `BRICKLINK_TOKEN` | ⚠️ Optional | BrickLink OAuth token |
| `BRICKLINK_TOKEN_SECRET` | ⚠️ Optional | BrickLink OAuth token secret |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Production URL: https://www.brickcheck.app |
| `VERCEL_CRON_SECRET` | ✅ Yes | Secret for securing cron endpoints |
| `SENTRY_DSN` | ⚠️ Optional | Sentry DSN for error tracking |

### Troubleshooting

**Build fails:**
- Check that all environment variables are set
- Verify Node.js version (should be 18+)
- Check build logs in Vercel dashboard

**Cron job not running:**
- Verify `VERCEL_CRON_SECRET` is set
- Check cron job configuration in `vercel.json`
- Review cron job logs in Vercel dashboard

**Database errors:**
- Ensure migrations have been run in Supabase
- Verify RLS policies are set up correctly
- Check Supabase connection in Vercel logs

**Camera not working:**
- HTTPS is required for camera access
- Check browser permissions
- Verify camera access is granted

### Next Steps

1. ✅ Code is on GitHub
2. ⏳ Deploy to Vercel (follow steps above)
3. ⏳ Set up Supabase and run migrations
4. ⏳ Configure environment variables
5. ⏳ Test the deployed application
6. ⏳ (Optional) Integrate real Brickset/BrickLink APIs

