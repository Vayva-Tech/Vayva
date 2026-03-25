# Quick Reference Guide - Merchant Gap Fixes

**Last Updated:** March 25, 2026  
**Purpose:** Fast access to critical information for developers and ops team

---

## 🔗 Quick Links

- [Full Audit Report](./MERCHANT_GAP_ANALYSIS_AUDIT.md)
- [Phase 1 Details](./PHASE1_FIXES_SUMMARY.md)
- [Executive Summary](./EXECUTIVE_SUMMARY.md)

---

## 🏥 Health Checks

### Basic Health Check
```bash
curl https://merchant.vayva.com/api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "buildSha": "abc123"
}
```

### Comprehensive Health Check (NEW!)
```bash
curl https://merchant.vayva.com/api/health/comprehensive
```

**What it monitors:**
- ✅ Database
- ✅ Redis
- ✅ Backend API
- ✅ Resend (email)
- ✅ Paystack (payments)
- ✅ WhatsApp
- ✅ Kwik Delivery

**Status codes:**
- `200` = All healthy
- `503` = Degraded (non-critical down)
- `500` = Down (critical failure)

---

## 📧 Email Service

### Testing Email Sending
```typescript
import { ResendEmailService } from "@/lib/email/resend";

// Send transactional email
await ResendEmailService.sendTransactionalEmail({
  to: "user@example.com",
  subject: "Test Email",
  html: "<p>Hello World</p>",
});
```

### Account Deletion Emails
Automatically sent when:
1. User requests account deletion → Scheduled email
2. Deletion executed → Completion email

**Files:** `src/services/DeletionService.ts`

---

## 🛡️ Rate Limiting

### Pre-configured Presets
```typescript
import { withRateLimit } from "@/lib/rate-limit-helper";

export async function POST(request: Request) {
  return withRateLimit(request, 'auth', async () => {
    // Your handler logic here
  });
}
```

**Available presets:**
| Type | Limit | Window | Use Case |
|------|-------|--------|----------|
| `auth` | 5 req | 15 min | Login, register, password reset |
| `payment` | 10 req | 1 min | Payment processing |
| `api` | 30 req | 1 min | General API calls |
| `strict` | 3 req | 1 min | Critical operations |

### Custom Rate Limits
```typescript
import { createRateLimit } from "@/lib/rate-limit-helper";

const customLimit = createRateLimit(
  20,  // max requests
  120  // window in seconds
);
```

### Checking Existing Rate Limits
```bash
# Login endpoint
grep -n "checkRateLimit" src/app/api/auth/merchant/login/route.ts

# Registration endpoint
grep -n "checkRateLimit" src/app/api/auth/merchant/register/route.ts
```

---

## 🐛 Error Handling

### Required Pattern
```typescript
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: Request) {
  try {
    // Your business logic
    const data = await doSomething();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    handleApiError(error, { 
      endpoint: "/api/example", 
      operation: "GET" 
    });
    return NextResponse.json(
      { error: "Friendly message" }, 
      { status: 500 }
    );
  }
}
```

### What You Get
- ✅ Automatic logging with correlation IDs
- ✅ Structured error format
- ✅ Sentry integration
- ✅ Request tracing

---

## 🧪 Testing

### Run Type Check
```bash
pnpm typecheck
```

### Run Tests
```bash
pnpm test
```

### Run E2E Tests
```bash
pnpm test:e2e:smoke
```

### Test Email (Development)
```bash
# Emails will log instead of send in development
NODE_ENV=development pnpm test
```

---

## 📊 Monitoring Dashboard

### Key Metrics to Track

**Health Check Endpoint:**
- Response time (target: <500ms)
- Status code distribution
- Service availability %

**Rate Limiting:**
- Requests blocked (429 responses)
- Rate limit violations by IP
- False positive reports

**Email Service:**
- Emails sent successfully
- Email failures
- Bounce rate

### Setting Up Alerts

**Grafana Alert Example:**
```yaml
alert: High Error Rate
expr: sum(rate(http_requests_total{status=~"5.."}[5m])) > 0.1
for: 5m
labels:
  severity: critical
annotations:
  summary: "High error rate detected"
```

**PagerDuty Integration:**
- Trigger on health check returning 500
- Trigger on error rate > 10%
- Trigger on email failure rate > 5%

---

## 🔧 Troubleshooting

### Email Not Sending
1. Check env vars: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
2. Verify `FEATURES.EMAIL_ENABLED = true`
3. Check logs: `[DELETION] Failed to send` messages
4. Test Resend connection manually

### Rate Limit Too Strict
1. Review preset in `src/lib/rate-limit-helper.ts`
2. Check actual limits being applied
3. Adjust based on legitimate traffic patterns
4. Monitor false positives

### Health Check Failing
1. Check specific service status in response
2. Review service logs (database, redis, backend)
3. Verify environment variables
4. Test connectivity manually

### Common Error Messages

**"Email service is not configured"**
```bash
# Fix: Set RESEND_API_KEY
export RESEND_API_KEY=re_xxxxx
```

**"BACKEND_API_URL not configured"**
```bash
# Fix: Set BACKEND_API_URL
export BACKEND_API_URL=https://api.vayva.com
```

**"Rate limit exceeded"**
```bash
# Wait for window to expire or increase limits
# Check if under attack first!
```

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] All tests passing (`pnpm test`)
- [ ] Type checking clean (`pnpm typecheck`)
- [ ] Environment variables documented
- [ ] Monitoring alerts configured
- [ ] Runbook updated

### Deployment
- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Monitor health checks
- [ ] Check error rates
- [ ] Verify email delivery

### Post-deployment
- [ ] Monitor for 24 hours
- [ ] Review Sentry errors
- [ ] Check rate limit violations
- [ ] Validate health check metrics
- [ ] Update documentation if needed

---

## 📞 Emergency Contacts

**Production Issues:**
1. Check: `/api/health/comprehensive`
2. Review: Sentry dashboard
3. Escalate: On-call engineer
4. Rollback: Follow runbook

**Security Incidents:**
1. Contact: Security team immediately
2. Document: All findings
3. Preserve: Logs and evidence
4. Follow: Security incident playbook

---

## 🎯 Quick Commands

```bash
# Find all rate-limited endpoints
grep -r "checkRateLimit" src/app/api/

# Find routes using error handler
grep -r "handleApiError" src/app/api/

# Test comprehensive health
curl -s localhost:3000/api/health/comprehensive | jq

# Monitor real-time errors
tail -f .next/server/app/api/**/*.log | grep ERROR

# Check email service status
echo $RESEND_API_KEY | grep -q "re_" && echo "Configured" || echo "Missing"
```

---

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/router-handlers)
- [Rate Limiting Best Practices](https://redis.io/docs/manual/patterns/rate-limiting/)
- [Health Check Patterns](https://khalilstemmler.com/blogs/health-checks/)

---

**Questions?** Ask in #engineering channel  
**Found a bug?** Create GitHub issue with `[MERCHANT-GAP]` tag  
**Need help?** Tag @tech-lead or @devops-team
