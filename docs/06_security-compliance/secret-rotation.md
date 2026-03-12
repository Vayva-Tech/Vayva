# Secret Rotation SOP

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
Define how to rotate secrets safely without downtime.

## When to rotate
- Scheduled rotation (quarterly)
- Suspected leak
- A secret was ever committed/shared
- Staff changes

## Rotation playbook (generic)
1. Identify where the secret is used (Vercel, VPS env files, code).
2. Generate new secret.
3. Update non-prod first.
4. Deploy non-prod and verify.
5. Update prod secrets.
6. Deploy prod and verify.
7. Revoke old secret.

## Provider-specific notes
### Paystack
- Rotate secret/public keys in Paystack dashboard
- Update Vercel env vars
- Verify payment init + webhook

### Resend
- Rotate API key
- Verify email send

### Groq
- Rotate API key
- Verify AI route works

### Evolution API
- Rotate `AUTHENTICATION_API_KEY` (app server) and `EVOLUTION_API_KEY` (worker)
- Must match
- Restart Evolution container + worker
- Verify inbound/outbound messaging

### Database
- Rotate DB password
- Update all consumers (`DATABASE_URL`)
- Restart apps/worker

## Verification checklist
- No errors in logs
- Critical flows pass

## Rollback
- Revert to old secret only if absolutely necessary
- If reverting, investigate why rotation failed
