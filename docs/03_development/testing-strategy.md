# Testing Strategy

> Vayva Engineering -- Last updated: March 2026

This document describes Vayva's testing philosophy, tooling, coverage expectations, and integration with CI/CD.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Testing Trophy](#testing-trophy)
3. [Unit Tests (Vitest)](#unit-tests-vitest)
4. [Component Tests (Testing Library)](#component-tests-testing-library)
5. [End-to-End Tests (Playwright)](#end-to-end-tests-playwright)
6. [API Testing](#api-testing)
7. [Mocking Strategy](#mocking-strategy)
8. [Coverage Targets](#coverage-targets)
9. [CI Integration](#ci-integration)
10. [Running Tests Locally](#running-tests-locally)

---

## Philosophy

Testing at Vayva exists to provide **confidence in shipping**, not to hit arbitrary coverage numbers. We follow three principles:

1. **Test behaviour, not implementation.** Tests should verify what the code does for users and consumers, not how it does it internally.
2. **Shift testing closer to production.** Integration and E2E tests catch more real bugs than isolated unit tests. Invest time where it matters.
3. **Tests are a feature.** They are first-class code, reviewed with the same rigour as production code. Flaky tests are treated as P1 bugs.

---

## Testing Trophy

We follow Kent C. Dodds' **Testing Trophy** model, which prioritises integration tests over unit tests:

```
        ╱  E2E  ╲           Few, high-value user journey tests
       ╱──────────╲
      ╱ Integration ╲       Most tests live here
     ╱────────────────╲
    ╱   Component       ╲   React component rendering + interaction
   ╱──────────────────────╲
  ╱     Unit                ╲  Pure functions, utilities, schemas
 ╱────────────────────────────╲
╱       Static Analysis         ╲  TypeScript, ESLint, CI guards
────────────────────────────────
```

| Layer              | Tool                  | Approximate share |
| ------------------ | --------------------- | ----------------- |
| Static Analysis    | TypeScript, ESLint    | Always-on         |
| Unit               | Vitest                | ~20%              |
| Component          | Vitest + Testing Library | ~30%           |
| Integration        | Vitest + Prisma test DB | ~35%            |
| E2E                | Playwright            | ~15%              |

---

## Unit Tests (Vitest)

Vitest is the primary test runner for all non-E2E tests. The root `vitest.config.ts` provides base configuration, and individual packages can extend it.

### What to Unit Test

- Pure utility functions (`formatNaira`, `slugify`, `calculateDiscount`)
- Zod schema validation (valid/invalid inputs)
- State machines and reducers
- Business logic in service functions (with mocked dependencies)

### Configuration

```typescript
// vitest.config.ts (root)
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./apps/merchant/src"),
      "@vayva/shared": resolve(__dirname, "./packages/shared/src"),
      "@vayva/db": resolve(__dirname, "./infra/db/src/client.ts"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    exclude: ["**/e2e/**", "**/node_modules/**"],
  },
});
```

### Example: Utility Function Test

```typescript
// packages/shared/utils/src/__tests__/format-currency.test.ts
import { describe, it, expect } from "vitest";
import { formatNaira } from "../format-currency";

describe("formatNaira", () => {
  it("formats kobo value as Naira with symbol", () => {
    expect(formatNaira(150000)).toBe("₦1,500.00");
  });

  it("handles zero", () => {
    expect(formatNaira(0)).toBe("₦0.00");
  });

  it("handles negative values for refunds", () => {
    expect(formatNaira(-50000)).toBe("-₦500.00");
  });
});
```

### Example: Zod Schema Test

```typescript
// packages/domain/payments/src/__tests__/schemas.test.ts
import { describe, it, expect } from "vitest";
import { PaystackWebhookSchema } from "../schemas";

describe("PaystackWebhookSchema", () => {
  it("accepts a valid charge.success event", () => {
    const payload = {
      event: "charge.success",
      data: {
        reference: "ref_abc123",
        amount: 500000,
        currency: "NGN",
        status: "success",
      },
    };

    const result = PaystackWebhookSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("rejects payload missing required fields", () => {
    const result = PaystackWebhookSchema.safeParse({ event: "charge.success" });
    expect(result.success).toBe(false);
  });
});
```

---

## Component Tests (Testing Library)

Component tests verify that React components render correctly and respond to user interaction. Use `@testing-library/react` with Vitest and `jsdom` environment.

### Guidelines

- **Query by role, label, or text** -- never by class name or test ID unless absolutely necessary.
- **Simulate real user interactions** -- click, type, select -- not internal state changes.
- **Assert visible outcomes** -- text content, element presence, ARIA attributes.

### Example: Component Test

```typescript
// Frontend/merchant/src/components/features/products/__tests__/product-card.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductCard } from "../product-card";

const mockProduct = {
  id: "prod_1",
  name: "Ankara Fabric - 6 yards",
  priceInKobo: 1500000,
  imageUrl: "/images/ankara.jpg",
  inStock: true,
};

describe("ProductCard", () => {
  it("renders product name and formatted price", () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText("Ankara Fabric - 6 yards")).toBeInTheDocument();
    expect(screen.getByText("₦15,000.00")).toBeInTheDocument();
  });

  it("shows out-of-stock badge when product is unavailable", () => {
    render(<ProductCard product={{ ...mockProduct, inStock: false }} />);

    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });

  it("calls onAddToCart when add button is clicked", async () => {
    const user = userEvent.setup();
    const onAddToCart = vi.fn();

    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);

    await user.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(onAddToCart).toHaveBeenCalledWith("prod_1");
  });
});
```

---

## End-to-End Tests (Playwright)

Playwright tests verify complete user journeys across all three web frontends: merchant, storefront, and ops-console.

### Configuration

The Playwright config at `playwright.config.ts` defines three projects:

| Project      | Base URL                   | Port |
| ------------ | -------------------------- | ---- |
| merchant     | `http://127.0.0.1:3000`    | 3000 |
| storefront   | `http://127.0.0.1:3001`    | 3001 |
| ops-console  | `http://127.0.0.1:3002`    | 3002 |

Key settings:
- **Retries:** 2 in CI, 0 locally
- **Workers:** 1 in CI, auto locally
- **Traces:** retained on failure
- **Screenshots:** captured on failure
- **Video:** retained on failure
- **Timeout:** 30 seconds per test, 5 seconds per assertion

### Test Organisation

```
tests/
  e2e/
    merchant/
      auth.spec.ts
      products.spec.ts
      orders.spec.ts
      settings.spec.ts
    storefront/
      browse.spec.ts
      checkout.spec.ts
      search.spec.ts
    ops-console/
      dashboard.spec.ts
      merchants.spec.ts
      support.spec.ts
    fixtures/
      auth.fixture.ts
      test-data.fixture.ts
```

### Example: E2E Test

```typescript
// tests/e2e/merchant/products.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Product Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to products
    await page.goto("/auth/login");
    await page.fill('[name="email"]', "test@merchant.com");
    await page.fill('[name="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard");
    await page.goto("/dashboard/products");
  });

  test("merchant can create a new product", async ({ page }) => {
    await page.click("text=Add Product");
    await page.fill('[name="name"]', "Test Product");
    await page.fill('[name="price"]', "5000");
    await page.fill('[name="description"]', "A test product description");
    await page.click('button[type="submit"]');

    await expect(page.getByText("Product created successfully")).toBeVisible();
    await expect(page.getByText("Test Product")).toBeVisible();
  });

  test("merchant can search products", async ({ page }) => {
    await page.fill('[placeholder*="Search"]', "Ankara");
    await expect(page.getByText("Ankara Fabric")).toBeVisible();
  });
});
```

### E2E Mode

Tests run with `VAYVA_E2E_MODE=true`, which enables test-specific behaviours:
- Seeded test database with known data
- Disabled rate limiting
- Mocked external services (Paystack, Evolution API)

---

## API Testing

API route handlers are tested using integration-style tests with real HTTP requests against a test server.

### Strategy

- Use Vitest with the `node` environment.
- Spin up a test instance or call route handlers directly with mocked `Request` objects.
- Test the full request/response cycle including validation, auth, and error handling.

### Example: API Route Test

```typescript
// Backend/core-api/src/routes/__tests__/products.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestClient } from "../../test-utils/client";

describe("POST /api/products", () => {
  const client = createTestClient();

  it("returns 201 for valid product creation", async () => {
    const response = await client.post("/api/products", {
      name: "Test Product",
      priceInKobo: 500000,
      categoryId: "cat_test_123",
    });

    expect(response.status).toBe(201);
    expect(response.data.data.name).toBe("Test Product");
  });

  it("returns 400 for missing required fields", async () => {
    const response = await client.post("/api/products", {
      name: "",
    });

    expect(response.status).toBe(400);
    expect(response.data.error).toBe("Validation failed");
  });

  it("returns 401 for unauthenticated requests", async () => {
    const response = await client.post("/api/products", {}, { auth: false });

    expect(response.status).toBe(401);
  });
});
```

---

## Mocking Strategy

### What to Mock

| Dependency            | Mock approach                          |
| --------------------- | -------------------------------------- |
| Database (Prisma)     | Use test database or `vitest-mock-extended` |
| Redis                 | In-memory mock via `ioredis-mock`      |
| Paystack API          | MSW (Mock Service Worker) handlers     |
| Evolution API         | MSW handlers                           |
| Groq / OpenRouter     | MSW handlers with canned responses     |
| File storage (MinIO)  | In-memory mock                         |
| Email (Resend)        | Spy on service function                |
| `Date.now` / timers   | `vi.useFakeTimers()`                   |

### What NOT to Mock

- Your own code -- if you need to mock a module you own, consider refactoring the dependency boundary.
- Zod schemas -- test them with real data.
- React components under test -- mock their children only when absolutely necessary.

### MSW Example

```typescript
// tests/mocks/handlers/paystack.ts
import { http, HttpResponse } from "msw";

export const paystackHandlers = [
  http.post("https://api.paystack.co/transaction/initialize", () => {
    return HttpResponse.json({
      status: true,
      data: {
        authorization_url: "https://checkout.paystack.com/test",
        access_code: "access_test_123",
        reference: "ref_test_123",
      },
    });
  }),

  http.get("https://api.paystack.co/transaction/verify/:reference", ({ params }) => {
    return HttpResponse.json({
      status: true,
      data: {
        reference: params.reference,
        amount: 500000,
        currency: "NGN",
        status: "success",
      },
    });
  }),
];
```

---

## Coverage Targets

| Package/App          | Line Coverage | Branch Coverage | Notes                           |
| -------------------- | ------------- | --------------- | ------------------------------- |
| `packages/shared`    | 80%           | 75%             | Core utilities, high value      |
| `packages/domain/*`  | 75%           | 70%             | Business logic                  |
| `packages/ui`        | 70%           | 65%             | Component rendering             |
| `Frontend/merchant`  | 60%           | 55%             | Focus on critical paths         |
| `Frontend/storefront`| 60%           | 55%             | Focus on checkout flow          |
| `Backend/core-api`   | 75%           | 70%             | API reliability                 |
| `Backend/worker`     | 70%           | 65%             | Job processing correctness      |
| **E2E (Playwright)** | N/A           | N/A             | 100% of critical user journeys  |

Coverage is collected via Vitest's built-in c8/istanbul reporter:

```bash
pnpm test -- --coverage
```

Coverage reports are uploaded as CI artifacts and tracked over time. **Coverage must not decrease on any PR.**

---

## CI Integration

Tests run in the following CI pipeline stages:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Typecheck    │───>│    Lint       │───>│  Unit/Integ  │───>│    E2E       │
│  (turbo)      │    │  (ESLint)    │    │  (Vitest)    │    │ (Playwright) │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                                                    │
                                                            ┌──────────────┐
                                                            │  CI Guards   │
                                                            │  (security)  │
                                                            └──────────────┘
```

### CI Commands

```bash
# Full CI pipeline (what runs on every PR)
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm ci:guards

# Smoke test (quick validation)
pnpm test:smoke
```

### CI Guard Scripts

These custom scripts run as part of CI and enforce Vayva-specific invariants:

| Script                         | Purpose                                              |
| ------------------------------ | ---------------------------------------------------- |
| `check-hardcoded-domains.js`   | No hardcoded production URLs in source               |
| `check-merchant-auth-wrapper.js` | All merchant routes wrapped in auth checks         |
| `check-merchant-idors.js`      | No IDOR vulnerabilities in merchant API routes       |
| `check-ops-auditlog.js`        | All ops-console mutations produce audit log entries  |
| `check-docs-links.js`          | No broken links in documentation                     |
| `check-docs-secrets.js`        | No secrets leaked in documentation                   |

---

## Running Tests Locally

```bash
# Run all tests via TurboRepo
pnpm test

# Run tests for a specific package
pnpm --filter @vayva/shared test
pnpm --filter merchant test

# Run tests in watch mode
pnpm --filter @vayva/shared test -- --watch

# Run a specific test file
pnpm vitest run packages/shared/utils/src/__tests__/format-currency.test.ts

# Run E2E tests (starts dev servers automatically)
pnpm test:e2e

# Run E2E with UI mode (interactive debugging)
pnpm test:ui

# Run E2E for a specific project
pnpm test:e2e -- --project=merchant

# Run a specific E2E test
pnpm test:e2e -- tests/e2e/merchant/products.spec.ts

# View Playwright test report
npx playwright show-report
```
