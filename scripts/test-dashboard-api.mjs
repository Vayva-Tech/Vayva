#!/usr/bin/env node

/**
 * Dashboard API Test Script
 * Tests the universal dashboard and industry configuration endpoints
 */

import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

// Test configuration
const TEST_STORE_ID = 'test_store_123';
const BASE_URL = 'http://localhost:3000'; // Adjust based on your dev server

// Test industries to verify
const TEST_INDUSTRIES = [
  'retail',
  'fashion',
  'food',
  'services',
  'real_estate',
  'education',
  'automotive',
  'travel_hospitality',
  'nonprofit'
];

async function waitForServer(port: number, maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`http://localhost:${port}/api/health`);
      if (response.ok) {
        console.log(`✅ Server ready on port ${port}`);
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    
    console.log(`⏳ Waiting for server... (${i + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('❌ Server failed to start');
  return false;
}

async function testUniversalDashboard() {
  console.log('\n🧪 Testing Universal Dashboard Endpoint');
  console.log('=====================================');
  
  try {
    // Test different time ranges
    const ranges = ['today', 'week', 'month'];
    
    for (const range of ranges) {
      console.log(`\nTesting range: ${range}`);
      
      const response = await fetch(`${BASE_URL}/api/dashboard/universal?range=${range}`, {
        headers: {
          'Authorization': `Bearer test-token-${TEST_STORE_ID}`,
          'X-Store-ID': TEST_STORE_ID
        }
      });
      
      if (!response.ok) {
        console.log(`❌ Failed for range ${range}: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      // Validate response structure
      const requiredFields = ['success', 'data', 'timestamp'];
      const missingFields = requiredFields.filter(field => !(field in data));
      
      if (missingFields.length > 0) {
        console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
        continue;
      }
      
      // Validate data structure
      const dataFields = ['kpis', 'metrics', 'overview', 'todosAlerts', 'activity', 'primaryObjects', 'storeInfo'];
      const missingDataFields = dataFields.filter(field => !(field in data.data));
      
      if (missingDataFields.length > 0) {
        console.log(`❌ Missing data fields: ${missingDataFields.join(', ')}`);
        continue;
      }
      
      console.log(`✅ Range ${range} - Success`);
      console.log(`   - KPIs: ${Object.keys(data.data.kpis).length} metrics`);
      console.log(`   - Cache Status: ${response.headers.get('X-Cache') || 'Not set'}`);
      console.log(`   - Response Time: ${response.headers.get('X-Response-Time') || 'Not measured'}`);
    }
    
  } catch (error) {
    console.log(`❌ Universal dashboard test failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function testIndustryConfiguration() {
  console.log('\n🧪 Testing Industry Configuration Endpoints');
  console.log('==========================================');
  
  for (const industry of TEST_INDUSTRIES) {
    try {
      console.log(`\nTesting industry: ${industry}`);
      
      const response = await fetch(`${BASE_URL}/api/dashboard/industry/${industry}`, {
        headers: {
          'Authorization': `Bearer test-token-${TEST_STORE_ID}`,
          'X-Store-ID': TEST_STORE_ID
        }
      });
      
      if (!response.ok) {
        console.log(`❌ Failed for ${industry}: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      if (!data.success) {
        console.log(`❌ API returned success=false for ${industry}`);
        continue;
      }
      
      // Validate industry config structure
      const requiredFields = [
        'industrySlug', 'kpiKeys', 'primaryObjectName', 
        'hasBookings', 'hasInventory', 'chartTypes', 
        'allowedModules', 'designCategory'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in data.data));
      
      if (missingFields.length > 0) {
        console.log(`❌ Missing config fields for ${industry}: ${missingFields.join(', ')}`);
        continue;
      }
      
      console.log(`✅ ${industry} - Success`);
      console.log(`   - KPI Keys: ${data.data.kpiKeys.join(', ')}`);
      console.log(`   - Primary Object: ${data.data.primaryObjectName}`);
      console.log(`   - Has Bookings: ${data.data.hasBookings}`);
      console.log(`   - Has Inventory: ${data.data.hasInventory}`);
      console.log(`   - Design Category: ${data.data.designCategory}`);
      console.log(`   - Cache Status: ${response.headers.get('X-Cache') || 'Not set'}`);
      
    } catch (error) {
      console.log(`❌ ${industry} test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

async function testCacheFunctionality() {
  console.log('\n🧪 Testing Cache Functionality');
  console.log('==============================');
  
  try {
    // First request - should be cache MISS
    console.log('\nFirst request (should be MISS):');
    const firstResponse = await fetch(`${BASE_URL}/api/dashboard/universal?range=week`, {
      headers: {
        'Authorization': `Bearer test-token-${TEST_STORE_ID}`,
        'X-Store-ID': TEST_STORE_ID
      }
    });
    
    console.log(`Cache Status: ${firstResponse.headers.get('X-Cache') || 'Not set'}`);
    
    // Second request - should be cache HIT (if caching is working)
    console.log('\nSecond request (should be HIT):');
    const secondResponse = await fetch(`${BASE_URL}/api/dashboard/universal?range=week`, {
      headers: {
        'Authorization': `Bearer test-token-${TEST_STORE_ID}`,
        'X-Store-ID': TEST_STORE_ID
      }
    });
    
    console.log(`Cache Status: ${secondResponse.headers.get('X-Cache') || 'Not set'}`);
    
    // Test cache invalidation
    console.log('\nTesting cache invalidation:');
    const invalidateResponse = await fetch(`${BASE_URL}/api/dashboard/universal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer test-token-${TEST_STORE_ID}`,
        'X-Store-ID': TEST_STORE_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ dataType: 'all' })
    });
    
    if (invalidateResponse.ok) {
      console.log('✅ Cache invalidation successful');
    } else {
      console.log(`❌ Cache invalidation failed: ${invalidateResponse.status}`);
    }
    
  } catch (error) {
    console.log(`❌ Cache test failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function testErrorHandling() {
  console.log('\n🧪 Testing Error Handling');
  console.log('=========================');
  
  try {
    // Test invalid industry
    console.log('\nTesting invalid industry:');
    const invalidResponse = await fetch(`${BASE_URL}/api/dashboard/industry/invalid_industry`, {
      headers: {
        'Authorization': `Bearer test-token-${TEST_STORE_ID}`,
        'X-Store-ID': TEST_STORE_ID
      }
    });
    
    if (invalidResponse.status === 400) {
      console.log('✅ Invalid industry properly rejected');
    } else {
      console.log(`❌ Expected 400, got ${invalidResponse.status}`);
    }
    
    // Test without authentication
    console.log('\nTesting without authentication:');
    const noAuthResponse = await fetch(`${BASE_URL}/api/dashboard/universal`);
    
    if (noAuthResponse.status === 401) {
      console.log('✅ Unauthenticated request properly rejected');
    } else {
      console.log(`❌ Expected 401, got ${noAuthResponse.status}`);
    }
    
  } catch (error) {
    console.log(`❌ Error handling test failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function runTests() {
  console.log('🚀 Starting Dashboard API Tests');
  console.log('===============================');
  
  // Wait for server to be ready
  const serverReady = await waitForServer(3000);
  if (!serverReady) {
    console.log('Server not ready, exiting tests');
    process.exit(1);
  }
  
  // Run all tests
  await testUniversalDashboard();
  await testIndustryConfiguration();
  await testCacheFunctionality();
  await testErrorHandling();
  
  console.log('\n🏁 All tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});