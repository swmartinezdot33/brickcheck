#!/bin/bash

# Script to add missing environment variables to Vercel
# Usage: ./add-missing-env.sh

echo "Checking for missing environment variables in Vercel..."
echo ""

# Check if BRICKECONOMY_API_KEY exists
if ! npx vercel env ls 2>/dev/null | grep -q "BRICKECONOMY_API_KEY"; then
  echo "❌ BRICKECONOMY_API_KEY is missing"
  echo ""
  echo "To add it, run:"
  echo "  npx vercel env add BRICKECONOMY_API_KEY production"
  echo "  npx vercel env add BRICKECONOMY_API_KEY preview"
  echo "  npx vercel env add BRICKECONOMY_API_KEY development"
  echo ""
  echo "Get your API key from: https://www.brickeconomy.com/premium"
  echo ""
else
  echo "✅ BRICKECONOMY_API_KEY is already set"
fi

echo ""
echo "Current environment variables:"
npx vercel env ls


