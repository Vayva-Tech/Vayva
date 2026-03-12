#!/bin/bash
# ============================================
# VAYVA VPS DEPLOYMENT HELPER
# ============================================
# This script helps deploy updates to the VPS infrastructure
# including the WhatsApp Gateway (Evolution API)
#
# Usage: ./deploy-vps.sh [command]
# Commands:
#   update       - Pull latest images and restart services
#   logs         - Show logs for all services
#   status       - Check health status of all services
#   whatsapp     - Show WhatsApp/Evolution API specific logs
#   restart      - Restart all services
#   backup       - Backup Evolution API instances data
#
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.app.yml"
ENV_FILE=".env"
VAYVA_DIR="${HOME}/vayva"

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running in correct directory
check_directory() {
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "Compose file not found: $COMPOSE_FILE"
        log_info "Please run this script from the directory containing $COMPOSE_FILE"
        exit 1
    fi

    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file not found: $ENV_FILE"
        log_info "Please create .env file from env.app.example"
        exit 1
    fi
}

# Update all services
update_services() {
    log_info "Pulling latest images..."
    docker compose -f $COMPOSE_FILE pull

    log_info "Stopping services..."
    docker compose -f $COMPOSE_FILE down

    log_info "Starting services with new images..."
    docker compose -f $COMPOSE_FILE up -d

    log_info "Waiting for services to be healthy..."
    sleep 10

    check_health
}

# Check health of all services
check_health() {
    log_info "Checking service health..."

    # Check Redis
    if docker compose -f $COMPOSE_FILE ps redis | grep -q "healthy"; then
        log_info "✅ Redis is healthy"
    else
        log_warn "⚠️  Redis health check pending or unhealthy"
    fi

    # Check Evolution API (WhatsApp Gateway)
    if docker compose -f $COMPOSE_FILE ps evolution-api | grep -q "healthy"; then
        log_info "✅ Evolution API (WhatsApp) is healthy"
    else
        log_warn "⚠️  Evolution API health check pending or unhealthy"
        log_info "Check logs with: docker compose -f $COMPOSE_FILE logs evolution-api"
    fi

    # Check Proxy Manager
    if docker compose -f $COMPOSE_FILE ps proxy-manager | grep -q "healthy"; then
        log_info "✅ Proxy Manager is healthy"
    else
        log_warn "⚠️  Proxy Manager health check pending or unhealthy"
    fi

    log_info "Container status:"
    docker compose -f $COMPOSE_FILE ps
}

# Show logs for all services
show_logs() {
    log_info "Showing logs (press Ctrl+C to exit)..."
    docker compose -f $COMPOSE_FILE logs -f
}

# Show WhatsApp/Evolution API specific logs
show_whatsapp_logs() {
    log_info "Showing WhatsApp Gateway (Evolution API) logs..."
    log_info "Recent entries:"
    docker compose -f $COMPOSE_FILE logs --tail=100 evolution-api

    echo ""
    log_info "Following logs (press Ctrl+C to exit)..."
    docker compose -f $COMPOSE_FILE logs -f evolution-api
}

# Restart all services
restart_services() {
    log_info "Restarting all services..."
    docker compose -f $COMPOSE_FILE restart

    log_info "Waiting for services to restart..."
    sleep 5

    check_health
}

# Backup Evolution API instances
backup_evolution() {
    local backup_dir="${VAYVA_DIR}/backups/evolution-$(date +%Y%m%d-%H%M%S)"

    log_info "Creating Evolution API backup at: $backup_dir"
    mkdir -p "$backup_dir"

    # Backup instances volume
    docker run --rm \
        -v vayva_evolution_instances:/data \
        -v "$backup_dir:/backup" \
        alpine tar czf /backup/instances.tar.gz -C /data .

    log_info "Backup created: $backup_dir/instances.tar.gz"
}

# Check API key consistency
check_api_keys() {
    log_info "Checking Evolution API key configuration..."

    # Get AUTHENTICATION_API_KEY from .env
    local auth_key=$(grep "^AUTHENTICATION_API_KEY=" .env | cut -d= -f2)

    if [ -z "$auth_key" ] || [ "$auth_key" = "change-me" ] || [ "$auth_key" = "change-me-to-a-strong-api-key" ]; then
        log_error "AUTHENTICATION_API_KEY not set in .env!"
        log_info "Please set a strong API key in .env"
        return 1
    fi

    log_info "AUTHENTICATION_API_KEY is configured"
    log_info "Ensure this matches EVOLUTION_API_KEY in /opt/vayva/worker.env"
}

# Main command handler
main() {
    case "${1:-status}" in
        update)
            check_directory
            check_api_keys
            backup_evolution
            update_services
            ;;
        logs)
            check_directory
            show_logs
            ;;
        status)
            check_directory
            check_health
            ;;
        whatsapp)
            check_directory
            show_whatsapp_logs
            ;;
        restart)
            check_directory
            restart_services
            ;;
        backup)
            check_directory
            backup_evolution
            ;;
        check-keys)
            check_directory
            check_api_keys
            ;;
        help|--help|-h)
            echo "Vayva VPS Deployment Helper"
            echo ""
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  update      - Pull latest images, backup, and restart services"
            echo "  logs        - Show logs for all services"
            echo "  status      - Check health status of all services"
            echo "  whatsapp    - Show WhatsApp/Evolution API specific logs"
            echo "  restart     - Restart all services"
            echo "  backup      - Backup Evolution API instances data"
            echo "  check-keys  - Verify API key configuration"
            echo "  help        - Show this help message"
            ;;
        *)
            log_error "Unknown command: $1"
            echo "Run '$0 help' for usage information"
            exit 1
            ;;
    esac
}

main "$@"
