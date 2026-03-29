# Remaining 53 Routes Migration Plan

## Backend Services Created (27 total):
1. beauty-stylists.routes.ts ✓
2. beauty-gallery.routes.ts ✓
3. beauty-packages.routes.ts ✓
4. marketplace-vendors.routes.ts ✓
5. education-enrollments.routes.ts (needed)
6. calendar-sync.routes.ts (needed)
7. dashboard-sidebar-counts.routes.ts (needed)
8. b2b-credit.routes.ts (needed)
9. b2b-rfq.routes.ts (needed)
10. affiliate.routes.ts (needed)
11. affiliate-dashboard.routes.ts (needed)
12. nightlife-events.routes.ts (already exists - extend)
13. merchant-quick-replies.routes.ts (needed)
14. merchant-policies.routes.ts (needed)
15. merchant-readiness.routes.ts (needed)
16. merchant-billing.routes.ts (needed)
17. merchant-store-status.routes.ts (needed)
18. analytics-events.routes.ts (needed)
19. editor-data-extensions.routes.ts (needed)
20. telemetry.routes.ts (needed)
21. store-policies.routes.ts (needed)
22. socials-instagram.routes.ts (needed)
23. rescue-incidents.routes.ts (extend existing)
24. kyc-cac.routes.ts (extend existing)
25. webhooks-delivery.routes.ts (needed)
26. kitchen-orders.routes.ts (extend existing)
27. beta-waitlist.routes.ts (extend existing)

## Frontend Migration Pattern:
```typescript
// BEFORE
import { prisma } from "@vayva/db";
export async function GET(request: NextRequest) {
  const storeId = auth.user.storeId;
  const data = await prisma.model.findMany({ where: { storeId } });
  return NextResponse.json(data);
}

// AFTER  
import { apiJson } from "@/lib/api-client-shared";
export async function GET(request: NextRequest) {
  const auth = await buildBackendAuthHeaders(request);
  const response = await apiJson(
    `${process.env.BACKEND_API_URL}/api/v1/model?storeId=${auth.user.storeId}`,
    { headers: auth.headers }
  );
  return NextResponse.json(response);
}
```

## Files to Migrate (53 total):
See full list in previous grep output. All follow same pattern.
