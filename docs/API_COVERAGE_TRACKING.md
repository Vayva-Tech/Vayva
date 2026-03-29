# API Coverage Tracking - Phase 1 Authentication

## Overview
This document tracks the backend API endpoint coverage for the Merchant Frontend Cleanup Phase 1 (Authentication Flow).

**Last Updated**: March 27, 2026  
**Status**: In Progress

---

## Required Endpoints vs Current Implementation

### ✅ Implemented Endpoints

#### 1. **POST /api/v1/auth/login**
- **Status**: ✅ Implemented
- **Location**: `/Backend/fastify-server/src/routes/api/v1/auth/auth.routes.ts`
- **Schema**: `LoginSchema` (email, password)
- **Response**: `{ success: boolean, data: { token, user } }`
- **Notes**: 
  - Currently returns mock response (TODO: implement actual auth logic)
  - JWT token generation working
  - Missing OTP integration
  - Missing rate limiting (needs @fastify/rate-limit)

#### 2. **GET /api/v1/auth/me**
- **Status**: ✅ Implemented
- **Location**: `/Backend/fastify-server/src/routes/api/v1/auth/auth.routes.ts`
- **Auth**: Requires JWT authentication (`preHandler: [server.authenticate]`)
- **Response**: `{ success: boolean, data: { id, email, storeId, role } }`
- **Notes**: Working correctly with JWT

---

### ❌ Missing Endpoints (Required by Frontend)

Based on frontend service analysis (`/Frontend/merchant/src/services/auth.ts`):

#### 1. **POST /api/auth/merchant/login**
- **Status**: ❌ MISSING
- **Required By**: `AuthService.signIn()` (line 75)
- **Expected Request**:
  ```json
  {
    "email": "string",
    "password": "string",
    "otpMethod": "EMAIL" | "WHATSAPP"
  }
  ```
- **Expected Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "string",
      "user": { ... },
      "merchant": { ... },
      "requiresOTP": true,
      "otpMethod": "EMAIL",
      "maskedPhone": "+1***555****"
    }
  }
  ```
- **Priority**: 🔴 CRITICAL - Blocks signin flow

#### 2. **POST /api/auth/merchant/register**
- **Status**: ❌ MISSING
- **Required By**: `AuthService.signUp()` (line 97)
- **Expected Request**:
  ```json
  {
    "email": "string",
    "password": "string",
    "firstName": "string",
    "lastName": "string",
    "storeName": "string",
    "industrySlug": "string"
  }
  ```
- **Expected Response**:
  ```json
  {
    "success": true,
    "data": {
      "userId": "string",
      "email": "string",
      "requiresVerification": true
    }
  }
  ```
- **Priority**: 🔴 CRITICAL - Blocks signup flow

#### 3. **POST /api/auth/merchant/verify-otp**
- **Status**: ❌ MISSING
- **Required By**: `AuthService.verifyOTP()` (line 124)
- **Expected Request**:
  ```json
  {
    "email": "string",
    "code": "string",
    "method": "EMAIL" | "WHATSAPP",
    "rememberMe": "boolean"
  }
  ```
- **Expected Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "string",
      "user": { ... },
      "merchant": { ... }
    }
  }
  ```
- **Priority**: 🔴 CRITICAL - Blocks OTP verification flow

#### 4. **POST /api/auth/merchant/resend-otp**
- **Status**: ❌ MISSING
- **Required By**: `AuthService.resendCode()` (line 144)
- **Expected Request**:
  ```json
  {
    "email": "string",
    "method": "EMAIL" | "WHATSAPP"
  }
  ```
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Code resent successfully"
  }
  ```
- **Priority**: 🔴 HIGH - Needed for resend code functionality

#### 5. **POST /api/auth/forgot-password**
- **Status**: ❌ MISSING
- **Required By**: `AuthService.requestPasswordReset()` (line 24)
- **Expected Request**:
  ```json
  {
    "email": "string"
  }
  ```
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Password reset email sent"
  }
  ```
- **Priority**: 🟡 MEDIUM - Needed for password recovery

#### 6. **POST /api/auth/reset-password**
- **Status**: ❌ MISSING
- **Required By**: `AuthService.verifyPasswordReset()` (line 49)
- **Expected Request**:
  ```json
  {
    "token": "string",
    "password": "string"
  }
  ```
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Password reset successful"
  }
  ```
- **Priority**: 🟡 MEDIUM - Needed for password recovery completion

---

## Backend Files to Create

### New Route Structure
```
/Backend/fastify-server/src/routes/api/v1/auth/
├── auth.routes.ts (EXISTING - needs update)
├── auth.controller.ts (NEW - request handlers)
├── auth.service.ts (NEW - business logic)
├── auth.schema.ts (NEW - Zod schemas)
└── auth.types.ts (NEW - TypeScript types)
```

### Migration Strategy

**Option 1: Update existing auth.routes.ts** (Recommended for Phase 1)
- Keep current `/api/v1/auth/login` for backward compatibility
- Add new merchant-specific routes under `/api/auth/merchant/*`
- Gradually migrate to new endpoints

**Option 2: Complete rewrite** (Better long-term)
- Replace entire auth system
- Break backward compatibility
- Require coordinated frontend/backend deployment

**Decision**: Option 1 for Phase 1 to minimize disruption

---

## Integration Points

### External Services Required
1. **Email Service** (SendGrid/AWS SES)
   - OTP codes via email
   - Password reset emails
   
2. **WhatsApp Business API**
   - OTP codes via WhatsApp
   - Phone number validation

3. **Database Tables**
   - `users` - User accounts
   - `merchants` - Merchant profiles
   - `stores` - Store information
   - `otp_codes` - OTP tracking
   - `password_reset_tokens` - Reset tokens

4. **Redis** (Optional but recommended)
   - OTP code caching (5-min TTL)
   - Rate limiting storage
   - Session management

---

## Testing Checklist

### Unit Tests Required
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Login triggers OTP when required
- [ ] Registration creates user account
- [ ] Registration sends OTP
- [ ] OTP verification success
- [ ] OTP verification failure
- [ ] OTP expiration (5-min timeout)
- [ ] Resend OTP rate limiting
- [ ] Password reset request
- [ ] Password reset completion
- [ ] Token refresh mechanism

### Integration Tests
- [ ] Full signin → OTP → dashboard flow
- [ ] Full signup → OTP → onboarding flow
- [ ] Password reset flow end-to-end
- [ ] JWT token validation on protected routes
- [ ] Rate limiting enforcement

---

## Timeline

| Phase | Task | Status | ETA |
|-------|------|--------|-----|
| 1A | Document API requirements | ✅ Complete | Mar 27 |
| 1B | Create missing backend endpoints | ⏳ Pending | Mar 28 |
| 1C | Test endpoints | ⏳ Pending | Mar 29 |
| 1D | Frontend integration | ⏳ Pending | Mar 30 |

---

## Blockers & Risks

### Current Blockers
1. ❌ No merchant login endpoint - **Blocking frontend signin**
2. ❌ No OTP verification endpoint - **Blocking verification flow**
3. ❌ No registration endpoint - **Blocking signup**

### Technical Risks
1. **Email/WhatsApp integration** - Need API keys and configuration
2. **Database schema** - Need to verify all required tables exist
3. **JWT strategy** - Need to align token payload between frontend/backend
4. **Rate limiting** - Need to configure properly to prevent abuse

### Mitigation
- Use mock services for development (email/WhatsApp)
- Create database migration scripts
- Document JWT payload structure
- Configure rate limiting with higher limits for staging

---

## Next Steps

1. **Immediate**: Create `/api/auth/merchant/login` endpoint
2. **High Priority**: Create OTP verification endpoints
3. **Medium Priority**: Create password reset endpoints
4. **Low Priority**: Add comprehensive error handling and logging

---

## Notes

- All endpoints should follow the standard response format: `{ success: boolean, data?: T, error?: { code, message } }`
- Rate limiting required on all auth endpoints (use `@fastify/rate-limit`)
- Input validation with Zod schemas mandatory
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 429, 500)
- CORS configured for frontend origin
- Structured logging with correlation IDs
