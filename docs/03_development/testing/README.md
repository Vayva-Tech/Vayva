# Testing

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026

---

## Overview

Vayva uses a comprehensive testing strategy to ensure code quality and reliability. This document outlines our testing approach, tools, and best practices.

## Testing Levels

### 1. Unit Tests

Test individual functions and components in isolation.

**Tools:**
- Vitest (test runner)
- React Testing Library (component testing)

**Location:**
```
packages/*/src/**/*.test.ts
Frontend/*/src/**/*.test.tsx
Backend/*/src/**/*.test.ts
```

**Example:**
```typescript
import { describe, it, expect } from 'vitest';
import { calculateTotal } from './utils';

describe('calculateTotal', () => {
  it('should calculate total with tax', () => {
    const result = calculateTotal({ subtotal: 1000, tax: 50 });
    expect(result).toBe(1050);
  });
});
```

### 2. Integration Tests

Test interactions between components and services.

**Tools:**
- Vitest
- MSW (Mock Service Worker) for API mocking

**Location:**
```
packages/*/src/**/*.integration.test.ts
```

**Example:**
```typescript
import { describe, it, expect } from 'vitest';
import { createOrder } from './order-service';

describe('Order Service', () => {
  it('should create order with valid data', async () => {
    const order = await createOrder({
      items: [{ productId: '1', quantity: 2 }],
      customerId: 'cust-1'
    });
    expect(order.status).toBe('PENDING');
  });
});
```

### 3. End-to-End Tests

Test complete user flows.

**Tools:**
- Playwright

**Location:**
```
tests/e2e/
```

**Example:**
```typescript
import { test, expect } from '@playwright/test';

test('user can complete checkout', async ({ page }) => {
  await page.goto('/store/test-store');
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="checkout"]');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('[data-testid="pay"]');
  await expect(page.locator('[data-testid="success"]')).toBeVisible();
});
```

## Test Organization

### Directory Structure

```
├── tests/
│   ├── e2e/                 # End-to-end tests
│   │   ├── checkout.spec.ts
│   │   ├── auth.spec.ts
│   │   └── orders.spec.ts
│   ├── fixtures/            # Test data
│   └── utils/               # Test utilities
├── packages/
│   └── shared/
│       └── src/
│           └── utils/
│               └── utils.test.ts  # Unit tests
└── Frontend/
    └── merchant-admin/
        └── src/
            └── components/
                └── Button/
                    └── Button.test.tsx
```

## Running Tests

### All Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

### Specific Tests

```bash
# Run unit tests only
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Run specific file
pnpm test Button.test.tsx
```

### Test Coverage

```bash
# Generate coverage report
pnpm test:coverage

# View HTML report
open coverage/index.html
```

## Test Data

### Factories

Use factories to create test data:

```typescript
// tests/factories/merchant.ts
export function createMerchant(overrides = {}) {
  return {
    id: 'merch-' + randomUUID(),
    name: 'Test Merchant',
    email: 'test@example.com',
    plan: 'STARTER',
    ...overrides
  };
}
```

### Fixtures

```typescript
// tests/fixtures/products.ts
export const sampleProducts = [
  { id: '1', name: 'Product A', price: 1000 },
  { id: '2', name: 'Product B', price: 2000 },
];
```

## Mocking

### API Mocking (MSW)

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/products', () => {
    return HttpResponse.json([
      { id: '1', name: 'Product A' }
    ]);
  }),
];
```

### Database Mocking

```typescript
// Mock Prisma client
jest.mock('@vayva/db', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      create: jest.fn(),
    }
  }
}));
```

## Component Testing

### React Testing Library

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

## E2E Testing with Playwright

### Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

### Page Object Model

```typescript
// tests/pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('[type="submit"]');
  }
}
```

## Test Best Practices

### DO

- Write tests for critical paths
- Use descriptive test names
- Keep tests independent
- Use factories for test data
- Mock external dependencies

### DON'T

- Test implementation details
- Write tests that depend on each other
- Use real API calls in unit tests
- Ignore test failures
- Write tests just for coverage

## CI/CD Integration

Tests run automatically on:

- Pull requests
- Merge to main
- Deployment pipeline

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:e2e
```

## Test Metrics

Target coverage:

| Type | Target |
|------|--------|
| Unit Tests | 80% |
| Integration Tests | 60% |
| E2E Tests | Critical paths |

---

**Questions?** Contact qa@vayva.ng
