#!/bin/bash
# Non-interactive cleanup - deletes migrated legacy directories with backup

set -e

BACKUP_DIR="/tmp/legacy-backup-$(date +%Y%m%d-%H%M%S)"
LEGACY_API="Backend/core-api/src/app/api"

echo "Starting legacy backend cleanup..."
echo "Creating backup at: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Migrated directories to delete
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

DELETED=0
for dir in "${MIGRATED_DIRS[@]}"; do
    src_path="$LEGACY_API/$dir"
    backup_path="$BACKUP_DIR/$dir"
    
    if [[ -d "$src_path" ]]; then
        cp -r "$src_path" "$backup_path"
        rm -rf "$src_path"
        echo "✅ Deleted: $dir"
        ((DELETED++))
    fi
done

echo ""
echo "Cleanup complete! Deleted $DELETED directories"
echo "Backup location: $BACKUP_DIR"

