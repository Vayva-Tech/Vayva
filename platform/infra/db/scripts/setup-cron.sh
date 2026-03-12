#!/bin/bash

# Setup Automated Database Maintenance Cron Jobs
# Run this on your VPS to configure automatic database maintenance

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="$(dirname "$SCRIPT_DIR")"
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  VAYVA DATABASE MAINTENANCE SETUP${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if running on VPS
if [ ! -f "$DB_DIR/.env" ]; then
    echo -e "${RED}ERROR: .env file not found in $DB_DIR${NC}"
    echo "Please ensure you're running this on your VPS with the correct environment setup."
    exit 1
fi

echo "This script will set up automated database maintenance:"
echo "  1. Daily backups at 1:00 AM"
echo "  2. Hourly WAL archiving"
echo "  3. Daily health checks at 6:00 AM"
echo "  4. Weekly maintenance (Sundays at 2:00 AM)"
echo "  5. Monthly backup verification"
echo ""

read -p "Continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

# Create cron job content
CRON_JOBS="# Vayva Database Maintenance Jobs
# Generated: $(date)

# Environment variables
DATABASE_URL=$(grep DATABASE_URL "$DB_DIR/.env" | cut -d'=' -f2-)
PATH=/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin
SHELL=/bin/bash

# Daily full backup at 1:00 AM
0 1 * * * cd $DB_DIR && ./scripts/backup-database.sh full >> /var/log/vayva-backup.log 2>&1

# Hourly WAL backup (if WAL archiving enabled)
0 * * * * cd $DB_DIR && ./scripts/backup-database.sh wal >> /var/log/vayva-wal.log 2>&1

# Daily health check at 6:00 AM
0 6 * * * cd $DB_DIR && ./scripts/db-health-check.sh >> /var/log/vayva-health.log 2>&1

# Weekly deep maintenance (Sundays at 2:00 AM)
0 2 * * 0 cd $DB_DIR && psql \"\$DATABASE_URL\" -f scripts/maintenance-routines.sql >> /var/log/vayva-maintenance.log 2>&1

# Monthly backup verification (1st of month at 3:00 AM)
0 3 1 * * cd $DB_DIR && psql \"\$DATABASE_URL\" -f scripts/backup-verification.sql >> /var/log/vayva-verify.log 2>&1

# Cleanup old backups (weekly)
0 4 * * 0 find /var/backups/vayva/daily -name 'vayva_full_*.sql.gz' -mtime +7 -delete 2>/dev/null
"

# Install cron jobs
echo "Installing cron jobs..."
echo "$CRON_JOBS" | crontab -

echo -e "${GREEN}✓ Cron jobs installed successfully!${NC}"
echo ""

# Create log directories
mkdir -p /var/log
mkdir -p /var/backups/vayva

# Set up log rotation
echo "Setting up log rotation..."
cat > /etc/logrotate.d/vayva-db <<EOF
/var/log/vayva-*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOF

echo -e "${GREEN}✓ Log rotation configured${NC}"
echo ""

# Verify setup
echo "Verifying installation..."
echo ""
echo "Installed cron jobs:"
crontab -l | grep -E "(vayva|backup|health|maintenance)" || echo "No vayva jobs found"
echo ""

# Check if scripts are executable
if [ -x "$DB_DIR/scripts/backup-database.sh" ] && \
   [ -x "$DB_DIR/scripts/db-health-check.sh" ]; then
    echo -e "${GREEN}✓ All scripts are executable${NC}"
else
    echo -e "${RED}⚠ Some scripts may not be executable${NC}"
    chmod +x "$DB_DIR/scripts/"*.sh
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  SETUP COMPLETE!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Your database is now configured for automatic maintenance:"
echo ""
echo "📦 BACKUPS:"
echo "  • Daily full backups at 1:00 AM → /var/backups/vayva/daily/"
echo "  • Hourly WAL backups → /var/backups/vayva/wal/"
echo "  • Weekly backups kept for 4 weeks"
echo "  • Monthly backups kept for 12 months"
echo ""
echo "🔍 MONITORING:"
echo "  • Daily health check at 6:00 AM"
echo "  • Results logged to /var/log/vayva-health.log"
echo "  • Access dashboard at /ops/admin/database/health"
echo ""
echo "🔧 MAINTENANCE:"
echo "  • Weekly deep maintenance (Sundays 2:00 AM)"
echo "  • Automatic VACUUM ANALYZE"
echo "  • Index optimization"
echo "  • Bloat detection and cleanup"
echo ""
echo "📊 VERIFICATION:"
echo "  • Monthly backup integrity checks"
echo "  • Data integrity verification"
echo "  • Row count validation"
echo ""
echo "Logs:"
echo "  tail -f /var/log/vayva-*.log"
echo ""
echo "Manual backup:"
echo "  cd $DB_DIR && ./scripts/backup-database.sh full"
echo ""
echo "Manual health check:"
echo "  cd $DB_DIR && ./scripts/db-health-check.sh"
echo ""
