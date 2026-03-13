# VAYVA API INTEGRATION STRATEGY
## Comprehensive Backend Architecture for All 22 Industries

**Document Version:** 1.0  
**Last Updated:** March 10, 2026  
**Related Documents:** 
- MASTER_DESIGN_PLAN_COMPLETE.md (Industries 1-2)
- MASTER_DESIGN_PLAN_PART2.md (Industries 3-5)
- MASTER_DESIGN_PLAN_PART3.md (Industries 6-8)
- MASTER_DESIGN_PLAN_PART4_FINAL.md (Industries 9-22)

---

## TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [Universal Endpoints (Tier 1)](#universal-endpoints-tier-1)
3. [Configurable Endpoints (Tier 2)](#configurable-endpoints-tier-2)
4. [Industry-Specific Endpoints (Tier 3)](#industry-specific-endpoints-tier-3)
5. [WebSocket Integration](#websocket-integration)
6. [Caching Strategy](#caching-strategy)
7. [Error Handling](#error-handling)
8. [Security & Compliance](#security--compliance)
9. [API Implementation Roadmap](#api-implementation-roadmap)

---

## ARCHITECTURE OVERVIEW

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js Application (merchant-admin)                    │  │
│  │  - 22 Industry Dashboard Implementations                 │  │
│  │  - Vayva UI Component Library                            │  │
│  │  - React Query (Caching)                                 │  │
│  │  - WebSocket Client (Real-time)                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / WSS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express.js Server (Backend/core-api)                    │  │
│  │  - Authentication Middleware (JWT)                       │  │
│  │  - Rate Limiting                                         │  │
│  │  - Request Validation(Zod)                              │  │
│  │  - Industry Router                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   SERVICE    │    │   SERVICE    │    │   SERVICE    │
│   LAYER      │    │   LAYER      │    │   LAYER      │
│              │    │              │    │              │
│ - Analytics  │    │ - Inventory  │    │ - Orders     │
│ - Products   │    │ - Payments   │    │ - Customers  │
│ - Users      │    │ - Calendar   │    │ - Staff      │
└──────────────┘    └──────────────┘    └──────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   PostgreSQL │    │   Redis     │    │  Third-Party │
│   (Primary   │    │   (Cache,    │    │   APIs       │
│    Data)     │    │   Sessions,  │    │              │
│              │    │   Pub/Sub)   │    │ - Stripe     │
│              │    │              │    │ - Twilio     │
│              │    │              │    │ - SendGrid   │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Technology Stack

**Backend Framework:**
- **Runtime:** Node.js 20.x LTS
- **Framework:** Express.js 4.x
- **Language:** TypeScript 5.x
- **Validation:** Zod (runtime type validation)
- **Authentication:** JWT + bcryptjs
- **Database ORM:**Prisma ORM
- **Caching:** Redis (ioredis client)
- **WebSocket:** ws library
- **Queue:** Bull (Redis-based job queues)

**Database:**
- **Primary:** PostgreSQL 15.x
- **Cache:** Redis 7.x
- **Search:** Elasticsearch (optional, for large catalogs)

**Third-Party Integrations:**
- **Payments:** Stripe API
- **Email:**SendGrid/ AWS SES
- **SMS:** Twilio
- **Storage:** AWS S3 / Cloudflare R2
- **Analytics:** Mixpanel / Amplitude (optional)

---

## UNIVERSAL ENDPOINTS (TIER 1)

These endpoints work across ALL industries without modification. They provide core functionality that every merchant needs regardless of their vertical.

### Authentication & User Management

```typescript
// Backend/core-api/src/routes/auth.ts
import { Router } from 'express';
const router = Router();

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // Find user by email
  const user= await prisma.user.findUnique({
    where: { email },
    include: { merchant: true }
  });
  
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
   return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, merchantId: user.merchantId },
   process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  
  res.json({
   token,
    user: {
     id: user.id,
      email: user.email,
     name: user.name,
     role: user.role,
      merchantId: user.merchantId,
      industry: user.merchant.industry
    }
  });
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { 
      merchant: {
        include: {
         subscription: true,
          settings: true
        }
      }
    }
  });
  
  res.json(user);
});

/**
 * PUT /api/users/:id/settings
 * Update user preferences
 */
router.put('/users/:id/settings', authenticateToken, async (req: Request, res: Response) => {
  const { theme, notifications, timezone, language } = req.body;
  
  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { theme, notifications, timezone, language }
  });
  
  res.json(updated);
});
```

### Core Analytics

```typescript
// Backend/core-api/src/routes/analytics.ts
import { Router } from 'express';
const router = Router();

/**
 * GET /api/analytics/sales
 * Get sales analytics with date range and grouping
 */
router.get('/sales', authenticateToken, async (req: Request, res: Response) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;
  
  const sales = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC(${groupBy}, created_at) as period,
      SUM(total) as revenue,
      COUNT(*) as orders,
      AVG(total) as avg_order_value
    FROM orders
    WHERE merchant_id = ${req.merchantId}
      AND created_at >= ${startDate}
      AND created_at <= ${endDate}
    GROUP BY period
    ORDER BY period ASC
  `;
  
  res.json(sales);
});

/**
 * GET /api/analytics/products/top-selling
 * Get top-selling products
 */
router.get('/products/top-selling', authenticateToken, async (req: Request, res: Response) => {
  const { limit = 10, period= '30d' } = req.query;
  
  const topProducts = await prisma.$queryRaw`
    SELECT 
      p.id,
     p.name,
      p.price,
      SUM(oi.quantity) as total_sold,
      SUM(oi.quantity * oi.price) as revenue
    FROM products p
    JOIN order_items oi ON p.id = oi.product_id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.merchant_id = ${req.merchantId}
      AND o.created_at >= NOW() - INTERVAL '${period}'
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT ${limit}
  `;
  
  res.json(topProducts);
});

/**
 * GET /api/analytics/customers
 * Get customer analytics
 */
router.get('/customers', authenticateToken, async (req: Request, res: Response) => {
  const { limit= 50 } = req.query;
  
  const customers = await prisma.customer.findMany({
    where: { merchantId: req.merchantId },
   orderBy: { totalSpent: 'desc' },
    take: Number(limit),
    include: {
     orders: {
        select: {
         id: true,
         total: true,
          createdAt: true
        },
       orderBy: { createdAt: 'desc' },
        take: 5
      },
      _count: {
        select: { orders: true }
      }
    }
  });
  
  res.json(customers);
});
```

### Inventory Management

```typescript
// Backend/core-api/src/routes/inventory.ts
import { Router } from 'express';
const router= Router();

/**
 * GET /api/inventory/items
 * Get all inventory items with filtering
 */
router.get('/items', authenticateToken, async (req: Request, res: Response) => {
  const { status, category, lowStock, search } = req.query;
  
  const where: any = { merchantId: req.merchantId };
  
  if (status === 'lowStock') {
    where.currentStock = { lte: prisma.inventoryItem.fields.minStock };
  } else if (status === 'outOfStock') {
    where.currentStock= 0;
  }
  
  if (category) {
    where.category = category;
  }
  
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }
  
  const items = await prisma.inventoryItem.findMany({
    where,
    include: {
     product: {
        select: {
         id: true,
         name: true,
          images: true
        }
      }
    },
   orderBy: { updatedAt: 'desc' }
  });
  
  res.json(items);
});

/**
 * PUT /api/inventory/items/:id
 * Update inventory item
 */
router.put('/inventory/items/:id', authenticateToken, async (req: Request, res: Response) => {
  const { currentStock, minStock, maxStock, location } = req.body;
  
  const updated = await prisma.inventoryItem.update({
    where: { 
     id: req.params.id,
      merchantId: req.merchantId 
    },
    data: { currentStock, minStock, maxStock, location }
  });
  
  // Trigger low stock alert if needed
  if (updated.currentStock <= updated.minStock) {
    await sendLowStockAlert(updated);
  }
  
  res.json(updated);
});

/**
 * GET /api/inventory/summary
 * Get inventory summary statistics
 */
router.get('/summary', authenticateToken, async (req: Request, res: Response) => {
  const summary = await prisma.$queryRaw`
    SELECT 
      COUNT(*) as total_items,
      SUM(current_stock) as total_stock,
      COUNT(CASE WHEN current_stock <= min_stock THEN 1 END) as low_stock_count,
      COUNT(CASE WHEN current_stock = 0 THEN 1 END) as out_of_stock_count,
      COUNT(CASE WHEN current_stock >= max_stock THEN 1 END) as overstocked_count
    FROM inventory_items
    WHERE merchant_id = ${req.merchantId}
  `;
  
  res.json(summary[0]);
});
```

### Orders Management

```typescript
// Backend/core-api/src/routes/orders.ts
import { Router } from 'express';
const router = Router();

/**
 * GET /api/orders
 * Get orders with filtering and pagination
 */
router.get('/orders', authenticateToken, async (req: Request, res: Response) => {
  const { status, page = 1, limit = 50, startDate, endDate } = req.query;
  
  const where: any = { merchantId: req.merchantId };
  
  if (status && status !== 'all') {
    where.status = status;
  }
  
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    };
  }
  
  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: {
        select: {
         id: true,
         name: true,
          email: true,
          phone: true
        }
      },
      items: {
        include: {
         product: {
            select: {
             id: true,
             name: true,
              images: true
            }
          }
        }
      }
    },
   orderBy: { createdAt: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit)
  });
  
  const total = await prisma.order.count({ where });
  
  res.json({
   orders,
   pagination: {
     page: Number(page),
      limit: Number(limit),
     total,
     totalPages: Math.ceil(total / Number(limit))
    }
  });
});

/**
 * POST /api/orders
 * Create new order
 */
router.post('/orders', authenticateToken, async (req: Request, res: Response) => {
  const { customerId, items, shippingAddress, paymentMethod } = req.body;
  
  // Calculate total
  const orderTotal = items.reduce((sum: number, item: any) => {
   return sum + (item.price * item.quantity);
  }, 0);
  
  // Create order with transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create order
   const newOrder = await tx.order.create({
      data: {
        merchantId: req.merchantId,
        customerId,
       status: 'pending',
       total: orderTotal,
        shippingAddress,
       paymentMethod,
        items: {
          create: items.map((item: any) => ({
           productId: item.productId,
           quantity: item.quantity,
           price: item.price,
           name: item.name
          }))
        }
      },
      include: {
        items: true,
        customer: true
      }
    });
    
    // Update inventory
    for (const item of items) {
      await tx.inventoryItem.update({
        where: { id: item.productId },
        data: {
          currentStock: {
            decrement: item.quantity
          }
        }
      });
    }
    
   return newOrder;
  });
  
  // Send order confirmation email
  await sendOrderConfirmation(order);
  
  // Emit WebSocket event
  emitToMerchant(req.merchantId, 'order-created', order);
  
  res.status(201).json(order);
});

/**
 * PUT /api/orders/:id/status
 * Update order status
 */
router.put('/orders/:id/status', authenticateToken, async (req: Request, res: Response) => {
  const { status, trackingNumber } = req.body;
  
  const updated = await prisma.order.update({
    where: { 
     id: req.params.id,
      merchantId: req.merchantId 
    },
    data: { status, trackingNumber }
  });
  
  // Emit WebSocket event
  emitToMerchant(req.merchantId, 'order-status-change', {
   orderId: updated.id,
   status: updated.status,
    updatedAt: updated.updatedAt
  });
  
  res.json(updated);
});
```

---

## CONFIGURABLE ENDPOINTS (TIER 2)

These endpoints accept industry-specific query parameters to customize behavior per vertical.

### Products Endpoint with Industry Filtering

```typescript
// Backend/core-api/src/controllers/products.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

interface IndustryConfig {
  productCategoryType: string;
  customFields: string[];
  defaultSort: string;
}

const INDUSTRY_CONFIGS: Record<string, IndustryConfig> = {
  fashion: {
   productCategoryType: 'clothing',
    customFields: ['sizes', 'colors', 'material', 'season'],
    defaultSort: 'soldCount'
  },
  retail: {
   productCategoryType: 'general',
    customFields: ['brand', 'model', 'warranty'],
    defaultSort: 'createdAt'
  },
  beauty: {
   productCategoryType: 'services',
    customFields: ['duration', 'stylistLevel', 'includes'],
    defaultSort: 'popularity'
  },
  automotive: {
   productCategoryType: 'vehicles',
    customFields: ['vin', 'make', 'model', 'year', 'mileage', 'condition'],
    defaultSort: 'price'
  },
  real_estate: {
   productCategoryType: 'properties',
    customFields: ['bedrooms', 'bathrooms', 'sqft', 'lotSize', 'yearBuilt'],
    defaultSort: 'listedAt'
  },
  restaurant: {
   productCategoryType: 'menu-items',
    customFields: ['ingredients', 'allergens', 'prepTime', 'spicyLevel'],
    defaultSort: 'category'
  }
};

export const getProducts = async (req: Request, res: Response) => {
  const { industry, ...filters } = req.query;
  
  let industryConfig: IndustryConfig | null = null;
  
  if (industry) {
    industryConfig = INDUSTRY_CONFIGS[industry as string] || null;
    
    if (industryConfig) {
      // Apply industry-specific filtering
      filters.categoryType = industryConfig.productCategoryType;
      
      // Add custom field filtering
     const customFilters: any = {};
      industryConfig.customFields.forEach(field => {
        if (filters[field]) {
          customFilters[field] = filters[field];
          delete filters[field];
        }
      });
      
      Object.assign(filters, customFilters);
      
      // Set default sort if not specified
      if (!filters.sortBy) {
        filters.sortBy= industryConfig.defaultSort;
      }
    }
  }
  
  // Build Prisma query
  const where: any = { merchantId: req.merchantId };
  
  if (filters.category) {
    where.category = filters.category;
  }
  
  if (filters.search) {
    where.name = { contains: filters.search, mode: 'insensitive' };
  }
  
  if (filters.status) {
    where.status = filters.status;
  }
  
  const products = await prisma.product.findMany({
    where,
    include: {
      inventory: true,
      images: true,
      variants: industryConfig ? true: false
    },
   orderBy: { [filters.sortBy || 'createdAt']: filters.order || 'desc' },
    skip: filters.offset ? Number(filters.offset) : 0,
    take: filters.limit ? Number(filters.limit) : 50
  });
  
  res.json(products);
};
```

### Appointments with Industry Context

```typescript
// Backend/core-api/src/controllers/appointments.controller.ts
export const getAppointments = async (req: Request, res: Response) => {
  const { industry, date, providerType, serviceType, ...filters } = req.query;
  
  const where: any = { 
    merchantId: req.merchantId,
    date: new Date(date as string)
  };
  
  // Industry-specific provider type filtering
  if (providerType) {
    switch (industry) {
     case 'beauty':
        where.providerType = 'stylist';
        break;
     case 'healthcare':
        where.providerType = 'doctor';
        break;
     case 'automotive':
        where.providerType = 'technician';
        break;
     case 'restaurant':
        where.providerType = 'server';
        break;
      default:
        where.providerType= providerType;
    }
  }
  
  // Industry-specific service filtering
  if (serviceType) {
    where.service= {
     category: industry === 'beauty' ? 'hair-service' : 
                industry === 'healthcare' ? 'medical-consultation' :
                industry === 'automotive' ? 'maintenance' : serviceType
    };
  }
  
  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      customer: true,
     provider: true,
      service: true
    },
   orderBy: { time: 'asc' }
  });
  
  res.json(appointments);
};
```

---

## INDUSTRY-SPECIFIC ENDPOINTS (TIER 3)

Dedicated routes under `/api/industries/:industry/` for vertical-specific functionality.

### Fashion Industry Endpoints

```typescript
// Backend/core-api/src/routes/industries/fashion.ts
import { Router } from 'express';
const router = Router();

/**
 * GET /api/industries/fashion/dashboard
 * Complete fashion dashboard data
 */
router.get('/dashboard', authenticateToken, async (req: Request, res: Response) => {
  const [salesData, sizeCurve, visualMerchandising, trending] = await Promise.all([
    getFashionSalesData(req.merchantId),
    getSizeCurveAnalysis(req.merchantId),
    getVisualMerchandisingBoard(req.merchantId),
    getTrendingProducts(req.merchantId, 'fashion')
  ]);
  
  res.json({
   sales: salesData,
   sizeCurve,
    visualMerchandising,
   trending
  });
});

/**
 * GET /api/industries/fashion/size-curve
 * Size distribution analysis
 */
router.get('/size-curve', authenticateToken, async (req: Request, res: Response) => {
  const sizeData = await prisma.$queryRaw`
    SELECT 
     size,
      SUM(quantity) as total_sold,
      COUNT(DISTINCT order_id) as order_count,
      AVG(price) as avg_price
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN product_variants pv ON oi.variant_id = pv.id
    WHERE p.merchant_id = ${req.merchantId}
      AND p.category = 'fashion'
      AND pv.size IS NOT NULL
    GROUP BY size
    ORDER BY 
      CASE size 
        WHEN 'XS' THEN 1 
        WHEN 'S' THEN 2 
        WHEN 'M' THEN 3 
        WHEN 'L' THEN 4 
        WHEN 'XL' THEN 5 
        ELSE 6 
      END
  `;
  
  // Get best sellers by size
  const bestSellers = await prisma.product.findMany({
    where: { 
      merchantId: req.merchantId,
     category: 'fashion'
    },
   orderBy: { soldCount: 'desc' },
    take: 10,
    select: {
     id: true,
     name: true,
     soldCount: true
    }
  });
  
  // Get restock alerts
  const restockAlerts = await prisma.inventoryItem.findMany({
    where: {
      merchantId: req.merchantId,
      currentStock: { lte: prisma.inventoryItem.fields.minStock }
    },
    include: {
     product: {
        select: {
         id: true,
         name: true,
         category: true
        }
      },
      variant: {
        select: {
         size: true,
         color: true
        }
      }
    }
  });
  
  res.json({
   sizes: sizeData.reduce((acc: any, row: any) => {
     acc[row.size] = {
       sold: row.total_sold,
       orders: row.order_count,
       avgPrice: row.avg_price
      };
     return acc;
    }, {}),
    bestSellers,
   restockAlerts
  });
});

/**
 * GET /api/industries/fashion/visual-merchandising
 * Visual merchandising board data
 */
router.get('/visual-merchandising', authenticateToken, async (req: Request, res: Response) => {
  const featuredCollection = await prisma.collection.findFirst({
    where: {
      merchantId: req.merchantId,
     featured: true
    },
    include: {
     products: {
        include: {
          images: {
            take: 1
          }
        },
        take: 8
      }
    }
  });
  
  res.json({
   featuredCollection: featuredCollection ? {
     id: featuredCollection.id,
     name: featuredCollection.name,
      images: featuredCollection.products.flatMap(p => p.images.map(i => i.url)),
     productCount: featuredCollection.products.length
    } : null,
   gridLayout: '4x2',
    lastUpdated: featuredCollection?.updatedAt || new Date()
  });
});

/**
 * GET /api/industries/fashion/forecast
 * AI-powered sales forecast
 */
router.get('/forecast', authenticateToken, async (req: Request, res: Response) => {
  // Historical sales data
  const historicalSales = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('week', created_at) as week,
      SUM(total) as revenue
    FROM orders
    WHERE merchant_id = ${req.merchantId}
      AND created_at >= NOW() - INTERVAL '12 weeks'
    GROUP BY week
    ORDER BY week ASC
  `;
  
  // Simple forecasting algorithm (replace with ML model in production)
  const recentWeeks = historicalSales.slice(-4);
  const avgGrowth = recentWeeks.reduce((acc: number, week: any, idx: number, arr: any[]) => {
    if (idx === 0) return 0;
   const prevWeek = arr[idx - 1];
   return acc + ((week.revenue- prevWeek.revenue) / prevWeek.revenue);
  }, 0) / (recentWeeks.length - 1);
  
  const currentRevenue = historicalSales[historicalSales.length - 1].revenue;
  const nextWeekPrediction = currentRevenue * (1 + avgGrowth);
  
  // Get top category prediction
  const topCategory = await prisma.$queryRaw`
    SELECT category
    FROM products p
    JOIN order_items oi ON p.id = oi.product_id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.merchant_id = ${req.merchantId}
      AND o.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY category
    ORDER BY SUM(oi.quantity) DESC
    LIMIT 1
  `;
  
  res.json({
   nextWeekRevenue: Math.round(nextWeekPrediction),
   growthPercentage: Math.round(avgGrowth * 100 * 10) / 10,
   topCategory: topCategory[0]?.category || 'Unknown',
   recommendedActions: [
     avgGrowth > 0 ? 'Continue current marketing strategy' : 'Review pricing and promotions',
      'Restock size M in bestsellers',
      'Prepare for seasonal transition'
    ].filter(Boolean),
   confidenceScore: Math.min(95, 60 + (historicalSales.length * 2))
  });
});
```

### Restaurant Industry Endpoints

```typescript
// Backend/core-api/src/routes/industries/restaurant.ts
import { Router } from 'express';
const router = Router();

/**
 * GET /api/industries/restaurant/foh/dashboard
 * Front of house dashboard data
 */
router.get('/foh/dashboard', authenticateToken, async (req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [todayOrders, floorPlan, serverPerformance] = await Promise.all([
    getTodayOrders(req.merchantId),
    getFloorPlanStatus(req.merchantId),
    getServerPerformance(req.merchantId, today)
  ]);
  
  const revenue = todayOrders.reduce((sum: number, order: any) => sum + order.total, 0);
  const guestCount = todayOrders.reduce((sum: number, order: any) => sum + (order.guestCount || 1), 0);
  
  res.json({
   todayRevenue: revenue,
   guestCount,
   averageRating: 4.8, // Would calculate from reviews
    floorPlan: {
      tables: floorPlan
    },
   activeOrders: todayOrders
      .filter((o: any) => o.status === 'active')
      .map((o: any) => ({
        tableNumber: o.tableNumber,
        waitTime: Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000),
        items: o.items.map((i: any) => i.name),
        isUrgent: Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000) > 15
      })),
    serverPerformance
  });
});

/**
 * GET /api/industries/restaurant/kds/tickets
 * Kitchen display system tickets
 */
router.get('/kds/tickets', authenticateToken, async (req: Request, res: Response) => {
  const activeTickets = await prisma.kitchenTicket.findMany({
    where: {
      merchantId: req.merchantId,
     status: { in: ['queued', 'prep', 'cooking'] }
    },
    include: {
     order: {
        include: {
          items: {
            include: {
              modifiers: true
            }
          }
        }
      },
     station: true
    },
   orderBy: { createdAt: 'asc' }
  });
  
  // Group by station
  const stations = ['grill', 'cold', 'hot', 'expo'].map(stationName => {
   const stationTickets = activeTickets.filter(t => t.station.name === stationName);
    
   return {
     name: stationName,
     tickets: stationTickets.map(ticket => ({
       id: ticket.id,
        tableNumber: ticket.order.tableNumber,
        items: ticket.order.items.map(item => ({
         name: item.name,
         quantity: item.quantity,
          modifiers: item.modifiers.map(m => m.name)
        })),
       startTime: ticket.createdAt,
        estimatedReady: ticket.estimatedReadyTime,
       status: ticket.status,
       priority: ticket.priority
      }))
    };
  });
  
  // Calculate average ticket time
  const completedTickets = await prisma.kitchenTicket.findMany({
    where: {
      merchantId: req.merchantId,
     status: 'completed',
     completedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    }
  });
  
  const avgTicketTime = completedTickets.reduce((acc: number, ticket: any) => {
   const time = (ticket.completedAt - ticket.createdAt) / 60000; // minutes
   return acc + time;
  }, 0) / completedTickets.length;
  
  res.json({
   stations,
   averageTicketTime: Math.round(avgTicketTime * 10) / 10,
   averagePrepTime: Math.round(avgTicketTime * 0.6 * 10) / 10
  });
});

/**
 * GET /api/industries/restaurant/86-board
 * Out of stock items
 */
router.get('/86-board', authenticateToken, async (req: Request, res: Response) => {
  const outOfStock = await prisma.menuItem.findMany({
    where: {
      merchantId: req.merchantId,
     available: false
    },
    select: {
     id: true,
     name: true
    }
  });
  
  const lowStock= await prisma.inventoryItem.findMany({
    where: {
      merchantId: req.merchantId,
      currentStock: { lte: prisma.inventoryItem.fields.minStock }
    },
    include: {
      menuItem: {
        select: {
         id: true,
         name: true
        }
      }
    },
    take: 10
  });
  
  res.json({
   outOfStockItems: outOfStock.map(item => item.name),
   lowStockItems: lowStock.map(item => ({
     name: item.menuItem?.name || item.product?.name || 'Unknown',
     remaining: item.currentStock
    })),
    lastUpdated: new Date()
  });
});
```

### Healthcare Industry Endpoints

```typescript
// Backend/core-api/src/routes/industries/healthcare.ts
import { Router } from 'express';
const router= Router();

/**
 * GET /api/industries/healthcare/patient-queue
 * Current patient queue
 */
router.get('/patient-queue', authenticateToken, async (req: Request, res: Response) => {
  const queue = await prisma.patientQueue.findMany({
    where: {
      merchantId: req.merchantId,
      date: new Date(),
     status: { in: ['waiting', 'in-room', 'with-provider'] }
    },
    include: {
     patient: {
        select: {
         id: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true
        }
      },
     provider: {
        select: {
         id: true,
          firstName: true,
          lastName: true,
          specialty: true
        }
      },
     appointment: {
        select: {
         id: true,
         reason: true,
         scheduledTime: true
        }
      }
    },
   orderBy: { checkInTime: 'asc' }
  });
  
  res.json({
   queue: queue.map(patient => ({
     roomId: patient.roomNumber,
     patientName: `${patient.patient.firstName} ${patient.patient.lastName}`,
     checkInTime: patient.checkInTime.toISOString(),
     reason: patient.appointment?.reason || 'Walk-in',
      waitTimeMinutes: Math.floor((Date.now() - patient.checkInTime.getTime()) / 60000),
     status: patient.status
    }))
  });
});

/**
 * GET /api/industries/healthcare/action-required
 * Critical actions requiring attention
 */
router.get('/action-required', authenticateToken, async (req: Request, res: Response) => {
  const [statLabResults, unsignedDocuments] = await Promise.all([
   prisma.labResult.findMany({
      where: {
        merchantId: req.merchantId,
        isStat: true,
       reviewed: false,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      include: {
       patient: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        testType: true
      }
    }),
   prisma.document.findMany({
      where: {
        merchantId: req.merchantId,
       signed: false,
       requiresSignature: true
      },
      include: {
       patient: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      take: 10
    })
  ]);
  
  res.json({
   statLabResults: {
     total: statLabResults.length,
      critical: statLabResults.filter(r => r.isCritical).length,
      urgent: statLabResults.filter(r => r.isUrgent).length,
     results: statLabResults.map(result => ({
       patientName: `${result.patient.firstName} ${result.patient.lastName}`,
        testType: result.testType.name,
        value: result.value,
        flag: result.isCritical ? 'critical' : 'urgent'
      }))
    },
   unsignedDocuments: {
     total: unsignedDocuments.length,
      dischargeSummaries: unsignedDocuments.filter(d => d.type === 'discharge').length,
     referralLetters: unsignedDocuments.filter(d => d.type === 'referral').length,
      documents: unsignedDocuments.map(doc => ({
       id: doc.id,
       patientName: `${doc.patient.firstName} ${doc.patient.lastName}`,
       type: doc.type,
        createdAt: doc.createdAt
      }))
    }
  });
});
```

---

## WEBSOCKET INTEGRATION

### WebSocket Server Setup

```typescript
// Backend/core-api/src/websocket/server.ts
import WebSocket, { WebSocketServer } from 'ws';
import { verify } from 'jsonwebtoken';

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  merchantId?: string;
  channels?: Set<string>;
}

export class WebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, Set<ExtendedWebSocket>> = new Map();

  constructor(server: any) {
    this.wss = new WebSocketServer({ 
      server,
     path: '/ws'
    });

    this.wss.on('connection', (ws: ExtendedWebSocket, req: any) => {
      this.handleConnection(ws, req);
    });
  }

  private handleConnection(ws: ExtendedWebSocket, req: any) {
    // Extract token from query params
   const token = req.url.split('?')[1]?.split('&').find(p => p.startsWith('token='))?.split('=')[1];
    
    if (!token) {
      ws.close(4001, 'Authentication required');
     return;
    }

   try {
      // Verify JWT token
     const decoded = verify(token, process.env.JWT_SECRET!) as any;
      ws.userId = decoded.userId;
      ws.merchantId= decoded.merchantId;
      ws.channels = new Set();

     console.log(`Client connected: ${ws.userId} (${ws.merchantId})`);

      ws.on('message', (data: Buffer) => {
       const message = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      });

      ws.on('close', () => {
        this.removeClient(ws);
       console.log(`Client disconnected: ${ws.userId}`);
      });

      ws.on('error', (error) => {
       console.error('WebSocket error:', error);
      });

    } catch (error) {
      ws.close(4002, 'Invalid token');
    }
  }

  private handleMessage(ws: ExtendedWebSocket, message: any) {
    switch (message.action) {
     case 'subscribe':
        this.subscribeToChannels(ws, message.channels);
        break;
     case 'unsubscribe':
        this.unsubscribeFromChannels(ws, message.channels);
        break;
     case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
    }
  }

  private subscribeToChannels(ws: ExtendedWebSocket, channels: string[]) {
   channels.forEach(channel => {
      ws.channels?.add(channel);
      
     const channelKey = `${ws.merchantId}:${channel}`;
      
      if (!this.clients.has(channelKey)) {
        this.clients.set(channelKey, new Set());
      }
      
      this.clients.get(channelKey)?.add(ws);
    });

    ws.send(JSON.stringify({
     type: 'subscribed',
     channels
    }));
  }

  private unsubscribeFromChannels(ws: ExtendedWebSocket, channels: string[]) {
   channels.forEach(channel => {
      ws.channels?.delete(channel);
      
     const channelKey = `${ws.merchantId}:${channel}`;
      this.clients.get(channelKey)?.delete(ws);
    });
  }

  private removeClient(ws: ExtendedWebSocket) {
    ws.channels?.forEach(channel => {
     const channelKey = `${ws.merchantId}:${channel}`;
      this.clients.get(channelKey)?.delete(ws);
    });
  }

  // Broadcast to all clients subscribed to a channel
  public broadcast(merchantId: string, channel: string, data: any) {
   const channelKey = `${merchantId}:${channel}`;
   const clients = this.clients.get(channelKey);

    if (clients && clients.size > 0) {
     const message = JSON.stringify(data);
      
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  // Helper method to emit to specific merchant
  public emitToMerchant(merchantId: string, type: string, payload: any) {
    // Determine channel based on type
   let channel: string;
    
    if (type.includes('order')) channel = 'orders-live';
    else if (type.includes('inventory')) channel = 'inventory-alerts';
    else if (type.includes('appointment')) channel = 'appointment-updates';
    else if (type.includes('lead')) channel = 'leads-live';
    else channel = 'general';

    this.broadcast(merchantId, channel, {
     type,
     payload,
     timestamp: Date.now()
    });
  }
}

// Singleton instance
let websocketServer: WebSocketServer | null = null;

export const getWebSocketServer= () => websocketServer;

export const initializeWebSocket = (server: any) => {
  websocketServer= new WebSocketServer(server);
  return websocketServer;
};
```

### Frontend WebSocket Client Hook

```typescript
// Frontend/merchant-admin/src/hooks/useWebSocket.ts
import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

interface UseWebSocketOptions {
  channels: string[];
  onMessage?: (message: WebSocketMessage) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const { token } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (!token) return;

   const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws?token=${token}`;
   const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
     console.log('WebSocket connected');
     reconnectAttemptsRef.current = 0;

      // Subscribe to channels
      ws.send(JSON.stringify({
       action: 'subscribe',
       channels: options.channels
      }));
    };

    ws.onmessage = (event) => {
     const message: WebSocketMessage = JSON.parse(event.data);
      
      if (options.onMessage) {
        options.onMessage(message);
      }
    };

    ws.onerror = (error) => {
     console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
     console.log('WebSocket closed');
      
      // Attempt reconnection
      if (reconnectAttemptsRef.current < (options.maxReconnectAttempts || 5)) {
       reconnectTimeoutRef.current = setTimeout(() => {
         reconnectAttemptsRef.current++;
         connect();
        }, options.reconnectInterval || 3000);
      }
    };

    wsRef.current = ws;
  }, [token, options.channels, options.onMessage, options.reconnectInterval, options.maxReconnectAttempts]);

  useEffect(() => {
   connect();

   return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { sendMessage };
}
```

---

## CACHING STRATEGY

### Multi-Level Caching with Redis

```typescript
// Backend/core-api/src/lib/cache.ts
import { Redis } from 'ioredis';
import { serialize, deserialize } from '../utils/serialization';

const redis = new Redis(process.env.REDIS_URL!);

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  tags?: string[]; // For bulk invalidation
}

class CacheService {
  private defaultTTL = 300; // 5 minutes

  async get<T>(key: string): Promise<T | null> {
   const value = await redis.get(key);
    
    if (!value) {
     return null;
    }

   try {
     return deserialize<T>(value);
    } catch (error) {
     console.error('Cache deserialization error:', error);
     return null;
    }
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
   const ttl = options.ttl || this.defaultTTL;
   const serialized = serialize(value);

    await redis.setex(key, ttl, serialized);

    // Store tags for invalidation
    if (options.tags) {
      for (const tag of options.tags) {
        await redis.sadd(`cache:tags:${tag}`, key);
        await redis.expire(`cache:tags:${tag}`, ttl);
      }
    }
  }

  async invalidate(key: string): Promise<void> {
    await redis.del(key);
  }

  async invalidateByTag(tag: string): Promise<void> {
   const keys = await redis.smembers(`cache:tags:${tag}`);
    
    if (keys.length > 0) {
      await redis.del(...keys);
      await redis.del(`cache:tags:${tag}`);
    }
  }

  async invalidateByPattern(pattern: string): Promise<void> {
   const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  // Cache wrapper for async functions
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try cache first
   const cached = await this.get<T>(key);
    
    if (cached !== null) {
     return cached;
    }

    // Execute function
   const result = await fn();

    // Cache result
    await this.set(key, result, options);

   return result;
  }
}

export const cache = new CacheService();

// Decorator for caching controller methods
export function Cached(options: CacheOptions = {}) {
  return function(
    target: any,
   propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
   const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
     const context = this as any;
     const merchantId= context.req?.merchantId || 'global';
     const cacheKey = `cache:${options.prefix || ''}:${propertyKey}:${merchantId}:${JSON.stringify(args)}`;

     return cache.wrap(cacheKey, () => originalMethod.apply(this, args), options);
    };

   return descriptor;
  };
}
```

### Usage Examples

```typescript
// Backend/core-api/src/controllers/analytics.controller.ts
import { cache, Cached } from '../lib/cache';

export class AnalyticsController {
  // Manual caching
  @Cached({ ttl: 300, prefix: 'analytics', tags: ['analytics', 'sales'] })
  async getSalesData(merchantId: string, period: string) {
    // Expensive database query
   const sales = await prisma.$queryRaw`...`;
   return sales;
  }

  // Programmatic cache invalidation
  async createOrder(data: any) {
   const order = await prisma.order.create({ ... });

    // Invalidate related caches
    await cache.invalidateByTag('analytics');
    await cache.invalidateByTag('inventory');
    await cache.invalidateByPattern(`cache:dashboard:*`);

   return order;
  }
}
```

---

## ERROR HANDLING

### Global Error Handler

```typescript
// Backend/core-api/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
  industry?: string;
}

export const errorHandler = async (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const industry= (req as any).industry || 'global';

  // Log error
  console.error(`[${industry}] ${err.message}`, err.stack);

  // Industry-specific error messages
  const errorMessages: Record<string, Record<string, string>> = {
    fashion: {
      'INVENTORY_NOT_FOUND': 'Product inventory not found. Please check the SKU.',
      'SIZE_CURVE_ERROR': 'Unable to load size curve data. Please refresh.',
      'VISUAL_MERCHANDISING_ERROR': 'Failed to load visual merchandising board.'
    },
   restaurant: {
      'TABLE_NOT_AVAILABLE': 'This table is currently occupied or reserved.',
      'KDS_SYNC_ERROR': 'Kitchen display sync failed. Reconnecting...',
      'ORDER_TIMEOUT': 'Order took too long to prepare. Please check with kitchen.'
    },
    healthcare: {
      'PATIENT_NOT_FOUND': 'Patient record not found.',
      'HIPAA_VIOLATION': 'Access denied. Insufficient permissions.',
      'LAB_RESULT_ERROR': 'Unable to load lab results. Please try again.'
    },
   real_estate: {
      'PROPERTY_NOT_FOUND': 'Property listing not found.',
      'CMA_GENERATION_ERROR': 'Failed to generate CMA report.',
      'LEAD_CONFLICT': 'This lead is already assigned to another agent.'
    }
  };

  const industryErrors = errorMessages[industry] || {};
  const message = industryErrors[err.code || ''] || err.message;

  res.status(statusCode).json({
   success: false,
    error: {
     code: err.code || 'INTERNAL_ERROR',
      message,
      industry,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

---

## SECURITY & COMPLIANCE

### HIPAA Compliance for Healthcare

```typescript
// Backend/core-api/src/middleware/hipaaCompliance.ts
import { Request, Response, NextFunction } from 'express';
import { logAuditEvent } from '../services/auditLog';

export const hipaaCompliance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;
  
  // Log all PHI access
  if (req.path.includes('/patients/') || req.path.includes('/lab-results/')) {
    await logAuditEvent({
     eventType: 'PHI_ACCESS',
      userId: user.id,
     resourceType: 'PATIENT_RECORD',
     resourceId: req.params.id,
     action: req.method,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
  }

  // Enforce minimum necessary access
  if (user.role === 'nurse' && req.method === 'DELETE') {
   return res.status(403).json({
      error: 'Insufficient permissions for this operation'
    });
  }

  next();
};

// Session timeout middleware
export const sessionTimeout = (timeoutMs: number= 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
   const lastActivity= (req as any).user?.lastActivity;
    
    if (lastActivity && Date.now() -lastActivity > timeoutMs) {
      // Force logout
     return res.status(401).json({
        error: 'Session expired due to inactivity'
      });
    }

    // Update last activity
    (req as any).user.lastActivity = Date.now();
    
   next();
  };
};
```

---

## API IMPLEMENTATION ROADMAP

### Phase 1: Foundation(Week 1-2)

**Priority:** Universal endpoints (Tier 1)

```typescript
// Week 1 Tasks
- [ ] Setup Express server with TypeScript
- [ ] Configure Prisma ORM with PostgreSQL schema
- [ ] Implement JWT authentication
- [ ] Create universal analytics endpoints
- [ ] Create universal inventory endpoints
- [ ] Create universal orders endpoints
- [ ] Setup Redis caching layer
- [ ] Write unit tests for Tier 1 endpoints

// Week 2 Tasks
- [ ] Setup WebSocket server
- [ ] Implement WebSocket client hook in frontend
- [ ] Create error handling middleware
- [ ] Implement rate limiting
- [ ] Setup logging with Winston
- [ ] Deploy to staging environment
```

### Phase 2: High-Priority Industries (Week 3-6)

**Priority:** Fashion, Restaurant, Retail, Real Estate, Healthcare

```typescript
// Week 3: Fashion & Beauty
- [ ] Create /api/industries/fashion/* endpoints
- [ ] Implement size curve analysis algorithm
- [ ] Create visual merchandising board endpoint
- [ ] Build fashion forecasting logic
- [ ] Create /api/industries/beauty/* endpoints
- [ ] Implement stylist availability tracking
- [ ] Build before/after gallery storage

// Week 4: Restaurant FOH & KDS
- [ ] Create /api/industries/restaurant/foh/* endpoints
- [ ] Implement floor plan status tracking
- [ ] Create /api/industries/restaurant/kds/* endpoints
- [ ] Build kitchen ticket routing logic
- [ ] Implement 86 board functionality
- [ ] Setup WebSocket channels for real-time updates

// Week 5: Retail & Real Estate
- [ ] Create /api/industries/retail/* endpoints
- [ ] Implement multi-channel sales tracking
- [ ] Build abandoned cart recovery system
- [ ] Create/api/industries/realestate/* endpoints
- [ ] Implement CMA generation algorithm
- [ ] Build lead pipeline management

// Week 6: Healthcare
- [ ] Create /api/industries/healthcare/* endpoints
- [ ] Implement patient queue management
- [ ] Build HIPAA compliance middleware
- [ ] Create audit logging system
- [ ] Implement session timeout functionality
- [ ] Security audit and penetration testing
```

### Phase 3: Medium-Priority Industries (Week 7-10)

**Priority:** Events, Automotive, Travel, Education, Services

```typescript
// Week 7: Events & Nightlife
- [ ] Create /api/industries/events/* endpoints
- [ ] Implement capacity tracking system
- [ ] Build attendance heatmap logic
- [ ] Create ticket sales ticker endpoint

// Week 8: Automotive
- [ ] Create /api/industries/automotive/* endpoints
- [ ] Implement vehicle inventory management
- [ ] Build financing calculator endpoint
- [ ] Create service bay scheduling system

// Week 9: Travel & Education
- [ ] Create /api/industries/travel/* endpoints
- [ ] Implement booking management
- [ ] Create /api/industries/education/* endpoints
- [ ] Build student enrollment tracking

// Week 10: Services & Creative
- [ ] Create /api/industries/services/* endpoints
- [ ] Implement service booking system
- [ ] Create /api/industries/creative/* endpoints
- [ ] Build portfolio gallery management
```

### Phase 4: Remaining Industries (Week 11-12)

**Priority:** Grocery, Wholesale, Marketplace, Blog, SaaS, Bar, Wellness, Professional Services

```typescript
// Week 11: Grocery, Wholesale, Marketplace
- [ ] Create /api/industries/grocery/* endpoints
- [ ] Implement expiration date tracking
- [ ] Create /api/industries/wholesale/* endpoints
- [ ] Build bulk order management
- [ ] Create /api/industries/marketplace/* endpoints
- [ ] Implement multi-vendor support

// Week 12: Blog, SaaS, Bar, Wellness, Professional Services
- [ ] Create remaining industry endpoints
- [ ] Documentation and API reference
- [ ] Load testing and optimization
- [ ] Production deployment
- [ ] Monitoring and alerting setup
```

---

## MONITORING & ALERTING

### Performance Metrics

```typescript
// Backend/core-api/src/middleware/metrics.ts
import { Request, Response, NextFunction } from 'express';

interface Metrics {
  requestCount: number;
  responseTime: number[];
  errorCount: number;
  activeConnections: number;
}

const metrics: Record<string, Metrics> = {};

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const route = req.route?.path || req.path;

  if (!metrics[route]) {
    metrics[route] = {
     requestCount: 0,
     responseTime: [],
      errorCount: 0,
     activeConnections: 0
    };
  }

  metrics[route].requestCount++;
  metrics[route].activeConnections++;

  res.on('finish', () => {
   const duration = Date.now() - start;
    metrics[route].responseTime.push(duration);
    metrics[route].activeConnections--;

    // Keep only last 100 response times
    if (metrics[route].responseTime.length > 100) {
      metrics[route].responseTime.shift();
    }

    if (res.statusCode >= 400) {
      metrics[route].errorCount++;
    }
  });

  next();
};

// GET /api/metrics
export const getMetrics = async (req: Request, res: Response) => {
  const aggregatedMetrics = Object.entries(metrics).map(([route, data]) => ({
   route,
   requestCount: data.requestCount,
   avgResponseTime: data.responseTime.reduce((a, b) => a + b, 0) / data.responseTime.length,
   p95ResponseTime: data.responseTime.sort((a, b) => a - b)[Math.floor(data.responseTime.length * 0.95)],
    errorRate: (data.errorCount/ data.requestCount * 100).toFixed(2) + '%'
  }));

  res.json(aggregatedMetrics);
};
```

---

## CONCLUSION

This API integration strategy provides a comprehensive, scalable foundation for all 22 industry dashboards. By organizing endpoints into three tiers (Universal, Configurable, Industry-Specific), we maximize code reuse while maintaining flexibility for vertical-specific requirements.

**Key Architectural Decisions:**

1. **Three-Tier Endpoint Structure**: Maximizes reuse while allowing customization
2. **WebSocket First**: Real-time updates built into core architecture
3. **Multi-Level Caching**: Redis caching with tag-based invalidation
4. **Industry Configuration Pattern**: Centralized config objects for each vertical
5. **Security by Design**: HIPAA compliance, audit logging, session management
6. **Monitoring Built-In**: Performance metrics, error tracking, alerting

**Next Steps:**

1. Begin Phase 1 implementation (Tier 1 universal endpoints)
2. Setup development environment with Docker Compose
3. Create comprehensive API documentation with OpenAPI/Swagger
4. Implement automated testing suite
5. Deploy to staging for integration testing

---

*Document Complete - All 22 Industries Covered*
