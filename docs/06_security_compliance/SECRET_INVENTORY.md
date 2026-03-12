# Vayva Secret Inventory

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026  
**Classification:** INTERNAL - RESTRICTED ACCESS  
**Version:** 1.0.0

---

## ⚠️ CRITICAL SECURITY NOTICE

This document contains the complete inventory of all secrets used in the Vayva platform. 

**NEVER:**
- Commit actual secret values to git
- Share this document outside the engineering team
- Store secrets in plain text files
- Use production secrets in development

**ALWAYS:**
- Use a secrets manager (1Password, HashiCorp Vault, etc.)
- Rotate secrets quarterly
- Use different secrets per environment
- Audit secret access regularly

---

## Secret Categories

| Category | Count | Rotation Frequency |
|----------|-------|-------------------|
| Authentication | 6 | Quarterly |
| Payment APIs | 2 | Quarterly |
| AI Services | 6 | Quarterly |
| Communication | 2 | Quarterly |
| Infrastructure | 8 | Quarterly |
| External Services | 8 | Annually |
| **TOTAL** | **32** | - |

---

## 1. Authentication Secrets

### 1.1 BETTER_AUTH_SECRET

| Attribute | Value |
|-----------|-------|
| **Purpose** | Primary authentication secret for Better Auth |
| **Used By** | All frontend apps, Core API |
| **Environment** | All environments |
| **Format** | 64-character hex string |
| **Generation** | `openssl rand -hex 32` |
| **Location** | `.env.local`, Vercel env vars |

**Files Using:**
- `Frontend/merchant-admin/src/lib/auth.ts`
- `Frontend/storefront/src/lib/auth.ts`
- `Backend/core-api/src/lib/auth.ts`

**Rotation Procedure:**
1. Generate new secret
2. Update in Vercel (all projects)
3. Update in VPS (worker, Evolution)
4. Restart services
5. Invalidate all sessions

---

### 1.2 NEXTAUTH_SECRET

| Attribute | Value |
|-----------|-------|
| **Purpose** | Legacy NextAuth.js secret (migration in progress) |
| **Used By** | Legacy auth implementations |
| **Environment** | All environments |
| **Format** | 64-character hex string |
| **Generation** | `openssl rand -hex 32` |
| **Location** | `.env.local`, Vercel env vars |

**Note:** Being phased out in favor of BETTER_AUTH_SECRET

---

### 1.3 JWT_SECRET

| Attribute | Value |
|-----------|-------|
| **Purpose** | JWT signing for auth-service (Fastify) |
| **Used By** | Auth microservice |
| **Environment** | All environments |
| **Format** | 64-character hex string |
| **Generation** | `openssl rand -hex 32` |
| **Location** | `.env.local`, VPS env files |

---

### 1.4 COOKIE_SECRET

| Attribute | Value |
|-----------|-------|
| **Purpose** | API Gateway cookie signing |
| **Used By** | API Gateway service |
| **Environment** | All environments |
| **Format** | 64-character hex string |
| **Generation** | `openssl rand -hex 32` |
| **Location** | `.env.local` |

---

### 1.5 INTERNAL_API_SECRET

| Attribute | Value |
|-----------|-------|
| **Purpose** | Shared secret for internal API calls between services |
| **Used By** | All microservices |
| **Environment** | All environments |
| **Format** | 64-character hex string |
| **Generation** | `openssl rand -hex 32` |
| **Location** | `.env.local`, Vercel env vars, VPS env files |

**Usage:**
```typescript
// Internal API call
headers: {
  'X-Internal-Secret': process.env.INTERNAL_API_SECRET
}
```

---

### 1.6 OPS_AUTH_SECRET

| Attribute | Value |
|-----------|-------|
| **Purpose** | Ops Console authentication secret |
| **Used By** | Ops Console |
| **Environment** | All environments |
| **Format** | 64-character hex string |
| **Generation** | `openssl rand -hex 32` |
| **Location** | Vercel env vars (ops-console only) |

---

## 2. Payment API Secrets

### 2.1 PAYSTACK_SECRET_KEY

| Attribute | Value |
|-----------|-------|
| **Purpose** | Paystack API authentication |
| **Used By** | Core API, Worker |
| **Environment** | All environments |
| **Format** | `sk_test_...` (test) / `sk_live_...` (prod) |
| **Source** | https://dashboard.paystack.com/#/settings/developer |
| **Location** | `.env.local`, Vercel env vars, VPS env files |

**Permissions Required:**
- Charges
- Refunds
- Transfers
- Subaccounts

**Rotation Procedure:**
1. Generate new key in Paystack dashboard
2. Update in all environments
3. Test payment flow
4. Revoke old key

---

### 2.2 NEXT_PUBLIC_PAYSTACK_KEY

| Attribute | Value |
|-----------|-------|
| **Purpose** | Client-side Paystack key for checkout |
| **Used By** | Storefront, Merchant Admin |
| **Environment** | All environments |
| **Format** | `pk_test_...` (test) / `pk_live_...` (prod) |
| **Source** | https://dashboard.paystack.com/#/settings/developer |
| **Location** | Vercel env vars (public) |

**Note:** This is a PUBLIC key - safe to expose to frontend

---

## 3. AI Service Secrets

### 3.1 GROQ_API_KEY

| Attribute | Value |
|-----------|-------|
| **Purpose** | Primary Groq API access |
| **Used By** | Core API, Worker |
| **Environment** | All environments |
| **Format** | `gsk_...` |
| **Source** | https://console.groq.com/keys |
| **Location** | `.env.local`, Vercel env vars, VPS env files |

**Models Used:**
- llama-3.1-70b-versatile
- llama3-70b-8192

---

### 3.2 GROQ_ADMIN_KEY

| Attribute | Value |
|-----------|-------|
| **Purpose** | Groq API for admin operations |
| **Used By** | Ops Console |
| **Environment** | All environments |
| **Format** | `gsk_...` |
| **Source** | https://console.groq.com/keys |
| **Location** | Vercel env vars (ops-console only) |

---

### 3.3 GROQ_MARKETING_KEY

| Attribute | Value |
|-----------|-------|
| **Purpose** | Groq API for marketing site |
| **Used By** | Marketing site |
| **Environment** | All environments |
| **Format** | `gsk_...` |
| **Source** | https://console.groq.com/keys |
| **Location** | Vercel env vars (marketing only) |

---

### 3.4 GROQ_WHATSAPP_KEY

| Attribute | Value |
|-----------|-------|
| **Purpose** | Groq API for WhatsApp AI features |
| **Used By** | Worker (WhatsApp jobs) |
| **Environment** | All environments |
| **Format** | `gsk_...` |
| **Source** | https://console.groq.com/keys |
| **Location** | VPS env files (worker only) |

---

### 3.5 GROQ_API_KEY_RESCUE

| Attribute | Value |
|-----------|-------|
| **Purpose** | Groq API for Vayva Rescue system |
| **Used By** | Ops Console, Rescue service |
| **Environment** | All environments |
| **Format** | `gsk_...` |
| **Source** | https://console.groq.com/keys |
| **Location** | Vercel env vars (ops-console, core-api) |

**Model Used:**
- llama-3.1-70b-versatile (high reasoning for diagnostics)

---

### 3.6 OPENAI_API_KEY

| Attribute | Value |
|-----------|-------|
| **Purpose** | OpenAI API access (fallback) |
| **Used By** | Core API |
| **Environment** | All environments |
| **Format** | `sk-proj-...` |
| **Source** | https://platform.openai.com/api-keys |
| **Location** | `.env.local`, Vercel env vars |

---

## 4. Communication Secrets

### 4.1 RESEND_API_KEY

| Attribute | Value |
|-----------|-------|
| **Purpose** | Email sending API |
| **Used By** | Worker, Core API |
| **Environment** | All environments |
| **Format** | `re_...` |
| **Source** | https://resend.com/api-keys |
| **Location** | `.env.local`, Vercel env vars, VPS env files |

**Permissions:**
- Sending access
- Domain verification

---

### 4.2 RESEND_FROM_EMAIL

| Attribute | Value |
|-----------|-------|
| **Purpose** | Default sender email address |
| **Used By** | Worker, Core API |
| **Environment** | All environments |
| **Format** | `no-reply@vayva.ng` |
| **Source** | Resend dashboard |
| **Location** | `.env.local`, Vercel env vars |

---

## 5. Infrastructure Secrets

### 5.1 DATABASE_URL

| Attribute | Value |
|-----------|-------|
| **Purpose** | PostgreSQL connection string |
| **Used By** | All applications |
| **Environment** | All environments |
| **Format** | `postgresql://user:password@host:5432/database?sslmode=require` |
| **Source** | Database provider (Supabase, AWS RDS, etc.) |
| **Location** | `.env.local`, Vercel env vars, VPS env files |

**Components:**
- Username
- Password
- Host
- Port
- Database name
- SSL mode

**Rotation Procedure:**
1. Create new DB user
2. Grant permissions
3. Update connection strings
4. Restart services
5. Revoke old user

---

### 5.2 REDIS_URL

| Attribute | Value |
|-----------|-------|
| **Purpose** | Redis connection for caching and queues |
| **Used By** | All applications |
| **Environment** | All environments |
| **Format** | `redis://username:password@host:port` or `rediss://...` |
| **Source** | Redis provider (Upstash, AWS ElastiCache, etc.) |
| **Location** | `.env.local`, Vercel env vars, VPS env files |

**Alternative:**
- `UPSTASH_REDIS_REST_URL` - For REST API access

---

### 5.3 MINIO_ACCESS_KEY

| Attribute | Value |
|-----------|-------|
| **Purpose** | MinIO/S3 access key |
| **Used By** | Core API, Worker |
| **Environment** | All environments |
| **Format** | Alphanumeric string |
| **Source** | MinIO console or AWS IAM |
| **Location** | `.env.local`, Vercel env vars, VPS env files |

---

### 5.4 MINIO_SECRET_KEY

| Attribute | Value |
|-----------|-------|
| **Purpose** | MinIO/S3 secret key |
| **Used By** | Core API, Worker |
| **Environment** | All environments |
| **Format** | Alphanumeric string |
| **Source** | MinIO console or AWS IAM |
| **Location** | `.env.local`, Vercel env vars, VPS env files |

---

### 5.5 BLOB_READ_WRITE_TOKEN

| Attribute | Value |
|-----------|-------|
| **Purpose** | Vercel Blob storage access |
| **Used By** | Core API (optional alternative to MinIO) |
| **Environment** | Production |
| **Format** | `vercel_blob_rw_...` |
| **Source** | Vercel dashboard |
| **Location** | Vercel env vars |

---

### 5.6 EVOLUTION_API_KEY

| Attribute | Value |
|-----------|-------|
| **Purpose** | Evolution API (WhatsApp gateway) authentication |
| **Used By** | Worker, Core API |
| **Environment** | All environments |
| **Format** | Custom string |
| **Source** | Evolution API configuration |
| **Location** | VPS env files, `.env.local` |

**Note:** Must match `AUTHENTICATION_API_KEY` in Evolution API config

---

### 5.7 EVOLUTION_API_URL

| Attribute | Value |
|-----------|-------|
| **Purpose** | Evolution API base URL |
| **Used By** | Worker, Core API |
| **Environment** | All environments |
| **Format** | `http://localhost:8080` (local) / `https://evolution.vayva.ng` (prod) |
| **Source** | VPS deployment |
| **Location** | VPS env files, `.env.local` |

---

### 5.8 EVOLUTION_INSTANCE_NAME

| Attribute | Value |
|-----------|-------|
| **Purpose** | WhatsApp instance identifier |
| **Used By** | Worker, Core API |
| **Environment** | All environments |
| **Format** | `vayva-main` |
| **Source** | Evolution API configuration |
| **Location** | VPS env files, `.env.local` |

---

## 6. External Service Secrets

### 6.1 KWIK_EMAIL

| Attribute | Value |
|-----------|-------|
| **Purpose** | Kwik delivery service login |
| **Used By** | Core API, Worker |
| **Environment** | All environments |
| **Format** | Email address |
| **Source** | Kwik client panel |
| **Location** | `.env.local`, Vercel env vars, VPS env files |

---

### 6.2 KWIK_PASSWORD

| Attribute | Value |
|-----------|-------|
| **Purpose** | Kwik delivery service password |
| **Used By** | Core API, Worker |
| **Environment** | All environments |
| **Format** | Password string |
| **Source** | Kwik client panel |
| **Location** | `.env.local`, Vercel env vars, VPS env files |

---

### 6.3 META_APP_ID

| Attribute | Value |
|-----------|-------|
| **Purpose** | Meta (Facebook) app identifier |
| **Used By** | Core API (Instagram integration) |
| **Environment** | All environments |
| **Format** | Numeric string |
| **Source** | https://developers.facebook.com/apps |
| **Location** | `.env.local`, Vercel env vars |

---

### 6.4 META_APP_SECRET

| Attribute | Value |
|-----------|-------|
| **Purpose** | Meta (Facebook) app secret |
| **Used By** | Core API (Instagram integration) |
| **Environment** | All environments |
| **Format** | Alphanumeric string |
| **Source** | https://developers.facebook.com/apps |
| **Location** | `.env.local`, Vercel env vars |

---

### 6.5 YOUVERIFY_API_KEY

| Attribute | Value |
|-----------|-------|
| **Purpose** | YouVerify KYC/identity verification |
| **Used By** | Core API |
| **Environment** | Production |
| **Format** | API key string |
| **Source** | YouVerify dashboard |
| **Location** | Vercel env vars |

---

### 6.6 WEBSTUDIO_TOKEN

| Attribute | Value |
|-----------|-------|
| **Purpose** | WebStudio integration (templates) |
| **Used By** | Template system |
| **Environment** | All environments |
| **Format** | Token string |
| **Source** | WebStudio dashboard |
| **Location** | `.env.local` (template-specific) |

---

### 6.7 SENTRY_DSN

| Attribute | Value |
|-----------|-------|
| **Purpose** | Error tracking and monitoring |
| **Used By** | All applications |
| **Environment** | All environments |
| **Format** | `https://...` URL |
| **Source** | Sentry dashboard |
| **Location** | Vercel env vars |

---

### 6.8 SENTRY_AUTH_TOKEN

| Attribute | Value |
|-----------|-------|
| **Purpose** | Sentry release tracking |
| **Used By** | CI/CD pipelines |
| **Environment** | CI only |
| **Format** | Token string |
| **Source** | Sentry dashboard |
| **Location** | GitHub Secrets, Vercel env vars |

---

## Secret Locations by Environment

### Local Development

**File:** `.env.local` (root of each app)

```
Frontend/marketing/.env.local
Frontend/merchant-admin/.env.local
Frontend/ops-console/.env.local
Frontend/storefront/.env.local
Backend/core-api/.env.local
Backend/worker/.env.local
```

**Required Secrets:**
- All authentication secrets
- Database URL
- Redis URL
- Payment keys (test)
- AI API keys
- Email API key
- MinIO credentials (or use local)

### Vercel (Production/Staging)

**Projects:**
- `vayva-marketing`
- `vayva-merchant-admin`
- `vayva-ops-console`
- `vayva-storefront`
- `vayva-core-api`

**Access:**
- Vercel dashboard → Project → Settings → Environment Variables

**Required Secrets per Project:**

| Secret | Marketing | Merchant | Ops | Storefront | Core API |
|--------|-----------|----------|-----|------------|----------|
| BETTER_AUTH_SECRET | ✓ | ✓ | ✓ | ✓ | ✓ |
| DATABASE_URL | - | ✓ | ✓ | ✓ | ✓ |
| REDIS_URL | - | ✓ | ✓ | ✓ | ✓ |
| PAYSTACK_SECRET_KEY | - | - | - | - | ✓ |
| NEXT_PUBLIC_PAYSTACK_KEY | - | ✓ | - | ✓ | - |
| GROQ_API_KEY | ✓ | ✓ | ✓ | - | ✓ |
| GROQ_API_KEY_RESCUE | - | - | ✓ | - | ✓ |
| RESEND_API_KEY | - | ✓ | ✓ | - | ✓ |
| MINIO_ACCESS_KEY | - | ✓ | ✓ | - | ✓ |
| MINIO_SECRET_KEY | - | ✓ | ✓ | - | ✓ |
| INTERNAL_API_SECRET | ✓ | ✓ | ✓ | ✓ | ✓ |
| OPS_AUTH_SECRET | - | - | ✓ | - | - |

### VPS (Production)

**Services:**
- Worker (systemd)
- Evolution API (Docker)
- MinIO (Docker)
- PostgreSQL
- Redis

**Files:**
```
/var/www/vayva/Backend/worker/.env
/etc/systemd/system/vayva-worker.service.d/override.conf
~/vayva/platform/infra/db/.env
```

**Required Secrets:**
- All worker-required secrets
- Database credentials
- Redis credentials
- Evolution API key
- MinIO credentials
- Kwik credentials

---

## Secret Rotation Schedule

### Quarterly Rotation (Every 3 Months)

| Month | Secrets to Rotate |
|-------|-------------------|
| January | Auth secrets, API keys |
| April | Payment keys, AI keys |
| July | Infrastructure secrets |
| October | External service secrets |

### Rotation Checklist

- [ ] Generate new secret
- [ ] Update in 1Password/Vault
- [ ] Update in Vercel (all projects)
- [ ] Update in VPS (all services)
- [ ] Update in `.env.example`
- [ ] Test affected services
- [ ] Monitor for 24 hours
- [ ] Revoke old secret
- [ ] Document rotation in security log

---

## Secret Validation

### Automated Validation

**Script:** `scripts/validate-env.js`

**Required Variables Checked:**
```javascript
const REQUIRED = [
    'NODE_ENV',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
    'REDIS_URL',
    'PAYSTACK_SECRET_KEY',
    'YOUVERIFY_API_KEY',
    'RESEND_API_KEY'
];
```

**Usage:**
```bash
node scripts/validate-env.js
```

### Manual Validation

**Pre-deployment Checklist:**
1. Run `validate-env.js`
2. Check all Vercel projects have required vars
3. Verify VPS env files
4. Test critical paths (login, payment, email)

---

## Incident Response

### Secret Compromise Response

If a secret is compromised:

1. **IMMEDIATE (0-5 minutes)**
   - Rotate the compromised secret
   - Revoke old secret at provider
   - Check access logs for unauthorized usage

2. **SHORT TERM (5-30 minutes)**
   - Audit affected systems
   - Check for unauthorized data access
   - Notify security team

3. **LONG TERM (30+ minutes)**
   - Post-incident review
   - Update rotation schedule if needed
   - Document lessons learned

---

## Related Documentation

- [Secrets Management](secrets-management.md)
- [Secret Rotation](secret-rotation.md)
- [Environment Variables](../../03_development/env-vars.md)
- [Security Policies](../policies/)

---

**Last Review:** March 2026  
**Next Review:** June 2026  
**Owner:** Nyamsi Fredrick (Founder)

**Questions?** Contact security@vayva.ng or #security on Slack.
