#!/bin/bash

# Apply Ops Invitation Migration Script
# Run this on your VPS where the database is accessible

set -e

echo "==================================="
echo "Vayva Ops Invitation Migration"
echo "==================================="
echo ""

# Check if we're in the right directory
if [ ! -f "prisma/schema.prisma" ]; then
    echo "Error: Please run this script from /Users/fredrick/Documents/Vayva-Tech/vayva/platform/infra/db"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Loading environment variables from .env..."
    if [ -f ".env" ]; then
        export $(grep -v '^#' .env | xargs)
    else
        echo "Error: .env file not found"
        exit 1
    fi
fi

echo "Database: $(echo $DATABASE_URL | cut -d'@' -f2 | cut -d'?' -f1)"
echo ""

# Option 1: Apply using Prisma Migrate
echo "Option 1: Apply via Prisma Migrate (recommended)"
echo "------------------------------------------------"
echo "Run: npx prisma migrate deploy"
echo ""

# Option 2: Apply using SQL directly
echo "Option 2: Apply SQL directly via psql"
echo "---------------------------------------"
echo "Run: psql \"$DATABASE_URL\" -f prisma/migrations/create_ops_invitation_table.sql"
echo ""

# Check if user wants to proceed
read -p "Do you want to apply the migration now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Applying migration..."
    
    # Try Prisma migrate first
    if command -v npx &> /dev/null; then
        echo "Using Prisma migrate deploy..."
        npx prisma migrate deploy
    else
        echo "Prisma not available. Please install dependencies first:"
        echo "  pnpm install"
        echo ""
        echo "Or apply the SQL manually:"
        echo "  psql \"$DATABASE_URL\" -f prisma/migrations/create_ops_invitation_table.sql"
    fi
    
    echo ""
    echo "==================================="
    echo "Migration completed!"
    echo "==================================="
    echo ""
    echo "To verify, run:"
    echo "  npx prisma migrate status"
    echo ""
else
    echo ""
    echo "Migration not applied."
    echo ""
    echo "To apply later, SSH to your VPS and run:"
    echo "  cd /Users/fredrick/Documents/Vayva-Tech/vayva/platform/infra/db"
    echo "  npx prisma migrate deploy"
    echo ""
fi
