#!/bin/bash

# Supabase Setup Script for BrickCheck
# This script will link the project and run migrations once the project is ready

PROJECT_REF="lajiakzlublsamwpmzyd"
DB_PASSWORD_FILE=".supabase-db-password.txt"

if [ ! -f "$DB_PASSWORD_FILE" ]; then
    echo "Error: Database password file not found!"
    exit 1
fi

DB_PASSWORD=$(cat "$DB_PASSWORD_FILE")

echo "🔗 Linking to Supabase project..."
echo "Project Ref: $PROJECT_REF"
echo ""

# Try to link (may need to wait for project to be ready)
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "Attempt $((RETRY_COUNT + 1))/$MAX_RETRIES: Linking project..."
    
    if supabase link --project-ref "$PROJECT_REF" --password "$DB_PASSWORD" 2>&1 | grep -q "Linked to"; then
        echo "✅ Successfully linked to project!"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "⏳ Project may still be provisioning. Waiting 30 seconds..."
            sleep 30
        else
            echo "❌ Failed to link after $MAX_RETRIES attempts."
            echo "Please try manually:"
            echo "  supabase link --project-ref $PROJECT_REF --password <password>"
            exit 1
        fi
    fi
done

echo ""
echo "📦 Pushing database migrations..."
supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations applied successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Get your project credentials:"
    echo "   supabase status"
    echo ""
    echo "2. Or get them from the dashboard:"
    echo "   https://supabase.com/dashboard/project/$PROJECT_REF/settings/api"
    echo ""
    echo "3. Add environment variables to Vercel:"
    echo "   https://vercel.com/ultimateagent/brickcheck/settings/environment-variables"
    echo ""
    echo "4. Database password saved in: $DB_PASSWORD_FILE"
    echo "   (Keep this secure and add it to your password manager)"
else
    echo "❌ Failed to push migrations. Please check the error above."
    exit 1
fi






