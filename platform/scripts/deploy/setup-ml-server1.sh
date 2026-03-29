#!/bin/bash
# ============================================================================
# ML SERVER 1 SETUP SCRIPT
# Deploy Ollama, Qdrant, and Embedding Service
# ============================================================================

set -e

echo "🚀 Starting ML Server 1 Setup..."
echo ""

# Configuration
ML_SERVER1_IP="${ML_SERVER1_IP:-localhost}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.ml-server1.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Step 1: Check Docker installation
print_status "Step 1/6: Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    print_status "Docker installed successfully. Please reconnect SSH for group changes to take effect."
    exit 1
fi

docker_version=$(docker --version)
print_status "Docker found: $docker_version"

# Step 2: Check Docker Compose
print_status "Step 2/6: Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi

compose_version=$(docker-compose --version)
print_status "Docker Compose found: $compose_version"

# Step 3: Verify compose file exists
print_status "Step 3/6: Verifying deployment configuration..."
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "Compose file not found: $COMPOSE_FILE"
    exit 1
fi
print_status "Compose file verified: $COMPOSE_FILE"

# Step 4: Pull Docker images
print_status "Step 4/6: Pulling Docker images..."
docker-compose -f "$COMPOSE_FILE" pull

# Step 5: Start services
print_status "Step 5/6: Starting ML services..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for services to be healthy
print_info "Waiting for services to start (this may take 2-3 minutes)..."
sleep 30

# Step 6: Verify services
print_status "Step 6/6: Verifying service health..."

# Check Ollama
print_info "Checking Ollama..."
if curl -f http://localhost:11434/api/tags &> /dev/null; then
    print_status "Ollama is running and healthy"
else
    print_error "Ollama health check failed"
    docker logs ml-ollama
fi

# Check Qdrant
print_info "Checking Qdrant..."
if curl -f http://localhost:6333/ &> /dev/null; then
    print_status "Qdrant is running and healthy"
else
    print_error "Qdrant health check failed"
    docker logs ml-qdrant
fi

# Check Embedding Service
print_info "Checking Embedding Service..."
if curl -f http://localhost:8001/health &> /dev/null; then
    print_status "Embedding Service is running and healthy"
else
    print_error "Embedding Service health check failed"
    docker logs ml-embedding-service
fi

# Display summary
echo ""
echo "============================================="
print_status "ML Server 1 Setup Complete!"
echo "============================================="
echo ""
echo "Services running:"
echo "  • Ollama (LLM):       http://localhost:11434"
echo "  • Qdrant (Vector DB): http://localhost:6333"
echo "  • Embedding Service:  http://localhost:8001"
echo ""
echo "Next steps:"
echo "  1. Pull Phi-3 Mini model: docker exec -it ml-ollama ollama pull phi3:mini"
echo "  2. Test Ollama: curl http://localhost:11434/api/generate -d '{\"model\":\"phi3:mini\",\"prompt\":\"Hello\",\"stream\":false}'"
echo "  3. Test Qdrant: curl http://localhost:6333/collections"
echo "  4. Test Embedding: curl -X POST http://localhost:8001/embed -H 'Content-Type: application/json' -d '{\"text\":\"Hello world\"}'"
echo ""
print_info "To view logs: docker-compose -f $COMPOSE_FILE logs -f"
print_info "To stop services: docker-compose -f $COMPOSE_FILE down"
print_info "To restart services: docker-compose -f $COMPOSE_FILE restart"
echo ""
