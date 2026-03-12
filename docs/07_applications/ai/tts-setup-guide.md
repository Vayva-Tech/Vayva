# Qwen3-TTS Integration Setup Guide

## Overview
This guide explains how to set up Qwen3-TTS as a free alternative to ElevenLabs for voice generation in your Vayva AI system.

## Prerequisites
- Node.js 18+
- Python 3.12+ (for Qwen3-TTS server)
- CUDA-compatible GPU (recommended, 8GB+ VRAM)
- Docker (optional, for containerized deployment)

## Installation Options

### Option 1: Local Qwen3-TTS Server (Recommended)

1. **Clone the Qwen3-TTS server repository:**
```bash
git clone https://github.com/linyimin0812/qwen3-tts-service.git
cd qwen3-tts-service
```

2. **Install dependencies:**
```bash
# Install uv (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Sync dependencies
uv sync
```

3. **Start the server:**
```bash
uv run python main.py
# or
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

The server will be available at `http://localhost:8000`

### Option 2: Docker Deployment

1. **Build and run with Docker:**
```bash
docker build -t qwen3-tts-service .
docker run -p 8000:8000 --gpus all qwen3-tts-service
```

### Option 3: RunPod Deployment

For cloud deployment, you can use RunPod with the optimized Docker image.

## Environment Configuration

Add these environment variables to your `.env` file:

```bash
# Qwen3-TTS Configuration
QWEN3_TTS_API_URL=http://localhost:8000
QWEN3_TTS_API_KEY=your_api_key_here  # Optional
```

## Testing the Integration

1. **Run the test script:**
```bash
cd /path/to/vayva
npx tsx scripts/test-tts-integration.ts
```

2. **Test via API:**
```bash
# Get available voices
curl http://localhost:3000/api/merchant/tts

# Generate speech
curl -X POST http://localhost:3000/api/merchant/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello! Welcome to our store.",
    "voice": "Vivian",
    "language": "English"
  }' \
  --output output.wav
```

## Available Features

### Voice Profiles
- **Vivian**: Female, natural pronunciation
- **Alex**: Male, warm tone
- **Emma**: Female, friendly demeanor

### Supported Languages
- Chinese
- English
- Japanese
- Korean
- German
- French
- Russian
- Portuguese
- Spanish
- Italian

### Advanced Features
- **Emotion Control**: Adjust emotional tone (friendly, professional, enthusiastic, etc.)
- **Speed Control**: Modify speech speed (0.5x - 2.0x)
- **Voice Cloning**: Create custom voices from audio samples
- **Real-time Streaming**: Low-latency speech generation

## UI Integration

The voice settings are now available in the Merchant Admin dashboard:
1. Navigate to Settings → AI Agent
2. Scroll to "Voice Generation" section
3. Toggle "Enable Voice Responses"
4. Configure voice profile, speed, and emotional tone

## Troubleshooting

### Common Issues

1. **Server not starting**: Ensure Python 3.12+ and required dependencies are installed
2. **CUDA errors**: Verify GPU drivers and CUDA installation
3. **API connection failed**: Check QWEN3_TTS_API_URL in environment variables
4. **Poor voice quality**: Try different voice profiles or adjust speed settings

### Performance Optimization

1. **GPU Acceleration**: Use `--gpus all` flag with Docker
2. **Model Caching**: Models are cached in `/root/.cache/` after first download
3. **Batch Processing**: For multiple requests, consider batching text inputs

## Cost Analysis

**Qwen3-TTS is completely free** with no usage limits or API costs, unlike ElevenLabs which charges per character.

| Feature | Qwen3-TTS | ElevenLabs |
|---------|-----------|------------|
| Cost | Free | $0.0005/character |
| Voice Cloning | ✓ | ✓ |
| Multilingual | ✓ (10 languages) | ✓ (30+ languages) |
| Emotion Control | ✓ | ✓ |
| Custom Voices | ✓ | ✓ |
| Rate Limits | None | 50,000 chars/day (free tier) |

## Future Enhancements

Planned improvements:
- [ ] Coqui TTS local integration for enhanced privacy
- [ ] Voice cloning from merchant's own voice samples
- [ ] Real-time voice streaming for live chat
- [ ] Custom voice training interface
- [ ] Voice analytics and performance metrics

## Support

For issues or questions:
- Check the [Qwen3-TTS GitHub repository](https://github.com/QwenLM/Qwen3-TTS)
- Review the [official documentation](https://qwen.ai/blog?id=qwen3-tts-1128)
- Contact the Vayva development team