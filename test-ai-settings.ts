// Test file to verify AI settings integration
import { getSettingsManager, type AISettings } from '@vayva/settings';

console.warn('Testing AI Settings Integration...');

try {
  const settingsManager = getSettingsManager();
  const aiSettings: AISettings = settingsManager.getAISettings();
  
  console.warn('✅ Successfully loaded AI settings:');
  console.warn('- Tone:', aiSettings.personality.tone);
  console.warn('- Response Length:', aiSettings.personality.responseLength);
  console.warn('- Technical Level:', aiSettings.personality.technicalLevel);
  console.warn('- Proactivity:', aiSettings.personality.proactivity);
  console.warn('- Emoji Usage:', aiSettings.personality.emojiUsage);
  console.warn('- Industry Jargon:', aiSettings.personality.useIndustryJargon);
  
  console.warn('\n✅ AI Settings integration is working!');
  console.warn('Ready for production use.');
  
} catch (error) {
  console.error('❌ Error loading AI settings:', error);
  process.exit(1);
}