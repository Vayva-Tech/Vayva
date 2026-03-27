# Vayva Backend Migration - Branch Assignment Plan

**Master Document:** Use this to spawn 5 parallel migration branches  
**Coordination:** All branches report back to main chat for cleanup & verification  
**Created:** 2026-03-27

---

## 🎯 Branch Overview

### Branch 1: Critical Business Operations 🔴
**Focus:** Revenue-impacting and operational APIs  
**Priority:** HIGHEST  
**Estimated Endpoints:** 70-95

### Branch 2: Customer Experience & Marketing 🟡
**Focus:** Customer-facing features and marketing tools  
**Priority:** HIGH  
**Estimated Endpoints:** 60-80

### Branch 3: AI & Intelligent Services 🟢
**Focus:** AI-powered features and automation  
**Priority:** MEDIUM  
**Estimated Endpoints:** 50-70

### Branch 4: Industry-Specific Verticals 🔵
**Focus:** Specialized industry functionality  
**Priority:** MEDIUM  
**Estimated Endpoints:** 100-120

### Branch 5: Infrastructure & Platform ⚪
**Focus:** System APIs and platform utilities  
**Priority:** LOWER  
**Estimated Endpoints:** 80-100

---

## 📋 Detailed Branch Assignments

### **BRANCH 1: Critical Business Operations** 🔴

**Directories to Migrate:**
```
Backend/core-api/src/app/api/
├── bookings/              # Appointment scheduling
├── fulfillment/           # Order fulfillment
├── invoices/              # Invoice generation
├── ledger/                # Financial ledger
├── refunds/               # Refund processing
├── returns/               # Return management
├── settlements/           # Merchant settlements
└── workflows/             # Business automation
```

**Services to Create:**
1. `booking.service.ts` + `bookings.routes.ts`
2. `fulfillment.service.ts` + `fulfillment.routes.ts`
3. `invoice.service.ts` + `invoices.routes.ts`
4. `ledger.service.ts` + `ledger.routes.ts`
5. `refund.service.ts` + `refunds.routes.ts`
6. `return.service.ts` + `returns.routes.ts`
7. `settlement.service.ts` + `settlements.routes.ts`
8. `workflow.service.ts` + `workflows.routes.ts`

**Key Considerations:**
- These are business-critical paths
- Must maintain data consistency
- Heavy database transactions
- Integration with existing orders/payments

**Success Criteria:**
- All 8 services created
- Routes registered in index.ts
- Proper error handling
- Transaction support where needed

---

### **BRANCH 2: Customer Experience & Marketing** 🟡

**Directories to Migrate:**
```
Backend/core-api/src/app/api/
├── collections/           # Product collections
├── coupons/               # Coupon management
├── credits/               # Store credit
├── discount-rules/        # Dynamic pricing
├── leads/                 # Lead generation
├── loyalty/               # Loyalty programs (if not in retail)
├── referrals/             # Referral tracking
├── reviews/               # Product reviews
├── services/              # Service catalog
└── templates/             # Email/document templates
```

**Services to Create:**
1. `collection.service.ts` + `collections.routes.ts`
2. `coupon.service.ts` + `coupons.routes.ts`
3. `credit.service.ts` + `credits.routes.ts`
4. `discountRules.service.ts` + `discount-rules.routes.ts`
5. `lead.service.ts` + `leads.routes.ts`
6. `review.service.ts` + `reviews.routes.ts`
7. `serviceCatalog.service.ts` + `services.routes.ts`
8. `template.service.ts` + `templates.routes.ts`
9. `referral.service.ts` + `referrals.routes.ts`

**Key Considerations:**
- Customer-facing features
- Marketing automation integration
- Caching important for performance
- SEO considerations for reviews

**Success Criteria:**
- All 9 services created
- Integration with existing products/orders
- Proper validation rules
- Cache headers where appropriate

---

### **BRANCH 3: AI & Intelligent Services** 🟢

**Directories to Migrate:**
```
Backend/core-api/src/app/api/
├── ai/                    # Core AI services
├── ai-agent/              # AI agent orchestration
├── automation/            # Marketing automation
├── wa-agent/              # WhatsApp AI agent ⚠️ SEE NOTE BELOW
└── control-center/        # Admin controls (AI-related)
```

**⚠️ IMPORTANT ARCHITECTURE DECISION:**
```
wa-agent/ should be migrated as part of AI services, NOT separate!
Reason: WhatsApp is just a channel for AI chat functionality
```

**Services to Create:**
1. `ai.service.ts` + `ai.routes.ts` (includes wa-agent functionality)
   - Core AI chat/completion endpoints
   - WhatsApp integration handlers
   - Multi-channel support (WhatsApp, web, etc.)
   
2. `aiAgent.service.ts` + `aiAgent.routes.ts`
   - Agent orchestration
   - Task routing
   - Multi-agent coordination
   
3. `automation.service.ts` + `automation.routes.ts`
   - Marketing automation workflows
   - Trigger-based actions
   - Campaign automation

**Key Considerations:**
- External AI API integrations (OpenRouter, etc.)
- Rate limiting critical
- Token/cost tracking
- Conversation state management
- WhatsApp Business API integration

**Service Structure Example:**
```typescript
// src/services/ai/ai.service.ts
export class AiService {
  async chat(storeId: string, message: any, channel: 'whatsapp' | 'web' | 'app') {
    // Route to appropriate AI model
    // Track token usage
    // Save conversation history
  }
  
  async whatsappWebhook(storeId: string, payload: any) {
    // Handle WhatsApp incoming messages
    // Process through AI
    // Send response via WhatsApp API
  }
}
```

**Success Criteria:**
- Unified AI service handling all channels
- WhatsApp integration working
- Rate limiting implemented
- Cost tracking per store

---

### **BRANCH 4: Industry-Specific Verticals** 🔵

**Directories to Migrate:**
```
Backend/core-api/src/app/api/
├── box-subscriptions/     # Subscription boxes
├── kitchen/               # Kitchen management
├── menu-items/            # Restaurant menus
├── portfolio/             # Portfolio management
├── properties/            # Property listings
├── quotes/                # Price quotes
├── realestate/            # Real estate APIs
├── rescue/                # Emergency operations
├── travel/                # Travel booking
├── vehicles/              # Vehicle management
├── wellness/              # Wellness services
└── professional-services/ # Consulting/services
```

**Services to Create:**
1. `boxSubscription.service.ts` + `box-subscriptions.routes.ts`
2. `kitchen.service.ts` + `kitchen.routes.ts`
3. `menuItem.service.ts` + `menu-items.routes.ts`
4. `portfolio.service.ts` + `portfolio.routes.ts`
5. `property.service.ts` + `properties.routes.ts`
6. `quote.service.ts` + `quotes.routes.ts`
7. `realEstate.service.ts` + `realestate.routes.ts`
8. `travel.service.ts` + `travel.routes.ts`
9. `vehicle.service.ts` + `vehicles.routes.ts`
10. `wellness.service.ts` + `wellness.routes.ts`
11. `professionalServices.service.ts` + `professional-services.routes.ts`

**Key Considerations:**
- Industry-specific business logic
- Some may overlap with existing services (e.g., menu-items → restaurant)
- Evaluate consolidation opportunities

**Consolidation Opportunities:**
- `menu-items/` → Could merge into existing `restaurant/` service
- `box-subscriptions/` → Could merge into existing `subscriptions/` service
- `properties/` + `realestate/` → Single real estate service

**Success Criteria:**
- All vertical services migrated
- No duplication with existing services
- Industry-specific logic preserved

---

### **BRANCH 5: Infrastructure & Platform** ⚪

**Directories to Migrate:**
```
Backend/core-api/src/app/api/
├── appeals/               # Dispute appeals (extend compliance)
├── disputes/              # Dispute management (extend compliance)
├── internal/              # Internal tools
├── me/                    # User profile (extend account)
├── merchant/              # Merchant management
├── payment-methods/       # Payment storage
├── paymenttransaction/    # Transaction processing
├── security/              # Security policies
├── sites/                 # Multi-site management
├── socials/               # Social media integration
├── storage/               # File storage
├── support/               # Customer support
├── system/                # System configs
├── uploads/               # File upload handling
├── webhooks/              # Webhook management
├── websocket/             # WebSocket handlers
└── webstudio/             # Web builder
```

**Services to Create:**
1. Extend `compliance.service.ts` + add to `compliance.routes.ts` (appeals, disputes)
2. Extend `account.service.ts` + add to `account.routes.ts` (me, merchant)
3. `paymentMethod.service.ts` + `payment-methods.routes.ts`
4. `paymentTransaction.service.ts` + `paymenttransaction.routes.ts`
5. `site.service.ts` + `sites.routes.ts`
6. `social.service.ts` + `socials.routes.ts`
7. `storage.service.ts` + `storage.routes.ts`
8. `support.service.ts` + `support.routes.ts`
9. `upload.service.ts` + `uploads.routes.ts`
10. Extend `integrations.service.ts` + add to `integrations.routes.ts` (webhooks)
11. `websocket.service.ts` + `websocket.routes.ts`
12. `webstudio.service.ts` + `webstudio.routes.ts`

**Key Considerations:**
- Some extend existing services (appeals/disputes → compliance)
- File storage needs S3/MinIO integration
- WebSocket requires special handling in Fastify
- Webhooks integration with existing integrations service

**Special Handling:**
```typescript
// For websockets - needs @fastify/websocket plugin
server.register(require('@fastify/websocket'), {
  options: {
    maxPayload: 1048576,
  },
});
```

**Success Criteria:**
- Infrastructure services migrated
- File uploads working with MinIO/S3
- WebSocket connections stable
- Webhooks integrated with existing system

---

## 🔄 BFF Layer Extraction (All Branches)

### Frontend/ops-console (154 routes)
**Action:** Each branch should identify relevant BFF routes

**Process:**
1. Search for `Frontend/ops-console/src/app/api/**/route.ts`
2. Identify business logic that belongs in backend
3. Extract to corresponding Fastify service
4. Replace with API client calls in frontend

**Example Pattern:**
```typescript
// BEFORE (in ops-console)
import { prisma } from '@vayva/db';
export async function POST(req) {
  const data = await prisma.booking.create({...});
  return NextResponse.json({ success: true, data });
}

// AFTER (in ops-console)
import { apiClient } from '@/lib/api-client';
export async function POST(req) {
  const data = await apiClient.post('/api/v1/bookings', { body: req.body });
  return NextResponse.json(data);
}
```

### Frontend/storefront (55 routes)
**Same process as ops-console**

---

## 📊 Progress Tracking Template

Each branch should maintain:

```markdown
## Branch [X] Progress

### Completed ✅
- [ ] service1.ts + service1.routes.ts
- [ ] service2.ts + service2.routes.ts

### In Progress 🔄
- [ ] service3.ts (service layer done, routes 50%)

### Pending ⏳
- [ ] service4.ts + service4.routes.ts

### Issues/Blockers 🚧
- Issue description here
```

---

## 🎯 Return to Main Chat Checklist

When each branch completes, return to main chat with:

1. **List of services created** (file names)
2. **List of routes registered** (endpoints added to index.ts)
3. **Any conflicts found** (duplicate functionality, naming collisions)
4. **BFF routes extracted** (count and locations)
5. **Testing notes** (any issues discovered)

### Final Verification Steps (Main Chat):
- [ ] Verify all imports in index.ts
- [ ] Check for duplicate route registrations
- [ ] Ensure no Prisma in frontend packages
- [ ] Run TypeScript compilation
- [ ] Test critical paths
- [ ] Update documentation
- [ ] Prepare deployment checklist

---

## 🚀 Getting Started Instructions

### For Each Branch:

1. **Read the existing pattern:**
   ```bash
   # Look at completed services for reference
   cat Backend/fastify-server/src/services/industry/retail.service.ts
   cat Backend/fastify-server/src/routes/api/v1/industry/retail.routes.ts
   ```

2. **Follow the migration workflow:**
   ```
   a. Read source Next.js routes (Backend/core-api/src/app/api/[your-dir]/)
   b. Create service file with business logic
   c. Create routes file with HTTP handlers
   d. Import in index.ts
   e. Register with prefix /api/v1/[resource]
   f. Extract BFF logic from frontend (if applicable)
   ```

3. **Use consistent patterns:**
   - Service classes use `@vayva/db` Prisma import
   - Routes use JWT authentication via `server.authenticate`
   - Response format: `{ success: true/false, data/error: any }`
   - Logging with `pino` logger

4. **Test incrementally:**
   - Create 1-2 services at a time
   - Verify they work before continuing
   - Report issues early

---

## 📞 Communication Protocol

**Branch Chat Should Report:**
- "Branch X: Completed [N] services, [N] endpoints"
- "Branch X: Blocked on [issue]"
- "Branch X: Found conflict with [existing service]"

**Main Chat Will:**
- Resolve conflicts between branches
- Consolidate duplicate functionality
- Final registration in index.ts
- Overall testing and verification

---

## 💡 Quick Reference

### Service Template
```typescript
import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class EntityService {
  constructor(private readonly db = prisma) {}

  async findAll(storeId: string, filters: any) {
    const entities = await this.db.entity.findMany({
      where: { storeId, ...filters },
      orderBy: { createdAt: 'desc' },
    });
    return entities;
  }

  async create(storeId: string, data: any) {
    const entity = await this.db.entity.create({
      data: { ...data, storeId },
    });
    logger.info(`[Entity] Created ${entity.id}`);
    return entity;
  }
}
```

### Route Template
```typescript
import { FastifyPluginAsync } from 'fastify';
import { EntityService } from '../../../services/domain/entity.service';

const entityService = new EntityService();

export const entityRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;
      
      const entities = await entityService.findAll(storeId, query);
      return reply.send({ success: true, data: entities });
    },
  });

  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const data = request.body as any;
      
      try {
        const entity = await entityService.create(storeId, data);
        return reply.code(201).send({ success: true, data: entity });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create' 
        });
      }
    },
  });
};
```

### Registration Template
```typescript
// In src/index.ts
import { entityRoutes } from './routes/api/v1/domain/entity.routes';

// In buildServer() function
await server.register(entityRoutes, { prefix: '/api/v1/entity' });
```

---

**Good luck with parallel migration! 🚀**
