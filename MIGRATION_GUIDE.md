# Migration Guide: Frontend to Backend API

**Purpose:** Step-by-step guide for migrating frontend services from direct Prisma usage to backend API calls.

---

## 🎯 Migration Pattern

### Before (Direct Prisma)
```typescript
import { prisma } from "@vayva/db";

export class MyService {
  static async doSomething(id: string) {
    const result = await prisma.myModel.findUnique({
      where: { id },
    });
    return result;
  }
}
```

### After (Backend API)
```typescript
import { api } from '@/lib/api-client';

export class MyService {
  static async doSomething(id: string) {
    const response = await api.get(`/my-model/${id}`);
    return response.data;
  }
}
```

---

## 📋 Migration Checklist

### Phase 1: Preparation

- [ ] **Create backend service** in `Backend/fastify-server/src/services/`
- [ ] **Create API routes** in `Backend/fastify-server/src/routes/api/v1/`
- [ ] **Register routes** in `Backend/fastify-server/src/index.ts`
- [ ] **Test endpoints** with curl or Postman
- [ ] **Document endpoints** with request/response examples

### Phase 2: Frontend Migration

- [ ] **Remove Prisma imports** from the file
- [ ] **Add API client import**: `import { api } from '@/lib/api-client';`
- [ ] **Replace Prisma calls** with API calls:
  - `prisma.model.findUnique()` → `api.get('/endpoint/:id')`
  - `prisma.model.create()` → `api.post('/endpoint', data)`
  - `prisma.model.update()` → `api.patch('/endpoint/:id', data)`
  - `prisma.model.delete()` → `api.delete('/endpoint/:id')`
  - `prisma.model.findMany()` → `api.get('/endpoint', params)`
- [ ] **Remove unused imports** (email services, logger, etc.)
- [ ] **Update error handling** to use standardized pattern
- [ ] **Test the migrated service** end-to-end

### Phase 3: Verification

- [ ] **No Prisma imports** remain in the file
- [ ] **All methods work** correctly with backend API
- [ ] **Error handling** is consistent
- [ ] **TypeScript compiles** without errors
- [ ] **End-to-end tests** pass

---

## 🔧 Common Patterns

### Pattern 1: Find by ID

**Before:**
```typescript
const order = await prisma.order.findUnique({
  where: { id: orderId },
  include: { customer: true },
});
```

**After:**
```typescript
const response = await api.get(`/orders/${orderId}`, { include: 'customer' });
const order = response.data;
```

---

### Pattern 2: Create Record

**Before:**
```typescript
const result = await prisma.order.create({
  data: {
    storeId,
    customerId,
    total,
  },
});
```

**After:**
```typescript
const response = await api.post('/orders', {
  storeId,
  customerId,
  total,
});
const result = response.data;
```

---

### Pattern 3: Update Record

**Before:**
```typescript
await prisma.order.update({
  where: { id: orderId },
  data: { status: 'SHIPPED' },
});
```

**After:**
```typescript
await api.patch(`/orders/${orderId}`, {
  status: 'SHIPPED',
});
```

---

### Pattern 4: Delete Record

**Before:**
```typescript
await prisma.order.delete({
  where: { id: orderId },
});
```

**After:**
```typescript
await api.delete(`/orders/${orderId}`);
```

---

### Pattern 5: Complex Query

**Before:**
```typescript
const orders = await prisma.order.findMany({
  where: {
    storeId,
    status: 'ACTIVE',
    createdAt: { gte: startDate },
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: page * 20,
});
```

**After:**
```typescript
const response = await api.get('/orders', {
  storeId,
  status: 'ACTIVE',
  startDate: startDate.toISOString(),
  orderBy: 'createdAt',
  order: 'desc',
  limit: 20,
  page: page + 1,
});
const orders = response.data;
```

---

## 🚨 Important Considerations

### 1. Authentication

The API client automatically handles auth token injection via interceptors. You don't need to manually add tokens.

✅ **Good:**
```typescript
const result = await api.post('/endpoint', data);
```

❌ **Don't do this:**
```typescript
const token = await getAuthToken();
const result = await fetch(url, {
  headers: { Authorization: `Bearer ${token}` },
});
```

---

### 2. Error Handling

Use the standardized error handling from the API client.

✅ **Good:**
```typescript
const result = await api.post('/endpoint', data);
if (!result.success) {
  console.error(result.error);
  return result;
}
```

❌ **Don't do this:**
```typescript
try {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed');
} catch (error) {
  // Custom error handling
}
```

---

### 3. Response Format

All API responses follow standard format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

Access your actual data via `response.data`.

---

### 4. Type Safety

Define interfaces for your data models:

```typescript
interface Order {
  id: string;
  storeId: string;
  total: number;
  status: string;
}

// Use in your service
const response = await api.get<Order>(`/orders/${orderId}`);
const order: Order = response.data;
```

---

## 📝 Migration Examples

### Example 1: Simple Service Migration

**Original (with Prisma):**
```typescript
import { prisma } from "@vayva/db";

export class UserService {
  static async getUser(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  }

  static async updateUser(userId: string, data: any) {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
```

**Migrated (API-based):**
```typescript
import { api } from '@/lib/api-client';

export class UserService {
  static async getUser(userId: string) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }

  static async updateUser(userId: string, data: any) {
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
  }
}
```

---

### Example 2: Complex Service with Business Logic

**Original (with Prisma):**
```typescript
import { prisma } from "@vayva/db";
import { sendEmail } from "@/lib/email";

export class OrderService {
  static async cancelOrder(orderId: string, reason: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'DELIVERED') {
      throw new Error('Cannot cancel delivered order');
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELED' },
    });

    await sendEmail({
      to: order.customer.email,
      subject: 'Order Canceled',
      body: `Your order was canceled. Reason: ${reason}`,
    });

    return { success: true };
  }
}
```

**Migrated (API-based):**
```typescript
import { api } from '@/lib/api-client';

export class OrderService {
  static async cancelOrder(orderId: string, reason: string) {
    const response = await api.post(`/orders/${orderId}/cancel`, {
      reason,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to cancel order');
    }

    return response.data;
  }
}
```

**Note:** Email sending and business logic moved to backend service.

---

## 🛠️ Troubleshooting

### Issue: "Cannot find module '@/lib/api-client'"

**Solution:** Make sure you're in the correct package directory and the file exists.

```bash
cd Frontend/merchant
ls src/lib/api-client.ts
```

---

### Issue: TypeScript errors on API response types

**Solution:** Define explicit types for your responses:

```typescript
interface MyResponse {
  id: string;
  name: string;
}

const response = await api.get<MyResponse>('/endpoint');
const data: MyResponse = response.data;
```

---

### Issue: Auth token not being sent

**Solution:** Implement `getAuthToken()` in your API client:

```typescript
const getAuthToken = async (): Promise<string | null> => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};
```

---

### Issue: Network errors or CORS

**Solution:** Ensure your backend has CORS enabled:

```typescript
// In Fastify server
import cors from '@fastify/cors';
await server.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
});
```

---

## 📚 Additional Resources

- **API Documentation:** `BACKEND_API_DOCUMENTATION.md`
- **API Client Implementation:** `Frontend/merchant/src/lib/api-client.ts`
- **Migration Status:** `CLEANUP_COMPLETE_STATUS.md`
- **Architecture Overview:** `RESTRUCTURING_PLAN.md`

---

## ✅ Quick Reference

### HTTP Methods Mapping

| Prisma Method | HTTP Method | Endpoint Pattern |
|---------------|-------------|------------------|
| `findUnique` | GET | `/resource/:id` |
| `findFirst` | GET | `/resource?query=params` |
| `findMany` | GET | `/resource` |
| `create` | POST | `/resource` |
| `update` | PATCH | `/resource/:id` |
| `delete` | DELETE | `/resource/:id` |

---

### Standard Response Format

```typescript
{
  success: true,
  data: { /* your data */ }
}

// OR on error

{
  success: false,
  error: "Error message"
}
```

---

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

---

**Happy Migrating!** 🚀
