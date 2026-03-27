#!/bin/bash
set -e

echo "↩️ Rolling back Vayva deployment..."
echo "===================================="
echo ""

cd /home/fredrick/vayva || {
    echo "❌ Error: Cannot navigate to vayva directory"
    exit 1
}

# Show current commit
CURRENT=$(git rev-parse HEAD)
echo "Current commit: $CURRENT"

# Get previous commit
PREV_COMMIT=$(git rev-parse HEAD~1)
echo "Rolling back to: $PREV_COMMIT"
echo ""

# Confirm rollback
read -p "Are you sure you want to rollback? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Rollback cancelled"
    exit 0
fi

# Reset to previous commit
echo "📦 Resetting to previous commit..."
git reset --hard $PREV_COMMIT
echo "✅ Reset complete"
echo ""

# Reinstall dependencies
echo "📥 Reinstalling dependencies..."
pnpm install --prod
echo "✅ Dependencies reinstalled"
echo ""

# Rebuild backend
echo "🔨 Rebuilding backend..."
pnpm --filter=@vayva/core-api build
echo "✅ Backend rebuilt"
echo ""

# Restart services
echo "🔄 Restarting services..."
sudo systemctl restart vayva-backend
sleep 3

# Check if frontend needs rebuild
if git diff HEAD~1 HEAD --quiet -- Frontend/ packages/; then
    echo "ℹ️ No frontend changes, skipping rebuild"
else
    echo "🎨 Rebuilding frontend..."
    pnpm --filter=@vayva/merchant build
    pnpm --filter=marketing build
    sudo systemctl reload nginx
    echo "✅ Frontend rebuilt"
fi
echo ""

# Verify services
echo "✅ Checking service status..."
if systemctl is-active --quiet vayva-backend; then
    echo "  ✅ Backend: running"
else
    echo "  ❌ Backend: failed"
    systemctl status vayva-backend --no-pager
    exit 1
fi

if systemctl is-active --quiet nginx; then
    echo "  ✅ Nginx: running"
else
    echo "  ⚠️ Nginx: issues detected"
fi
echo ""

echo "================================"
echo "✅ Rollback completed successfully!"
echo "================================"
echo ""
echo "Now running commit: $PREV_COMMIT"
echo ""
echo "Next steps:"
echo "  - Monitor logs: journalctl -u vayva-backend -f"
echo "  - Test application functionality"
echo "  - Investigate what caused the issue in the previous commit"
