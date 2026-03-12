# Test Suite Structure

## ✅ Active Tests (CI)

The primary test suite is located in **`tests/e2e/`**. These tests are run automatically by GitHub Actions on every push.

- **`tests/e2e/*.spec.ts`**: Core End-to-End tests covering Authentication, Onboarding, Billing, and Admin flows.
- **`tests/e2e/ci-guards.spec.ts`**: Critical regression guards for Navigation and Routing structure.
- **`tests/e2e/smoke.spec.ts`**: Safe-for-production smoke tests (Public pages, Health checks).
- **`tests/e2e/pricing.spec.ts`**: Validates pricing visibility.

## ⏸️ Inactive Tests (Future Work)

The following directories contain tests that are currently **excluded** from the CI pipeline (`ci.yml`). They require additional configuration or environment setup to be enabled.

- **`tests/integration/`**: Integration tests for specific subsystems (Email, Feature Flags, etc.).
- **`tests/unit/`**: Isolated unit tests for internal logic (Consent, Events, etc.).

## Running Tests

To run the active suite:

```bash
pnpm test:e2e
```
