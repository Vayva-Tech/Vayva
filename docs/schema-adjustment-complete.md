# ✅ Schema Adjustment Complete

## Status: SCHEMA UPDATED, PRISMA CLIENT GENERATED

### Summary
Successfully added `payoutsEnabled` field to the Store model and generated the Prisma client. The action APIs now have the schema support they need.

---

## ✅ Changes Made

### 1. Schema Update
**File**: `infra/db/prisma/schema.prisma`
**Line**: 1941

**Added**:
```prisma
model Store {
  // ... existing fields
  isLive                   Boolean                   @default(false)
  payoutsEnabled           Boolean                   @default(true)  // ✅ ADDED
  // ... rest of fields
}
```

### 2. Prisma Client Generated
```bash
✔ Generated Prisma Client (v5.7.0)
```

The TypeScript types now include:
- `Store.payoutsEnabled: boolean`
- Default value: `true`

---

## ⚠️ Remaining Work: Update Action APIs

The action APIs still reference `prisma.merchant` instead of `prisma.store`. They need to be updated to match the schema.

### Files That Need Updates (4)

#### 1. disable-payouts/route.ts
**Changes Needed**:
- Line 28: `prisma.merchant` → `prisma.store`
- Line 29: `businessName` → `name`
- Line 49: `prisma.merchant` → `prisma.store`
- Line 57: `actorId` → `opsUserId`
- Line 58: `action` → `eventType`
- Line 59-65: Move `targetType`, `targetId`, `reason` into `metadata`

#### 2. enable-payouts/route.ts
**Changes Needed**:
- Same as disable-payouts

#### 3. force-kyc-review/route.ts
**Changes Needed**:
- Line 28: `prisma.merchant` → `prisma.store`
- Line 32: `kycSubmissions` → `kycRecord`
- Line 58: `prisma.kycSubmission` → `prisma.kycRecord`
- Line 70: Update audit log structure

#### 4. suspend-account/route.ts
**Changes Needed**:
- Line 28: `prisma.merchant` → `prisma.store`
- Line 33: Add tenant/membership query for user
- Line 56: `prisma.merchant` → `prisma.store`
- Line 57: `isActive` → `isLive`
- Line 65-69: Update user suspension logic
- Line 75: Update audit log structure

---

## Quick Reference: Field Mapping

| API Code (Old) | Schema (Actual) | Notes |
|---|---|---|
| `prisma.merchant` | `prisma.store` | Model name |
| `merchant.businessName` | `store.name` | Field name |
| `merchant.isActive` | `store.isLive` | Field name |
| `merchant.payoutsEnabled` | `store.payoutsEnabled` | ✅ Now exists |
| `merchant.kycSubmissions` | `store.kycRecord` | One-to-one, not array |
| `merchant.User` | `store.tenant.TenantMembership[].User` | Indirect relation |
| `opsAuditEvent.actorId` | `opsAuditEvent.opsUserId` | Field name |
| `opsAuditEvent.action` | `opsAuditEvent.eventType` | Field name |
| `opsAuditEvent.targetType` | `opsAuditEvent.metadata.targetType` | Store in JSON |
| `opsAuditEvent.targetId` | `opsAuditEvent.metadata.targetId` | Store in JSON |
| `opsAuditEvent.reason` | `opsAuditEvent.metadata.reason` | Store in JSON |

---

## Database Migration (When Ready)

When you're ready to apply the schema change to the database:

```bash
cd /Users/fredrick/Documents/GitHub/vayva-platform/infra/db

# Ensure DATABASE_URL is set
export DATABASE_URL="your-database-url"

# Run migration
pnpm prisma migrate dev --name add_payouts_enabled_to_store

# Or for production
pnpm prisma migrate deploy
```

The migration will:
1. Add `payoutsEnabled` column to `Store` table
2. Set default value to `true` for all existing stores
3. Update the migration history

---

## Next Steps

### Option 1: Update APIs Manually (Recommended for Learning)
Update each of the 4 action API files following the mapping table above.

### Option 2: I Can Update APIs (Faster)
I can update all 4 files to match the schema in one go.

### Option 3: Test Current State
The schema is ready, but APIs will fail until updated. You can test to see the exact errors.

---

## Testing Plan (After API Updates)

### 1. Start Dev Server
```bash
pnpm dev --filter ops-console
```

### 2. Login to Ops Console
Navigate to: `http://localhost:3002/ops/login`
- Email: `fred@vayva.ng`
- Password: `Smackdown21!`

### 3. Test Actions
1. Go to `/ops/merchants`
2. Click on a merchant
3. Go to "Actions" tab
4. Try "Disable Payouts"
   - Should require reason (10+ chars)
   - Should create audit log
   - Should update `store.payoutsEnabled` to `false`
5. Try "Enable Payouts"
   - Should re-enable
6. Try "Force KYC Review"
   - Should reset KYC status to PENDING
7. Try "Suspend Account" (requires OPS_OWNER role)
   - Should set `store.isLive` to `false`
   - Should set `store.payoutsEnabled` to `false`

### 4. Verify Audit Logs
Check `/ops/merchants/:id` → "Audit" tab
- Should see entries for each action
- Should include reason in metadata
- Should show actor (your ops user)

---

## Current Status Summary

| Component | Status | Notes |
|---|---|---|
| Schema | ✅ Updated | `payoutsEnabled` added to Store |
| Prisma Client | ✅ Generated | Types include new field |
| Database | ⏳ Pending | Migration not run (no DATABASE_URL) |
| Action APIs | ❌ Need Update | Still reference old schema |
| Frontend | ✅ Ready | Already uses correct terminology |

---

## Files Modified

### Schema (1)
1. `infra/db/prisma/schema.prisma` - Added `payoutsEnabled` to Store

### Documentation (2)
1. `docs/schema-adjustment-plan.md` - Detailed analysis
2. `docs/schema-adjustment-complete.md` - This file

---

**Next Action**: Update the 4 action API files to use `prisma.store` instead of `prisma.merchant`.

Would you like me to update the APIs now?
