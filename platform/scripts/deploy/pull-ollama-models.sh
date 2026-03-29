#!/bin/bash
# ============================================================================
# PULL MODELS FOR OLLAMA
# Download and prepare LLM models for inference
# ============================================================================

set -e

echo "🤖 Pulling Ollama Models..."
echo ""

# Configuration
PRIMARY_MODEL="${1:-phi3:mini}"
BACKUP_MODEL="${2:-mistral:7b}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if Ollama is running
if ! curl -f http://localhost:11434/api/tags &> /dev/null; then
    echo "Error: Ollama is not running. Please start it first."
    exit 1
fi

print_status "Ollama is running"

# Pull primary model
print_info "Pulling primary model: $PRIMARY_MODEL"
docker exec -it ml-ollama ollama pull $PRIMARY_MODEL
print_status "$PRIMARY_MODEL downloaded successfully"

# Pull backup model (optional)
if [ -n "$BACKUP_MODEL" ]; then
    print_info "Pulling backup model: $BACKUP_MODEL"
    docker exec -it ml-ollama ollama pull $BACKUP_MODEL
    print_status "$BACKUP_MODEL downloaded successfully"
fi

# List available models
echo ""
print_status "Available models:"
docker exec ml-ollama ollama list

echo ""
echo "============================================="
print_status "Model Pulling Complete!"
echo "============================================="
echo ""
echo "Test the models:"
echo "  • Phi-3 Mini: curl http://localhost:11434/api/generate -d '{\"model\":\"phi3:mini\",\"prompt\":\"What is machine learning?\",\"stream\":false}'"
echo "  • Mistral 7B: curl http://localhost:11434/api/generate -d '{\"model\":\"mistral:7b\",\"prompt\":\"Explain quantum computing\",\"stream\":false}'"
echo ""
