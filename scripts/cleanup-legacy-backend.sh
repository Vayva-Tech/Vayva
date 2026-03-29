#!/bin/bash
# Safe cleanup of migrated legacy backend directories
# Creates backup before deletion

set -e  # Exit on error

BACKUP_DIR="/tmp/legacy-backup-$(date +%Y%m%d-%H%M%S)"
LEGACY_API="Backend/core-api/src/app/api"

echo "======================================"
echo "LEGACY BACKEND CLEANUP"
echo "======================================"
echo ""
echo "⚠️  WARNING: This will delete migrated legacy directories"
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""
read -p "Continue? (yes/no): " CONFIRM

if [[ "$CONFIRM" != "yes" ]]; then
    echo "Aborted."
    exit 0
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"
echo "Creating backup directory..."

# List of migrated directories to delete
MIGRATED_DIRS=(
    account ai ai-agent analytics automation beauty blog bookings
    campaigns carts checkout compliance creative customers dashboard
    domains education events fashion fulfillment grocery healthcare
    inventory invoices ledger marketing nightlife nonprofit
    notifications orders payments portfolio products refunds rescue
    restaurant retail returns settings settlements storage
    subscriptions support system wallet websocket webstudio
    wholesale workflows
)

echo ""
echo "Directories to delete: ${#MIGRATED_DIRS[@]}"
echo ""

DELETED=0
FAILED=0

for dir in "${MIGRATED_DIRS[@]}"; do
    src_path="$LEGACY_API/$dir"
    backup_path="$BACKUP_DIR/$dir"
    
    if [[ -d "$src_path" ]]; then
        echo -n "Deleting $dir... "
        
        # Copy to backup first
        cp -r "$src_path" "$backup_path"
        
        # Delete original
        if rm -rf "$src_path"; then
            echo "✅"
            ((DELETED++))
        else
            echo "❌ FAILED"
            ((FAILED++))
        fi
    else
        echo "⊘  Skipping $dir (not found)"
    fi
done

echo ""
echo "======================================"
echo "CLEANUP COMPLETE"
echo "======================================"
echo "Deleted: $DELETED directories"
echo "Failed: $FAILED directories"
echo ""
echo "Backup saved to: $BACKUP_DIR"
echo ""
echo "To restore if needed:"
echo "  cd $BACKUP_DIR"
echo "  rsync -av . ../../$LEGACY_API/"

