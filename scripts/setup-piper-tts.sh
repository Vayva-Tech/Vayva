#!/usr/bin/env bash

# Piper TTS Setup Script
# Installs high-quality, realistic neural TTS voices locally

echo "🚀 Setting up Piper TTS for realistic human-like voices..."

# Create directory for Piper
PIPER_DIR="$HOME/piper-tts"
mkdir -p "$PIPER_DIR"
cd "$PIPER_DIR"

# Download Piper executable (macOS ARM64)
echo "📥 Downloading Piper TTS executable..."
curl -L -o piper.tar.gz "https://github.com/rhasspy/piper/releases/latest/download/piper_macos_arm64.tar.gz"
tar -xzf piper.tar.gz
rm piper.tar.gz

# Make executable
chmod +x piper

# Download high-quality voices
echo "🎤 Downloading realistic voice models..."

# Female voice - very natural sounding
curl -L -o "en_US-lessac-medium.onnx" "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx"
curl -L -o "en_US-lessac-medium.onnx.json" "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json"

# Male voice - professional sounding  
curl -L -o "en_US-danny-low.onnx" "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/danny/low/en_US-danny-low.onnx"
curl -L -o "en_US-danny-low.onnx.json" "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/danny/low/en_US-danny-low.onnx.json"

# Expressive female voice
curl -L -o "en_GB-alan-medium.onnx" "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/alan/medium/en_GB-alan-medium.onnx"
curl -L -o "en_GB-alan-medium.onnx.json" "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/alan/medium/en_GB-alan-medium.onnx.json"

echo "✅ Piper TTS setup complete!"
echo ""
echo "Available voices:"
echo "• en_US-lessac-medium (Female - Natural)"
echo "• en_US-danny-low (Male - Professional)"  
echo "• en_GB-alan-medium (Female - Expressive)"
echo ""
echo "To test: echo 'Hello world' | $PIPER_DIR/piper -m en_US-lessac-medium.onnx --output_file test.wav"

# Add to PATH for easy access
echo "" >> ~/.zshrc
echo "# Piper TTS" >> ~/.zshrc
echo "export PATH=\"$PIPER_DIR:\$PATH\"" >> ~/.zshrc

echo "💡 Added Piper to PATH. Restart terminal or run: source ~/.zshrc"