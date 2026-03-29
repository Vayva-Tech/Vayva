#!/bin/bash
# ============================================================================
# ML INFRASTRUCTURE HEALTH CHECK
# Monitor all ML services and display status
# ============================================================================

echo "🏥 ML Infrastructure Health Check"
echo "=================================="
echo ""

# Configuration
OLLAMA_URL="http://localhost:11434"
QDRANT_URL="http://localhost:6333"
EMBEDDING_URL="http://localhost:8001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_service() {
    local name=$1
    local url=$2
    
    if curl -f --silent --max-time 5 "$url" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $name: HEALTHY"
        return 0
    else
        echo -e "${RED}✗${NC} $name: DOWN"
        return 1
    fi
}

# Check Ollama
check_service "Ollama (LLM)" "$OLLAMA_URL/api/tags"
if [ $? -eq 0 ]; then
    # Get model list
    models=$(curl -s "$OLLAMA_URL/api/tags" | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | tr '\n' ', ' | sed 's/,$//')
    if [ -n "$models" ]; then
        echo "   Models: $models"
    fi
fi

# Check Qdrant
check_service "Qdrant (Vector DB)" "$QDRANT_URL/"
if [ $? -eq 0 ]; then
    # Get collection count
    collections=$(curl -s "$QDRANT_URL/collections" | grep -o '"collections":\[' | wc -l)
    if [ "$collections" -gt 0 ]; then
        echo "   Collections: Active"
    else
        echo "   Collections: None yet"
    fi
fi

# Check Embedding Service
check_service "Embedding Service" "$EMBEDDING_URL/health"
if [ $? -eq 0 ]; then
    # Get health details
    health=$(curl -s "$EMBEDDING_URL/health")
    model_loaded=$(echo "$health" | grep -o '"model_loaded":true' || echo "")
    if [ -n "$model_loaded" ]; then
        echo "   Model: Loaded ✓"
    else
        echo "   Model: Loading..."
    fi
fi

echo ""
echo "Docker Container Status:"
echo "------------------------"
docker ps --filter "name=ml-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "No containers found"

echo ""
echo "Resource Usage:"
echo "---------------"
echo "Memory:"
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}" ml-ollama ml-qdrant ml-embedding-service 2>/dev/null || echo "Stats unavailable"

echo ""
echo "============================================="
echo "Health check complete!"
echo "============================================="
