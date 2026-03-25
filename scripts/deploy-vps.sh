#!/bin/bash
set -e

echo "🚀 Starting Vayva deployment..."
echo "================================"
echo ""

# Navigate to repo
cd /home/fredrick/vayva || {
    echo "❌ Error: Cannot navigate to vayva directory"
    exit 1
}

# Pull latest changes
echo "📦 Pulling latest changes from Git..."
git pull origin Vayva
echo "✅ Pull successful"
echo ""

# Install dependencies
echo "📥 Installing production dependencies..."
pnpm install --prod
echo "✅ Dependencies installed"
echo ""

# Build backend
echo "🔨 Building backend API..."
pnpm --filter=@vayva/core-api build
echo "✅ Backend built successfully"
echo ""

# Run database migrations
echo "🗄️ Running database migrations..."
pnpm --filter=@vayva/db migrate
echo "✅ Migrations completed"
echo ""

# Restart backend service
echo "🔄 Restarting backend service..."
sudo systemctl restart vayva-backend
sleep 3

# Verify backend is running
if systemctl is-active --quiet vayva-backend; then
    echo "✅ Backend service is running"
else
    echo "❌ Error: Backend service failed to start"
    systemctl status vayva-backend --no-pager
    exit 1
fi
echo ""

# Check if frontend changed (optional - skip if only backend changes)
if git diff HEAD~1 HEAD --quiet -- Frontend/ packages/; then
    echo "ℹ️ No frontend changes detected, skipping rebuild"
else
    echo "🎨 Building frontend applications..."
    
    # Build merchant admin
    echo "   Building Merchant Admin..."
    pnpm --filter=@vayva/merchant build
    echo "   ✅ Merchant Admin built"
    
    # Build marketing site
    echo "   Building Marketing Site..."
    pnpm --filter=marketing build
    echo "   ✅ Marketing Site built"
    
    # Reload Nginx to pick up new files
    echo "🔄 Reloading Nginx..."
    sudo systemctl reload nginx
    sleep 2
    
    # Verify Nginx is running
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx reloaded successfully"
    else
        echo "⚠️ Warning: Nginx may have issues"
        systemctl status nginx --no-pager
    fi
fi
echo ""

# Health checks
echo "🏥 Running health checks..."
sleep 5

# Check backend health
echo "   Checking backend API..."
if curl -f -s http://localhost:4000/api/health > /dev/null 2>&1; then
    echo "   ✅ Backend API is healthy"
else
    echo "   ⚠️ Backend API health check failed (may need manual verification)"
fi

# Cleanup old builds and cache
echo "🧹 Cleaning up..."
pnpm store prune
echo "✅ Cleanup complete"
echo ""

# Summary
echo "================================"
echo "✅ Deployment completed successfully!"
echo "================================"
echo ""
echo "Services status:"
echo "  - Backend: $(systemctl is-active vayva-backend)"
echo "  - Nginx: $(systemctl is-active nginx)"
echo ""
echo "Next steps:"
echo "  - Monitor logs: journalctl -u vayva-backend -f"
echo "  - Check application: https://your-domain.com"
echo ""
