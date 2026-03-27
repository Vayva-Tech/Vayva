/**
 * Load Testing Scripts for Vayva Platform
 * Using k6 for comprehensive performance testing
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration with multiple scenarios
export const options = {
  // Define multiple test scenarios
  scenarios: {
    // Scenario 1: Gradual ramp-up to normal load
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 50 },   // Ramp up to 50 users
        { duration: '15m', target: 50 },  // Stay at 50 users for 15 min
        { duration: '5m', target: 0 },    // Ramp down to 0
      ],
      gracefulStop: '30s',
      tags: { scenario: 'normal' },
    },

    // Scenario 2: Spike test (sudden traffic increase)
    spike_test: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 500,
      stages: [
        { duration: '10m', target: 100 }, // Normal load
        { duration: '1m', target: 500 },  // Spike to 500 req/s
        { duration: '5m', target: 500 },  // Maintain spike
        { duration: '1m', target: 100 },  // Return to normal
      ],
      tags: { scenario: 'spike' },
    },

    // Scenario 3: Stress test (breaking point)
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10m', target: 200 },
        { duration: '10m', target: 400 },
        { duration: '10m', target: 600 },
        { duration: '10m', target: 800 },
        { duration: '10m', target: 1000 },
        { duration: '5m', target: 0 },
      ],
      tags: { scenario: 'stress' },
    },
  },

  // Performance thresholds
  thresholds: {
    http_req_duration: [
      'p(50)<200',  // 50% of requests should complete below 200ms
      'p(90)<500',  // 90% of requests should complete below 500ms
      'p(95)<1000', // 95% of requests should complete below 1s
    ],
    http_req_failed: ['rate<0.01'], // Error rate must be less than 1%
    http_reqs: ['rate>100'],       // Must handle at least 100 req/s
    errors: ['rate<0.05'],         // Custom error rate < 5%
  },

  // WebSocket support for real-time features
  websocket: {
    url: 'ws://localhost:3000/api/websocket',
    pingInterval: '10s',
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_KEY = __ENV.API_KEY || 'test-api-key';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'User-Agent': 'k6-load-test',
};

// Industry dashboard endpoints to test
const endpoints = {
  fashion: '/api/fashion/stats',
  restaurant: '/api/restaurant/stats',
  realestate: '/api/realestate/stats',
  professional: '/api/professional-services/stats',
  healthcare: '/api/healthcare/stats',
  legal: '/api/legal/stats',
  beauty: '/api/beauty/stats',
};

// Main test function
export default function () {
  // Test 1: Health check endpoint
  testHealthCheck();
  
  sleep(1);

  // Test 2: Dashboard stats endpoints (read-heavy)
  testDashboardStats();
  
  sleep(1);

  // Test 3: List endpoints (pagination)
  testListEndpoints();
  
  sleep(1);

  // Test 4: Write operations (create/update)
  testWriteOperations();

  // Track custom error rate
  errorRate.add(0); // No errors in this iteration
}

/**
 * Test health check endpoints
 */
function testHealthCheck() {
  const res = http.get(`${BASE_URL}/api/healthz`, { headers });
  
  check(res, {
    'health check status is 200': (r) => r.status === 200,
    'health check returns OK': (r) => r.json()?.status === 'ok',
  });
}

/**
 * Test all dashboard stats endpoints
 */
function testDashboardStats() {
  for (const [industry, endpoint] of Object.entries(endpoints)) {
    const res = http.get(`${BASE_URL}${endpoint}`, { headers });
    
    check(res, {
      `${industry} stats status is 200`: (r) => r.status === 200,
      `${industry} stats has data`: (r) => {
        const body = r.json();
        return body && body.data && typeof body.data === 'object';
      },
      `${industry} stats response time < 500ms`: (r) => r.timings.duration < 500,
    });

    errorRate.add(res.status !== 200 ? 1 : 0);
  }
}

/**
 * Test list endpoints with pagination
 */
function testListEndpoints() {
  const listEndpoints = [
    '/api/fashion/products?limit=50',
    '/api/restaurant/menu-items?limit=50',
    '/api/realestate/properties?limit=50',
    '/api/professional-services/projects?limit=50',
  ];

  for (const endpoint of listEndpoints) {
    const res = http.get(`${BASE_URL}${endpoint}`, { headers });
    
    check(res, {
      'list endpoint status is 200': (r) => r.status === 200,
      'list returns array': (r) => {
        const body = r.json();
        return body && Array.isArray(body.data);
      },
      'list respects limit': (r) => {
        const body = r.json();
        return body.data.length <= 50;
      },
    });
  }
}

/**
 * Test write operations (POST/PUT)
 */
function testWriteOperations() {
  // Test creating a customer (lightweight operation)
  const customerData = JSON.stringify({
    name: 'Load Test Customer',
    email: `loadtest+${Date.now()}@example.com`,
  });

  const res = http.post(`${BASE_URL}/api/fashion/customers`, customerData, {
    headers,
  });

  check(res, {
    'create customer status is 201': (r) => r.status === 201,
    'create customer returns ID': (r) => {
      const body = r.json();
      return body && body.data && body.data.id;
    },
  });

  errorRate.add(res.status !== 201 ? 1 : 0);
}

/**
 * Setup - runs once before all tests
 */
export function setup() {
  console.log('Starting load test...');
  console.log(`Base URL: ${BASE_URL}`);
  
  // Verify server is running
  const res = http.get(`${BASE_URL}/api/healthz`);
  if (res.status !== 200) {
    throw new Error(`Server not responding: ${res.status}`);
  }
  
  return { startTime: Date.now() };
}

/**
 * Teardown - runs once after all tests
 */
export function teardown(data) {
  const duration = Date.now() - data.startTime;
  console.log(`Load test completed in ${duration}ms`);
  console.log('Check k6 output for detailed metrics');
}

/**
 * Handle HTTP errors gracefully
 */
export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  return `
📊 LOAD TEST SUMMARY
====================

Duration: ${data.state.testRunDurationMs}ms
Iterations: ${data.metrics.iterations.values.count}
HTTP Requests: ${data.metrics.http_reqs.values.count}

Response Times:
  - p(50): ${data.metrics.http_req_duration.values['p(50)']}ms
  - p(90): ${data.metrics.http_req_duration.values['p(90)']}ms
  - p(95): ${data.metrics.http_req_duration.values['p(95)']}ms

Error Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%
Success Rate: ${((1 - data.metrics.errors.values.rate) * 100).toFixed(2)}%

Thresholds:
  ${Object.entries(data.metrics).filter(([_, m]) => m.thresholds).map(([name, m]) => 
    `${name}: ${JSON.stringify(m.thresholds)}`
  ).join('\n  ')}
`;
}
