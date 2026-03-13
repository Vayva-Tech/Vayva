#!/bin/bash

# Vayva Ops Console - Production Deployment Script
# This script deploys the ops-console to production environment

set -e  # Exit on error

echo "🚀 DEPLOYING OPS CONSOLE TO PRODUCTION"
echo "======================================="
echo ""

# Configuration
APP_NAME="ops-console"
ENVIRONMENT="production"
PORT=3002

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}ℹ️  $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Pre-deployment checklist
pre_deployment_checklist() {
    echo ""
    log_info "PRE-DEPLOYMENT CHECKLIST"
    echo "=========================="
    
    read -p "✓ All tests passing locally? (y/n) " tests
    if [ "$tests" != "y" ]; then
        log_error "Please ensure all tests pass before deploying to production"
        exit 1
    fi
    
    read -p "✓ Staging deployment verified? (y/n) " staging
    if [ "$staging" != "y" ]; then
        log_warn "Consider deploying to staging first: ./scripts/deploy-staging.sh"
        read -p "Continue anyway? (y/n) " continue
        if [ "$continue" != "y" ]; then
            exit 0
        fi
    fi
    
    read -p "✓ Database migrations prepared? (y/n) " migrations
    if [ "$migrations" != "y" ]; then
        log_error "Database migrations must be prepared"
        exit 1
    fi
    
    read -p "✓ Team notified of deployment? (y/n) " team
    if [ "$team" != "y" ]; then
        log_warn "Consider notifying team before production deployment"
    fi
    
    echo ""
    log_info "✓ Pre-deployment checklist complete"
}

# Main deployment
main() {
    pre_deployment_checklist
    
    log_info "Starting production deployment..."
    
    cd Frontend/ops-console
    
    # Build for production
    log_info "Building production bundle..."
    pnpm next build --webpack
    
    # Deploy to Vercel production
    log_info "Deploying to production..."
    vercel --prod
    
    cd ../..
    
    # Post-deployment verification
    log_info "Running post-deployment verification..."
    sleep 10  # Wait for propagation
    
    # Health check
    curl -f https://ops.yourdomain.com/api/ops/health/system || {
        log_warn "Health check failed - monitoring deployment"
    }
    
    echo ""
    echo "======================================="
    log_info "✅ PRODUCTION DEPLOYMENT COMPLETE!"
    echo ""
    echo "📊 Production URL: https://ops.yourdomain.com"
    echo ""
    echo "🔍 Post-Deployment Tasks:"
    echo "   1. Monitor error logs for 1 hour"
    echo "   2. Check analytics dashboard"
    echo "   3. Verify all API endpoints"
    echo "   4. Update deployment tracker"
    echo ""
    echo "📞 Emergency Rollback:"
    echo "   vercel rollback [deployment-id]"
    echo ""
}

# Run main function
main
