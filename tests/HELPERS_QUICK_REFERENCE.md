# 🧪 E2E Test Helpers - Quick Reference

**Quick guide for using the new E2E test infrastructure**

---

## 📦 Import Helpers

```typescript
import {
  // Authentication
  createAuthenticatedMerchantContext,
  createAuthenticatedAdminContext,
  createTestMerchant,
  createTestAdmin,
  loginAsMerchant,
  loginAsAdmin,
  cleanupTestUsers,

  // Test Data
  createTestProduct,
  createTestOrder,
  createTestCustomer,
  createTestInventory,
  createCompleteTestStore,

  // Utilities
  navigateTo,
  fillField,
  clickButton,
  waitForToast,
  waitForApiResponse,
  elementExists,
  retryAction,
} from "../helpers";
```

---

## 🔐 Authentication

### **Quick Setup (Recommended)**

```typescript
test("my protected route test", async ({ page }) => {
  // One-liner: creates user, store, and sets up session
  const { user, store } = await createAuthenticatedMerchantContext(page);

  await page.goto("/dashboard");
  // ... your test logic
});
```

### **Admin Authentication**

```typescript
test("admin test", async ({ page }) => {
  const { user } = await createAuthenticatedAdminContext(page);

  await page.goto("/ops/admin-panel");
  // ... your test logic
});
```

### **Manual User Creation**

```typescript
test("custom user test", async ({ page }) => {
  const { user, store } = await createTestMerchant({
    email: "custom@test.com",
    firstName: "Custom",
    lastName: "User",
  });

  await setupAuthenticatedSession(page, user.email);
  // ... your test logic
});
```

### **Cleanup**

```typescript
test.describe("My Tests", () => {
  test.afterAll(async () => {
    await cleanupTestUsers(); // Always cleanup!
  });

  // ... your tests
});
```

---

## 📦 Test Data

### **Create Product**

```typescript
const { product, variant } = await createTestProduct(store.id, {
  title: "My Product",
  price: 10000, // in kobo (100.00 NGN)
});
```

### **Create Order**

```typescript
const order = await createTestOrder(store.id, customer.id, {
  status: "CONFIRMED",
  paymentStatus: "PAID",
  total: 5000,
});
```

### **Create Customer**

```typescript
const customer = await createTestCustomer(store.id, {
  email: "customer@test.com",
  firstName: "John",
  lastName: "Doe",
});
```

### **Complete Store Setup**

```typescript
const { user, store } = await createAuthenticatedMerchantContext(page);

const {
  store,
  products, // Array of 2 products with variants
  customers, // Array of 2 customers
  orders, // Array of 2 orders
} = await createCompleteTestStore(user.id);
```

---

## 🛠️ Utilities

### **Navigation**

```typescript
// Navigate and wait for page load
await navigateTo(page, "/dashboard/products");

// Wait for API response
const response = await waitForApiResponse(page, "/api/products");
```

### **Form Interaction**

```typescript
// Fill field by label or name
await fillField(page, "Email", "test@example.com");

// Click button by text
await clickButton(page, "Submit");

// Wait for toast notification
await waitForToast(page, "Success!");
```

### **Element Checks**

```typescript
// Check if element exists
if (await elementExists(page, ".my-element")) {
  // ... do something
}

// Get text content
const text = await getTextContent(page, "h1");
```

### **Retry Logic**

```typescript
// Retry action with exponential backoff
await retryAction(
  async () => {
    await page.click(".sometimes-slow-button");
  },
  3,
  1000,
); // 3 retries, 1s initial delay
```

---

## 📋 Common Patterns

### **Pattern 1: Test Protected Route**

```typescript
import { test, expect } from "@playwright/test";
import {
  createAuthenticatedMerchantContext,
  cleanupTestUsers,
} from "../helpers";

test.describe("My Feature", () => {
  test.afterAll(async () => {
    await cleanupTestUsers();
  });

  test("can access feature", async ({ page }) => {
    await createAuthenticatedMerchantContext(page);

    await page.goto("/my-feature");
    await expect(page).toHaveURL(/\/my-feature/);
  });
});
```

### **Pattern 2: Test with Data**

```typescript
test("can view product", async ({ page }) => {
  const { user, store } = await createAuthenticatedMerchantContext(page);
  const { product } = await createTestProduct(store.id);

  await page.goto(`/dashboard/products/${product.id}`);
  await expect(page.locator("h1")).toContainText(product.title);
});
```

### **Pattern 3: Test Unauthenticated Redirect**

```typescript
test("redirects to login when not authenticated", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/(signin|login)/);
});
```

### **Pattern 4: Test Admin Feature**

```typescript
test("admin can manage users", async ({ page }) => {
  await createAuthenticatedAdminContext(page);

  await page.goto("/ops/users");
  await expect(page).toHaveURL(/\/ops\/users/);
});
```

### **Pattern 5: Skip Unimplemented Feature**

```typescript
// TODO: Implement this feature before enabling test
test.describe.skip("Future Feature", () => {
  test("will work when implemented", async ({ page }) => {
    // ... test logic
  });
});
```

---

## ⚡ Best Practices

### **1. Always Cleanup**

```typescript
test.afterAll(async () => {
  await cleanupTestUsers();
});
```

### **2. Use Descriptive Test Names**

```typescript
// ✅ Good
test('authenticated user can create product', async ({ page }) => {

// ❌ Bad
test('test 1', async ({ page }) => {
```

### **3. Wait for Page Load**

```typescript
await page.goto("/dashboard");
await page.waitForLoadState("networkidle");
```

### **4. Use URL Assertions**

```typescript
// ✅ Good - checks URL
await expect(page).toHaveURL(/\/dashboard/);

// ❌ Less reliable - checks text
await expect(page.locator("h1")).toContainText("Dashboard");
```

### **5. Group Related Tests**

```typescript
test.describe('Product Management', () => {
    test.describe('Create Product', () => {
        test('can create product', async ({ page }) => {
        test('validates required fields', async ({ page }) => {
    });

    test.describe('Edit Product', () => {
        test('can edit product', async ({ page }) => {
    });
});
```

---

## 🚫 Common Mistakes

### **Mistake 1: Not Cleaning Up**

```typescript
// ❌ Bad - no cleanup
test("my test", async ({ page }) => {
  await createAuthenticatedMerchantContext(page);
});

// ✅ Good - with cleanup
test.describe("My Tests", () => {
  test.afterAll(async () => {
    await cleanupTestUsers();
  });

  test("my test", async ({ page }) => {
    await createAuthenticatedMerchantContext(page);
  });
});
```

### **Mistake 2: Not Waiting for Page Load**

```typescript
// ❌ Bad - might fail intermittently
await page.goto("/dashboard");
await expect(page.locator("h1")).toBeVisible();

// ✅ Good - waits for load
await page.goto("/dashboard");
await page.waitForLoadState("networkidle");
await expect(page.locator("h1")).toBeVisible();
```

### **Mistake 3: Testing Unimplemented Features**

```typescript
// ❌ Bad - test will fail
test("feature that doesn't exist yet", async ({ page }) => {
  await page.goto("/nonexistent-feature");
});

// ✅ Good - skip with TODO
test.skip("feature that doesn't exist yet", async ({ page }) => {
  // TODO: Implement feature first
});
```

---

## 📚 Full API Reference

See individual helper files for complete documentation:

- `tests/helpers/auth.ts` - Authentication utilities
- `tests/helpers/fixtures.ts` - Test data creation
- `tests/helpers/utils.ts` - Utility functions
- `tests/helpers/prisma.ts` - Database client

---

**Happy Testing!** 🧪
