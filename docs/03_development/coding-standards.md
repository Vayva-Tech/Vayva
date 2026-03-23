# Coding Standards

> Vayva Engineering -- Last updated: March 2026

This document defines the TypeScript conventions, naming rules, file-structure expectations, and tooling configuration that every contributor must follow across the Vayva monorepo.

---

## Table of Contents

1. [TypeScript Conventions](#typescript-conventions)
2. [Naming Conventions](#naming-conventions)
3. [File & Directory Structure](#file--directory-structure)
4. [Import Ordering](#import-ordering)
5. [Component Patterns](#component-patterns)
6. [Error Handling](#error-handling)
7. [Linting & Formatting](#linting--formatting)
8. [Commit Message Format](#commit-message-format)

---

## TypeScript Conventions

### General Rules

- **Strict mode is mandatory.** The root `tsconfig.base.json` enables `"strict": true`. Never disable it per-package.
- **Never use `@ts-nocheck` or `@ts-ignore`.** Fix the actual type error. If truly unavoidable, use `@ts-expect-error` with a comment explaining why and a link to a tracking issue.
- **Prefer `interface` over `type` for object shapes** that may be extended. Use `type` for unions, intersections, and computed types.
- **Use `unknown` instead of `any`.** If you must accept an arbitrary value, narrow it with type guards before use.
- **Prefer `const` assertions** for literal objects and tuples that should not be widened.

```typescript
// Good
interface MerchantProfile {
  id: string;
  storeName: string;
  tier: "starter" | "growth" | "scale";
  createdAt: Date;
}

// Good -- union type
type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

// Bad -- avoid `any`
function processData(data: any) { ... }

// Good -- use `unknown` + narrowing
function processData(data: unknown) {
  if (!isValidPayload(data)) throw new InvalidPayloadError();
  // data is now narrowed
}
```

### Zod Schemas

All external input (API requests, webhook payloads, form data) must be validated with Zod. Derive TypeScript types from Zod schemas -- never the other way around.

```typescript
import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(200),
  priceInKobo: z.number().int().positive(),
  categoryId: z.string().uuid(),
  description: z.string().max(2000).optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
```

### Enums & Constants

Prefer `as const` objects over TypeScript `enum`. This produces smaller bundle output and better tree-shaking.

```typescript
// Preferred
export const OrderStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
```

### Async Patterns

- Always handle promise rejections explicitly.
- Use `async/await` over raw `.then()` chains.
- For concurrent work, use `Promise.all` or `Promise.allSettled` -- never fire-and-forget promises.

---

## Naming Conventions

| Element             | Convention          | Example                        |
| ------------------- | ------------------- | ------------------------------ |
| Files (components)  | `kebab-case.tsx`    | `product-card.tsx`             |
| Files (utilities)   | `kebab-case.ts`     | `format-currency.ts`           |
| Files (tests)       | `*.test.ts(x)`      | `product-card.test.tsx`        |
| React components    | `PascalCase`        | `ProductCard`                  |
| Hooks               | `camelCase` (use*)  | `useCartItems`                 |
| Variables/functions | `camelCase`         | `calculateShipping`            |
| Constants           | `UPPER_SNAKE_CASE`  | `MAX_RETRY_COUNT`              |
| Types/Interfaces    | `PascalCase`        | `MerchantProfile`              |
| Zod schemas         | `PascalCase + Schema` | `CreateProductSchema`        |
| Database models     | `PascalCase`        | `Product`, `OrderItem`         |
| API routes          | `kebab-case`        | `/api/store-settings`          |
| Environment vars    | `UPPER_SNAKE_CASE`  | `PAYSTACK_SECRET_KEY`          |
| CSS classes         | Tailwind utilities  | `className="flex items-center"`|

### Naming Guidelines

- **Boolean variables:** prefix with `is`, `has`, `can`, `should` -- e.g., `isLoading`, `hasPermission`.
- **Event handlers:** prefix with `handle` in the component, `on` in props -- e.g., `handleClick`, `onClick`.
- **Server actions:** prefix with the verb -- e.g., `createProduct`, `updateOrder`, `deleteCategory`.

---

## File & Directory Structure

### Frontend Apps (`Frontend/<app>/src/`)

```
src/
  app/                    # Next.js App Router pages
    (auth)/               # Route groups
    (dashboard)/
    api/                  # API routes
    layout.tsx
    page.tsx
  components/
    ui/                   # Reusable UI primitives (Button, Input, Dialog)
    layout/               # Header, Sidebar, Footer
    features/             # Feature-specific components
      products/
      orders/
      analytics/
  hooks/                  # Custom React hooks
  lib/                    # Utility functions, API clients
  services/               # External service integrations
  types/                  # TypeScript type definitions
  config/                 # App configuration constants
  context/                # React context providers
```

### Backend Services (`Backend/<service>/src/`)

```
src/
  routes/                 # Express/Hono route handlers
  services/               # Business logic layer
  repositories/           # Database access layer
  middleware/             # Auth, validation, rate-limiting
  jobs/                   # BullMQ job processors
  utils/                  # Shared utilities
  types/                  # Type definitions
```

### Shared Packages (`packages/`)

```
packages/
  shared/
    utils/                # @vayva/shared -- common utilities
    templates/            # @vayva/templates -- store templates
    emails/               # @vayva/emails -- email templates
    extensions/           # @vayva/extensions -- plugin system
  domain/
    payments/             # @vayva/payments -- Paystack integration
    analytics/            # @vayva/analytics -- analytics logic
  infra/
    redis-adapter/        # @vayva/redis -- Redis client wrapper
  ui/                     # @vayva/ui -- shared component library
```

---

## Import Ordering

Imports must follow this order, separated by blank lines:

1. **Node built-ins** -- `path`, `fs`, `crypto`
2. **Third-party libraries** -- `react`, `next`, `zod`, `@prisma/client`
3. **Monorepo packages** -- `@vayva/shared`, `@vayva/ui`, `@vayva/payments`
4. **Internal aliases** -- `@/components/...`, `@/lib/...`, `@/hooks/...`
5. **Relative imports** -- `./utils`, `../types`
6. **Style imports** -- CSS modules, Tailwind imports (rare)

```typescript
// 1. Node built-ins
import { randomUUID } from "crypto";

// 2. Third-party
import { z } from "zod";
import { prisma } from "@prisma/client";

// 3. Monorepo packages
import { formatNaira } from "@vayva/shared";
import { Button } from "@vayva/ui";

// 4. Internal aliases
import { useAuth } from "@/hooks/use-auth";
import { ProductCard } from "@/components/features/products/product-card";

// 5. Relative imports
import { validateInput } from "./helpers";
import type { ProductFormData } from "../types";
```

The `eslint-plugin-import` plugin enforces this ordering automatically.

---

## Component Patterns

### Server Components (Default)

Next.js App Router components are Server Components by default. Keep them that way unless interactivity is required.

```typescript
// app/(dashboard)/products/page.tsx -- Server Component
import { prisma } from "@vayva/db";
import { ProductList } from "@/components/features/products/product-list";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return <ProductList products={products} />;
}
```

### Client Components

Only add `"use client"` when the component needs browser APIs, event handlers, hooks, or state.

```typescript
"use client";

import { useState } from "react";
import { Button } from "@vayva/ui";

interface QuantitySelectorProps {
  initial: number;
  max: number;
  onChange: (quantity: number) => void;
}

export function QuantitySelector({ initial, max, onChange }: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initial);

  function handleIncrement() {
    if (quantity < max) {
      const next = quantity + 1;
      setQuantity(next);
      onChange(next);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => handleDecrement()}>
        -
      </Button>
      <span className="w-8 text-center">{quantity}</span>
      <Button size="sm" variant="outline" onClick={handleIncrement}>
        +
      </Button>
    </div>
  );
}
```

### Props Interface Pattern

- Define props as an `interface` named `<ComponentName>Props`.
- Always destructure props in the function signature.
- Place the interface directly above the component in the same file -- do not export it unless another file needs it.

### Composition over Configuration

Prefer composable components with children and slots over monolithic components with dozens of props.

```typescript
// Preferred -- composable
<Card>
  <CardHeader>
    <CardTitle>Revenue</CardTitle>
  </CardHeader>
  <CardContent>
    <RevenueChart data={data} />
  </CardContent>
</Card>

// Avoid -- monolithic
<Card title="Revenue" chart={<RevenueChart data={data} />} headerVariant="large" />
```

---

## Error Handling

### API Routes

Return structured error responses with consistent shapes:

```typescript
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const product = await productService.create(parsed.data);
    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/products]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Custom Error Classes

Use domain-specific error classes for business logic failures:

```typescript
export class InsufficientStockError extends Error {
  constructor(productId: string, requested: number, available: number) {
    super(
      `Insufficient stock for product ${productId}: requested ${requested}, available ${available}`
    );
    this.name = "InsufficientStockError";
  }
}

export class PaymentFailedError extends Error {
  constructor(
    public readonly reference: string,
    public readonly reason: string
  ) {
    super(`Payment failed for reference ${reference}: ${reason}`);
    this.name = "PaymentFailedError";
  }
}
```

### Client-Side Error Boundaries

Wrap feature sections in error boundaries. Use Next.js `error.tsx` files per route segment.

```typescript
// app/(dashboard)/products/error.tsx
"use client";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

---

## Linting & Formatting

### ESLint Configuration

The monorepo uses ESLint 8 with the following plugins:

| Plugin                           | Purpose                                  |
| -------------------------------- | ---------------------------------------- |
| `@typescript-eslint/eslint-plugin` | TypeScript-specific rules              |
| `eslint-plugin-import`           | Import ordering and resolution           |
| `eslint-plugin-react`            | React best practices                     |
| `eslint-plugin-react-hooks`      | Hooks rules enforcement                  |
| `eslint-plugin-jsx-a11y`         | Accessibility checks                     |
| `eslint-config-prettier`         | Disables rules that conflict with Prettier |

Run linting:

```bash
# Lint the entire monorepo
pnpm lint

# Auto-fix issues
pnpm lint:fix
```

### Prettier Configuration

Prettier handles all formatting. Key settings:

| Setting        | Value   |
| -------------- | ------- |
| Print width    | 100     |
| Tab width      | 2       |
| Semicolons     | Yes     |
| Single quotes  | No      |
| Trailing comma | `all`   |
| Bracket spacing| Yes     |

Run formatting:

```bash
pnpm format
```

### Pre-commit Checks

Before pushing code, run the full validation suite:

```bash
# Full validation (doctor + lint + build + e2e)
pnpm validate:ship

# CI guard scripts (domain checks, auth wrappers, IDOR checks)
pnpm ci:guards
```

---

## Commit Message Format

Vayva follows **Conventional Commits** (https://www.conventionalcommits.org/).

### Structure

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | When to use                                    |
| ---------- | ---------------------------------------------- |
| `feat`     | A new feature                                  |
| `fix`      | A bug fix                                      |
| `docs`     | Documentation only changes                     |
| `style`    | Formatting, missing semicolons (no logic change)|
| `refactor` | Code change that neither fixes nor adds feature|
| `perf`     | Performance improvement                        |
| `test`     | Adding or correcting tests                     |
| `build`    | Changes to build system or dependencies        |
| `ci`       | CI/CD configuration changes                    |
| `chore`    | Maintenance tasks                              |

### Scopes

Use the affected package or app name: `merchant`, `storefront`, `ops-console`, `core-api`, `worker`, `payments`, `ui`, `shared`, `db`, `infra`.

### Examples

```
feat(merchant): add bulk product import via CSV
fix(payments): handle Paystack webhook signature verification edge case
refactor(core-api): extract order processing into dedicated service
test(storefront): add E2E tests for checkout flow
build(infra): upgrade Prisma to 5.7.0
docs(ops-console): update API endpoint documentation
```

### Breaking Changes

Append `!` after the type/scope and include a `BREAKING CHANGE:` footer:

```
feat(api)!: change product pricing from Naira to kobo integers

BREAKING CHANGE: All price fields now expect integer values in kobo (1 NGN = 100 kobo).
Existing API consumers must update their integrations.
```

---

## Additional Rules

1. **No console.log in production code.** Use a structured logger (`console.error` is acceptable for error boundaries).
2. **No hardcoded URLs or secrets.** Use environment variables and the `@vayva/shared` config module.
3. **No barrel re-exports (`index.ts`) in app code.** They are acceptable in shared packages for public API surfaces.
4. **Maximum file length: 300 lines.** If a file exceeds this, decompose it.
5. **Dead code must be removed, not commented out.** Git history preserves everything.
6. **All public functions in shared packages must have JSDoc comments.**
