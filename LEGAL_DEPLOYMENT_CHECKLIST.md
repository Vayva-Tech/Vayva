# Legal Dashboard Deployment Checklist

## Pre-Deployment Verification

### 1. Database Schema ✅
- [x] Schema validated successfully
- [ ] Migration created and applied to database
- [ ] Prisma client generated
- [ ] Seed data loaded (optional)

**Commands:**
```bash
# Validate schema
npx prisma validate --schema=./packages/prisma/prisma/schema.prisma

# Create migration
npx prisma migrate dev --name add_legal_industry_models

# Generate client
npx prisma generate

# Seed data (optional)
npx prisma db seed
```

---

### 2. Backend API ✅
- [x] All 16 API endpoints created
- [x] Authentication middleware configured (`withVayvaAPI`)
- [x] Permission checks implemented
- [ ] Environment variables set
- [ ] API tested with Postman/curl

**Environment Variables Required:**
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
JWT_SECRET="your-secret-key"
```

**Test Endpoints:**
```bash
# Test dashboard endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "x-store-id: default" \
     https://api.yourdomain.com/api/legal/dashboard

# Expected response: JSON with all metrics
```

---

### 3. Frontend Components ✅
- [x] All 11 components created
- [x] Main dashboard page created
- [x] TypeScript types exported
- [ ] No TypeScript compilation errors
- [ ] No console errors in browser

**Verification Commands:**
```bash
cd Frontend/merchant-admin

# Type check
npm run type-check

# Build
npm run build

# Start dev server
npm run dev
```

**Browser Console Check:**
- Navigate to `/dashboard/legal`
- Open DevTools Console
- Verify no errors (warnings OK)
- Verify data loads in Network tab

---

### 4. Permissions Configuration ⚠️ REQUIRED
Add legal-specific permissions to your auth system:

**File:** `Backend/core-api/src/lib/permissions.ts`

```typescript
export const PERMISSIONS = {
  // ... existing permissions
  
  // Legal Dashboard
  LEGAL_DASHBOARD_VIEW: 'legal:dashboard:view',
  LEGAL_CASES_CREATE: 'legal:cases:create',
  LEGAL_CASES_EDIT: 'legal:cases:edit',
  LEGAL_CASES_DELETE: 'legal:cases:delete',
  
  // Time & Billing
  LEGAL_TIME_CREATE: 'legal:time:create',
  LEGAL_BILLING_CREATE: 'legal:billing:create',
  LEGAL_BILLING_APPROVE: 'legal:billing:approve',
  
  // Trust Accounting
  LEGAL_TRUST_ACCESS: 'legal:trust:access',
  LEGAL_TRUST_DISBURSE: 'legal:trust:disburse',
  
  // Documents
  LEGAL_DOCUMENTS_CREATE: 'legal:documents:create',
  LEGAL_DOCUMENTS_SIGN: 'legal:documents:sign',
};
```

**Role Mapping Example:**
```typescript
const ROLE_PERMISSIONS = {
  attorney: [
    'LEGAL_DASHBOARD_VIEW',
    'LEGAL_CASES_CREATE',
    'LEGAL_CASES_EDIT',
    'LEGAL_TIME_CREATE',
    'LEGAL_BILLING_CREATE',
    'LEGAL_TRUST_ACCESS',
  ],
  paralegal: [
    'LEGAL_DASHBOARD_VIEW',
    'LEGAL_CASES_EDIT',
    'LEGAL_TIME_CREATE',
    'LEGAL_DOCUMENTS_CREATE',
  ],
  staff: [
    'LEGAL_DASHBOARD_VIEW',
    'LEGAL_TIME_CREATE',
  ],
};
```

---

### 5. Store/Client Configuration ⚠️ REQUIRED
If using multi-tenancy, ensure stores have legal industry flag:

**Database Update:**
```sql
-- Add legal industry flag to stores table
ALTER TABLE "Store" ADD COLUMN "industry" TEXT DEFAULT 'general';
UPDATE "Store" SET industry = 'legal' WHERE name = 'Your Law Firm';
```

**Or via Prisma:**
```typescript
await prisma.store.update({
  where: { id: 'store_id' },
  data: { 
    industry: 'legal',
    settings: {
      ...existingSettings,
      legalPractice: true,
    }
  },
});
```

---

## Deployment Steps

### Step 1: Database Migration
```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva

# Development
npx prisma migrate dev --name add_legal_industry_models

# Production (use deploy instead of dev)
npx prisma migrate deploy
```

**Expected Output:**
```
Applying migration `add_legal_industry_models`
The following changes to the database are about to be executed:
- CreateTable PracticeArea
- CreateTable Case
- CreateTable LitigationParty
...
✔ Generated Prisma Client (v6.x.x) to ./node_modules/@prisma/client
```

---

### Step 2: Generate Prisma Client
```bash
cd packages/prisma
npx prisma generate
```

**Expected Output:**
```
Prisma schema loaded from prisma/schema.prisma
✔ Generated Prisma Client (v6.x.x) to ./node_modules/@prisma/client
```

---

### Step 3: Load Seed Data (Optional)
```bash
npx prisma db seed
```

**Expected Output:**
```
🌱 Seeding legal industry data...
✅ Practice areas seeded
✅ Trust accounts seeded
✅ Sample cases seeded
✅ Billing rates seeded
✅ Document templates seeded
✅ Court deadlines seeded
✅ CLE credits seeded
🎉 Seeding completed successfully!
```

---

### Step 4: Deploy Backend API
**Vercel Deployment:**
```bash
cd Backend/core-api

# Install dependencies
npm install

# Build
npm run build

# Deploy to Vercel
vercel deploy --prod
```

**Environment Variables in Vercel:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `NEXT_PUBLIC_API_URL` - Your API domain

---

### Step 5: Deploy Frontend
**Vercel Deployment:**
```bash
cd Frontend/merchant-admin

# Install dependencies
npm install

# Build
npm run build

# Deploy to Vercel
vercel deploy --prod
```

**Environment Variables in Vercel:**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_APP_URL` - Frontend domain

---

### Step 6: Test Dashboard Access
1. **Navigate to:** `https://your-domain.com/dashboard/legal`
2. **Login** with attorney/paralegal credentials
3. **Verify:**
   - ✅ Page loads without errors
   - ✅ All 11 components display
   - ✅ Data populates (not empty/loading forever)
   - ✅ No console errors
   - ✅ Responsive on mobile/tablet

---

## Post-Deployment Testing

### Functional Tests

#### 1. Dashboard Metrics
```typescript
// Test: Dashboard API returns valid data
const response = await fetch('/api/legal/dashboard', {
  headers: {
    'Authorization': 'Bearer TOKEN',
    'x-store-id': 'default'
  }
});

const data = await response.json();

// Verify structure
expect(data.success).toBe(true);
expect(data.data).toHaveProperty('firmPerformance');
expect(data.data).toHaveProperty('casePipeline');
expect(data.data.firmPerformance.activeCases).toBeGreaterThanOrEqual(0);
```

#### 2. Component Rendering
```tsx
// Test: Components render without crashing
import { render } from '@testing-library/react';
import { FirmPerformance } from '@/components/legal/FirmPerformance';

test('renders firm performance metrics', () => {
  const mockData = {
    activeCases: 42,
    billableHoursMTD: 156.5,
    collectionsMTD: 87500.00,
  };

  const { getByText } = render(
    <FirmPerformance data={mockData} />
  );

  expect(getByText('42')).toBeInTheDocument();
  expect(getByText('Active Cases')).toBeInTheDocument();
});
```

#### 3. API Endpoint Tests
```bash
# Test trust account balance endpoint
curl -X GET \
  -H "Authorization: Bearer TOKEN" \
  -H "x-store-id: default" \
  "https://api.yourdomain.com/api/legal/trust/accounts/balance"

# Expected: { "success": true, "data": { "totalBalance": 200000.00 } }
```

---

## Performance Benchmarks

### Target Metrics
| Metric | Target | Acceptable |
|--------|--------|------------|
| Dashboard Load Time | < 1s | < 2s |
| API Response Time | < 200ms | < 500ms |
| First Contentful Paint | < 1.5s | < 3s |
| Time to Interactive | < 3s | < 5s |
| Lighthouse Score | > 90 | > 75 |

### Monitoring Setup
**Use Vercel Analytics:**
```tsx
// Frontend/merchant-admin/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Troubleshooting

### Issue: Prisma Migration Fails
**Error:** `Can't reach database server at X.X.X.X`

**Solution:**
1. Verify DATABASE_URL is correct
2. Check database server is running
3. Ensure network connectivity
4. Try: `npx prisma db pull` to test connection

---

### Issue: Dashboard Shows Empty Data
**Possible Causes:**
1. No data in database → Run seed script
2. Wrong storeId → Check x-store-id header
3. Permission denied → Verify user permissions
4. API endpoint error → Check server logs

**Debug Steps:**
```bash
# Check API response
curl -H "Authorization: Bearer TOKEN" \
     -H "x-store-id: default" \
     https://api.yourdomain.com/api/legal/dashboard

# Check browser console for errors
# Open DevTools → Console → Look for red errors
```

---

### Issue: TypeScript Compilation Errors
**Common Errors:**
```
error TS2307: Cannot find module '@prisma/client'
```

**Solution:**
```bash
cd packages/prisma
npx prisma generate

cd ../..
npm install
```

---

## Security Checklist

### ✅ Must-Have Before Production
- [ ] HTTPS enforced (Vercel does this automatically)
- [ ] JWT authentication working
- [ ] Permission checks on all API endpoints
- [ ] SQL injection protection (Prisma provides this)
- [ ] XSS protection (React escapes by default)
- [ ] Rate limiting on API endpoints
- [ ] CORS configured correctly
- [ ] Environment variables secured (not committed to git)
- [ ] Database credentials rotated
- [ ] Audit logging enabled

### Recommended Enhancements
- [ ] Two-factor authentication
- [ ] IP whitelisting for admin access
- [ ] Session timeout (30 min inactivity)
- [ ] Password complexity requirements
- [ ] Account lockout after failed attempts
- [ ] Data encryption at rest
- [ ] Regular security audits

---

## Rollback Plan

### If Deployment Fails
1. **Revert Database:**
   ```bash
   npx prisma migrate resolve --rolled-back "migration_name"
   ```

2. **Revert Code:**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Redeploy Previous Version:**
   ```bash
   vercel deploy --prod --commit <previous-commit-hash>
   ```

---

## Success Criteria

### ✅ Deployment Complete When:
- [x] Database migration successful
- [x] Prisma client generated
- [x] Backend API deployed and responding
- [x] Frontend deployed and accessible
- [x] Dashboard loads without errors
- [x] All 11 components display data
- [x] No console errors
- [x] Permissions working correctly
- [x] Mobile responsive verified
- [x] Performance benchmarks met

---

## Next Steps After Deployment

### Phase 2 Enhancements (Optional)
1. **Additional APIs** (54 endpoints):
   - Document management
   - Litigation support
   - Compliance tracking
   - Advanced reporting

2. **Settings Pages** (8 pages):
   - Case management settings
   - Billing configuration
   - Trust account rules
   - Document templates
   - Deadline rules
   - User roles
   - CLE tracking
   - Malpractice settings

3. **Advanced Features**:
   - E-signature integration (DocuSign)
   - Calendar sync (Outlook/Google)
   - Payment processing (Stripe/LawPay)
   - Email integration
   - SMS notifications
   - Client portal

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Version:** 1.0.0
**Status:** ☐ Success ☐ Partial ☐ Failed

**Notes:**
_______________________________________
_______________________________________
_______________________________________
