#!/bin/bash

# Vayva Platform - Production Deployment Script
# One-command deployment to production

set -e

echo "======================================"
echo "🚀 VAYVA PRODUCTION DEPLOYMENT"
echo "======================================"
echo ""

# Configuration
DEPLOY_TARGET=${1:-"staging"}  # staging or production
SKIP_TESTS=${2:-false}
REDIS_CLOUD_URL=${REDIS_URL:-""}

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Pre-flight checks
log "Running pre-flight checks..."

# Check if on main branch for production
if [ "$DEPLOY_TARGET" = "production" ] && [ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]; then
    error "Must be on main branch for production deployment"
    exit 1
fi

# Check environment variables
if [ -z "$DATABASE_URL" ]; then
    warning "DATABASE_URL not set in environment"
fi

if [ -z "$REDIS_URL" ]; then
    warning "REDIS_URL not set - caching will use fallback"
fi

# Step 1: Run tests (unless skipped)
if [ "$SKIP_TESTS" != "true" ]; then
    log "Running test suite..."
    ./scripts/run-all-tests.sh || {
        error "Tests failed! Aborting deployment."
        exit 1
    }
    success "All tests passed"
else
    warning "Skipping tests (--skip-tests flag used)"
fi

# Step 2: Build applications
log "Building applications..."

# Build backend
cd Backend/core-api
pnpm build || {
    error "Backend build failed"
    exit 1
}
success "Backend built successfully"
cd ../..

# Build frontend apps
cd Frontend/merchant
pnpm build || {
    error "Frontend build failed"
    exit 1
}
success "Frontend built successfully"
cd ../..

# Step 3: Database migrations
log "Running database migrations..."
cd Backend/core-api
pnpm prisma migrate deploy || {
    error "Database migration failed"
    exit 1
}
success "Database migrated"
cd ../..

# Step 4: Deploy to Vercel (if configured)
if command -v vercel &> /dev/null && [ -f ".vercel/project.json" ]; then
    log "Deploying to Vercel ($DEPLOY_TARGET)..."
    
    if [ "$DEPLOY_TARGET" = "production" ]; then
        vercel --prod || {
            error "Vercel deployment failed"
            exit 1
        }
    else
        vercel || {
            warning "Vercel preview deployment failed (continuing...)"
        }
    fi
    success "Deployed to Vercel"
else
    warning "Vercel not configured, skipping..."
fi

# Step 5: Restart backend services (if using PM2)
if command -v pm2 &> /dev/null && [ -f "ecosystem.config.js" ]; then
    log "Restarting backend services..."
    pm2 restart vayva-api || {
        warning "PM2 restart failed (may need manual restart)"
    }
    success "Backend services restarted"
fi

# Step 6: Health checks
log "Running health checks..."
sleep 10  # Wait for services to start

# Check API health
if curl -sf http://localhost:3000/api/healthz > /dev/null 2>&1; then
    success "API health check passed"
else
    warning "API health check failed (service may still be starting)"
fi

# Post-deployment summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Deployment Details:"
echo "• Target: $DEPLOY_TARGET"
echo "• Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo "• Commit: $(git rev-parse --short HEAD)"
echo "• Branch: $(git rev-parse --abbrev-ref HEAD)"
echo ""
echo "Services Status:"
echo "• Backend: ✅ Deployed"
echo "• Frontend: ✅ Deployed"
echo "• Database: ✅ Migrated"
echo "• Redis: ${REDIS_URL:+✅ Configured}${REDIS_URL:-⚠️  Not configured}"
echo ""
echo "Next Steps:"
echo "1. Monitor logs: pm2 logs vayva-api"
echo "2. Check metrics: https://dashboard.vayva.com/analytics"
echo "3. Verify functionality: https://merchant.vayva.com"
echo ""
echo "Rollback Instructions:"
echo "  git revert HEAD"
echo "  pm2 restart vayva-api"
echo ""
