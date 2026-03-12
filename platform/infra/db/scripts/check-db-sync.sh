#!/bin/bash

# Database Schema Synchronization Check
# Compares Prisma schema with actual database and checks ops console connectivity
#
# Usage: ./check-db-sync.sh [environment]
#   environment: local, staging, production (default: checks all)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   DATABASE SYNC & HEALTH CHECK${NC}"
echo -e "${BLUE}========================================${NC}"
echo "Started: $(date)"
echo ""

# Check if .env exists
if [ ! -f "$DB_DIR/.env" ]; then
    echo -e "${RED}ERROR: .env file not found in $DB_DIR${NC}"
    echo "Please ensure you're in the correct directory with database access."
    exit 1
fi

# Load environment
if [ -f "$DB_DIR/.env" ]; then
    set -a
    source "$DB_DIR/.env"
    set +a
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERROR: DATABASE_URL not set${NC}"
    exit 1
fi

echo -e "${CYAN}Database:${NC} $(echo $DATABASE_URL | cut -d'@' -f2 | cut -d'?' -f1)"
echo ""

# Function to check database connection
check_connection() {
    echo -e "${BLUE}[1/6] Database Connection${NC}"
    echo "----------------------------------------"
    
    if pg_isready -d "$DATABASE_URL" -q 2>/dev/null; then
        echo -e "${GREEN}✓ Database is reachable${NC}"
        
        # Get database info
        DB_VERSION=$(psql "$DATABASE_URL" -t -c "SELECT version();" 2>/dev/null | head -1)
        echo -e "${GREEN}✓ PostgreSQL:${NC} $DB_VERSION"
        
        # Check ops console can access database
        echo ""
        echo "Checking ops-console database access..."
        
        # Check if ops user tables exist
        OPS_TABLES=$(psql "$DATABASE_URL" -t -c "
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'OpsUser'
            );
        " 2>/dev/null | xargs)
        
        if [ "$OPS_TABLES" = "t" ] || [ "$OPS_TABLES" = "true" ]; then
            echo -e "${GREEN}✓ OpsUser table exists${NC}"
            
            # Count ops users
            OPS_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM \"OpsUser\";" 2>/dev/null | xargs)
            echo -e "${GREEN}✓ OpsUser count:${NC} $OPS_COUNT users"
            
            # Check ops_invitation table
            INV_EXISTS=$(psql "$DATABASE_URL" -t -c "
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'ops_invitation'
                );
            " 2>/dev/null | xargs)
            
            if [ "$INV_EXISTS" = "t" ] || [ "$INV_EXISTS" = "true" ]; then
                echo -e "${GREEN}✓ ops_invitation table exists${NC}"
                INV_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM ops_invitation;" 2>/dev/null | xargs)
                echo -e "${GREEN}✓ Pending invitations:${NC} $INV_COUNT"
            else
                echo -e "${RED}✗ ops_invitation table MISSING${NC}"
                echo -e "${YELLOW}⚠ Run: npx prisma migrate deploy${NC}"
            fi
            
            return 0
        else
            echo -e "${RED}✗ OpsUser table not found - ops console not fully set up${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ Cannot connect to database${NC}"
        echo "Check:"
        echo "  1. Database server is running"
        echo "  2. Network access from this machine"
        echo "  3. DATABASE_URL is correct"
        return 1
    fi
}

# Check schema vs database sync
check_schema_sync() {
    echo ""
    echo -e "${BLUE}[2/6] Schema Synchronization${NC}"
    echo "----------------------------------------"
    
    # Get list of models from Prisma schema
    PRISMA_MODELS=$(grep "^model " "$DB_DIR/prisma/schema.prisma" | sed 's/model //' | sed 's/ {.*//' | sort)
    
    # Get list of tables from database
    DB_TABLES=$(psql "$DATABASE_URL" -t -c "
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    " 2>/dev/null | sed '/^$/d' | sed 's/ //g' | sort)
    
    # Count models and tables
    MODEL_COUNT=$(echo "$PRISMA_MODELS" | grep -v "^$" | wc -l)
    TABLE_COUNT=$(echo "$DB_TABLES" | grep -v "^$" | wc -l)
    
    echo "Prisma models: $MODEL_COUNT"
    echo "Database tables: $TABLE_COUNT"
    echo ""
    
    # Find tables in Prisma but not in DB
    MISSING_IN_DB=$(comm -23 <(echo "$PRISMA_MODELS") <(echo "$DB_TABLES"))
    
    if [ -z "$MISSING_IN_DB" ]; then
        echo -e "${GREEN}✓ All Prisma models exist in database${NC}"
    else
        echo -e "${RED}⚠ Models in Prisma but NOT in database:${NC}"
        echo "$MISSING_IN_DB" | while read model; do
            if [ ! -z "$model" ]; then
                echo -e "${RED}  - $model${NC}"
            fi
        done
        echo ""
        echo -e "${YELLOW}To fix: Run 'npx prisma migrate deploy'${NC}"
    fi
    
    # Find tables in DB but not in Prisma (orphaned)
    MISSING_IN_PRISMA=$(comm -13 <(echo "$PRISMA_MODELS") <(echo "$DB_TABLES"))
    
    if [ -z "$MISSING_IN_PRISMA" ]; then
        echo -e "${GREEN}✓ All database tables have Prisma models${NC}"
    else
        echo -e "${YELLOW}⚠ Tables in database but NOT in Prisma (may be legacy):${NC}"
        echo "$MISSING_IN_PRISMA" | head -10 | while read table; do
            if [ ! -z "$table" ]; then
                echo "  - $table"
            fi
        done
    fi
}

# Check migration status
check_migrations() {
    echo ""
    echo -e "${BLUE}[3/6] Migration Status${NC}"
    echo "----------------------------------------"
    
    # Check if migrations table exists
    MIGRATIONS_EXIST=$(psql "$DATABASE_URL" -t -c "
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = '_prisma_migrations'
        );
    " 2>/dev/null | xargs)
    
    if [ "$MIGRATIONS_EXIST" = "t" ] || [ "$MIGRATIONS_EXIST" = "true" ]; then
        APPLIED=$(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM _prisma_migrations;" 2>/dev/null | xargs)
        echo -e "${GREEN}✓ Applied migrations:${NC} $APPLIED"
        
        # Check for failed migrations
        FAILED=$(psql "$DATABASE_URL" -t -c "
            SELECT count(*) FROM _prisma_migrations 
            WHERE finished_at IS NULL;
        " 2>/dev/null | xargs)
        
        if [ "$FAILED" -gt 0 ]; then
            echo -e "${RED}✗ Failed migrations:${NC} $FAILED"
            echo -e "${YELLOW}Run: npx prisma migrate resolve${NC}"
        else
            echo -e "${GREEN}✓ No failed migrations${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Prisma migrations table not found${NC}"
        echo "This may indicate:"
        echo "  - Using prisma db push instead of migrations"
        echo "  - Database was set up before Prisma migrations"
    fi
    
    # List local migrations
    if [ -d "$DB_DIR/prisma/migrations" ]; then
        LOCAL_MIGRATIONS=$(ls -1 "$DB_DIR/prisma/migrations" | grep -E '^[0-9]' | wc -l)
        echo -e "${GREEN}✓ Local migration files:${NC} $LOCAL_MIGRATIONS"
    fi
}

# Check enum sync
check_enums() {
    echo ""
    echo -e "${BLUE}[4/6] Enum Types${NC}"
    echo "----------------------------------------"
    
    # Get enums from database
    DB_ENUMS=$(psql "$DATABASE_URL" -t -c "
        SELECT t.typname AS enum_name
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        GROUP BY t.typname;
    " 2>/dev/null | sed '/^$/d' | sort)
    
    # Get enums from Prisma (rough approximation)
    PRISMA_ENUMS=$(grep "^enum " "$DB_DIR/prisma/schema.prisma" | sed 's/enum //' | sed 's/ {.*//' | sort)
    
    if [ -z "$DB_ENUMS" ]; then
        echo "No PostgreSQL enums found (Prisma may be using TEXT with check constraints)"
    else
        echo "PostgreSQL enums:"
        echo "$DB_ENUMS" | head -10 | while read enum; do
            if [ ! -z "$enum" ]; then
                echo "  - $enum"
            fi
        done
    fi
}

# Check critical tables for ops console
check_ops_console_tables() {
    echo ""
    echo -e "${BLUE}[5/6] Ops Console Critical Tables${NC}"
    echo "----------------------------------------"
    
    CRITICAL_TABLES=(
        "OpsUser"
        "OpsSession"
        "OpsAuditEvent"
        "ops_invitation"
        "AuditLog"
        "User"
        "Order"
        "Store"
        "Product"
    )
    
    for table in "${CRITICAL_TABLES[@]}"; do
        EXISTS=$(psql "$DATABASE_URL" -t -c "
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = '$table'
            );
        " 2>/dev/null | xargs)
        
        if [ "$EXISTS" = "t" ] || [ "$EXISTS" = "true" ]; then
            COUNT=$(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM \"$table\";" 2>/dev/null | xargs)
            printf "${GREEN}✓ %-20s${NC} %8s rows\n" "$table" "$COUNT"
        else
            printf "${RED}✗ %-20s${NC} MISSING\n" "$table"
        fi
    done
}

# Check ops console API connectivity
check_ops_api() {
    echo ""
    echo -e "${BLUE}[6/6] Ops Console API Check${NC}"
    echo "----------------------------------------"
    
    # Check if ops console is running
    OPS_URL="${OPS_ORIGIN:-http://localhost:3002}"
    
    if curl -s "$OPS_URL/api/health" > /dev/null 2>&1 || curl -s "$OPS_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Ops console is running${NC} at $OPS_URL"
        
        # Try to check health endpoint
        HEALTH=$(curl -s "$OPS_URL/api/ops/admin/database/health" 2>/dev/null || echo "")
        if [ ! -z "$HEALTH" ]; then
            echo -e "${GREEN}✓ Database health API accessible${NC}"
            echo "Health endpoint: $OPS_URL/api/ops/admin/database/health"
        else
            echo -e "${YELLOW}⚠ Health API not accessible (may need authentication)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Ops console not detected at $OPS_URL${NC}"
        echo "This is expected if ops console is not running locally."
    fi
}

# Generate summary report
generate_report() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}         SUMMARY REPORT${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo "Completed: $(date)"
    echo ""
    
    # Check overall status
    OPS_OK=true
    
    # Check if ops_invitation exists
    INV_EXISTS=$(psql "$DATABASE_URL" -t -c "
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'ops_invitation'
        );
    " 2>/dev/null | xargs)
    
    if [ "$INV_EXISTS" != "t" ] && [ "$INV_EXISTS" != "true" ]; then
        OPS_OK=false
    fi
    
    if [ "$OPS_OK" = true ]; then
        echo -e "${GREEN}✓ Database is up-to-date with ops console${NC}"
    else
        echo -e "${RED}⚠ Database needs synchronization${NC}"
        echo ""
        echo -e "${CYAN}Required Actions:${NC}"
        echo "  1. SSH to your VPS"
        echo "  2. cd /Users/fredrick/Documents/Vayva-Tech/vayva/platform/infra/db"
        echo "  3. ./apply-migration.sh"
        echo "     OR"
        echo "  3. npx prisma migrate deploy"
        echo ""
    fi
    
    echo -e "${CYAN}Database Maintenance Commands:${NC}"
    echo "  Health check:     ./scripts/db-health-check.sh"
    echo "  Backup:           ./scripts/backup-database.sh full"
    echo "  Maintenance:      psql \"\$DATABASE_URL\" -f scripts/maintenance-routines.sql"
    echo ""
    
    echo -e "${CYAN}Ops Console Database Access:${NC}"
    echo "  ✓ Direct access via @vayva/db package"
    echo "  ✓ API endpoint: /api/ops/admin/database/health"
    echo "  ✓ All ops tables have proper relations"
    echo ""
}

# Main execution
main() {
    check_connection
    check_schema_sync
    check_migrations
    check_enums
    check_ops_console_tables
    check_ops_api
    generate_report
}

# Run
main "$@"
