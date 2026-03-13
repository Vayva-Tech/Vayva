# Phase 1: Core Commerce API Implementation Plan

**Document Version:** 1.0  
**Target Completion:** Weeks 3-5  
**Total APIs:** 80 (Fashion: 30, Restaurant: 30, Retail: 20)

---

## Overview

Implementing Phase 1 of the Industry API Inventory focusing on high-priority commerce industries:
- **Fashion** (30 APIs): Visual merchandising, size guides, collections, trend analytics
- **Restaurant** (30 APIs): Kitchen Display System, table management, menu, 86 board
- **Retail** (20 APIs): Multi-channel management, store operations, loyalty programs

## Implementation Approach

### Architecture Pattern
Following existing Vayva patterns:
- **Framework:** Next.js 14+ App Router
- **API Structure:** `/src/app/api/[industry]/[resource]/route.ts`
- **Authentication:** `withVayvaAPI()` middleware
- **Database:** Prisma with tenant isolation
- **Validation:** Zod schemas
- **Testing:** Vitest + integration tests

### Folder Structure
```
Backend/core-api/src/app/api/
├── fashion/
│   ├── lookbooks/
│   ├── size-guides/
│   ├── collections/
│   ├── trends/
│   ├── inventory/
│   └── wholesale/
├── restaurant/
│   ├── kds/
│   ├── tables/
│   ├── menu/
│   ├── 86-board/
│   ├── ingredients/
│   ├── reservations/
│   └── delivery-zones/
└── retail/
    ├── channels/
    ├── stores/
    ├── transfers/
    ├── loyalty/
    └── gift-cards/
```

---

## Detailed Implementation Schedule

### Week 3: Fashion Industry APIs (30 APIs)

#### Week 3.1: Visual Merchandising & Collections (Days 1-2)
- `/api/fashion/lookbooks/*` (5 endpoints)
- `/api/fashion/collections/*` (5 endpoints)

#### Week 3.2: Size Guides & Trend Analytics (Days 3-4)
- `/api/fashion/size-guides/*` (4 endpoints)
- `/api/fashion/trends/*` (4 endpoints)

#### Week 3.3: Inventory & Wholesale (Days 5-7)
- `/api/fashion/inventory/*` (4 endpoints)
- `/api/fashion/wholesale/*` (4 endpoints)
- `/api/fashion/fit/*` (4 endpoints)

### Week 4: Restaurant Industry APIs (30 APIs)

#### Week 4.1: Kitchen Display System (Days 1-2)
- `/api/restaurant/kds/*` (6 endpoints)

#### Week 4.2: Table & Menu Management (Days 3-4)
- `/api/restaurant/tables/*` (5 endpoints)
- `/api/restaurant/menu/*` (5 endpoints)

#### Week 4.3: Operations & Delivery (Days 5-7)
- `/api/restaurant/86-board/*` (3 endpoints)
- `/api/restaurant/ingredients/*` (4 endpoints)
- `/api/restaurant/reservations/*` (4 endpoints)
- `/api/restaurant/delivery-zones/*` (3 endpoints)

### Week 5: Retail Industry APIs (20 APIs)

#### Week 5.1: Channels & Stores (Days 1-3)
- `/api/retail/channels/*` (5 endpoints)
- `/api/retail/stores/*` (5 endpoints)

#### Week 5.2: Transfers & Loyalty (Days 4-5)
- `/api/retail/transfers/*` (4 endpoints)
- `/api/retail/loyalty/*` (4 endpoints)

#### Week 5.3: Gift Cards & Final Testing (Days 6-7)
- `/api/retail/gift-cards/*` (2 endpoints)
- Comprehensive testing and documentation

---

## Technical Implementation Details

### 1. API Route Template

```typescript
// src/app/api/fashion/lookbooks/route.ts
import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";

// Validation schemas
const CreateLookbookSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const GET = withVayvaAPI(
  PERMISSIONS.FASHION_LOOKBOOKS_VIEW,
  async (req, { storeId, db }) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      
      const lookbooks = await db.lookbook.findMany({
        where: { storeId },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
      });

      const total = await db.lookbook.count({ where: { storeId } });

      return NextResponse.json({
        success: true,
        data: lookbooks,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: "LOOKBOOK_FETCH_FAILED", 
            message: "Failed to fetch lookbooks" 
          } 
        },
        { status: 500 }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.FASHION_LOOKBOOKS_MANAGE,
  async (req, { storeId, db }) => {
    try {
      const body = await req.json();
      const validatedData = CreateLookbookSchema.parse(body);

      const lookbook = await db.lookbook.create({
        data: {
          ...validatedData,
          storeId,
        },
      });

      return NextResponse.json({
        success: true,
        data: lookbook,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: "VALIDATION_ERROR", 
              message: "Invalid request data",
              details: error.errors
            } 
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: "LOOKBOOK_CREATE_FAILED", 
            message: "Failed to create lookbook" 
          } 
        },
        { status: 500 }
      );
    }
  }
);
```

### 2. Database Schema Extensions

Need to extend Prisma schema for industry-specific models:

```prisma
// Fashion Models
model Lookbook {
  id          String   @id @default(cuid())
  storeId     String
  title       String
  description String?
  isActive    Boolean  @default(true)
  coverImage  String?
  products    LookbookProduct[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt()
  
  store Store @relation(fields: [storeId], references: [id])
}

model SizeGuide {
  id          String   @id @default(cuid())
  storeId     String
  name        String
  description String?
  measurements SizeMeasurement[]
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt()
}

// Restaurant Models
model KitchenTicket {
  id          String   @id @default(cuid())
  storeId     String
  orderId     String
  tableNumber String?
  status      TicketStatus @default(PENDING)
  items       Json
  station     String
  priority    Int      @default(0)
  estimatedTime Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt()
}

model MenuItem {
  id          String   @id @default(cuid())
  storeId     String
  name        String
  description String?
  price       Decimal
  categoryId  String
  isAvailable Boolean @default(true)
  ingredients Json?
  allergens   String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt()
}

// Retail Models
model SalesChannel {
  id          String   @id @default(cuid())
  storeId     String
  name        String
  type        ChannelType
  isActive    Boolean  @default(true)
  config      Json
  syncStatus  SyncStatus @default(IDLE)
  lastSync    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt()
}
```

### 3. Permission System Extensions

```typescript
// lib/team/permissions.ts
export const PERMISSIONS = {
  // Existing permissions...
  
  // Fashion Permissions
  FASHION_LOOKBOOKS_VIEW: "fashion:lookbooks:view",
  FASHION_LOOKBOOKS_MANAGE: "fashion:lookbooks:manage",
  FASHION_SIZE_GUIDES_VIEW: "fashion:size-guides:view",
  FASHION_SIZE_GUIDES_MANAGE: "fashion:size-guides:manage",
  FASHION_COLLECTIONS_VIEW: "fashion:collections:view",
  FASHION_COLLECTIONS_MANAGE: "fashion:collections:manage",
  
  // Restaurant Permissions
  RESTAURANT_KDS_VIEW: "restaurant:kds:view",
  RESTAURANT_KDS_MANAGE: "restaurant:kds:manage",
  RESTAURANT_TABLES_VIEW: "restaurant:tables:view",
  RESTAURANT_TABLES_MANAGE: "restaurant:tables:manage",
  RESTAURANT_MENU_VIEW: "restaurant:menu:view",
  RESTAURANT_MENU_MANAGE: "restaurant:menu:manage",
  
  // Retail Permissions
  RETAIL_CHANNELS_VIEW: "retail:channels:view",
  RETAIL_CHANNELS_MANAGE: "retail:channels:manage",
  RETAIL_STORES_VIEW: "retail:stores:view",
  RETAIL_STORES_MANAGE: "retail:stores:manage",
};
```

---

## Quality Assurance

### Testing Strategy
1. **Unit Tests** - Test individual route handlers
2. **Integration Tests** - Test full API flows with database
3. **Load Testing** - Verify performance under stress
4. **Security Testing** - Validate authz/authn and input sanitization

### Test Coverage Targets
- **Route Handlers:** 95%+
- **Business Logic:** 90%+
- **Edge Cases:** 85%+

### Monitoring & Observability
- Request/response logging
- Performance metrics (latency, throughput)
- Error rate tracking
- Business metrics (creation rates, usage patterns)

---

## Success Criteria

### Technical
✅ All 80 APIs implemented with proper error handling
✅ Authentication and authorization working correctly
✅ Database queries optimized with proper indexing
✅ Comprehensive test coverage (>90%)
✅ API documentation generated

### Business
✅ Fashion merchants can manage lookbooks and collections
✅ Restaurant owners can operate KDS and table management
✅ Retail businesses can handle multi-channel operations
✅ Performance meets SLA requirements (<200ms p95)

### Operational
✅ Deployment successful to staging environment
✅ Monitoring and alerting configured
✅ Documentation complete for developer consumption
✅ Team trained on new APIs

---

## Risk Mitigation

### Technical Risks
- **Database performance:** Implement connection pooling and query optimization
- **Rate limiting:** Configure appropriate limits per endpoint
- **Data consistency:** Use transactions for critical operations

### Business Risks
- **Adoption barriers:** Provide clear migration guides and examples
- **Performance impact:** Monitor closely and optimize as needed
- **Security concerns:** Regular penetration testing and code reviews

---

*This plan will be executed iteratively with daily standups and weekly progress reviews.*