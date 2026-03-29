#!/bin/bash
# ============================================================================
# START LOCAL ML INFRASTRUCTURE
# Deploy Ollama, Qdrant, Neo4j, and Embedding Service locally
# ============================================================================

set -e

echo "🚀 Starting Local ML Infrastructure..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check Docker
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop first."
    exit 1
fi
print_status "Docker is running"

# Stop and remove existing containers
print_info "Cleaning up existing containers..."
docker rm -f vayva-ollama-local vayva-qdrant-local vayva-embedding-local vayva-neo4j-local 2>/dev/null || true

# Start Ollama
print_info "Starting Ollama (LLM inference)..."
docker run -d \
  --name vayva-ollama-local \
  --restart unless-stopped \
  -p 11434:11434 \
  -v ollama_local:/root/.ollama \
  -e OLLAMA_MODELS=/root/.ollama/models \
  --memory=10g \
  ollama/ollama:latest

print_status "Ollama started on http://localhost:11434"

# Start Qdrant
print_info "Starting Qdrant (vector database)..."
docker run -d \
  --name vayva-qdrant-local \
  --restart unless-stopped \
  -p 6333:6333 \
  -p 6334:6334 \
  -v qdrant_local:/qdrant/storage \
  --memory=4g \
  qdrant/qdrant:latest

print_status "Qdrant started on http://localhost:6333"

# Start Neo4j
print_info "Starting Neo4j (graph database)..."
docker run -d \
  --name vayva-neo4j-local \
  --restart unless-stopped \
  -p 7474:7474 \
  -p 7687:7687 \
  -v neo4j_local:/data \
  -e NEO4J_AUTH=neo4j/local_password_123 \
  -e NEO4J_dbms_memory_heap_initial__size=2G \
  -e NEO4J_dbms_memory_heap_max__size=4G \
  --memory=6g \
  neo4j:5-community

print_status "Neo4j started on http://localhost:7474"

# Wait for services to initialize
print_info "Waiting for services to initialize (30 seconds)..."
sleep 30

# Start Embedding Service
print_info "Starting Embedding Service..."
cd /Users/fredrick/Documents/Vayva-Tech/vayva/apps/ml-embeddings
docker build -t vayva-embedding-local . || {
    print_error "Failed to build embedding service"
    exit 1
}

docker run -d \
  --name vayva-embedding-local \
  --restart unless-stopped \
  -p 8001:8001 \
  -e MODEL_NAME=BAAI/bge-m3 \
  -e PORT=8001 \
  -e DEVICE=cpu \
  --memory=4g \
  vayva-embedding-local

print_status "Embedding Service started on http://localhost:8001"

# Wait for all services to be healthy
print_info "Waiting for all services to be healthy (60 seconds)..."
sleep 60

# Verify services
echo ""
print_status "Verifying service health..."

# Check Ollama
if curl -f http://localhost:11434/api/tags > /dev/null 2>&1; then
    print_status "✓ Ollama is healthy"
else
    print_error "✗ Ollama health check failed"
fi

# Check Qdrant
if curl -f http://localhost:6333/ > /dev/null 2>&1; then
    print_status "✓ Qdrant is healthy"
else
    print_error "✗ Qdrant health check failed"
fi

# Check Neo4j
if wget -q --spider http://localhost:7474 > /dev/null 2>&1; then
    print_status "✓ Neo4j is healthy"
else
    print_error "✗ Neo4j health check failed"
fi

# Check Embedding Service
if curl -f http://localhost:8001/health > /dev/null 2>&1; then
    print_status "✓ Embedding Service is healthy"
else
    print_error "✗ Embedding Service health check failed"
fi

echo ""
echo "============================================="
print_status "Local ML Infrastructure Started!"
echo "============================================="
echo ""
echo "Services running:"
echo "  • Ollama (LLM):         http://localhost:11434"
echo "  • Qdrant (Vector DB):   http://localhost:6333/dashboard"
echo "  • Neo4j (Graph DB):     http://localhost:7474"
echo "  • Embedding Service:    http://localhost:8001"
echo ""
echo "Next steps:"
echo "  1. Pull Phi-3 Mini model:"
echo "     docker exec -it vayva-ollama-local ollama pull phi3:mini"
echo ""
echo "  2. Test Ollama:"
echo "     curl http://localhost:11434/api/generate -d '{\"model\":\"phi3:mini\",\"prompt\":\"Hello\",\"stream\":false}'"
echo ""
echo "  3. Access Qdrant Dashboard:"
echo "     open http://localhost:6333/dashboard"
echo ""
echo "  4. Access Neo4j Browser:"
echo "     open http://localhost:7474"
echo "     Username: neo4j"
echo "     Password: local_password_123"
echo ""
print_info "To view logs: docker logs -f <container-name>"
print_info "To stop all services: ./scripts/start-local-ml.sh stop"
echo ""
