# Secrets Management

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Rules
- Never commit secrets to git.
- Docs may include real domains/IPs, but **must not include** API keys/passwords.
- All secrets must be stored in a secret manager or Vercel env vars.

## Where secrets live
### Vercel
- Project environment variables

### VPS
- `~/vayva/.env` (Docker compose env for app server services)
- `/opt/vayva/worker.env` (systemd env file)

## Rotation
Rotate immediately if:
- a secret was committed
- a secret was shared in insecure channels

## High-risk secrets (examples)
- `PAYSTACK_SECRET_KEY`
- `RESEND_API_KEY`
- `GROQ_API_KEY`
- `INTERNAL_API_SECRET`
- `AUTHENTICATION_API_KEY` (Evolution API)
- DB passwords

## Verification
- CI includes docs secret scanning:
  - `platform/scripts/ci/check-docs-secrets.js`
