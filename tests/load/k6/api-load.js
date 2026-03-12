/**
 * k6 Load Testing Suite for Vayva API
 * 
 * Tests critical API endpoints under various load conditions
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');
const ordersCreated = new Counter('orders_created');

// Test configuration
export const options = {
  scenarios: {
    // Smoke test - minimal load to verify functionality
    smoke: {
      executor: 'constant-vus',
      vus: 5,
      duration: '1m',
      tags: { test_type: 'smoke' },
    },
    
    // Load test - simulate normal production load
    load: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 0 },
      ],
      tags: { test_type: 'load' },
    },
    
    // Stress test - find breaking point
    stress: {
      executor: 'ramping-vus',
      startVUs: 100,
      stages: [
        { duration: '2m', target: 500 },
        { duration: '5m', target: 500 },
        { duration: '2m', target: 1000 },
        { duration: '5m', target: 1000 },
        { duration: '2m', target: 2000 },
        { duration: '5m', target: 2000 },
        { duration: '2m', target: 0 },
      ],
      tags: { test_type: 'stress' },
    },
    
    // Spike test - sudden traffic surge
    spike: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '30s', target: 1000 },
        { duration: '2m', target: 1000 },
        { duration: '30s', target: 10 },
      ],
      tags: { test_type: 'spike' },
    },
    
    // Soak test - sustained load over time
    soak: {
      executor: 'constant-vus',
      vus: 100,
      duration: '30m',
      tags: { test_type: 'soak' },
    },
  },
  
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.05'],
    api_latency: ['p(95)<500'],
  },
};

const BASE_URL = __ENV.API_URL || 'https://api.vayva.ng';
const API_KEY = __ENV.API_KEY || '';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'X-Test-Run': 'k6-load-test',
};

// Helper function to track metrics
function trackMetrics(response) {
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(!success);
  apiLatency.add(response.timings.duration);
  
  return success;
}

// Test 1: Health Check
export function healthCheck() {
  group('Health Check', () => {
    const response = http.get(`${BASE_URL}/health/live`, { headers });
    trackMetrics(response);
    sleep(1);
  });
}

// Test 2: Authentication
export function authentication() {
  group('Authentication', () => {
    const payload = JSON.stringify({
      email: `test_${Math.random().toString(36).substring(7)}@example.com`,
      password: 'TestPassword123!',
    });
    
    const response = http.post(`${BASE_URL}/auth/login`, payload, { headers });
    trackMetrics(response);
    sleep(1);
  });
}

// Test 3: Get Products
export function getProducts() {
  group('Get Products', () => {
    const response = http.get(`${BASE_URL}/api/products?limit=20`, { headers });
    trackMetrics(response);
    
    check(response, {
      'products returned': (r) => {
        const body = JSON.parse(r.body);
        return body.data && body.data.length > 0;
      },
    });
    
    sleep(1);
  });
}

// Test 4: Create Order
export function createOrder() {
  group('Create Order', () => {
    const payload = JSON.stringify({
      customer: {
        name: 'Test Customer',
        phone: '+2348012345678',
        email: 'test@example.com',
      },
      items: [
        {
          productId: `prod_${Math.floor(Math.random() * 1000)}`,
          quantity: Math.floor(Math.random() * 5) + 1,
          price: 5000,
        },
      ],
      total: 5000,
      status: 'pending',
    });
    
    const response = http.post(`${BASE_URL}/api/orders`, payload, { headers });
    
    if (trackMetrics(response)) {
      ordersCreated.add(1);
    }
    
    sleep(2);
  });
}

// Test 5: Get Orders
export function getOrders() {
  group('Get Orders', () => {
    const response = http.get(`${BASE_URL}/api/orders?limit=10`, { headers });
    trackMetrics(response);
    sleep(1);
  });
}

// Test 6: Update Order Status
export function updateOrderStatus() {
  group('Update Order Status', () => {
    const orderId = `ord_${Math.floor(Math.random() * 10000)}`;
    const payload = JSON.stringify({
      status: 'confirmed',
      note: 'Updated via load test',
    });
    
    const response = http.patch(`${BASE_URL}/api/orders/${orderId}/status`, payload, { headers });
    trackMetrics(response);
    sleep(1);
  });
}

// Test 7: Customer Operations
export function customerOperations() {
  group('Customer Operations', () => {
    // Create customer
    const createPayload = JSON.stringify({
      name: `Customer ${Math.random().toString(36).substring(7)}`,
      phone: `+23480${Math.floor(Math.random() * 100000000)}`,
      email: `customer_${Math.random().toString(36).substring(7)}@example.com`,
    });
    
    const createResponse = http.post(`${BASE_URL}/api/customers`, createPayload, { headers });
    trackMetrics(createResponse);
    
    // Get customers
    const getResponse = http.get(`${BASE_URL}/api/customers?limit=10`, { headers });
    trackMetrics(getResponse);
    
    sleep(1);
  });
}

// Test 8: Analytics Endpoints
export function analytics() {
  group('Analytics', () => {
    const response = http.get(`${BASE_URL}/api/analytics/dashboard`, { headers });
    trackMetrics(response);
    sleep(2);
  });
}

// Test 9: Webhook Management
export function webhookManagement() {
  group('Webhook Management', () => {
    // List webhooks
    const listResponse = http.get(`${BASE_URL}/api/webhooks`, { headers });
    trackMetrics(listResponse);
    
    sleep(1);
  });
}

// Main test function
export default function () {
  // Run all tests in sequence
  healthCheck();
  authentication();
  getProducts();
  createOrder();
  getOrders();
  updateOrderStatus();
  customerOperations();
  analytics();
  webhookManagement();
}

// Setup function
export function setup() {
  console.log(`Starting load test against: ${BASE_URL}`);
  
  // Verify API is accessible
  const response = http.get(`${BASE_URL}/health/live`);
  if (response.status !== 200) {
    throw new Error(`API not accessible: ${response.status}`);
  }
  
  return {
    startTime: new Date().toISOString(),
    baseUrl: BASE_URL,
  };
}

// Teardown function
export function teardown(data) {
  console.log(`Load test completed. Started at: ${data.startTime}`);
  console.log(`Total orders created: ${ordersCreated.value}`);
}
