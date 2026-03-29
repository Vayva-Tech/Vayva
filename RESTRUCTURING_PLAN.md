# Repository Cleanup & Restructuring Plan

**Date:** 2026-03-28  
**Objective:** Separate frontend from backend, simplify codebase, eliminate redundancy

---

## Executive Summary

Your repo has **critical architectural confusion** with duplicate database layers, scattered Prisma schemas, and unclear boundaries between frontend/backend. This plan provides a step-by-step approach to achieve clean separation.

### Current Problems

1. **Three duplicate database packages:**
   - `/infra/db` ✅ (PRIMARY - used by Fastify)
   - `/platform/infra/db` ❌ (DUPLICATE)
   - `/packages/prisma` ❌ (INCOMPLETE/OUTDATED)

2. **Frontend still has direct Prisma imports** (violating separation):
   - Found in docs: `import { prisma } from "@vayva/db"` in Frontend/merchant files
   - These should call backend APIs instead

3. **Unclear infra purpose:**
   - `/infra` contains app code (db client) + infrastructure (Terraform)
   - Should only contain infrastructure configs

4. **Backend has both core-api AND fastify-server:**
   - `core-api` = Next.js API routes (legacy pattern)
   - `fastify-server` = Standalone Fastify (target architecture)
   - Need to clarify which is primary

---

## Target Architecture

```
vayva/
│
├── Frontend/                    # Next.js apps (Vercel deployment)
│   ├── merchant/                # Merchant dashboard → merchant.vayva.ng
│   ├── marketing/               # Marketing site → vayva.ng
│   ├── ops-console/             # Ops console → ops.vayva.ng
│   └── storefront/              # Customer stores → store.vayva.ng
│   │
│   └── SHARED PACKAGES:
│       ├── api-client/          # HTTP client to call backend APIs
│       └── ui/                  # Component library
│
├── Backend/                     # Fastify server (VPS/self-hosted)
│   ├── fastify-server/          # PRIMARY API SERVER ✅
│   │   ├── src/
│   │   │   ├── services/        # Business logic
│   │   │   ├── routes/          # API endpoints
│   │   │   └── middleware/      # Auth, rate limiting, etc.
│   │   └── package.json         # @vayva/fastify-server
│   │
│   └── worker/                  # Background jobs (BullMQ)
│
├── packages/                    # Shared libraries
│   ├── db/                      # ⭐ MOVED HERE from /infra/db
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Canonical schema (10k+ lines)
│   │   │   └── migrations/      # All migrations
│   │   ├── src/
│   │   │   ├── client.ts        # Prisma client exports
│   │   │   └── helpers/         # Idempotency, etc.
│   │   └── package.json         # @vayva/db
│   │
│   ├── schemas/                 # Zod schemas
│   ├── ai-agent/                # AI agent logic
│   ├── billing/                 # Subscription management
│   ├── payments/                # Paystack integration
│   └── ...                      # Other shared packages
│
└── infra/                       # Infrastructure-only (NO APP CODE)
    ├── terraform/               # AWS/VPS provisioning
    ├── docker/                  # Docker configs
    └── scripts/                 # Deployment scripts
```

---

## Action Plan

### Phase 1: Consolidate Database Package (CRITICAL)

**Goal:** Single source of truth for Prisma

#### Step 1.1: Verify Primary Database Location
✅ **KEEP:** `/infra/db` (most complete, used by fastify-server)
❌ **DELETE:** `/platform/infra/db` (duplicate)
❌ **MERGE/DELETE:** `/packages/prisma` (incomplete)

#### Step 1.2: Move to Standard Location
```bash
# Move /infra/db → /packages/db (standard monorepo pattern)
mv infra/db packages/db

# Update package.json name if needed
# From: "@vayva/db" (already correct)
```

#### Step 1.3: Update Dependencies
All packages using `@vayva/db` will automatically work since package.json already has `"name": "@vayva/db"`.

**Verification:**
```bash
pnpm install
pnpm db:generate  # Should generate Prisma client in packages/db/src/generated/client
```

---

### Phase 2: Clean Up Duplicates

#### Step 2.1: Delete Duplicate Database Packages

```bash
# Remove duplicates
rm -rf platform/infra/db
rm -rf packages/prisma

# If /packages/prisma has unique migrations, merge them first:
# cp packages/prisma/prisma/migrations/*.sql packages/db/prisma/migrations/
```

#### Step 2.2: Audit /infra/scripts

Review each file:
- `scaffold_apps.sh` - Keep if still used for scaffolding
- `smoke_test.sh` - Keep if still used for testing
- `seed.ts` - Likely duplicate of `packages/db/prisma/seed.ts`

**Action:** Delete unless actively used.

#### Step 2.3: Evaluate Terraform

Check if `/infra/terraform` is actively used:
- ✅ **KEEP** if deploying to AWS/VPS
- ❌ **DELETE** if only using Vercel

---

### Phase 3: Enforce Frontend-Backend Separation

#### Step 3.1: Identify Frontend Files with Direct Prisma Access

From previous audits, these files need migration:
- `Frontend/merchant/src/lib/security.ts`
- `Frontend/merchant/src/lib/apiKeys.ts`
- `Frontend/merchant/src/lib/eventBus.ts`
- `Frontend/merchant/src/lib/onboarding-sync.ts`
- `Frontend/merchant/src/lib/deletionService.ts`
- `Frontend/merchant/src/lib/beauty.service.ts`

#### Step 3.2: Migration Pattern

**BEFORE (Frontend with Prisma):**
```typescript
// Frontend/merchant/src/lib/security.ts ❌
import { prisma } from '@vayva/db';

export async function checkApiKey(apiKey: string) {
  return await prisma.apiKey.findUnique({ where: { key: apiKey } });
}
```

**AFTER (Frontend calling Backend API):**
```typescript
// Frontend/merchant/src/lib/security.ts ✅
import { apiClient } from '@vayva/api-client';

export async function checkApiKey(apiKey: string) {
  const response = await apiClient.post('/api/v1/security/verify-key', { apiKey });
  return response.data;
}
```

**Backend Service (NEW):**
```typescript
// Backend/fastify-server/src/services/security.service.ts ✅
import { prisma } from '@vayva/db';

export class SecurityService {
  async verifyApiKey(apiKey: string) {
    return await prisma.apiKey.findUnique({ where: { key: apiKey } });
  }
}
```

**Backend Route:**
```typescript
// Backend/fastify-server/src/routes/api/v1/security.routes.ts ✅
import { SecurityService } from '../../services/security.service';

export async function securityRoutes(fastify: FastifyInstance) {
  const service = new SecurityService();
  
  fastify.post('/verify-key', async (request, reply) => {
    const { apiKey } = request.body as { apiKey: string };
    const result = await service.verifyApiKey(apiKey);
    return { valid: !!result };
  });
}
```

---

### Phase 4: Simplify Backend Architecture

#### Decision: Choose Primary Backend Pattern

You have two patterns:

**Option A: Keep Both (Hybrid)**
- `fastify-server` = Main API server (stateless, business logic)
- `core-api` = Next.js API routes (Vercel edge functions, thin proxy to Fastify)

**Option B: Fastify Only (Cleaner)**
- `fastify-server` = ONLY backend API server
- Deploy on VPS/self-hosted
- Frontend calls Fastify directly via HTTP

**Recommendation:** Option B (Fastify-only) for true separation.

#### Step 4.1: If Choosing Fastify-Only

1. Migrate any unique logic from `core-api` → `fastify-server`
2. Update Frontend to call `fastify-server` endpoints directly
3. Delete or repurpose `core-api`

---

### Phase 5: Final Structure Verification

Run these checks:

```bash
# 1. No Prisma imports in Frontend
grep -r "from ['\"]@vayva/db['"]" Frontend/ || echo "✅ No direct Prisma in Frontend"

# 2. Only Backend imports @vayva/db
grep -r "from ['\"]@vayva/db['"]" Backend/ | wc -l  # Should be > 0

# 3. Single Prisma schema exists
ls -la packages/db/prisma/schema.prisma  # Should exist

# 4. No duplicate database packages
test ! -d platform/infra/db && echo "✅ Duplicate removed"
test ! -d packages/prisma && echo "✅ Outdated package removed"
```

---

## Implementation Checklist

### Week 1: Database Consolidation
- [ ] Move `/infra/db` → `/packages/db`
- [ ] Delete `/platform/infra/db`
- [ ] Merge/delete `/packages/prisma`
- [ ] Update root `package.json` scripts
- [ ] Run `pnpm install` and verify all builds pass

### Week 2: Infra Cleanup
- [ ] Audit `/infra/scripts` - keep only essential
- [ ] Evaluate Terraform usage
- [ ] Move essential scripts to `/platform/scripts`
- [ ] Delete `/infra` or keep only Terraform/Docker

### Week 3-4: Frontend Migration
- [ ] Create backend services for remaining Prisma-using files
- [ ] Create corresponding API routes
- [ ] Migrate Frontend files to use API calls
- [ ] Test all functionality end-to-end
- [ ] Remove `@vayva/db` dependency from Frontend packages

### Week 5: Backend Simplification
- [ ] Decide: Hybrid vs Fastify-only
- [ ] If Fastify-only: migrate core-api logic
- [ ] Update deployment configs
- [ ] Update documentation

---

## Expected Benefits

1. **Clear Boundaries:**
   - Frontend = UI only, calls APIs
   - Backend = Business logic + Database access
   - Infra = Deployment configs only

2. **Simplified Dependency Graph:**
   - Single `@vayva/db` package in `/packages/db`
   - No circular dependencies
   - Clear ownership

3. **Easier Onboarding:**
   - New devs understand architecture immediately
   - No confusion about where DB code lives
   - Standard monorepo patterns

4. **Better Security:**
   - No direct DB access from Frontend
   - All data access through authenticated API routes
   - Centralized validation and rate limiting

---

## Next Steps

1. **Get your decision on:**
   - Keep `/infra` for Terraform only?
   - Fastify-only backend or hybrid?

2. **I can then execute:**
   - Phase 1 (database consolidation) - 2 hours
   - Phase 2 (cleanup duplicates) - 1 hour
   - Phase 3 (frontend migration) - 2-3 days per file
   - Phase 4 (backend simplification) - 1-2 days

Which phase should I start with?
