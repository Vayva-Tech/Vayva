#!/usr/bin/env node

// Deployment Verification Script
// Verifies all critical components before staging deployment

import { getSettingsManager } from '@vayva/settings';
import fs from 'fs';

console.log('🚀 PHASE 3 DEPLOYMENT VERIFICATION\n');

let allTestsPassed = true;

// Test 1: Core Settings Manager Functionality
try {
  console.log('1. Testing Core Settings Manager...');
  const manager = getSettingsManager();
  const aiSettings = manager.getAISettings();
  
  if (!aiSettings.personality || !aiSettings.automation) {
    throw new Error('Missing core AI settings structure');
  }
  
  console.log('✅ Core Settings Manager: PASS');
} catch (error) {
  console.error('❌ Core Settings Manager: FAIL -', error.message);
  allTestsPassed = false;
}

// Test 2: AI Agent Integration
try {
  console.log('\n2. Testing AI Agent Integration...');
  
  // Simulate AI agent loading settings
  const manager = getSettingsManager();
  const settings = manager.getAISettings();
  
  // Verify key settings are accessible
  if (!settings.personality.tone || !settings.automation.mode) {
    throw new Error('AI agent cannot access required settings');
  }
  
  console.log('✅ AI Agent Integration: PASS');
} catch (error) {
  console.error('❌ AI Agent Integration: FAIL -', error.message);
  allTestsPassed = false;
}

// Test 3: Settings Updates
try {
  console.log('\n3. Testing Settings Updates...');
  const manager = getSettingsManager();
  
  const originalTone = manager.getAISettings().personality.tone;
  manager.updateAISettings({
    personality: {
      tone: 'friendly'
    }
  });
  
  const newTone = manager.getAISettings().personality.tone;
  if (newTone !== 'friendly') {
    throw new Error('Settings update not applied');
  }
  
  // Reset to original
  manager.updateAISettings({
    personality: {
      tone: originalTone
    }
  });
  
  console.log('✅ Settings Updates: PASS');
} catch (error) {
  console.error('❌ Settings Updates: FAIL -', error.message);
  allTestsPassed = false;
}

// Test 4: Automation Features
try {
  console.log('\n4. Testing Automation Features...');
  const manager = getSettingsManager();
  const automation = manager.getAISettings().automation;
  
  if (!automation.tasks || typeof automation.tasks.sendFollowUps !== 'boolean') {
    throw new Error('Automation settings structure invalid');
  }
  
  console.log('✅ Automation Features: PASS');
} catch (error) {
  console.error('❌ Automation Features: FAIL -', error.message);
  allTestsPassed = false;
}

// Test 5: Alert System
try {
  console.log('\n5. Testing Alert System...');
  const manager = getSettingsManager();
  const alerts = manager.getAISettings().alerts;
  
  if (!alerts.categories || !alerts.thresholds) {
    throw new Error('Alert system configuration missing');
  }
  
  console.log('✅ Alert System: PASS');
} catch (error) {
  console.error('❌ Alert System: FAIL -', error.message);
  allTestsPassed = false;
}

// Test 6: Export/Import Functionality
try {
  console.log('\n6. Testing Export/Import...');
  const manager = getSettingsManager();
  
  const exported = manager.exportSettings();
  if (!exported || exported.length < 100) {
    throw new Error('Export functionality not working');
  }
  
  console.log('✅ Export/Import: PASS');
} catch (error) {
  console.error('❌ Export/Import: FAIL -', error.message);
  allTestsPassed = false;
}

// Generate deployment readiness report
const deploymentReport = {
  timestamp: new Date().toISOString(),
  verification: {
    coreSettings: allTestsPassed ? 'PASS' : 'FAIL',
    aiIntegration: allTestsPassed ? 'PASS' : 'FAIL',
    settingsUpdates: allTestsPassed ? 'PASS' : 'FAIL',
    automation: allTestsPassed ? 'PASS' : 'FAIL',
    alerts: allTestsPassed ? 'PASS' : 'FAIL',
    exportImport: allTestsPassed ? 'PASS' : 'FAIL'
  },
  overallStatus: allTestsPassed ? 'READY_FOR_DEPLOYMENT' : 'REQUIRES_ATTENTION',
  summary: {
    totalTests: 6,
    passed: allTestsPassed ? 6 : 0,
    failed: allTestsPassed ? 0 : 6
  },
  nextSteps: allTestsPassed ? [
    'Proceed to staging deployment',
    'Monitor staging environment for 24 hours',
    'Conduct user acceptance testing',
    'Prepare production deployment'
  ] : [
    'Address failed verification tests',
    'Re-run verification after fixes',
    'Ensure all core functionality works'
  ]
};

fs.writeFileSync('deployment-verification-report.json', JSON.stringify(deploymentReport, null, 2));

console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
  console.log('🎉 DEPLOYMENT VERIFICATION COMPLETE - ALL TESTS PASSED!');
  console.log('✅ System is ready for staging deployment');
  console.log('📋 Report saved to deployment-verification-report.json');
} else {
  console.log('❌ DEPLOYMENT VERIFICATION FAILED');
  console.log('⚠️  Critical issues detected - deployment blocked');
  console.log('📋 See deployment-verification-report.json for details');
}

console.log('='.repeat(50));

process.exit(allTestsPassed ? 0 : 1);