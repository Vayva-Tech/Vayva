#!/usr/bin/env node

/**
 * OpenAI TTS Premium Quality Demo
 * Demonstrates ultra-realistic, human-like voices
 */

import { OpenAITTSService } from '../packages/ai-agent/src/lib/ai/openai-tts-service';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

async function playAudio(buffer: Buffer, description: string) {
  try {
    const tempPath = join(tmpdir(), `openai-tts-${Date.now()}.mp3`);
    await writeFile(tempPath, buffer);
    
    console.log(`🔊 Playing: ${description} (${buffer.length} bytes)`);
    await execAsync(`afplay "${tempPath}"`);
    
    // Clean up
    const fs = await import('fs');
    fs.unlinkSync(tempPath);
    
    console.log('✅ Playback completed\n');
  } catch (error) {
    console.error('❌ Playback failed:', error);
  }
}

async function main() {
  console.log('🌟 OpenAI TTS Premium Quality Demo');
  console.log('===================================\n');
  
  // Check if API key is available
  const service = OpenAITTSService.getInstance();
  
  if (!service.isAvailable()) {
    console.log('❌ OpenAI API key not found!');
    console.log('Please set OPENAI_API_KEY environment variable');
    console.log('export OPENAI_API_KEY=your_api_key_here');
    return;
  }
  
  console.log('✅ OpenAI TTS service available\n');
  
  console.log('Premium Voice Options:');
  const voices = service.getVoices();
  voices.forEach((voice, index) => {
    console.log(`${index + 1}. ${voice.name} (${voice.gender}) - ${voice.description}`);
  });
  
  console.log('\n🎙️  Demonstrating ultra-realistic voices:\n');
  
  // Premium voice demonstrations
  const premiumDemos = [
    {
      name: "Marin - Premium Female Voice",
      text: "Good morning! Welcome to our premium service experience. I'm delighted to assist you with your personalized consultation today.",
      voice: "marin",
      emotion: "warm and professional"
    },
    {
      name: "Cedar - Premium Male Voice", 
      text: "Based on our comprehensive analysis, I'd recommend our enterprise solution. The strategic advantages are truly compelling for your organization.",
      voice: "cedar",
      emotion: "confident and authoritative"
    },
    {
      name: "Nova - Bright Female Voice",
      text: "Fantastic news! Your custom project has been accelerated and will be delivered ahead of schedule with premium quality enhancements!",
      voice: "nova",
      emotion: "excited and upbeat"
    },
    {
      name: "Onyx - Professional Male Voice",
      text: "I completely understand your concerns. Let me ensure this matter is resolved to your complete satisfaction with our dedicated support team.",
      voice: "onyx",
      emotion: "reassuring and professional"
    }
  ];
  
  for (const demo of premiumDemos) {
    console.log(`🎤 ${demo.name}`);
    console.log(`💭 Emotion: ${demo.emotion}`);
    console.log(`📝 Text: "${demo.text}"`);
    
    try {
      const result = await service.synthesize({
        text: demo.text,
        voice: demo.voice,
        instructions: `Speak in a ${demo.emotion} manner`,
        responseFormat: "mp3"
      });
      
      if ('error' in result) {
        console.log(`❌ Failed: ${result.error}\n`);
        continue;
      }
      
      console.log(`✅ Generated successfully (${result.audioBuffer.length} bytes)`);
      await playAudio(result.audioBuffer, demo.name);
      
      // Show cost estimation
      const cost = service.estimateCost({
        text: demo.text,
        voice: demo.voice
      });
      console.log(`💰 Estimated cost: $${cost.toFixed(4)} USD\n`);
      
    } catch (error) {
      console.log(`❌ Error: ${error}\n`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('🎉 Premium TTS demonstration completed!');
  console.log('\n💎 Why OpenAI TTS Sounds Human-like:');
  console.log('• Advanced neural network trained on human speech patterns');
  console.log('• Natural prosody, rhythm, and intonation');
  console.log('• Contextual understanding of emotional tone');
  console.log('• Ultra-low latency with high fidelity output');
  console.log('• Professional voice actors as base models');
  console.log('• Dynamic speech characteristics adjustment');
  
  console.log('\n🚀 This is the quality level you were looking for!');
  console.log('These voices are virtually indistinguishable from human speakers.');
}

// Run the premium demonstration
main().catch(console.error);