// Test file to verify AI settings integration
import { getSettingsManager, type AISettings } from '@vayva/settings';

console.log('Testing AI Settings Integration...');

try {
  const settingsManager = getSettingsManager();
  const aiSettings: AISettings = settingsManager.getAISettings();
  
  console.log('✅ Successfully loaded AI settings:');
  console.log('- Tone:', aiSettings.personality.tone);
  console.log('- Response Length:', aiSettings.personality.responseLength);
  console.log('- Technical Level:', aiSettings.personality.technicalLevel);
  console.log('- Proactivity:', aiSettings.personality.proactivity);
  console.log('- Emoji Usage:', aiSettings.personality.emojiUsage);
  console.log('- Industry Jargon:', aiSettings.personality.useIndustryJargon);
  
  console.log('\n✅ AI Settings integration is working!');
  console.log('Ready for production use.');
  
} catch (error) {
  console.error('❌ Error loading AI settings:', error);
  process.exit(1);
}