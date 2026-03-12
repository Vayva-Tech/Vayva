# Universal Dashboard API Documentation

## Overview

The Universal Dashboard API provides a consolidated endpoint for retrieving dashboard data across all 22 industries with proper caching, industry-specific configurations, and unified data structures.

## Base URL

```
/api/dashboard
```

## Authentication

All endpoints require authentication via:
- `Authorization` header with Bearer token
- `X-Store-ID` header with store identifier

## Endpoints

### 1. Universal Dashboard Data

**GET** `/api/dashboard/universal`

Retrieves consolidated dashboard data for the authenticated store.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `range` | string | No | `month` | Time range: `today`, `week`, or `month` |

#### Response

```json
{
  "success": true,
  "data": {
    "kpis": {
      "revenue": 125000,
      "orders": 45,
      "bookings": 23,
      "customers": 156,
      "conversionRate": 78.5,
      "revenueChange": 12.3,
      "ordersChange": -5.2,
      "customersChange": 8.7,
      "conversionChange": 2.1,
      "aov": 2777.78,
      "returningCustomers": 67,
      "repeatRate": 43.2,
      "failedPayments": 3,
      "paymentSuccessRate": 95.8,
      "upcomingBookings": 12,
      "cancellations": 2,
      "inventoryValue": 89500,
      "lowStockCount": 8,
      "pctBelowReorder": 15.6,
      "returnsCount": 5,
      "refundAmount": 2350,
      "refundRate": 3.2,
      "completionRate": 89.1,
      "utilizationRate": 76.5,
      "retention": 67.8
    },
    "metrics": {
      "metrics": {
        "revenue": { "value": 15000 },
        "orders": { "value": 23 },
        "customers": { "value": 167 }
      }
    },
    "overview": {
      "statusCounts": {
        "PAID": 15,
        "PENDING": 8,
        "COMPLETED": 22
      },
      "meetings": [
        {
          "id": "meeting_1",
          "title": "Consultation Session",
          "subtitle": "John Doe",
          "time": "2:30 PM"
        }
      ],
      "tickets": [
        {
          "id": "ticket_1",
          "name": "Jane Smith",
          "subject": "Order Issue",
          "status": "open",
          "priority": "high",
          "updatedAt": "2024-01-15T14:30:00Z"
        }
      ]
    },
    "todosAlerts": {
      "todos": [
        {
          "id": "add-products",
          "title": "Add Your First Product",
          "description": "Start selling by adding products to your catalog",
          "priority": "high",
          "icon": "Package",
          "action": {
            "label": "Add Product",
            "href": "/dashboard/products/new"
          }
        }
      ],
      "alerts": [
        {
          "id": "upgrade-plan",
          "type": "info",
          "title": "Upgrade Your Plan",
          "message": "Unlock advanced features and grow your business faster",
          "action": {
            "label": "View Plans",
            "href": "/dashboard/billing"
          }
        }
      ]
    },
    "activity": [
      {
        "id": "order_123",
        "type": "ORDER",
        "date": "2024-01-15T14:30:00Z",
        "time": "2 hours ago",
        "message": "New order ORD-001 for ₦2,500",
        "user": "John Customer"
      }
    ],
    "primaryObjects": {
      "type": "orders",
      "items": [
        {
          "id": "order_123",
          "orderNumber": "ORD-001",
          "status": "PAID",
          "paymentStatus": "SUCCESS",
          "fulfillmentStatus": "PROCESSING",
          "total": 2500,
          "currency": "NGN",
          "createdAt": "2024-01-15T14:30:00Z",
          "customer": {
            "name": "John Customer",
            "email": "john@example.com",
            "phone": "+2341234567890"
          },
          "itemsPreview": [
            {
              "title": "Product A",
              "quantity": 2
            }
          ],
          "itemsCount": 3
        }
      ]
    },
    "inventoryAlerts": {
      "lowStockThreshold": 5,
      "lowCount": 8,
      "outOfStockCount": 2,
      "items": [
        {
          "id": "item_1",
          "productId": "prod_123",
          "productTitle": "T-Shirt",
          "variantId": "var_456",
          "variantTitle": "Size M",
          "available": 3
        }
      ]
    },
    "customerInsights": {
      "totals": {
        "totalCustomers": 892,
        "newCustomers": 45,
        "activeCustomers": 156,
        "returningCustomers": 67,
        "repeatRate": 43.2
      },
      "topCustomers": [
        {
          "id": "cust_1",
          "name": "Regular Customer",
          "email": "regular@example.com",
          "phone": "+2341234567890",
          "orders": 12,
          "spend": 15600
        }
      ]
    },
    "earnings": {
      "totalSales": 125000,
      "platformFee": 3750,
      "netEarnings": 121250,
      "pendingFunds": 15600,
      "availableFunds": 105650,
      "history": [
        {
          "id": "payout_1",
          "amount": 50000,
          "status": "SUCCESS",
          "date": "2024-01-10T09:00:00Z"
        }
      ]
    },
    "storeInfo": {
      "industrySlug": "fashion",
      "currency": "NGN",
      "hasBookings": false,
      "hasInventory": true,
      "plan": "PRO",
      "isLive": true,
      "onboardingCompleted": true
    }
  },
  "timestamp": "2024-01-15T15:30:00Z",
  "cacheHit": true
}
```

#### Response Headers

| Header | Description |
|--------|-------------|
| `X-Cache` | Cache status: `HIT`, `MISS`, or `STALE` |
| `X-Cache-Age` | Age of cached data in seconds (when cached) |
| `ETag` | Entity tag for cache validation |

---

### 2. Industry Configuration

**GET** `/api/dashboard/industry/{industrySlug}`

Retrieves industry-specific dashboard configuration including KPI definitions, object types, and design preferences.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `industrySlug` | string | Yes | Industry identifier (e.g., `fashion`, `food`, `services`) |

#### Response

```json
{
  "success": true,
  "data": {
    "industrySlug": "fashion",
    "kpiKeys": [
      "revenue",
      "orders",
      "customers",
      "conversionRate",
      "paymentSuccessRate",
      "inventoryValue",
      "lowStockCount",
      "pctBelowReorder"
    ],
    "primaryObjectName": "Order",
    "hasBookings": false,
    "hasInventory": true,
    "chartTypes": [
      "revenue",
      "orders",
      "customers",
      "sizeDistribution",
      "collectionPerformance"
    ],
    "allowedModules": [
      "dashboard",
      "analytics",
      "settings",
      "products",
      "collections",
      "inventory"
    ],
    "designCategory": "signature"
  },
  "timestamp": "2024-01-15T15:30:00Z"
}
```

#### Supported Industries

| Industry Slug | Primary Object | Has Bookings | Has Inventory | Design Category |
|---------------|----------------|--------------|---------------|-----------------|
| `retail` | Order | ❌ | ✅ | signature |
| `fashion` | Order | ❌ | ✅ | signature |
| `food` | Order | ❌ | ✅ | bold |
| `services` | Booking | ✅ | ❌ | glass |
| `real_estate` | Viewing | ✅ | ❌ | natural |
| `education` | Enrollment | ✅ | ❌ | signature |
| `automotive` | Test Drive | ✅ | ✅ | bold |
| `travel_hospitality` | Booking | ✅ | ❌ | natural |
| `nonprofit` | Donation | ❌ | ❌ | signature |

---

### 3. Cache Invalidation (Internal)

**POST** `/api/dashboard/universal`

Invalidates cached dashboard data for the store.

#### Request Body

```json
{
  "dataType": "all" // or "order", "booking", "customer", "inventory"
}
```

#### Response

```json
{
  "success": true,
  "message": "Dashboard cache invalidated for all data changes",
  "timestamp": "2024-01-15T15:30:00Z"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid industry slug: invalid_industry",
  "timestamp": "2024-01-15T15:30:00Z"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Unauthorized",
  "timestamp": "2024-01-15T15:30:00Z"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to fetch universal dashboard data",
  "timestamp": "2024-01-15T15:30:00Z"
}
```

## Caching Strategy

### Cache Configuration

| Data Type | TTL | Stale While Revalidate | Cache Key Pattern |
|-----------|-----|----------------------|-------------------|
| Universal Dashboard | 5 minutes | 2 minutes | `dashboard:universal:{storeId}:{range}` |
| Industry Config | 1 hour | 10 minutes | `dashboard:industry:config:{industrySlug}` |
| KPIs | 3 minutes | 1 minute | `dashboard:kpis:{storeId}:{range}` |

### Cache Headers

Responses include cache status headers:
- `X-Cache: HIT` - Data served from cache
- `X-Cache: MISS` - Fresh data fetched
- `X-Cache: STALE` - Stale data served while revalidating
- `X-Cache-Age` - Age of cached data in seconds

## Usage Examples

### JavaScript/TypeScript

```typescript
// Fetch universal dashboard data
async function getDashboardData(range = 'month') {
  const response = await fetch(`/api/dashboard/universal?range=${range}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'X-Store-ID': storeId
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data; // UniversalDashboardData
}

// Get industry configuration
async function getIndustryConfig(industrySlug: string) {
  const response = await fetch(`/api/dashboard/industry/${industrySlug}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'X-Store-ID': storeId
    }
  });
  
  const data = await response.json();
  return data.data; // IndustryDashboardConfig
}

// Invalidate cache after data changes
async function invalidateDashboardCache(dataType = 'all') {
  await fetch('/api/dashboard/universal', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'X-Store-ID': storeId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ dataType })
  });
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

interface UseDashboardOptions {
  range?: 'today' | 'week' | 'month';
  enabled?: boolean;
}

function useUniversalDashboard({ range = 'month', enabled = true }: UseDashboardOptions = {}) {
  const [data, setData] = useState<UniversalDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState<'HIT' | 'MISS' | 'STALE' | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/dashboard/universal?range=${range}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'X-Store-ID': localStorage.getItem('storeId') || ''
          }
        });
        
        setCacheStatus(response.headers.get('X-Cache') as any);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range, enabled]);

  return { data, loading, error, cacheStatus };
}

// Usage in component
function DashboardComponent() {
  const { data, loading, error, cacheStatus } = useUniversalDashboard({ 
    range: 'week',
    enabled: true 
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div>Cache Status: {cacheStatus}</div>
      <div>Revenue: {data?.kpis.revenue}</div>
      {/* Render dashboard components */}
    </div>
  );
}
```

## Performance Considerations

1. **Caching**: Responses are cached with appropriate TTLs to reduce database load
2. **ETags**: Conditional requests supported for efficient updates
3. **Compression**: Data is compressed for storage when enabled
4. **Stale-while-revalidate**: Serve stale content while fetching fresh data
5. **Batch Loading**: All dashboard data fetched in single optimized query

## Monitoring

Monitor cache performance via:
- Cache hit/miss ratios
- Response times
- Data freshness
- Memory usage

Cache statistics can be retrieved through the system monitoring endpoints.