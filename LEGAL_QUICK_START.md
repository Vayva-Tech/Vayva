# Legal Dashboard - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database accessible
- Git repository cloned

---

## Step 1: Install Dependencies

```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva

# Install root dependencies
npm install

# Install packages
cd packages/prisma && npm install && cd ../..
cd packages/industry-legal && npm install && cd ../..

# Install backend
cd Backend/core-api && npm install && cd ../..

# Install frontend
cd Frontend/merchant-admin && npm install && cd ../..
```

---

## Step 2: Configure Environment

Create `.env` file in root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Backend
JWT_SECRET="your-secret-key-here"
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Frontend
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Step 3: Setup Database

```bash
# Navigate to prisma package
cd packages/prisma

# Validate schema (should pass ✅)
npx prisma validate

# Generate migration
npx prisma migrate dev --name add_legal_industry_models

# Generate Prisma client
npx prisma generate

# (Optional) Seed test data
npx prisma db seed
```

**If database is not reachable:**
- Schema validation will still pass ✅
- You can proceed with development
- Migration will run when database becomes available

---

## Step 4: Start Development Servers

### Terminal 1 - Backend API
```bash
cd Backend/core-api
npm run dev
# Runs on http://localhost:3001
```

### Terminal 2 - Frontend
```bash
cd Frontend/merchant-admin
npm run dev
# Runs on http://localhost:3000
```

---

## Step 5: Access Dashboard

1. Open browser: `http://localhost:3000/dashboard/legal`
2. Login with your credentials
3. View the legal dashboard

**Expected Result:**
- 11 components should load
- Data should display (or empty state if no data seeded)
- No console errors

---

## 📁 Project Structure

```
vayva/
├── packages/
│   ├── prisma/
│   │   └── prisma/
│   │       ├── schema.prisma      # Database schema (18 legal models)
│   │       └── seed.ts            # Test data seeder
│   └── industry-legal/
│       └── src/
│           ├── types/
│           │   └── index.ts       # TypeScript types (671 lines)
│           ├── services/
│           │   └── index.ts       # Business logic (572 lines)
│           └── dashboard/
│               └── index.ts       # Dashboard config
├── Backend/
│   └── core-api/
│       └── src/
│           └── app/
│               └── api/
│                   └── legal/     # 16 API endpoints
└── Frontend/
    └── merchant-admin/
        ├── src/
        │   ├── components/
        │   │   └── legal/         # 11 React components
        │   └── app/
        │       └── (dashboard)/
        │           └── dashboard/
        │               └── legal/ # Dashboard page
        └── types/
            └── legal.ts           # Frontend type exports
```

---

## 🎯 Key Files to Know

### Backend Files
| File | Purpose | Lines |
|------|---------|-------|
| `packages/prisma/prisma/schema.prisma` | Database schema | 550+ |
| `packages/industry-legal/src/types/index.ts` | TypeScript types | 671 |
| `packages/industry-legal/src/services/index.ts` | Business logic | 572 |
| `Backend/core-api/src/app/api/legal/dashboard/route.ts` | Main API | 175 |

### Frontend Files
| File | Purpose | Lines |
|------|---------|-------|
| `Frontend/.../components/legal/FirmPerformance.tsx` | Metrics display | ~80 |
| `Frontend/.../components/legal/CasePipeline.tsx` | Pipeline view | ~120 |
| `Frontend/.../components/legal/TrustAccount.tsx` | Trust ledger | ~150 |
| `Frontend/.../app/(dashboard)/dashboard/legal/page.tsx` | Main page | 186 |

---

## 🔧 Common Development Tasks

### Add New Dashboard Component

1. **Create component:**
   ```tsx
   // Frontend/merchant-admin/src/components/legal/NewComponent.tsx
   import { Card } from "@/components/ui/card";
   
   interface NewComponentProps {
     data?: YourDataType;
   }
   
   export function NewComponent({ data }: NewComponentProps) {
     return (
       <Card className="p-6 border-l-4 border-blue-900 backdrop-blur-sm bg-white/90">
         {/* Your content */}
       </Card>
     );
   }
   ```

2. **Add to dashboard page:**
   ```tsx
   // Frontend/.../dashboard/legal/page.tsx
   import { NewComponent } from '@/components/legal/NewComponent';
   
   // In the grid:
   <NewComponent data={dashboardData?.yourData} />
   ```

3. **Add API endpoint:**
   ```typescript
   // Backend/core-api/src/app/api/legal/your-endpoint/route.ts
   export const GET = withVayvaAPI(
     PERMISSIONS.DASHBOARD_VIEW,
     async (request: NextRequest) => {
       // Your logic
       return NextResponse.json({ success: true, data: result });
     }
   );
   ```

---

### Add New Database Model

1. **Edit schema:**
   ```prisma
   // packages/prisma/prisma/schema.prisma
   model YourModel {
     id          String   @id @default(cuid())
     name        String
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
     
     @@index([storeId])
   }
   ```

2. **Generate migration:**
   ```bash
   npx prisma migrate dev --name add_your_model
   ```

3. **Regenerate client:**
   ```bash
   npx prisma generate
   ```

---

### Add New API Endpoint

1. **Create route file:**
   ```typescript
   // Backend/core-api/src/app/api/legal/your-feature/route.ts
   import { NextRequest } from "next/server";
   import { NextResponse } from "next/server";
   import { withVayvaAPI } from "@/lib/with-vayva-api";
   import { PERMISSIONS } from "@/lib/permissions";
   import { prisma } from "@/lib/prisma";
   
   export const GET = withVayvaAPI(
     PERMISSIONS.YOUR_PERMISSION,
     async (request: NextRequest) => {
       try {
         const storeId = request.headers.get("x-store-id");
         
         const result = await prisma.yourModel.findMany({
           where: { storeId },
         });
         
         return NextResponse.json({ success: true, data: result });
       } catch (error) {
         return NextResponse.json(
           { success: false, error: "Error message" },
           { status: 500 }
         );
       }
     }
   );
   ```

2. **Test endpoint:**
   ```bash
   curl -H "Authorization: Bearer TOKEN" \
        -H "x-store-id: default" \
        http://localhost:3001/api/legal/your-feature
   ```

---

## 🐛 Debugging Tips

### Check API Response
```bash
# Use curl or Postman
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "x-store-id: default" \
     http://localhost:3001/api/legal/dashboard | jq
```

### Check Database Connection
```bash
cd packages/prisma
npx prisma db pull
```

### Check TypeScript Errors
```bash
cd Frontend/merchant-admin
npm run type-check
```

### Check Component Rendering
- Open browser DevTools
- Go to Console tab
- Look for errors in red
- Check Network tab for failed requests

---

## 📊 Testing the Dashboard

### Manual Testing Checklist
- [ ] Navigate to `/dashboard/legal`
- [ ] Verify all 11 components load
- [ ] Check data populates (not stuck on loading)
- [ ] Resize window (test responsiveness)
- [ ] Click on any interactive elements
- [ ] Check mobile view (use DevTools device mode)
- [ ] Verify real-time refresh (wait 60s)

### API Testing Script
```bash
#!/bin/bash
# test-legal-api.sh

TOKEN="your-jwt-token"
BASE_URL="http://localhost:3001"

echo "Testing Legal Dashboard API..."

# Test dashboard endpoint
echo -e "\n1. Dashboard Metrics"
curl -s -H "Authorization: Bearer $TOKEN" \
         -H "x-store-id: default" \
         "$BASE_URL/api/legal/dashboard" | jq '.data.firmPerformance'

# Test cases by practice area
echo -e "\n2. Cases by Practice Area"
curl -s -H "Authorization: Bearer $TOKEN" \
         -H "x-store-id: default" \
         "$BASE_URL/api/legal/cases/by-practice-area" | jq '.data'

# Test trust accounts
echo -e "\n3. Trust Accounts"
curl -s -H "Authorization: Bearer $TOKEN" \
         -H "x-store-id: default" \
         "$BASE_URL/api/legal/trust/accounts" | jq '.data'

echo -e "\n✅ All tests complete!"
```

---

## 🎨 Design System Reference

### Premium Glass Theme
```tsx
// Card pattern
<Card className="p-6 border-l-4 border-blue-900 shadow-lg backdrop-blur-sm bg-white/90">

// Icon color
className="text-blue-900"

// Primary button
<Button className="bg-blue-900 text-white hover:bg-blue-800">

// Text colors
className="text-text-primary"   // Main text
className="text-text-secondary" // Muted text
```

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Justice Blue | #1E40AF | Primary actions, borders |
| Authority Gold | #D97706 | Success states, money |
| Integrity Green | #059669 | Positive metrics |
| Confidentiality Red | #DC2626 | Alerts, urgent items |

---

## 📚 Additional Resources

### Documentation Files
- `LEGAL_IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- `LEGAL_DEPLOYMENT_CHECKLIST.md` - Production deployment guide
- `BATCH_5_DESIGN_LEGAL.md` - Original design specification

### Code References
- Prisma Schema: `packages/prisma/prisma/schema.prisma`
- TypeScript Types: `packages/industry-legal/src/types/index.ts`
- Services: `packages/industry-legal/src/services/index.ts`
- API Routes: `Backend/core-api/src/app/api/legal/`
- Components: `Frontend/merchant-admin/src/components/legal/`

---

## 💡 Quick Commands Reference

```bash
# Database commands
npx prisma validate              # Validate schema
npx prisma migrate dev           # Create and apply migration
npx prisma migrate deploy        # Production deployment
npx prisma generate              # Generate Prisma client
npx prisma db seed               # Load seed data
npx prisma studio                # Open database GUI

# Development commands
npm run dev                      # Start dev server
npm run build                    # Build for production
npm run type-check               # TypeScript validation
npm run lint                     # ESLint validation

# Deployment commands
vercel deploy                    # Deploy to Vercel
vercel deploy --prod             # Production deployment
```

---

## 🆘 Getting Help

### Common Issues

**Issue:** `Cannot find module '@prisma/client'`
**Solution:** Run `npx prisma generate` in packages/prisma directory

**Issue:** `Database connection error`
**Solution:** Check DATABASE_URL in .env file

**Issue:** `Permission denied on API endpoint`
**Solution:** Verify JWT token has required permissions

**Issue:** `Dashboard shows empty state`
**Solution:** Either no data in database or wrong storeId header

### Support Channels
- **Documentation:** See .md files in root directory
- **Code Comments:** JSDoc comments in all files
- **Developer Contact:** WhatsApp: 07015459557

---

## ✅ Success Indicators

You know everything is working when:
- ✅ `npx prisma validate` passes without errors
- ✅ Backend starts without errors on port 3001
- ✅ Frontend starts without errors on port 3000
- ✅ Dashboard page loads at `/dashboard/legal`
- ✅ All 11 components display data
- ✅ No console errors in browser
- ✅ API responses return valid JSON

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Status:** Production Ready
