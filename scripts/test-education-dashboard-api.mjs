#!/usr/bin/env node

/**
 * Education Dashboard API Test Script
 * 
 * Tests all education-specific dashboard endpoints
 * Run: node scripts/test-education-dashboard-api.mjs
 */

import { $ } from 'bun';

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const STORE_ID = process.env.STORE_ID || 'test-store-123';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'test-token';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function error(message) {
  log(`✗ ${message}`, 'red');
}

function info(message) {
  log(`ℹ ${message}`, 'cyan');
}

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  total: 0,
};

async function testEndpoint(name, url, options = {}) {
  results.total++;
  
  try {
    info(`Testing: ${name}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (response.ok) {
      success(`${name} - Status: ${response.status}`);
      
      // Validate response structure
      if (data.success !== undefined) {
        success('  ✓ Response has success field');
      }
      
      if (data.data !== undefined) {
        success('  ✓ Response has data field');
      }
      
      if (data.timestamp !== undefined) {
        success('  ✓ Response has timestamp field');
      }
      
      results.passed++;
      return data;
    } else {
      error(`${name} - Status: ${response.status}`);
      error(`  Error: ${JSON.stringify(data, null, 2)}`);
      results.failed++;
      return null;
    }
  } catch (err) {
    error(`${name} - Failed with error: ${err.message}`);
    results.failed++;
    return null;
  }
}

async function runTests() {
  log('\n========================================', 'blue');
  log('Education Dashboard API Tests', 'blue');
  log('========================================\n', 'blue');
  
  info(`Base URL: ${BASE_URL}`);
  info(`Store ID: ${STORE_ID}\n`);

  // Test 1: Education Dashboard Stats
  log('\n--- Dashboard Statistics ---', 'yellow');
  await testEndpoint(
    'Education Dashboard Stats',
    `${BASE_URL}/api/education/dashboard/stats?storeId=${STORE_ID}&range=month`
  );

  // Test 2: Course Statistics
  log('\n--- Course Statistics ---', 'yellow');
  await testEndpoint(
    'Course Statistics',
    `${BASE_URL}/api/education/courses/stats?storeId=${STORE_ID}`
  );

  // Test 3: Student Progress
  log('\n--- Student Progress ---', 'yellow');
  await testEndpoint(
    'Student Progress',
    `${BASE_URL}/api/education/students/progress?storeId=${STORE_ID}`
  );

  // Test 4: Student Progress (At-Risk Only)
  log('\n--- Student Progress (At-Risk) ---', 'yellow');
  await testEndpoint(
    'Student Progress (At-Risk)',
    `${BASE_URL}/api/education/students/progress?storeId=${STORE_ID}&atRiskOnly=true`
  );

  // Test 5: Course Statistics with filters
  log('\n--- Course Statistics (Published) ---', 'yellow');
  await testEndpoint(
    'Course Statistics (Published)',
    `${BASE_URL}/api/education/courses/stats?storeId=${STORE_ID}&status=published`
  );

  // Test 6: Dashboard Stats with different range
  log('\n--- Dashboard Stats (Week) ---', 'yellow');
  await testEndpoint(
    'Dashboard Stats (Week)',
    `${BASE_URL}/api/education/dashboard/stats?storeId=${STORE_ID}&range=week`
  );

  // Test 7: Invalid store ID (should fail)
  log('\n--- Invalid Store ID (Expected Failure) ---', 'yellow');
  await testEndpoint(
    'Invalid Store ID',
    `${BASE_URL}/api/education/dashboard/stats?storeId=invalid-store&range=month`
  );

  // Summary
  log('\n========================================', 'blue');
  log('Test Results Summary', 'blue');
  log('========================================', 'blue');
  log(`Total Tests: ${results.total}`, 'cyan');
  success(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    error(`Failed: ${results.failed}`);
  }
  
  const passRate = ((results.passed / results.total) * 100).toFixed(1);
  log(`Pass Rate: ${passRate}%`, 'cyan');
  log('========================================\n', 'blue');

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Additional validation tests
async function validateDataStructure() {
  log('\n--- Validating Data Structure ---', 'yellow');

  const dashboardData = await testEndpoint(
    'Dashboard Data Structure',
    `${BASE_URL}/api/education/dashboard/stats?storeId=${STORE_ID}`
  );

  if (dashboardData && dashboardData.data) {
    const data = dashboardData.data;

    // Check overview metrics
    if (data.overview) {
      success('Overview metrics present');
      const requiredFields = [
        'totalCourses',
        'activeCourses',
        'totalStudents',
        'totalInstructors',
        'totalRevenue',
      ];
      
      requiredFields.forEach(field => {
        if (data.overview[field] !== undefined) {
          success(`  ✓ ${field} present`);
        } else {
          error(`  ✗ ${field} missing`);
        }
      });
    }

    // Check KPI metrics
    if (data.metrics) {
      success('KPI metrics present');
      const requiredMetrics = ['revenue', 'enrollments', 'students', 'completionRate', 'satisfaction'];
      
      requiredMetrics.forEach(metric => {
        if (data.metrics[metric]) {
          success(`  ✓ ${metric} present`);
          if (data.metrics[metric].value !== undefined) {
            success(`    ✓ value present`);
          }
          if (data.metrics[metric].change !== undefined) {
            success(`    ✓ change present`);
          }
          if (['up', 'down', 'neutral'].includes(data.metrics[metric].trend)) {
            success(`    ✓ valid trend`);
          }
        } else {
          error(`  ✗ ${metric} missing`);
        }
      });
    }

    // Check courses array
    if (Array.isArray(data.courses)) {
      success('Courses array present');
      if (data.courses.length > 0) {
        const course = data.courses[0];
        const requiredCourseFields = ['id', 'title', 'instructorId', 'status', 'progress'];
        
        requiredCourseFields.forEach(field => {
          if (course[field] !== undefined) {
            success(`  ✓ ${field} present`);
          }
        });
      }
    }

    // Check students array
    if (Array.isArray(data.students)) {
      success('Students array present');
    }

    // Check instructors array
    if (Array.isArray(data.instructors)) {
      success('Instructors array present');
    }

    // Check engagement metrics
    if (data.engagementMetrics) {
      success('Engagement metrics present');
      const requiredEngagementFields = [
        'overallScore',
        'videoViews',
        'quizAttempts',
        'forumPosts',
        'assignmentsCompleted',
      ];
      
      requiredEngagementFields.forEach(field => {
        if (data.engagementMetrics[field] !== undefined) {
          success(`  ✓ ${field} present`);
        }
      });
    }

    // Check alerts
    if (Array.isArray(data.alerts) || Array.isArray(data.aiInsights)) {
      success('Alerts/Insights present');
    }
  }
}

// Run all tests
(async () => {
  await runTests();
  await validateDataStructure();
})();
