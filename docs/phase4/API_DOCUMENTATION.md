# Phase 4: Industry-Specific Dashboard API Documentation

## Overview
This document provides comprehensive API documentation for the industry-specific dashboard endpoints created as part of Phase 4 implementation.

---

## 🎯 Priority Industries Implemented

### ✅ Fashion Industry (NEW)
- **Routes File:** `/Backend/fastify-server/src/routes/api/v1/industry/fashion.routes.ts`
- **Service File:** `/Backend/fastify-server/src/services/industry/fashion.service.ts`
- **Base Path:** `/api/v1/industry/fashion`

### ✅ Food Industry (NEW)
- **Routes File:** `/Backend/fastify-server/src/routes/api/v1/industry/food.routes.ts`
- **Service File:** `/Backend/fastify-server/src/services/industry/food.service.ts`
- **Base Path:** `/api/v1/industry/food`

### ✅ Retail Industry (EXISTING - Enhanced)
- **Routes File:** `/Backend/fastify-server/src/routes/api/v1/industry/retail.routes.ts`
- **Service File:** `/Backend/fastify-server/src/services/industry/retail.service.ts`
- **Base Path:** `/api/v1/industry/retail`

### ✅ Grocery Industry (EXISTING - Enhanced)
- **Routes File:** `/Backend/fastify-server/src/routes/api/v1/industry/grocery.routes.ts`
- **Service File:** `/Backend/fastify-server/src/services/industry/grocery.service.ts`
- **Base Path:** `/api/v1/industry/grocery`

### ✅ Beauty Industry (EXISTING - Enhanced)
- **Routes File:** `/Backend/fastify-server/src/routes/api/v1/industry/beauty.routes.ts`
- **Service File:** `/Backend/fastify-server/src/services/industry/beauty.service.ts`
- **Base Path:** `/api/v1/industry/beauty`

---

## 📚 API Endpoints

### Fashion Industry Endpoints

#### 1. GET `/api/v1/industry/fashion/dashboard`
Get comprehensive fashion dashboard data including KPIs, trends, alerts, actions, and top products.

**Authentication:** Required (Bearer Token)  
**Response Format:**
```json
{
  "success": true,
  "data": {
    "kpis": {
      "revenue": 125000,
      "orders": 450,
      "unitsSold": 1200,
      "avgOrderValue": 277.78,
      "returnRate": 8.5,
      "sizeGuideUsage": 75,
      "trendScore": 88
    },
    "trends": {
      "revenueTrend": [15000, 16500, 14800, 17200, 18900, 16300, 19500],
      "orderTrend": [52, 58, 51, 62, 68, 59, 70],
      "sellThroughTrend": [72, 75, 70, 78, 82, 76, 85]
    },
    "alerts": [
      {
        "id": "alert-lowstock-1234567890",
        "type": "warning",
        "title": "Low Stock Alert",
        "message": "15 products have low inventory levels",
        "priority": "high",
        "actionRequired": true
      }
    ],
    "actions": [
      {
        "id": "action-bestseller-1234567890",
        "title": "Promote Best Sellers",
        "description": "Feature your top-selling products in marketing campaigns",
        "icon": "trending-up",
        "priority": "high",
        "estimatedImpact": "+15% revenue"
      }
    ],
    "topProducts": [
      {
        "id": "prod-123",
        "name": "Classic Denim Jacket",
        "sku": "DJ-001",
        "soldCount": 245,
        "revenue": 24500,
        "inventory": 89,
        "image": "https://...",
        "variants": [...]
      }
    ]
  }
}
```

#### 2. GET `/api/v1/industry/fashion/kpis`
Get fashion-specific KPI metrics.

**Authentication:** Required  
**Response:**
```json
{
  "success": true,
  "data": {
    "revenue": 125000,
    "orders": 450,
    "unitsSold": 1200,
    "avgOrderValue": 277.78,
    "returnRate": 8.5,
    "sizeGuideUsage": 75,
    "trendScore": 88
  }
}
```

#### 3. GET `/api/v1/industry/fashion/metrics/:metricId`
Get specific metric data by ID.

**Parameters:**
- `metricId` (path): One of `revenue`, `orders`, `units-sold`, `return-rate`

**Example:**
```bash
GET /api/v1/industry/fashion/metrics/revenue
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metricId": "revenue",
    "value": 125000
  }
}
```

#### 4. GET `/api/v1/industry/fashion/trends`
Get trend analysis data for fashion categories.

**Authentication:** Required  
**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "category": "clothing",
        "sales": 1500,
        "productCount": 245,
        "trend": "up"
      },
      {
        "category": "shoes",
        "sales": 890,
        "productCount": 120,
        "trend": "up"
      }
    ],
    "updatedAt": "2026-03-27T10:30:00Z",
    "period": "Last 90 days"
  }
}
```

#### 5. GET `/api/v1/industry/fashion/size-guides`
Get size guide management data.

**Authentication:** Required  
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-123",
      "name": "Classic Denim Jacket",
      "category": "clothing",
      "sizeChart": {...},
      "variants": [...]
    }
  ]
}
```

#### 6. POST `/api/v1/industry/fashion/actions/:actionId`
Execute industry-specific action.

**Parameters:**
- `actionId` (path): Action identifier
- `data` (body): Optional action data

**Available Actions:**
- `promote-bestsellers`
- `update-size-guide`

**Example:**
```bash
POST /api/v1/industry/fashion/actions/promote-bestsellers
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Best sellers promotion activated"
  }
}
```

#### 7. GET `/api/v1/industry/fashion/top-products`
Get top performing products sorted by sales.

**Authentication:** Required  
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-123",
      "name": "Classic Denim Jacket",
      "sku": "DJ-001",
      "soldCount": 245,
      "revenue": 24500,
      "inventory": 89,
      "image": "https://...",
      "variants": [...]
    }
  ]
}
```

---

### Food Industry Endpoints

#### 1. GET `/api/v1/industry/food/dashboard`
Get comprehensive food delivery dashboard data.

**Authentication:** Required  
**Response:**
```json
{
  "success": true,
  "data": {
    "kpis": {
      "revenue": 85000,
      "orders": 1250,
      "avgPrepTime": 18,
      "avgDeliveryTime": 32,
      "orderAccuracy": 96,
      "customerSatisfaction": 92
    },
    "trends": {
      "revenueTrend": [10500, 11200, 10800, 12500, 13200, 11900, 14900],
      "orderTrend": [152, 165, 158, 178, 189, 172, 206],
      "prepTimeTrend": [17, 18, 19, 17, 18, 20, 18],
      "deliveryTimeTrend": [30, 32, 35, 31, 33, 36, 32]
    },
    "alerts": [
      {
        "id": "alert-pending-1234567890",
        "type": "warning",
        "title": "High Order Volume",
        "message": "15 orders awaiting confirmation",
        "priority": "high",
        "actionRequired": true
      }
    ],
    "actions": [
      {
        "id": "action-popular-1234567890",
        "title": "Promote Popular Items",
        "description": "Feature your best-selling items on the homepage",
        "icon": "star",
        "priority": "high",
        "estimatedImpact": "+25% orders"
      }
    ],
    "orderQueue": [
      {
        "id": "order-123",
        "orderNumber": "ORD-2026-001",
        "status": "preparing",
        "totalAmount": 87.50,
        "createdAt": "2026-03-27T09:45:00Z",
        "estimatedDeliveryTime": "2026-03-27T11:00:00Z",
        "customer": {...},
        "items": [...],
        "delivery": {...},
        "timeInQueue": 15
      }
    ]
  }
}
```

#### 2. GET `/api/v1/industry/food/kpis`
Get food delivery KPI metrics.

**Authentication:** Required  
**Response:**
```json
{
  "success": true,
  "data": {
    "revenue": 85000,
    "orders": 1250,
    "avgPrepTime": 18,
    "avgDeliveryTime": 32,
    "orderAccuracy": 96,
    "customerSatisfaction": 92
  }
}
```

#### 3. GET `/api/v1/industry/food/orders/queue`
Get current order queue for kitchen/display system.

**Authentication:** Required  
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-123",
      "orderNumber": "ORD-2026-001",
      "status": "preparing",
      "totalAmount": 87.50,
      "customer": {
        "name": "John Doe",
        "phone": "+1234567890"
      },
      "items": [
        {
          "name": "Margherita Pizza",
          "quantity": 2,
          "specialInstructions": "Extra cheese"
        }
      ],
      "delivery": {
        "status": "on_the_way",
        "eta": "2026-03-27T11:00:00Z",
        "driver": "Jane Smith",
        "driverPhone": "+1234567890"
      },
      "timeInQueue": 15
    }
  ]
}
```

#### 4. GET `/api/v1/industry/food/delivery/tracking`
Get active delivery tracking data.

**Authentication:** Required  
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "delivery-123",
      "status": "on_the_way",
      "orderNumber": "ORD-2026-001",
      "customerName": "John Doe",
      "deliveryAddress": "123 Main St, City",
      "driver": {
        "name": "Jane Smith",
        "phone": "+1234567890",
        "vehicleType": "motorcycle"
      },
      "pickedUpAt": "2026-03-27T10:15:00Z",
      "deliveredAt": null,
      "estimatedDeliveryTime": "2026-03-27T11:00:00Z"
    }
  ]
}
```

#### 5. GET `/api/v1/industry/food/menu/performance`
Get menu performance analytics.

**Authentication:** Required  
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "item-123",
      "name": "Margherita Pizza",
      "category": "food",
      "price": 15.99,
      "totalSold": 450,
      "revenue": 7195.50,
      "avgRating": 4.7,
      "reviewCount": 89,
      "isAvailable": true
    }
  ]
}
```

#### 6. GET `/api/v1/industry/food/metrics/:metricId`
Get specific metric data.

**Parameters:**
- `metricId` (path): One of `revenue`, `orders`, `prep-time`, `delivery-time`, `accuracy`, `satisfaction`

**Example:**
```bash
GET /api/v1/industry/food/metrics/prep-time
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metricId": "prep-time",
    "value": 18
  }
}
```

#### 7. POST `/api/v1/industry/food/actions/:actionId`
Execute industry-specific action.

**Available Actions:**
- `promote-popular-items`
- `optimize-delivery-zones`
- `update-menu-photos`

**Example:**
```bash
POST /api/v1/industry/food/actions/promote-popular-items
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Popular items promotion activated"
  }
}
```

---

## 🔧 Standard Response Format

All endpoints follow this standardized response format:

### Success Response:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-03-27T10:30:00Z",
    "requestId": "req-123456"
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Error code or message",
  "message": "Detailed error description"
}
```

### HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔐 Authentication

All endpoints require JWT authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

The token must contain a valid `storeId` claim which is used to scope data access.

---

## 📊 Rate Limiting

Rate limiting is configured per plan tier:
- **Free/Starter:** 100 requests/minute
- **Pro:** 500 requests/minute
- **Pro+:** 1000 requests/minute

Rate limit headers are included in all responses:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - Time when limit resets

---

## 🧪 Testing Examples

### cURL Examples

#### Fashion Dashboard:
```bash
curl -X GET http://localhost:3001/api/v1/industry/fashion/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

#### Food Order Queue:
```bash
curl -X GET http://localhost:3001/api/v1/industry/food/orders/queue \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

#### Execute Action:
```bash
curl -X POST http://localhost:3001/api/v1/industry/fashion/actions/promote-bestsellers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📈 Performance Targets

All endpoints are designed to meet these performance targets:
- **Cached responses:** < 500ms
- **Fresh data:** < 2s
- **Complex aggregations:** < 3s

Redis caching is recommended for frequently accessed data.

---

## 🚀 Integration Guide

### Frontend Integration Steps:

1. **Create API Client:**
```typescript
// /Frontend/merchant/src/lib/api/industry/fashion.api.ts
import { apiClient } from '@/lib/api-client';

export const fashionAPI = {
  getDashboard: () => 
    apiClient.get('/api/v1/industry/fashion/dashboard'),
  
  getKPIs: () => 
    apiClient.get('/api/v1/industry/fashion/kpis'),
  
  executeAction: (actionId: string, data?: any) => 
    apiClient.post(`/api/v1/industry/fashion/actions/${actionId}`, data),
};
```

2. **Create React Hook:**
```typescript
// /Frontend/merchant/src/hooks/useFashionDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { fashionAPI } from '@/lib/api/industry/fashion.api';

export function useFashionDashboard() {
  return useQuery({
    queryKey: ['fashion-dashboard'],
    queryFn: fashionAPI.getDashboard,
    refetchInterval: 60000, // Refresh every minute
  });
}
```

3. **Use in Component:**
```typescript
import { useFashionDashboard } from '@/hooks/useFashionDashboard';

function FashionDashboard() {
  const { data, isLoading, error } = useFashionDashboard();
  
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorFallback />;
  
  return <FashionKPICards kpis={data.data.kpis} />;
}
```

---

## 📝 Next Steps

### Remaining Tasks:
1. ✅ Backend routes created for Fashion and Food
2. ⏳ Enhance existing Retail, Grocery, Beauty endpoints
3. ⏳ Create industry-specific KPI components
4. ⏳ Implement lazy-loading with skeletons
5. ⏳ Comprehensive testing

### Documentation TODOs:
- Add Swagger/OpenAPI specifications
- Create Postman collection
- Add TypeScript type definitions
- Document error codes and troubleshooting

---

**Last Updated:** March 27, 2026  
**Version:** 1.0  
**Status:** In Progress
