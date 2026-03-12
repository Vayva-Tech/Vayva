#!/bin/bash

# Automated Database Backup Script with Rotation
# Backs up Vayva database with compression and retention policy
# 
# Usage:
#   ./backup-database.sh [full|incremental|wal]
#
# Cron setup:
#   0 1 * * * /var/www/vayva/platform/infra/db/scripts/backup-database.sh full
#   0 * * * * /var/www/vayva/platform/infra/db/scripts/backup-database.sh wal

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/vayva}"
DB_NAME="vayva"
RETENTION_DAYS=7
RETENTION_WEEKS=4
RETENTION_MONTHS=12
DATE=$(date +%Y%m%d_%H%M%S)
DAY_OF_WEEK=$(date +%u)
DAY_OF_MONTH=$(date +%d)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
LOG_FILE="${BACKUP_DIR}/logs/backup-${DATE}.log"
mkdir -p "${BACKUP_DIR}/logs"

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Load environment variables
if [ -f "/var/www/vayva/platform/infra/db/.env" ]; then
    export $(grep -v '^#' /var/www/vayva/platform/infra/db/.env | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL not set. Please configure environment."
    exit 1
fi

# Create backup directories
mkdir -p "${BACKUP_DIR}"/{daily,weekly,monthly,wal,archived}
mkdir -p "${BACKUP_DIR}/logs"

# Backup type
BACKUP_TYPE="${1:-full}"

log "=========================================="
log "Vayva Database Backup - ${BACKUP_TYPE^^}"
log "Started: $(date)"
log "=========================================="

# Check disk space
check_disk_space() {
    local available=$(df -BG "$BACKUP_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "$available" -lt 10 ]; then
        error "Insufficient disk space. Only ${available}GB available (need 10GB+)"
        exit 1
    fi
    log "Disk space check: ${available}GB available ✓"
}

# Full backup
full_backup() {
    log "Starting full database backup..."
    
    local backup_file="${BACKUP_DIR}/daily/vayva_full_${DATE}.sql.gz"
    local start_time=$(date +%s)
    
    # Perform backup with compression
    if pg_dump "$DATABASE_URL" --verbose --format=plain 2>>"$LOG_FILE" | gzip > "$backup_file"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        local size=$(du -h "$backup_file" | cut -f1)
        
        success "Full backup completed in ${duration}s"
        success "Backup file: $backup_file (${size})"
        
        # Create weekly backup on Sundays (day 7)
        if [ "$DAY_OF_WEEK" -eq 7 ]; then
            cp "$backup_file" "${BACKUP_DIR}/weekly/vayva_weekly_${DATE}.sql.gz"
            success "Weekly backup created"
        fi
        
        # Create monthly backup on 1st of month
        if [ "$DAY_OF_MONTH" -eq "01" ]; then
            cp "$backup_file" "${BACKUP_DIR}/monthly/vayva_monthly_${DATE}.sql.gz"
            success "Monthly backup created"
        fi
        
        # Record backup metadata
        record_backup_metadata "FULL" "$backup_file" "$duration" "$size"
        
        return 0
    else
        error "Full backup failed!"
        rm -f "$backup_file"
        return 1
    fi
}

# WAL archive backup
wal_backup() {
    log "Starting WAL backup..."
    
    # This requires WAL archiving to be enabled in PostgreSQL
    # Check if WAL directory exists
    if [ ! -d "$PGDATA/pg_wal" ]; then
        warning "WAL archiving not configured. Skipping WAL backup."
        return 0
    fi
    
    local wal_dir="${BACKUP_DIR}/wal"
    local archive_date=$(date +%Y%m%d_%H%M%S)
    
    # Archive WAL files
    if rsync -av "$PGDATA/pg_wal/" "${wal_dir}/${archive_date}/" >>"$LOG_FILE" 2>&1; then
        success "WAL backup completed"
        return 0
    else
        warning "WAL backup completed with warnings"
        return 0
    fi
}

# Record backup metadata in database
record_backup_metadata() {
    local type="$1"
    local file="$2"
    local duration="$3"
    local size="$4"
    local filename=$(basename "$file")
    local filesize=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
    
    # Create metadata table if not exists
    psql "$DATABASE_URL" -c "
        CREATE TABLE IF NOT EXISTS \"BackupMetadata\" (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
            \"backupType\" TEXT NOT NULL,
            \"backupFile\" TEXT NOT NULL,
            \"backupSize\" BIGINT,
            \"backupDuration\" INTEGER,
            \"backupDate\" TIMESTAMP NOT NULL DEFAULT now(),
            \"checksum\" TEXT,
            status TEXT DEFAULT 'SUCCESS'
        );
    " >>"$LOG_FILE" 2>&1 || true
    
    # Insert metadata
    psql "$DATABASE_URL" -c "
        INSERT INTO \"BackupMetadata\" 
        (\"backupType\", \"backupFile\", \"backupSize\", \"backupDuration\", status)
        VALUES ('$type', '$filename', $filesize, $duration, 'SUCCESS');
    " >>"$LOG_FILE" 2>&1 || true
}

# Verify backup integrity
verify_backup() {
    local backup_file="$1"
    
    log "Verifying backup integrity..."
    
    # Check if file exists and is not empty
    if [ ! -f "$backup_file" ] || [ ! -s "$backup_file" ]; then
        error "Backup file is missing or empty!"
        return 1
    fi
    
    # Test decompression (don't save output)
    if gunzip -t "$backup_file" 2>>"$LOG_FILE"; then
        success "Backup file integrity verified"
        return 0
    else
        error "Backup file is corrupted!"
        return 1
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    local cleaned=0
    
    # Clean daily backups (keep RETENTION_DAYS)
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            log "Removing old daily backup: $(basename "$file")"
            rm -f "$file"
            ((cleaned++))
        fi
    done < <(find "${BACKUP_DIR}/daily" -name "vayva_full_*.sql.gz" -type f -mtime +$RETENTION_DAYS 2>/dev/null)
    
    # Clean weekly backups (keep RETENTION_WEEKS)
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            log "Removing old weekly backup: $(basename "$file")"
            rm -f "$file"
            ((cleaned++))
        fi
    done < <(find "${BACKUP_DIR}/weekly" -name "vayva_weekly_*.sql.gz" -type f -mtime +$((RETENTION_WEEKS * 7)) 2>/dev/null)
    
    # Clean monthly backups (keep RETENTION_MONTHS)
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            log "Removing old monthly backup: $(basename "$file")"
            rm -f "$file"
            ((cleaned++))
        fi
    done < <(find "${BACKUP_DIR}/monthly" -name "vayva_monthly_*.sql.gz" -type f -mtime +$((RETENTION_MONTHS * 30)) 2>/dev/null)
    
    # Clean old WAL backups (keep 7 days)
    find "${BACKUP_DIR}/wal" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
    
    # Clean old logs (keep 30 days)
    find "${BACKUP_DIR}/logs" -name "*.log" -type f -mtime +30 -delete 2>/dev/null || true
    
    if [ $cleaned -gt 0 ]; then
        success "Cleaned up $cleaned old backup files"
    else
        log "No old backups to clean up"
    fi
}

# Send notification (customize as needed)
send_notification() {
    local status="$1"
    local message="$2"
    
    # Log to syslog
    logger -t "vayva-backup" "Backup $status: $message"
    
    # Could integrate with Slack, email, PagerDuty here
    # Example: curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"Backup $status: $message\"}" \
    #   $SLACK_WEBHOOK_URL
}

# Main execution
main() {
    check_disk_space
    
    local backup_success=false
    local backup_file=""
    
    case "$BACKUP_TYPE" in
        full)
            if full_backup; then
                backup_file="${BACKUP_DIR}/daily/vayva_full_${DATE}.sql.gz"
                if verify_backup "$backup_file"; then
                    backup_success=true
                fi
            fi
            ;;
        wal)
            wal_backup
            backup_success=true
            ;;
        *)
            error "Unknown backup type: $BACKUP_TYPE"
            echo "Usage: $0 [full|wal]"
            exit 1
            ;;
    esac
    
    # Cleanup old backups (only for full backups)
    if [ "$BACKUP_TYPE" = "full" ]; then
        cleanup_old_backups
    fi
    
    # Send notification
    if [ "$backup_success" = true ]; then
        send_notification "SUCCESS" "${BACKUP_TYPE} backup completed successfully"
        success "Backup process completed successfully!"
        exit 0
    else
        send_notification "FAILED" "${BACKUP_TYPE} backup failed - check logs at $LOG_FILE"
        error "Backup process failed!"
        exit 1
    fi
}

# Run main function
main "$@"
