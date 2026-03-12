#!/usr/bin/env node
/**
 * CLI for running load tests
 */

import { LoadTestFramework, ScenarioOptions } from './index';
import * as apiScenarios from './scenarios/api-load';
import * as checkoutScenarios from './scenarios/checkout-load';

// Safety check for production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ FATAL: Load tests cannot run against production environment');
  process.exit(1);
}

const framework = new LoadTestFramework({
  defaultBaseUrl: process.env.TARGET_URL || 'http://localhost:3000',
  defaultConcurrency: parseInt(process.env.CONCURRENCY || '50'),
  defaultDuration: parseInt(process.env.DURATION_SEC || '30'),
  defaultRampUp: parseInt(process.env.RAMP_UP_SEC || '5'),
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
  followRedirects: true,
});

// Register all scenarios
Object.entries(apiScenarios).forEach(([name, scenario]) => {
  if (typeof scenario === 'object' && 'execute' in scenario) {
    framework.registerScenario(scenario.name, scenario);
  }
});

Object.entries(checkoutScenarios).forEach(([name, scenario]) => {
  if (typeof scenario === 'object' && 'execute' in scenario) {
    framework.registerScenario(scenario.name, scenario);
  }
});

// Parse CLI arguments
const args = process.argv.slice(2);
const scenarioName = args[0];

if (!scenarioName) {
  console.log('Vayva Load Test CLI');
  console.log('===================');
  console.log('');
  console.log('Usage: load-test <scenario-name> [options]');
  console.log('');
  console.log('Available scenarios:');
  framework['registry'].list().forEach((name: string) => {
    console.log(`  - ${name}`);
  });
  console.log('');
  console.log('Environment variables:');
  console.log('  TARGET_URL      - Target base URL (default: http://localhost:3000)');
  console.log('  CONCURRENCY     - Number of concurrent workers (default: 50)');
  console.log('  DURATION_SEC    - Test duration in seconds (default: 30)');
  console.log('  RAMP_UP_SEC     - Ramp-up time in seconds (default: 5)');
  console.log('  REQUEST_TIMEOUT - Request timeout in milliseconds (default: 30000)');
  console.log('  TEST_AUTH_TOKEN - Auth token for authenticated endpoints');
  process.exit(0);
}

// Parse options
const options: ScenarioOptions = {};
for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const [key, value] = arg.slice(2).split('=');
    switch (key) {
      case 'concurrency':
        options.concurrency = parseInt(value);
        break;
      case 'duration':
        options.duration = parseInt(value);
        break;
      case 'ramp-up':
        options.rampUp = parseInt(value);
        break;
      case 'base-url':
        options.baseUrl = value;
        break;
      case 'max-rps':
        options.maxRps = parseInt(value);
        break;
      case 'stop-on-error':
        options.stopOnError = value === 'true';
        break;
    }
  }
}

// Run the scenario
async function main() {
  try {
    const result = await framework.runScenario(scenarioName, options);
    
    // Exit with error code if test failed
    if (result.summary.failedRequests > result.summary.successfulRequests) {
      console.error('\n❌ Load test failed: More failures than successes');
      process.exit(1);
    }
    
    console.log('\n✅ Load test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Load test error:', error);
    process.exit(1);
  }
}

main();
