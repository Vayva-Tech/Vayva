# OpenAI TTS Integration Setup Guide

## Overview
This guide explains how to set up OpenAI's ultra-realistic Text-to-Speech for human-like voice generation in your Vayva AI system.

## Prerequisites
- OpenAI API key (paid service)
- Node.js 18+
- Internet connectivity

## Setup Instructions

### 1. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key securely

### 2. Configure Environment Variables
Add your OpenAI API key to your environment:

```bash
# Add to your .env file
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Install Dependencies
The required OpenAI package is already included in the ai-agent package.json.

### 4. Test the Integration
Run the premium quality demo:

```bash
cd /path/to/vayva
npx tsx scripts/openai-tts-demo.ts
```

## Premium Voice Options

OpenAI provides 13 ultra-realistic voices optimized for different use cases:

### Premium Voices (Recommended)
- **Marin** - Female, premium quality, most natural sounding
- **Cedar** - Male, rich and deep, commanding presence

### Professional Voices
- **Nova** - Female, bright and optimistic
- **Onyx** - Male, professional and sophisticated
- **Coral** - Female, warm and inviting
- **Echo** - Male, deep and authoritative

### Specialized Voices
- **Shimmer** - Female, ethereal and gentle
- **Fable** - Neutral, narrative and educational
- **Alloy** - Neutral, balanced and versatile
- **Ash** - Neutral, young and energetic
- **Ballad** - Neutral, melodic and storytelling
- **Sage** - Neutral, wise and experienced
- **Verse** - Neutral, poetic and lyrical

## Key Features

### Ultra-Realistic Quality
- Advanced neural network trained on human speech
- Natural prosody, rhythm, and intonation
- Contextual emotional expression
- Professional voice actor base models

### Flexible Control
- **Emotional tone**: Control warmth, enthusiasm, professionalism
- **Speech speed**: Adjustable from 0.25x to 4.0x
- **Voice instructions**: Detailed guidance for specific delivery styles
- **Multiple formats**: MP3, WAV, Opus, AAC, FLAC, PCM

### Cost Structure
- **Pricing**: $15 per 1 million characters
- **Example**: 1000 characters ≈ $0.015
- **Typical merchant message**: 100-200 characters ≈ $0.0015-$0.003

## API Usage Examples

### Basic Usage
```typescript
import { OpenAITTSService } from "@vayva/ai-agent";

const service = OpenAITTSService.getInstance();

const result = await service.synthesize({
  text: "Hello! Welcome to our store.",
  voice: "marin",
  instructions: "Speak warmly and professionally"
});
```

### Advanced Configuration
```typescript
const result = await service.synthesize({
  text: "Your order is confirmed!",
  voice: "cedar",
  instructions: "Speak with excitement and urgency",
  speed: 1.1,
  responseFormat: "wav"
});
```

## Integration Benefits

### Compared to System Voices
| Feature | System Voices | OpenAI TTS |
|---------|---------------|------------|
| Quality | Robotic, basic | Human-like, natural |
| Emotional Range | Limited | Extensive |
| Voice Variety | 3-5 voices | 13 premium voices |
| Cost | Free | $15/M characters |
| Setup | Built-in | API key required |

### Business Value
- **Customer Experience**: Dramatically improved engagement
- **Brand Perception**: Professional, premium quality
- **Conversion Rates**: More compelling voice interactions
- **Competitive Edge**: Superior to most commercial alternatives

## Best Practices

### Voice Selection
- Use **Marin** or **Cedar** for primary customer interactions
- Match voice gender to your brand personality
- Consider target audience preferences

### Emotional Guidance
- Customer service: "Speak warmly and helpfully"
- Sales: "Speak confidently and persuasively"  
- Updates: "Speak clearly and informatively"
- Urgent matters: "Speak with appropriate urgency"

### Performance Optimization
- Cache frequently used phrases
- Use appropriate response formats (MP3 for web, WAV for editing)
- Monitor usage for cost management

## Troubleshooting

### Common Issues
1. **API Key Errors**: Verify OPENAI_API_KEY is set correctly
2. **Rate Limiting**: Implement exponential backoff for high-volume usage
3. **Quality Issues**: Try different voices or adjust instructions
4. **Latency**: Use streaming for real-time applications

### Support Resources
- [OpenAI TTS Documentation](https://platform.openai.com/docs/guides/text-to-speech)
- [OpenAI.FM Demo](https://www.openai.fm)
- Vayva development team

## Migration Path

For users wanting the highest quality human-like voices, OpenAI TTS provides the gold standard. The integration maintains backward compatibility with free alternatives while offering premium upgrade paths.