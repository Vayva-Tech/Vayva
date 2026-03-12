# Merchant-Admin E2E Tests

End-to-end tests for critical merchant-admin flows using Playwright.

## Test Coverage

### 1. Onboarding Flow (`onboarding.spec.ts`)
- ✅ Complete onboarding without auto-publishing store
- ✅ Bank beneficiary saved correctly (no fake UUID)
- ✅ Onboarding state reconciliation
- ✅ Multi-step form validation

### 2. Payment Verification (`payment-verification.spec.ts`)
- ✅ Double-fulfillment prevention (idempotency)
- ✅ Amount validation (fraud prevention)
- ✅ Ledger entry creation
- ✅ Correlation ID propagation
- ✅ Audit logging

### 3. Transactions UI (`transactions.spec.ts`)
- ✅ Transaction list display
- ✅ Filtering (status, type, date range)
- ✅ Transaction detail modal
- ✅ CSV export
- ✅ Empty states (initial and filtered)
- ✅ Filter clearing

### 4. Support Bot (`support-bot.spec.ts`)
- ✅ Bot reply with message ID
- ✅ Feedback loop (thumbs up/down)
- ✅ Manual escalation
- ✅ Auto-escalation triggers
- ✅ Rate limiting

## Running Tests

### Prerequisites
```bash
# Install dependencies
pnpm install

# Ensure database is seeded with test data
# (Test user: test@vayva.com / Test123!@#)
```

### Run All Tests
```bash
# Run all E2E tests
pnpm --filter merchant-admin playwright test

# Run with UI mode (interactive)
pnpm --filter merchant-admin playwright test --ui

# Run specific test file
pnpm --filter merchant-admin playwright test e2e/onboarding.spec.ts

# Run in headed mode (see browser)
pnpm --filter merchant-admin playwright test --headed
```

### Debug Tests
```bash
# Debug mode with Playwright Inspector
pnpm --filter merchant-admin playwright test --debug

# Run specific test with debug
pnpm --filter merchant-admin playwright test e2e/transactions.spec.ts --debug
```

### View Test Report
```bash
# Generate and open HTML report
pnpm --filter merchant-admin playwright show-report
```

## Test Configuration

Configuration is in `playwright.config.ts`:
- **Base URL:** `http://localhost:3000`
- **Browser:** Chromium (Desktop Chrome)
- **Retries:** 2 on CI, 0 locally
- **Screenshots:** On failure only
- **Traces:** On first retry

## Test Data

Tests use fixtures from `e2e/fixtures/`:
- **auth.ts** — Authentication helpers and test user credentials

### Test User
```typescript
{
  email: 'test@vayva.com',
  password: 'Test123!@#',
  storeId: 'test-store-id',
  firstName: 'Test',
  lastName: 'Merchant'
}
```

## Writing New Tests

### Basic Structure
```typescript
import { test, expect } from '@playwright/test';
import { signIn } from './fixtures/auth';

test.describe('Feature Name', () => {
    test.beforeEach(async ({ page }) => {
        await signIn(page);
    });

    test('should do something', async ({ page }) => {
        await page.goto('/dashboard/feature');
        await expect(page.locator('h1')).toBeVisible();
    });
});
```

### Best Practices
1. **Use data-testid attributes** for stable selectors
2. **Wait for network idle** before assertions
3. **Use page.waitForSelector** instead of arbitrary timeouts
4. **Clean up test data** after each test
5. **Mock external APIs** (Paystack, WhatsApp, etc.)
6. **Use fixtures** for reusable setup code

## CI/CD Integration

Tests run automatically on:
- Pull requests to `main`
- Commits to `main` branch
- Manual workflow dispatch

### GitHub Actions
```yaml
- name: Run E2E Tests
  run: pnpm --filter merchant-admin playwright test
  env:
    CI: true
```

## Troubleshooting

### Tests Failing Locally
1. Ensure dev server is running (`pnpm dev`)
2. Check database has test data
3. Clear browser cache/storage
4. Update Playwright browsers: `pnpm exec playwright install`

### Flaky Tests
- Add explicit waits for async operations
- Use `page.waitForLoadState('networkidle')`
- Increase timeout for slow operations
- Check for race conditions

### Authentication Issues
- Verify test user exists in database
- Check session/cookie handling
- Ensure NextAuth is configured correctly

## Coverage Goals

- ✅ Critical user flows (onboarding, payments, transactions)
- ✅ Feature flag gating
- ✅ Error handling and edge cases
- ✅ Data integrity (idempotency, race conditions)
- 🔄 Socials messaging flow (pending)
- 🔄 Store publishing flow (pending)
- 🔄 Team management (pending)

## Related Documentation

- [Playwright Docs](https://playwright.dev)
- [Testing Best Practices](../../docs/testing.md)
- [V2 Architecture](../../docs/v2-architecture.md)
