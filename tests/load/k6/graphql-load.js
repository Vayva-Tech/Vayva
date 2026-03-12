/**
 * GraphQL API Load Testing
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.API_URL || 'https://api.vayva.ng';
const headers = {
  'Content-Type': 'application/json',
};

const queries = {
  getOrders: `
    query GetOrders($limit: Int!) {
      orders(limit: $limit) {
        id
        orderNumber
        total
        status
        customer {
          name
          phone
        }
      }
    }
  `,
  
  getDashboard: `
    query GetDashboard {
      dashboard {
        revenue
        orders
        customers
        conversionRate
      }
    }
  `,
  
  createOrder: `
    mutation CreateOrder($input: CreateOrderInput!) {
      createOrder(input: $input) {
        id
        orderNumber
        status
      }
    }
  `,
};

export default function () {
  // Query orders
  const ordersResponse = http.post(
    `${BASE_URL}/graphql`,
    JSON.stringify({
      query: queries.getOrders,
      variables: { limit: 20 },
    }),
    { headers }
  );
  
  check(ordersResponse, {
    'orders query successful': (r) => r.status === 200,
    'orders data returned': (r) => {
      const body = JSON.parse(r.body);
      return body.data && body.data.orders !== undefined;
    },
  });
  
  sleep(1);
  
  // Query dashboard
  const dashboardResponse = http.post(
    `${BASE_URL}/graphql`,
    JSON.stringify({ query: queries.getDashboard }),
    { headers }
  );
  
  check(dashboardResponse, {
    'dashboard query successful': (r) => r.status === 200,
  });
  
  sleep(2);
}
