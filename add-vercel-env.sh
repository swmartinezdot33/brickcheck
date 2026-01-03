#!/bin/bash

# Script to add environment variables to Vercel
# Make sure you have your Supabase credentials ready

PROJECT_REF="lajiakzlublsamwpmzyd"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

echo "🔐 Adding environment variables to Vercel..."
echo ""
echo "You'll need to provide:"
echo "1. Supabase Anon Key (from dashboard)"
echo "2. Supabase Service Role Key (from dashboard)"
echo ""
echo "Get them from: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api"
echo ""

# Generate cron secret
CRON_SECRET=$(openssl rand -hex 32)
echo "Generated VERCEL_CRON_SECRET: $CRON_SECRET"
echo ""

# Add environment variables
echo "Adding NEXT_PUBLIC_SUPABASE_URL..."
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$SUPABASE_URL"
npx vercel env add NEXT_PUBLIC_SUPABASE_URL preview <<< "$SUPABASE_URL"
npx vercel env add NEXT_PUBLIC_SUPABASE_URL development <<< "$SUPABASE_URL"

echo ""
read -p "Enter your Supabase Anon Key: " ANON_KEY
echo "Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$ANON_KEY"
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview <<< "$ANON_KEY"
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development <<< "$ANON_KEY"

echo ""
read -sp "Enter your Supabase Service Role Key: " SERVICE_KEY
echo ""
echo "Adding SUPABASE_SERVICE_ROLE_KEY..."
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$SERVICE_KEY"
npx vercel env add SUPABASE_SERVICE_ROLE_KEY preview <<< "$SERVICE_KEY"
npx vercel env add SUPABASE_SERVICE_ROLE_KEY development <<< "$SERVICE_KEY"

echo ""
echo "Adding NEXT_PUBLIC_APP_URL..."
APP_URL="https://brickcheck-six.vercel.app"
npx vercel env add NEXT_PUBLIC_APP_URL production <<< "$APP_URL"
npx vercel env add NEXT_PUBLIC_APP_URL preview <<< "$APP_URL"
npx vercel env add NEXT_PUBLIC_APP_URL development <<< "http://localhost:3000"

echo ""
echo "Adding VERCEL_CRON_SECRET..."
npx vercel env add VERCEL_CRON_SECRET production <<< "$CRON_SECRET"
npx vercel env add VERCEL_CRON_SECRET preview <<< "$CRON_SECRET"

echo ""
echo "✅ Environment variables added!"
echo ""
echo "📋 Summary:"
echo "   NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL"
echo "   NEXT_PUBLIC_APP_URL=$APP_URL"
echo "   VERCEL_CRON_SECRET=$CRON_SECRET"
echo ""
echo "⚠️  Remember to:"
echo "   1. Run migrations: supabase db push"
echo "   2. Redeploy: npx vercel --prod"

