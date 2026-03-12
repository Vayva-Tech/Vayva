#!/usr/bin/env node

/**
 * Audio Player for TTS Output
 * Plays generated speech files using system audio
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

async function playAudio(buffer: Buffer, filename: string = 'speech.wav') {
  try {
    // Write audio to temporary file
    const tempPath = join(tmpdir(), filename);
    await writeFile(tempPath, buffer);
    
    // Play audio using system player
    console.log(`🔊 Playing: ${filename}`);
    
    // Use afplay on macOS (built-in audio player)
    await execAsync(`afplay "${tempPath}"`);
    
    console.log('✅ Playback completed');
  } catch (error) {
    console.error('❌ Playback failed:', error);
  }
}

async function generateAndPlay(text: string, voice: string = 'Vivian', speed: number = 1.0) {
  try {
    console.log(`\n🎙️  Generating speech with ${voice} (speed: ${speed}x)`);
    console.log(`📝 Text: "${text}"`);
    
    // Make API call to generate speech
    const response = await fetch('http://localhost:3000/api/merchant/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice,
        speed,
        language: 'English'
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const audioBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);
    
    console.log(`✅ Generated ${buffer.length} bytes of audio`);
    
    // Play the audio
    await playAudio(buffer, `speech-${voice}-${Date.now()}.wav`);
    
  } catch (error) {
    console.error('❌ Generation failed:', error);
  }
}

async function main() {
  console.log('🎵 TTS Audio Player Demo');
  console.log('========================\n');
  
  // Test different voices and scenarios
  const demos = [
    {
      text: "Hello! Welcome to our store. How can I help you today?",
      voice: "Vivian",
      speed: 1.0
    },
    {
      text: "I'd recommend our premium collection. The quality is exceptional.",
      voice: "Alex", 
      speed: 0.9
    },
    {
      text: "Great news! Your order has been confirmed and will arrive tomorrow!",
      voice: "Emma",
      speed: 1.1
    }
  ];
  
  for (const demo of demos) {
    await generateAndPlay(demo.text, demo.voice, demo.speed);
    // Small pause between demos
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 Demo completed! All voices played successfully.');
}

// Run the demo
main().catch(console.error);