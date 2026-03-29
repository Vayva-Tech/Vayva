# Backend API Documentation

**Base URL:** `http://localhost:4000/api/v1`  
**Authentication:** JWT Bearer token required on all endpoints  
**Content-Type:** `application/json`

---

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Account Deletion Endpoints

### POST `/compliance/account-deletion/request`

Request account deletion with 7-day grace period.

**Request Body:**
```json
{
  "reason": "Optional reason for deletion"
}
```

**Response (200):**
```json
{
  "success": true,
  "scheduledFor": "2026-04-04T00:00:00.000Z",
  "message": "Deletion scheduled."
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Cannot delete account yet.",
  "blockers": ["Pending payouts exist"]
}
```

---

### POST `/compliance/account-deletion/cancel`

Cancel pending deletion request.

**Response (200):**
```json
{
  "success": true,
  "message": "Deletion canceled."
}
```

---

### GET `/compliance/account-deletion/status`

Get current deletion status.

**Response (200):**
```json
{
  "success": true,
  "hasPendingDeletion": false
}
```

**Response (200) - Pending:**
```json
{
  "success": true,
  "hasPendingDeletion": true,
  "request": {
    "id": "req_123",
    "status": "SCHEDULED",
    "scheduledFor": "2026-04-04T00:00:00.000Z",
    "requestedAt": "2026-03-28T00:00:00.000Z"
  }
}
```

---

## Order State Endpoints

### POST `/orders/state/transition`

Transition order to new fulfillment status.

**Request Body:**
```json
{
  "orderId": "order_123",
  "toStatus": "SHIPPED"
}
```

**Valid Status Transitions:**
- `UNFULFILLED` → `PROCESSING`
- `PROCESSING` → `SHIPPED`
- `SHIPPED` → `DELIVERED`
- Any → `CANCELED`

**Response (200):**
```json
{
  "success": true,
  "order": { /* full order object */ },
  "fromStatus": "PROCESSING",
  "toStatus": "SHIPPED",
  "notificationsSent": ["customer_email", "merchant_dashboard"]
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Order not found"
}
```

---

### GET `/orders/state/status`

Get current order status.

**Query Parameters:**
- `orderId` (required): Order ID

**Response (200):**
```json
{
  "success": true,
  "order": {
    "id": "order_123",
    "fulfillmentStatus": "SHIPPED",
    "status": "ACTIVE"
  }
}
```

---

### POST `/orders/state/bulk-update`

Bulk update multiple orders to same status.

**Request Body:**
```json
{
  "orderIds": ["order_1", "order_2"],
  "toStatus": "DELIVERED"
}
```

**Response (200):**
```json
{
  "success": true,
  "updatedCount": 2,
  "orders": [ /* array of updated orders */ ]
}
```

---

## Delivery Endpoints

### GET `/delivery/:orderId/readiness`

Check if order is ready for delivery dispatch.

**Path Parameters:**
- `orderId`: Order ID

**Response (200):**
```json
{
  "status": "READY",
  "blockers": []
}
```

**Response (200) - Not Ready:**
```json
{
  "status": "NOT_READY_ADDRESS_MISSING",
  "blockers": ["Store Pickup Address Missing", "Recipient Phone Missing"]
}
```

---

### POST `/delivery/:orderId/dispatch`

Auto-dispatch order to delivery provider.

**Path Parameters:**
- `orderId`: Order ID

**Request Body:**
```json
{
  "channel": "whatsapp"
}
```

**Response (200):**
```json
{
  "success": true,
  "status": "DISPATCHED",
  "shipment": { /* shipment object */ },
  "providerJobId": "KWIK_12345",
  "trackingUrl": "https://track.kwik.com/KWIK_12345"
}
```

**Response (400):**
```json
{
  "success": false,
  "status": "BLOCKED",
  "reason": "Readiness Failed: Store Pickup Address Missing"
}
```

---

### GET `/delivery/shipments/:shipmentId/tracking`

Get delivery tracking information.

**Path Parameters:**
- `shipmentId`: Shipment ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "IN_TRANSIT",
    "location": "Lagos Distribution Center",
    "estimatedDelivery": "2026-03-30T00:00:00.000Z"
  }
}
```

---

### PATCH `/delivery/shipments/:shipmentId/status`

Update shipment delivery status.

**Path Parameters:**
- `shipmentId`: Shipment ID

**Request Body:**
```json
{
  "status": "DELIVERED"
}
```

**Response (200):**
```json
{
  "success": true,
  "shipment": { /* updated shipment object */ }
}
```

---

## Returns Endpoints

### POST `/returns/request`

Request product return.

**Request Body:**
```json
{
  "orderId": "order_123",
  "items": [
    {
      "itemId": "item_1",
      "quantity": 2,
      "reason": "Defective"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "return": { /* return request object */ }
}
```

---

### GET `/returns/:returnId`

Get return request details.

**Path Parameters:**
- `returnId`: Return ID

**Response (200):**
```json
{
  "success": true,
  "return": {
    "id": "ret_123",
    "status": "APPROVED",
    "items": [ /* items */ ]
  }
}
```

---

### POST `/returns/:returnId/approve`

Approve return request.

**Path Parameters:**
- `returnId`: Return ID

**Response (200):**
```json
{
  "success": true,
  "message": "Return approved."
}
```

---

### POST `/returns/:returnId/reject`

Reject return request.

**Path Parameters:**
- `returnId`: Return ID

**Request Body:**
```json
{
  "reason": "Item condition does not match policy"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Return rejected."
}
```

---

## KYC Endpoints

### POST `/kyc/submit`

Submit KYC verification documents.

**Request Body:**
```json
{
  "businessName": "Example Ltd",
  "registrationNumber": "RC123456",
  "taxId": "TAX789",
  "documentUrls": [
    "https://storage.example.com/doc1.pdf"
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "kyc": {
    "id": "kyc_123",
    "status": "PENDING_REVIEW"
  }
}
```

---

### GET `/kyc/status`

Get KYC verification status.

**Response (200):**
```json
{
  "success": true,
  "kyc": {
    "id": "kyc_123",
    "status": "VERIFIED",
    "verifiedAt": "2026-03-27T00:00:00.000Z"
  }
}
```

---

### POST `/kyc/update`

Update KYC information.

**Request Body:**
```json
{
  "businessName": "Updated Business Name",
  "documentUrls": [
    "https://storage.example.com/new-doc.pdf"
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "KYC updated successfully."
}
```

---

## Error Handling

All endpoints return errors in consistent format:

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
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Rate Limiting

Rate limits are applied per IP address:

- **Default:** 100 requests per minute
- **Authentication endpoints:** 10 requests per minute
- **Bulk operations:** 20 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1648483200
```

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page (max: 100)

**Response:**
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Best Practices

1. **Always handle errors gracefully**
   - Check `success` field in response
   - Handle network errors
   - Implement retry logic with exponential backoff

2. **Use proper authentication**
   - Never expose credentials
   - Refresh tokens before expiry
   - Store tokens securely

3. **Respect rate limits**
   - Monitor rate limit headers
   - Implement backoff strategies
   - Cache responses when appropriate

4. **Validate client-side**
   - Validate inputs before sending
   - Use TypeScript types
   - Show clear error messages to users

---

## SDK Usage Example

Using the centralized API client:

```typescript
import { api } from '@/lib/api-client';

// Request account deletion
const result = await api.post('/compliance/account-deletion/request', {
  reason: 'No longer needed'
});

if (result.success) {
  console.log('Deletion scheduled for:', result.data.scheduledFor);
} else {
  console.error('Failed:', result.error);
}

// Transition order status
const transition = await api.post('/orders/state/transition', {
  orderId: 'order_123',
  toStatus: 'SHIPPED'
});

// Get order status
const status = await api.get('/orders/state/status', {
  orderId: 'order_123'
});
```

---

## Testing

Test endpoints using curl:

```bash
# Request account deletion
curl -X POST http://localhost:4000/api/v1/compliance/account-deletion/request \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Testing"}'

# Get order status
curl -X GET "http://localhost:4000/api/v1/orders/state/status?orderId=order_123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Support

For API issues or questions:
- GitHub Issues: [Link to repo]
- Email: tech@vayva.com
- Documentation: /docs directory
