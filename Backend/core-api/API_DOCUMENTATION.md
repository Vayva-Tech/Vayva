# Vayva Backend API Documentation

**Base URL**: `http://163.245.209.203:3001/api/v1`  
**Version**: 1.0  
**Status**: Production Ready ✅

---

## Authentication

All endpoints (except login) require JWT authentication via Bearer token.

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "owner@store.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "store": {
      "id": "store-123",
      "name": "My Store"
    }
  }
}
```

**Usage**: Include `Authorization: Bearer YOUR_TOKEN` in all subsequent requests.

---

## Inventory Management

### Get Stock Level
```http
GET /api/v1/inventory/stock/:variantId?locationId=optional-location
Authorization: Bearer TOKEN
```

### Get Multi-Location Stock
```http
GET /api/v1/inventory/stock/:variantId/locations
Authorization: Bearer TOKEN
```

### Get Low Stock Items
```http
GET /api/v1/inventory/low-stock?threshold=5
Authorization: Bearer TOKEN
```

### Adjust Stock
```http
POST /api/v1/inventory/adjust
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "productId": "prod-123",
  "variantId": "var-123",
  "locationId": "loc-123",
  "delta": 10,
  "reason": "purchase",
  "reference": "PO-001",
  "note": "Restocked from supplier"
}
```

### Deplete Stock (Order Fulfillment)
```http
POST /api/v1/inventory/deplete
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "items": [
    {
      "productId": "prod-123",
      "variantId": "var-123",
      "quantity": 2,
      "orderId": "order-456"
    }
  ]
}
```

### Receive Stock (Purchase Order)
```http
POST /api/v1/inventory/receive
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "items": [
    {
      "productId": "prod-123",
      "variantId": "var-123",
      "quantity": 50,
      "reference": "PO-001"
    }
  ]
}
```

### Transfer Stock Between Locations
```http
POST /api/v1/inventory/transfer
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "fromLocationId": "loc-1",
  "toLocationId": "loc-2",
  "productId": "prod-123",
  "variantId": "var-123",
  "quantity": 10,
  "note": "Balancing inventory"
}
```

### Cycle Count (Physical Inventory)
```http
POST /api/v1/inventory/cycle-count
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "counts": [
    {
      "productId": "prod-123",
      "variantId": "var-123",
      "locationId": "loc-1",
      "physicalCount": 45
    }
  ]
}
```

### Get Movement History
```http
GET /api/v1/inventory/movements/:variantId?limit=50&since=2026-01-01
Authorization: Bearer TOKEN
```

---

## POS System

### List Devices
```http
GET /api/v1/pos/devices
Authorization: Bearer TOKEN
```

### Register Device
```http
POST /api/v1/pos/devices/register
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "provider": "square",
  "deviceId": "SQUARE-DEVICE-001",
  "deviceName": "Front Counter",
  "accessToken": "sq_access_token_xyz",
  "settings": {
    "autoSyncInventory": true,
    "autoSyncProducts": true,
    "autoSyncOrders": true,
    "syncInterval": 15
  }
}
```

### Update Device Settings
```http
PUT /api/v1/pos/devices/:deviceId/settings
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "autoSyncInventory": false,
  "syncInterval": 30
}
```

### Trigger Sync
```http
POST /api/v1/pos/devices/:deviceId/sync
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "syncType": "full" 
  // Options: "inventory", "products", "orders", "full"
}
```

### Get Sync History
```http
GET /api/v1/pos/devices/:deviceId/history?limit=20
Authorization: Bearer TOKEN
```

### Remove Device
```http
DELETE /api/v1/pos/devices/:deviceId
Authorization: Bearer TOKEN
```

---

## Rentals

### List Rental Products
```http
GET /api/v1/rentals/products?status=active&type=monthly
Authorization: Bearer TOKEN
```

### Create Rental Product
```http
POST /api/v1/rentals/products
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "productId": "prod-123",
  "type": "rental",
  "pricing": {
    "dailyRate": 5000,
    "weeklyRate": 30000,
    "monthlyRate": 100000,
    "securityDeposit": 50000,
    "lateFeePerDay": 2000
  },
  "availability": {
    "totalQuantity": 10
  }
}
```

### Book a Rental
```http
POST /api/v1/rentals/bookings
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "customerId": "cust-123",
  "rentalProductId": "rental-456",
  "startDate": "2026-04-01",
  "endDate": "2026-05-01",
  "rentalType": "monthly"
}
```

### Return Rental
```http
POST /api/v1/rentals/bookings/:bookingId/return
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "condition": "good",
  "notes": "Returned on time, no issues"
}
```

### Get Customer's Active Rentals
```http
GET /api/v1/rentals/customers/:customerId/active
Authorization: Bearer TOKEN
```

### Extend Rental
```http
POST /api/v1/rentals/bookings/:bookingId/extend
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "endDate": "2026-06-01"
}
```

---

## Meal Kit

### Get Recipes
```http
GET /api/v1/meal-kit/recipes?category=dinner&difficulty=easy
Authorization: Bearer TOKEN
```

### Create Recipe
```http
POST /api/v1/meal-kit/recipes
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "Spaghetti Carbonara",
  "description": "Classic Italian pasta",
  "category": "dinner",
  "difficulty": "medium",
  "prepTimeMinutes": 30,
  "cookTimeMinutes": 20,
  "servings": 4,
  "ingredients": [
    {
      "name": "Spaghetti",
      "quantity": 400,
      "unit": "g"
    }
  ],
  "instructions": ["Boil water", "Cook pasta", ...]
}
```

---

## Fashion

### Get Style Quizzes
```http
GET /api/v1/fashion/quizzes
Authorization: Bearer TOKEN
```

### Create Quiz
```http
POST /api/v1/fashion/quizzes
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "Find Your Style",
  "questions": [
    {
      "text": "What's your preferred fit?",
      "options": ["Slim", "Regular", "Loose"]
    }
  ]
}
```

### Submit Quiz
```http
POST /api/v1/fashion/quizzes/:quizId/submit
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "q1",
      "answer": "Slim"
    }
  ]
}
```

### Get Quiz Results
```http
GET /api/v1/fashion/quizzes/:quizId/results/:customerId
Authorization: Bearer TOKEN
```

---

## Education

### Get Courses
```http
GET /api/v1/education/courses?status=active&category=math
Authorization: Bearer TOKEN
```

### Create Course
```http
POST /api/v1/education/courses
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "Advanced Mathematics",
  "description": "Calculus and beyond",
  "category": "math",
  "level": "advanced",
  "price": 50000,
  "duration": "12 weeks"
}
```

### Get Course Stats
```http
GET /api/v1/education/courses/stats
Authorization: Bearer TOKEN
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common HTTP Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

- Default: 100 requests per minute per IP
- Authenticated: 500 requests per minute per user

Headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1648387200
```

---

## Pagination

List endpoints support pagination:

```http
GET /api/v1/inventory/low-stock?page=1&limit=20
```

Response includes:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

---

## Testing with cURL

### Example: Get Stock Level
```bash
# Login first
TOKEN=$(curl -X POST http://163.245.209.203:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@store.com","password":"password"}' \
  | jq -r '.data.token')

# Get stock
curl http://163.245.209.203:3001/api/v1/inventory/stock/var-123 \
  -H "Authorization: Bearer $TOKEN"
```

---

**Last Updated**: 2026-03-27  
**Maintained By**: Development Team  
**Status**: Production Ready ✅
