# NextAuth Legacy Route - Removal Recommendation

**Date**: March 27, 2026  
**Status**: ⚠️ **REQUIRES DECISION**  
**Priority**: 🟡 MEDIUM  

---

## 🔍 Current State

**File**: `/Frontend/merchant/src/app/api/auth/[...nextauth]/route.ts` (7 lines)

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### What It Does

This route uses **NextAuth.js** with Credentials Provider for authentication. It's connected to:
- `/Frontend/merchant/src/lib/auth.ts` (226 lines) - Auth configuration
- Uses JWT tokens for session management
- Handles user sessions via NextAuth's built-in system

### Related Files

1. **`/Frontend/merchant/src/lib/auth.ts`** (226 lines)
   - NextAuth options configuration
   - Session callbacks
   - JWT token handling
   - User role/plan/trial tracking

2. **`/Frontend/merchant/src/lib/session.server.ts`** (exists)
   - Creates sessions using JWT
   - Used by verify-otp route

3. **Dependencies**:
   - `next-auth` package
   - `@auth/prisma-adapter` (possibly unused)

---

## ❌ Why This Should Be Removed

### 1. **Dual Authentication System**

We now have **TWO** complete auth systems:

| System | Location | Status |
|--------|----------|--------|
| **NextAuth** | Frontend routes | ⚠️ Legacy |
| **Fastify Backend** | Backend/fastify-server | ✅ Production Ready |

**Current Implementation**:
- ✅ Login → Fastify backend
- ✅ Register → Fastify backend
- ✅ Verify OTP → Fastify backend
- ✅ Password Reset → Fastify backend
- ⚠️ NextAuth route → Still configured but possibly unused

### 2. **Architecture Violation**

Our policy states:
> **"All business logic must be in Fastify backend"**

NextAuth handles:
- Session management ❌ (should be in backend)
- JWT token generation ❌ (backend does this)
- User serialization ❌ (backend handles this)

### 3. **Unnecessary Complexity**

With Fastify backend auth:
- Backend generates JWT tokens
- Frontend just stores them in cookies
- No need for NextAuth's session system
- Simpler codebase, easier maintenance

### 4. **Maintenance Burden**

Keeping both systems means:
- Two sets of auth logic to maintain
- Potential security gaps
- Confusion for new developers
- Double the testing requirements

---

## ✅ Recommended Action: REMOVE

### Migration Plan

#### Phase 1: Audit Usage (30 minutes)

Search for NextAuth usage across frontend:

```bash
# Check if next-auth is imported anywhere
grep -r "from 'next-auth'" Frontend/merchant/src --include="*.ts" --include="*.tsx"

# Check getServerSession usage
grep -r "getServerSession" Frontend/merchant/src

# Check useSession hook usage
grep -r "useSession" Frontend/merchant/src
```

#### Phase 2: Replace Session Management (2 hours)

**Replace NextAuth sessions with simple JWT cookie pattern**:

Current pattern (with NextAuth):
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
const userId = session.user.id;
```

New pattern (direct JWT):
```typescript
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const cookieStore = cookies();
const token = cookieStore.get("auth_token")?.value;

if (!token) {
  throw new Error("Not authenticated");
}

const verified = await jwtVerify(token, secret);
const userId = verified.payload.userId;
```

#### Phase 3: Remove Files (15 minutes)

**Delete**:
- [ ] `/Frontend/merchant/src/app/api/auth/[...nextauth]/route.ts`
- [ ] `/Frontend/merchant/src/lib/auth.ts` (or keep only types)
- [ ] Remove `next-auth` from package.json
- [ ] Remove `@auth/prisma-adapter` if present

**Update**:
- [ ] Update all server components using `getServerSession`
- [ ] Update all client components using `useSession`
- [ ] Update middleware if using NextAuth

#### Phase 4: Test (1 hour)

- [ ] Login flow still works
- [ ] Session persistence works
- [ ] Protected routes work
- [ ] Logout clears cookies properly

---

## 🎯 Alternative: Keep Temporarily

If removal seems too risky right now, we can:

### Option A: Hybrid Approach

Keep NextAuth for session management but ensure it calls Fastify for auth:

```typescript
// In credentials provider
async authorize(credentials) {
  // Call Fastify backend
  const res = await fetch(`${BACKEND_API_URL}/api/auth/merchant/login`, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  
  const data = await res.json();
  
  if (!res.ok) return null;
  
  return {
    id: data.user.id,
    email: data.user.email,
    // ... other fields
  };
}
```

**Pros**:
- Minimal changes to existing code
- Gradual migration path

**Cons**:
- Still maintains dual system
- Adds complexity
- Delays inevitable cleanup

---

## 📊 Impact Analysis

### Files That Might Need Updates

**Estimated**: 10-20 files

| Category | Count | Effort |
|----------|-------|--------|
| API Routes | 2 | Low |
| Server Components | 5-10 | Medium |
| Client Components | 3-5 | Low |
| Middleware | 1 | High |
| Utils/Hooks | 2-3 | Low |

### Risk Level

**Overall Risk**: 🟡 MEDIUM

**Why**:
- Session management is critical
- Changes affect many components
- Testing required but straightforward

**Mitigation**:
- Deploy to staging first
- Test all auth flows thoroughly
- Have rollback plan ready
- Monitor error logs closely

---

## 🎯 Recommendation

### Immediate Action (Today)

1. **Audit actual usage** (30 min)
   ```bash
   grep -r "next-auth" Frontend/merchant/src -l
   grep -r "getServerSession" Frontend/merchant/src -l
   grep -r "useSession" Frontend/merchant/src -l
   ```

2. **Make decision**:
   - If NextAuth is barely used → **Remove immediately**
   - If heavily integrated → **Plan gradual migration**

3. **If removing**:
   - Create replacement session utilities
   - Update critical components first
   - Test thoroughly before deployment

### Preferred Approach

**Remove NextAuth completely** and use simple JWT cookie pattern:

```typescript
// Simple session utility (no NextAuth needed)
export async function getCurrentUser() {
  const token = cookies().get("auth_token")?.value;
  if (!token) return null;
  
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload;
  } catch {
    return null;
  }
}
```

**Benefits**:
- ✅ Single source of truth (Fastify backend)
- ✅ Simpler architecture
- ✅ Easier to maintain
- ✅ Better performance (less abstraction)
- ✅ Clearer separation of concerns

---

## 📋 Decision Required

**Tech Lead Decision Needed**:

- [ ] **Option A**: Remove NextAuth completely (Recommended)
- [ ] **Option B**: Keep temporarily, migrate gradually
- [ ] **Option C**: Keep indefinitely (Not recommended)

**Timeline**:
- If Option A: Complete removal by March 29-30
- If Option B: Start migration planning April 1
- If Option C: Document why exception exists

---

## 🔧 Quick Audit Commands

Run these to assess usage:

```bash
# Count NextAuth imports
echo "=== NextAuth Imports ==="
grep -r "from ['\"]next-auth['\"]" Frontend/merchant/src --include="*.ts" --include="*.tsx" | wc -l

# List files using getServerSession
echo "=== getServerSession Usage ==="
grep -r "getServerSession" Frontend/merchant/src --include="*.ts" --include="*.tsx" -l

# List files using useSession
echo "=== useSession Usage ==="
grep -r "useSession" Frontend/merchant/src --include="*.ts" --include="*.tsx" -l

# Check package.json
echo "=== Dependencies ==="
grep -E "(next-auth|@auth)" Frontend/merchant/package.json
```

---

**Prepared By**: AI Code Analysis Assistant  
**For Review By**: Tech Lead / Architecture Team  
**Decision Deadline**: March 28, 2026
