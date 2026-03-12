#!/usr/bin/env node

/**
 * TTS Integration Test Script
 * Tests the Qwen3-TTS integration with sample texts
 */

import { TTSService } from '../packages/ai-agent/src/lib/ai/tts-service';

async function runTests() {
  console.log('🚀 Starting TTS Integration Tests...\n');
  
  const ttsService = TTSService.getInstance();
  
  // Test 1: Get available voices
  console.log('📋 Test 1: Getting available voices...');
  try {
    const voices = await ttsService.getVoices();
    console.log('✅ Available voices:', voices.map(v => `${v.name} (${v.gender})`).join(', '));
  } catch (error) {
    console.error('❌ Failed to get voices:', error);
  }
  
  // Test 2: Basic TTS generation
  console.log('\n📝 Test 2: Generating basic speech...');
  try {
    const result = await ttsService.synthesize({
      text: "Hello! Welcome to our store. How can I help you today?",
      voice: "Vivian",
      language: "English",
      speed: 1.0
    });
    
    if ('error' in result) {
      console.error('❌ TTS generation failed:', result.error);
    } else {
      console.log('✅ TTS generated successfully!');
      console.log(`   - Audio size: ${result.audioBuffer.length} bytes`);
      console.log(`   - Content type: ${result.contentType}`);
      console.log(`   - Word count: ${result.wordCount}`);
    }
  } catch (error) {
    console.error('❌ TTS generation error:', error);
  }
  
  // Test 3: Emotional tone
  console.log('\n🎭 Test 3: Testing emotional tone...');
  try {
    const result = await ttsService.synthesize({
      text: "Great news! Your order has been confirmed and will arrive tomorrow!",
      voice: "Vivian",
      emotion: "enthusiastic",
      speed: 1.2
    });
    
    if ('error' in result) {
      console.error('❌ Emotional TTS failed:', result.error);
    } else {
      console.log('✅ Emotional TTS generated successfully!');
    }
  } catch (error) {
    console.error('❌ Emotional TTS error:', error);
  }
  
  // Test 4: Different voice profiles
  console.log('\n🗣️ Test 4: Testing different voice profiles...');
  const testProfiles = ['Vivian', 'Alex', 'Emma'];
  
  for (const profile of testProfiles) {
    try {
      const result = await ttsService.synthesize({
        text: `This is ${profile} speaking.`,
        voice: profile,
        language: "English"
      });
      
      if ('error' in result) {
        console.log(`❌ ${profile}: Failed - ${result.error}`);
      } else {
        console.log(`✅ ${profile}: Success (${result.audioBuffer.length} bytes)`);
      }
    } catch (error) {
      console.log(`❌ ${profile}: Error - ${error}`);
    }
  }
  
  // Test 5: Multilingual support
  console.log('\n🌍 Test 5: Testing multilingual support...');
  const multilingualTests = [
    { text: "你好，欢迎光临我们的店铺！", language: "Chinese", voice: "Vivian" },
    { text: "こんにちは、当店へようこそ！", language: "Japanese", voice: "Vivian" },
    { text: "Bonjour, bienvenue dans notre magasin!", language: "French", voice: "Vivian" }
  ];
  
  for (const test of multilingualTests) {
    try {
      const result = await ttsService.synthesize({
        text: test.text,
        voice: test.voice,
        language: test.language
      });
      
      if ('error' in result) {
        console.log(`❌ ${test.language}: Failed - ${result.error}`);
      } else {
        console.log(`✅ ${test.language}: Success (${result.audioBuffer.length} bytes)`);
      }
    } catch (error) {
      console.log(`❌ ${test.language}: Error - ${error}`);
    }
  }
  
  console.log('\n🏁 TTS Integration Tests Completed!');
}

// Run tests
runTests().catch(console.error);