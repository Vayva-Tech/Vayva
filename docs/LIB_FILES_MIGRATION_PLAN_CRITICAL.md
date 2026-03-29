# Critical Lib Files Migration Plan

**Created**: March 27, 2026  
**Priority**: 🔴 **CRITICAL**  
**Goal**: Zero Prisma imports in frontend by April 3, 2026  

---

## 🎯 Top 5 Critical Files to Migrate First

### Priority Order

1. **security.ts** - Sudo mode security checks (27 lines)
2. **security/apiKeys.ts** - API key management (122 lines)
3. **ops-auth.ts** - Ops authentication (167 lines)
4. **eventBus.ts** - Event system (unknown size)
5. **onboarding-sync.ts** - Onboarding sync (unknown size)

**Rationale**: These handle security, authentication, and core business logic - must be in backend.

---

## 📋 File 1: security.ts

### Current State
**Location**: `/Frontend/merchant/src/lib/security.ts`  
**Lines**: 27  
**Prisma Usage**: `MerchantSession` findUnique  
**Purpose**: Check/require sudo mode for sensitive operations

### What It Does

```typescript
// Checks if user has active sudo session
checkSudoMode(userId, storeId) → boolean

// Throws error if sudo mode not active
requireSudoMode(userId, storeId) → void
```

### Backend Service Design

**Create**: `/Backend/fastify-server/src/services/security.service.ts`

```typescript
import { prisma } from '@vayva/db';

export class SecurityService {
  /**
   * Check if user has active sudo mode
   */
  async checkSudoMode(storeId: string, token: string): Promise<boolean> {
    const session = await prisma.merchantSession.findUnique({
      where: { token },
    });
    
    if (!session || !session.sudoExpiresAt) return false;
    if (session.sudoExpiresAt < new Date()) return false;
    
    return true;
  }

  /**
   * Require sudo mode - throws if not active
   */
  async requireSudoMode(storeId: string, token: string): Promise<void> {
    const isSudo = await this.checkSudoMode(storeId, token);
    if (!isSudo) {
      throw new Error('Sudo mode required');
    }
  }
}
```

### Backend Route

**Create**: `/Backend/fastify-server/src/routes/api/v1/security/sudo/route.ts`

```typescript
// GET /api/v1/security/check-sudo
server.get('/check-sudo', {
  schema: {
    headers: z.object({ authorization: z.string() }),
    querystring: z.object({ storeId: z.string().uuid() }),
  },
}, async (request, reply) => {
  const token = extractToken(request.headers.authorization);
  const { storeId } = request.query;
  
  const isSudo = await securityService.checkSudoMode(storeId, token);
  return { success: true, data: { isSudo } };
});
```

### Frontend Migration

**Update**: `/Frontend/merchant/src/lib/security.ts`

```typescript
// Remove Prisma import
// OLD: import { prisma } from "@vayva/db";
// NEW: Call backend API

const BACKEND_URL = process.env.BACKEND_API_URL || '';

export async function checkSudoMode(userId: string, storeId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  
  // Call backend instead of direct Prisma
  const res = await fetch(`${BACKEND_URL}/api/v1/security/check-sudo`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    query: { storeId },
  });
  
  const data = await res.json();
  return data.data.isSudo;
}
```

**Effort**: ~2 hours  
**Risk**: 🟢 LOW  
**Testing**: Verify sudo mode checks work in all scenarios

---

## 📋 File 2: security/apiKeys.ts

### Current State
**Location**: `/Frontend/merchant/src/lib/security/apiKeys.ts`  
**Lines**: 122  
**Prisma Usage**: ApiKey CRUD operations  
**Purpose**: Create, hash, validate API keys

### What It Does

```typescript
// Generate and hash API key
generateVayvaApiKey() → { key, hash, last4 }

// Create API key record
createKey(storeId, name, scopes, createdByUserId) → ApiKey

// Validate raw key
validateKey(rawKey) → ApiKey | null

// List keys for store
listKeys(storeId) => ApiKey[]

// Revoke key
revokeKey(keyId) => void
```

### Backend Service Design

**Create**: `/Backend/fastify-server/src/services/api-key.service.ts`

```typescript
import { prisma } from '@vayva/db';
import { randomBytes, createHash } from 'crypto';

const KEY_PREFIX = 'vayva_live_';
const KEY_LENGTH_BYTES = 16;

export class ApiKeyService {
  private generateKey() {
    const keyBody = randomBytes(KEY_LENGTH_BYTES).toString('hex');
    const key = `${KEY_PREFIX}${keyBody}`;
    const hash = createHash('sha256').update(key).digest('hex');
    const last4 = key.slice(-4);
    return { key, hash, last4 };
  }

  async createKey(
    storeId: string,
    name: string,
    scopes: string[],
    createdByUserId: string
  ) {
    const { key, hash, last4 } = this.generateKey();
    
    const created = await prisma.apiKey.create({
      data: {
        storeId,
        name,
        scopes,
        status: 'ACTIVE',
        keyHash: hash,
        createdByUserId,
        metadata: { last4 },
      },
      select: { id: true },
    });
    
    return {
      id: created.id,
      key, // Return plain text key ONCE
      last4,
    };
  }

  async validateKey(rawKey: string) {
    const hash = createHash('sha256').update(rawKey).digest('hex');
    
    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash: hash },
      include: { store: true },
    });
    
    if (!apiKey || apiKey.status !== 'ACTIVE') {
      return null;
    }
    
    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });
    
    return apiKey;
  }

  async listKeys(storeId: string) {
    return prisma.apiKey.findMany({
      where: { storeId },
      select: {
        id: true,
        name: true,
        scopes: true,
        last4: true, // from metadata
        createdAt: true,
        lastUsedAt: true,
      },
    });
  }

  async revokeKey(keyId: string) {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { status: 'REVOKED' },
    });
  }
}
```

### Backend Routes

**Create**: `/Backend/fastify-server/src/routes/api/v1/security/api-keys/routes.ts`

```typescript
// POST /api/v1/security/api-keys
server.post('/', {
  schema: {
    body: z.object({
      name: z.string(),
      scopes: z.array(z.string()),
    }),
  },
}, async (request, reply) => {
  const { name, scopes } = request.body;
  const storeId = request.user.storeId; // From JWT
  const userId = request.user.userId;
  
  const result = await apiKeyService.createKey(
    storeId, name, scopes, userId
  );
  
  return { success: true, data: result };
});

// GET /api/v1/security/api-keys
server.get('/', async (request, reply) => {
  const storeId = request.user.storeId;
  const keys = await apiKeyService.listKeys(storeId);
  return { success: true, data: keys };
});

// DELETE /api/v1/security/api-keys/:id
server.delete('/:id', async (request, reply) => {
  const { id } = request.params;
  await apiKeyService.revokeKey(id);
  return { success: true };
});
```

### Frontend Migration

**Update**: `/Frontend/merchant/src/lib/security/apiKeys.ts`

```typescript
// Remove Prisma, call backend instead
const BACKEND_URL = process.env.BACKEND_API_URL || '';

export const ApiKeyService = {
  async createKey(storeId: string, name: string, scopes: string[], createdByUserId: string) {
    const res = await fetch(`${BACKEND_URL}/api/v1/security/api-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, scopes }),
    });
    
    const data = await res.json();
    return data.data;
  },

  async listKeys(storeId: string) {
    const res = await fetch(`${BACKEND_URL}/api/v1/security/api-keys`, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    const data = await res.json();
    return data.data;
  },

  async revokeKey(keyId: string) {
    await fetch(`${BACKEND_URL}/api/v1/security/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  },
};
```

**Effort**: ~3 hours  
**Risk**: 🟡 MEDIUM  
**Testing**: Test key generation, validation, revocation flows

---

## 📋 File 3: ops-auth.ts

### Current State
**Location**: `/Frontend/merchant/src/lib/ops-auth.ts`  
**Lines**: 167  
**Prisma Usage**: OpsUser CRUD, session management  
**Purpose**: Operations team authentication

### What It Does

```typescript
// Bootstrap first ops owner
bootstrapOwner() => void

// Login and create session
login(email, password) => Session

// Get current session
getCurrentSession() => Session | null

// Logout
logout() => void
```

### Backend Service Design

**Create**: `/Backend/fastify-server/src/services/ops-auth.service.ts`

```typescript
import { prisma } from '@vayva/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class OpsAuthService {
  async bootstrapOwner() {
    const count = await prisma.opsUser.count();
    if (count > 0) return;
    
    const email = process.env.OPS_OWNER_EMAIL;
    const password = process.env.OPS_OWNER_PASSWORD;
    if (!email || !password) {
      logger.warn('OPS_BOOTSTRAP_SKIPPED');
      return;
    }
    
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.opsUser.create({
      data: {
        email,
        password: passwordHash,
        role: 'OPS_OWNER',
        name: 'System Owner',
        isActive: true,
      },
    });
  }

  async login(email: string, password: string) {
    const user = await prisma.opsUser.findUnique({ where: { email } });
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    if (!user.isActive) throw new Error('Account disabled');
    
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await prisma.opsSession.create({
      data: {
        opsUserId: user.id,
        token,
        expiresAt,
      },
    });
    
    return { user, token };
  }
}
```

### Backend Routes

**Create**: `/Backend/fastify-server/src/routes/api/v1/ops/auth/routes.ts`

```typescript
// POST /api/v1/ops/auth/login
server.post('/login', {
  schema: {
    body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  },
}, async (request, reply) => {
  const { email, password } = request.body;
  const result = await opsAuthService.login(email, password);
  
  if (!result) {
    return reply.code(401).send({ 
      success: false, 
      error: { code: 'INVALID_CREDENTIALS' } 
    });
  }
  
  return { success: true, data: result };
});
```

### Frontend Migration

**Update**: `/Frontend/merchant/src/lib/ops-auth.ts`

```typescript
// Remove Prisma, call backend
const BACKEND_URL = process.env.BACKEND_API_URL || '';

export class OpsAuthService {
  static async login(email: string, password: string) {
    const res = await fetch(`${BACKEND_URL}/api/v1/ops/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    if (!data.success) return null;
    return data.data;
  }
}
```

**Effort**: ~3 hours  
**Risk**: 🟡 MEDIUM  
**Testing**: Test ops login flow thoroughly

---

## 📊 Migration Timeline

### Day 1 (Mar 29) - Security Services
- [ ] Create SecurityService in backend (2h)
- [ ] Create API Key service in backend (3h)
- [ ] Create routes for both (2h)
- [ ] Test backend services (1h)
- **Total**: 8 hours

### Day 2 (Mar 30) - Ops Auth & EventBus
- [ ] Create OpsAuthService in backend (3h)
- [ ] Create ops auth routes (1h)
- [ ] Audit eventBus.ts usage (1h)
- [ ] Create backend event bus service (3h)
- [ ] Test both services (2h)
- **Total**: 10 hours

### Day 3 (Mar 31) - Onboarding & Testing
- [ ] Audit onboarding-sync.ts (1h)
- [ ] Create backend onboarding service (3h)
- [ ] Migrate frontend files (3h)
- [ ] End-to-end testing (3h)
- **Total**: 10 hours

### Days 4-5 (Apr 1-2) - Remaining 20 Files
- Migrate remaining lib files
- 2 hours per file average
- **Total**: 40 hours

---

## ✅ Success Criteria

- [ ] Zero Prisma imports in top 5 critical files
- [ ] All backend services have full test coverage
- [ ] Frontend calls backend correctly
- [ ] No functionality regressions
- [ ] Performance maintained or improved
- [ ] Security enhanced (no exposed secrets)

---

## 🔧 Implementation Checklist

For Each File:

1. **Audit Phase** (30 min)
   - [ ] Read entire file
   - [ ] Identify all Prisma queries
   - [ ] List dependent files
   - [ ] Document business logic

2. **Backend Service Creation** (2-3h)
   - [ ] Create service file
   - [ ] Implement business logic
   - [ ] Add Zod validation schemas
   - [ ] Write unit tests

3. **Backend Routes** (1-2h)
   - [ ] Define endpoints
   - [ ] Add OpenAPI documentation
   - [ ] Implement rate limiting
   - [ ] Add error handling

4. **Frontend Migration** (2-3h)
   - [ ] Remove Prisma imports
   - [ ] Replace with backend API calls
   - [ ] Update TypeScript types
   - [ ] Handle errors properly

5. **Testing** (2-3h)
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing complete
   - [ ] Performance acceptable

---

## 📞 Support Needed

**From Tech Lead**:
- Architecture review after Day 1
- Approval on API design patterns
- Priority confirmation vs other tasks

**From Backend Team**:
- Code review on services
- Best practices sharing
- Testing strategy alignment

**From Frontend Team**:
- Feedback on new patterns
- Migration coordination
- Testing support

---

**Last Updated**: March 27, 2026  
**Next Review**: March 29, 2026 (Start implementation)
