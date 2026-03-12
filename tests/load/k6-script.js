
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test Configuration
export const options = {
    stages: [
        { duration: '1m', target: 50 },  // Ramp up to 50 users
        { duration: '3m', target: 50 },  // Stay at 50 users
        { duration: '1m', target: 100 }, // Ramp up to 100 users (Stress)
        { duration: '3m', target: 100 }, // Stay at 100 users
        { duration: '1m', target: 0 },   // Ramp down
    ],
    thresholds: {
        'http_req_duration': ['p(95)<500'], // 95% of requests must complete below 500ms
        'errors': ['rate<0.01'],            // Error rate must be less than 1%
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
    // Scenario 1: Browse Storefront (Public)
    const homeRes = http.get(`${BASE_URL}/`);
    check(homeRes, {
        'Home status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    // Scenario 2: Browse Category
    const catRes = http.get(`${BASE_URL}/category/electronics`);
    check(catRes, {
        'Category status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    // Scenario 3: API Health Check
    const healthRes = http.get(`${BASE_URL}/api/health`);
    check(healthRes, {
        'API status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(Math.random() * 3); // Think time 0-3s
}
