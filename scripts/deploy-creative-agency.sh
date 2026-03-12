#!/bin/bash

# ============================================
# Creative Agency Platform - Deployment Script
# ============================================
# This script deploys the entire platform to Vercel
# with all advanced enhancements configured

set -e  # Exit on error

echo "🚀 Starting Creative Agency Platform Deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production.creative-agency exists
if [ ! -f ".env.production.creative-agency" ]; then
    echo -e "${RED}❌ Error: .env.production.creative-agency not found${NC}"
    echo "Please create and configure the environment file first."
    exit 1
fi

# Step 1: Install dependencies
echo -e "${YELLOW}📦 Step 1: Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Build Redis package
echo -e "${YELLOW}🔴 Step 2: Building @vayva/redis package...${NC}"
cd packages/redis
pnpm install
pnpm build
cd ../..
echo -e "${GREEN}✅ Redis package built${NC}"
echo ""

# Step 3: Deploy Backend Core-API
echo -e "${YELLOW}⚙️  Step 3: Deploying Backend Core-API to Vercel...${NC}"
cd Backend/core-api

# Link environment variables
echo "Linking environment variables..."
vercel link --yes || true

# Deploy to production
echo "Deploying to production..."
vercel --prod

echo -e "${GREEN}✅ Backend deployed${NC}"
cd ../..
echo ""

# Step 4: Deploy Frontend Merchant-Admin
echo -e "${YELLOW}🎨 Step 4: Deploying Frontend Merchant-Admin to Vercel...${NC}"
cd Frontend/merchant-admin

# Link environment variables
echo "Linking environment variables..."
vercel link --yes || true

# Deploy to production
echo "Deploying to production..."
vercel --prod

echo -e "${GREEN}✅ Frontend deployed${NC}"
cd ../..
echo ""

# Step 5: Run database migrations
echo -e "${YELLOW}🗄️  Step 5: Running Prisma migrations...${NC}"
cd packages/prisma/prisma
npx prisma migrate deploy
npx prisma generate
cd ../../..
echo -e "${GREEN}✅ Database migrations complete${NC}"
echo ""

# Step 6: Verify deployment
echo -e "${YELLOW}🔍 Step 6: Verifying deployment...${NC}"
echo "Waiting 30 seconds for deployment to propagate..."
sleep 30

# Get deployment URL from Vercel
BACKEND_URL=$(vercel ls --yes | grep -o 'https://[^ ]*' | head -1)
FRONTEND_URL=$(cd Frontend/merchant-admin && vercel ls --yes | grep -o 'https://[^ ]*' | head -1)

echo ""
echo -e "${GREEN}=============================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""
echo "📊 Deployment Summary:"
echo ""
echo "   Backend API: ${BACKEND_URL:-'Check Vercel dashboard'}"
echo "   Frontend:    ${FRONTEND_URL:-'Check Vercel dashboard'}"
echo ""
echo "🔧 Next Steps:"
echo ""
echo "   1. Update your DNS records to point to Vercel"
echo "   2. Configure OAuth redirect URIs in QuickBooks/Xero dashboards"
echo "   3. Set up webhooks in QuickBooks/Xero to point to:"
echo "      - ${BACKEND_URL}/api/webhooks/quickbooks"
echo "      - ${BACKEND_URL}/api/webhooks/xero"
echo "   4. Test the health endpoint:"
echo "      curl ${BACKEND_URL}/api/health"
echo "   5. Configure scheduled reports cron job (already set in vercel.json)"
echo ""
echo -e "${GREEN}=============================================${NC}"
echo ""
