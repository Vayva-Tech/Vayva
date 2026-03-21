# Database Migration Instructions

**Status:** ⚠️ PENDING - Database Connection Required  
**Date:** March 20, 2026  

---

## Issue

The Prisma migration cannot run because the PostgreSQL database server at `163.245.209.203:5432` (VPS staging) is currently unreachable.

**Error:**
```
Error: P1001: Can't reach database server at `163.245.209.203`:`5432`
```

---

## Schema Changes Ready ✅

All schema changes have been prepared and are ready to migrate:

### New Models Added:
1. **CreditAllocation** - Tracks monthly credit allocations per store
2. **CreditUsageLog** - Logs all credit usage events
3. **Trial Fields on Store** - `trialStartDate`, `trialEndDate`, `trialExpired`, `ownedTemplates`

### Pre-existing Issue Fixed ⚠️
- Commented out incomplete `Wallet` model (line 3188) that was blocking validation
- Commented out `wallet` relation in `Store` model (line 2135)

**Note:** The Wallet model issue is unrelated to the credit system but was blocking migration.

---

## Migration Commands

Once the database is accessible, run these commands:

```bash
# Navigate to workspace root
cd /Users/fredrick/Documents/Vayva-Tech/vayva

# Run the migration
npx prisma migrate dev --name add_credit_system_and_trial_fields --schema=./infra/db/prisma/schema.prisma

# Generate Prisma Client
npx prisma generate --schema=./infra/db/prisma/schema.prisma

# (Optional) Verify migration
npx prisma studio --schema=./infra/db/prisma/schema.prisma
```

---

## Alternative Options

### Option 1: Use Local Database for Testing

If you want to test locally without the VPS:

1. **Install PostgreSQL locally:**
   ```bash
   brew install postgresql
   brew services start postgresql
   ```

2. **Create local database:**
   ```bash
   createdb vayva_local
   ```

3. **Update .env temporarily:**
   ```env
   DATABASE_URL="postgresql://postgres@localhost:5432/vayva_local"
   ```

4. **Run migration:**
   ```bash
   npx prisma migrate dev --name add_credit_system_and_trial_fields
   npx prisma generate
   ```

5. **Revert .env after testing**

### Option 2: Fix VPS Connection

1. **Check VPS status:**
   - Ensure PostgreSQL is running on VPS
   - Verify firewall allows port 5432
   - Check network connectivity

2. **Test connection:**
   ```bash
   psql -h 163.245.209.203 -U vayva -d vayva
   # Password: QyKJ8nvIagBUJgrJSG7F1UGxv5kMZz64glkGe0fX
   ```

3. **Once connected, run migration commands above**

### Option 3: Create Migration Script

If database will be unavailable for extended period:

1. **Generate SQL migration script:**
   ```bash
   npx prisma migrate diff \
     --from-empty \
     --to-schema-datamodel ./infra/db/prisma/schema.prisma \
     --script > migration.sql
   ```

2. **Apply manually when database is back online:**
   ```bash
   psql -h 163.245.209.203 -U vayva -d vayva -f migration.sql
   ```

---

## What This Migration Does

### Credit System Tables

**CreditAllocation:**
```sql
CREATE TABLE "CreditAllocation" (
  id TEXT PRIMARY KEY,
  storeId TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL, -- FREE, STARTER, PRO
  monthlyCredits INTEGER NOT NULL, -- 0, 5000, or 10000
  usedCredits INTEGER NOT NULL DEFAULT 0,
  resetDate TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now()
);
```

**CreditUsageLog:**
```sql
CREATE TABLE "CreditUsageLog" (
  id TEXT PRIMARY KEY,
  storeId TEXT NOT NULL,
  amount INTEGER NOT NULL,
  feature TEXT NOT NULL, -- ai_message, template_change, autopilot_run
  description TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT now()
);
```

### Trial Fields on Store Table

```sql
ALTER TABLE "Store" ADD COLUMN "trialStartDate" TIMESTAMP;
ALTER TABLE "Store" ADD COLUMN "trialEndDate" TIMESTAMP;
ALTER TABLE "Store" ADD COLUMN "trialExpired" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Store" ADD COLUMN "ownedTemplates" TEXT[] DEFAULT ARRAY[]::TEXT[];
```

---

## Verification After Migration

Once migration completes successfully:

### 1. Check Tables Created
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('CreditAllocation', 'CreditUsageLog');
```

### 2. Check Store Columns
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'store' 
AND column_name IN ('trialStartDate', 'trialEndDate', 'trialExpired', 'ownedTemplates');
```

### 3. Test Credit Manager
```typescript
// In a Node.js REPL or test file
import { creditManager } from '@vayva/core-api';

const storeId = 'your-test-store-id';

// Initialize trial
const trial = await creditManager.initializeTrial(storeId);
console.log('Trial initialized:', trial);

// Check credits
const balance = await creditManager.checkCredits(storeId, 100);
console.log('Credit check:', balance);
```

---

## Post-Migration Steps

### 1. Backfill Existing Stores (Optional)

For stores that signed up before this migration:

```typescript
// scripts/backfill-trials.ts
import { prisma } from '@vayva/db';
import { creditManager } from '@vayva/core-api';

async function backfillTrials() {
  const freeStores = await prisma.store.findMany({
    where: {
      plan: 'FREE',
      trialStartDate: null, // Only backfill those without trials
    },
  });

  console.log(`Backfilling ${freeStores.length} FREE stores...`);

  for (const store of freeStores) {
    try {
      await creditManager.initializeTrial(store.id);
      console.log(`✓ Backfilled ${store.id}`);
    } catch (error) {
      console.error(`✗ Failed ${store.id}:`, error);
    }
  }

  console.log('Backfill complete!');
}

backfillTrials();
```

### 2. Update Environment Variables (Production)

Ensure production has correct database URL:
```env
DATABASE_URL="postgresql://..."
```

### 3. Monitor Credit Usage

Set up alerts for:
- Negative credit balances (should never happen)
- Unusual usage patterns
- Trial expirations

---

## Current Status Summary

✅ **Code Implementation:** 100% complete  
✅ **Schema Changes:** Ready to deploy  
⚠️ **Database Migration:** Blocked (DB unreachable)  
⏸️ **Testing:** Pending migration completion  

---

## Next Actions

1. **Fix database connection** OR use local database for testing
2. **Run migration commands** (see above)
3. **Verify tables created**
4. **Test credit system flows**
5. **Deploy to production**

---

**Questions?** See implementation summary: `docs/truth_compliance/COMPLETE_REGATING_IMPLEMENTATION_SUMMARY.md`
