# Vercel Deployment (Marketing, Merchant Admin, Ops Console)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Goal
Deploy Vayva’s web apps to Vercel with correct monorepo settings, domains, and environment variables.

## Preconditions
- You have access to the GitHub repo.
- You have access to the Vercel team/account that owns the production domains.
- You have production secrets available in a secure place (do not paste them into docs or chat logs).

## What is deployed on Vercel
From repo docs and deployment scripts, the Vercel-hosted surfaces include:
- Marketing: `vayva.ng` (+ `www.vayva.ng`)
- Merchant Admin: `merchant.vayva.ng`
- Ops Console: `ops.vayva.ng`

Storefront wildcard routing may be configured via DNS (`*` record) depending on the approach (see `topology.md`).

## 1) Create Vercel projects
You will import the same GitHub repo multiple times, each with a different root directory.

### Root directories (monorepo)
The repo currently uses `Frontend/*` (not `apps/*`). If you see older docs referencing `apps/*`, treat them as legacy.

Create one project per app:
- `Frontend/marketing`
- `Frontend/merchant-admin`
- `Frontend/ops-console`

If you also deploy a separate storefront app, it will usually be:
- `Frontend/storefront`

### Settings per project
- Framework preset: **Next.js**
- Install command: `pnpm install`
- Build command: `pnpm build`
- Output directory: `.next`
- Monorepo: enable “Include source files outside of the root directory” (Vercel setting)

Recommended additional settings:
- Build & Development Settings → Node.js Version:
  - Use Node 22 if available (repo `.nvmrc` is `22`).

## 1.1) Confirm repo scripts (what Vercel will run)
From root `package.json`:
- `build`: `turbo run build`
- `typecheck`: `node platform/ci/run-typecheck.mjs`
- `ci:guards`: includes docs link + docs secret checks

Implication:
- Vercel build must be able to read workspace packages outside the app root.

## 2) Domains
In each project, add the domains:
- Marketing:
  - `vayva.ng`
  - `www.vayva.ng`
- Merchant Admin:
  - `merchant.vayva.ng`
- Ops:
  - `ops.vayva.ng`

## 3) Environment variables
### Source of truth
- Repo env template: `.env.example`
- Worker env template (VPS): `platform/scripts/deploy/env.worker.example`
- App server env template (VPS): `platform/scripts/deploy/env.app.example`

### Common env vars required on Vercel
At minimum for most apps:
- `DATABASE_URL`
- `DIRECT_URL` (if used)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### Recommended URL variables
From `.env.example` (canonical):
- `MARKETING_BASE_URL=https://vayva.ng`
- `MERCHANT_BASE_URL=https://merchant.vayva.ng`
- `OPS_BASE_URL=https://ops.vayva.ng`
- `STOREFRONT_ROOT_DOMAIN=vayva.ng`
- `STOREFRONT_PROTOCOL=https`
- `PUBLIC_ASSETS_BASE_URL=https://vayva.ng`

### Per-app env var checklists

#### Marketing (`Frontend/marketing`)
Minimum:
- `MARKETING_BASE_URL`
- `PUBLIC_ASSETS_BASE_URL`

If the marketing app calls paid APIs:
- `GROQ_API_KEY_MARKETING` (or whichever key the app expects)

#### Merchant Admin (`Frontend/merchant-admin`)
Minimum:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `MERCHANT_BASE_URL`

If payments are enabled:
- `PAYSTACK_SECRET_KEY`
- `NEXT_PUBLIC_PAYSTACK_KEY`

If email is enabled:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

If storage uses MinIO:
- `MINIO_ENDPOINT`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET`
- `MINIO_PUBLIC_BASE_URL`

If WhatsApp (Evolution) is enabled:
- `EVOLUTION_API_URL` (likely `https://api.vayva.ng`)
- `EVOLUTION_API_KEY`

#### Ops Console (`Frontend/ops-console`)
Minimum:
- `DATABASE_URL`
- `OPS_BASE_URL`

If ops AI is enabled:
- `GROQ_API_KEY_RESCUE`

### URLs
From `.env.example`:
- `MARKETING_BASE_URL=https://vayva.ng`
- `MERCHANT_BASE_URL=https://merchant.vayva.ng`
- `OPS_BASE_URL=https://ops.vayva.ng`
- `STOREFRONT_ROOT_DOMAIN=vayva.ng`
- `PUBLIC_ASSETS_BASE_URL=https://vayva.ng`

### Integrations
Only set the integrations you actually use in production:
- Paystack: `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_KEY`
- Resend: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- Groq: `GROQ_API_KEY` (and variants)
- MinIO (if uploads use MinIO): `MINIO_*`

## 4) DNS (recommended approach)
There are two common models:
- **Registrar manages DNS** and points CNAME/A records to Vercel
- **Vercel DNS is authoritative** (nameservers set to Vercel)

If using Vercel as authoritative DNS, a common pattern is:
- Nameservers:
  - `ns1.vercel-dns.com`
  - `ns2.vercel-dns.com`

## 5) Verify
- `https://vayva.ng`
- `https://merchant.vayva.ng`
- `https://ops.vayva.ng`

Suggested verification steps:
- Marketing loads with no broken assets.
- Merchant Admin:
  - login page loads
  - after login, dashboard renders without 500s
- Ops:
  - login page loads
  - authenticated routes redirect correctly

## Rollback
- In Vercel, you can “Promote to Production” an older deployment.
- If env vars changed, revert env vars and redeploy.

Rollback verification:
- Confirm the previously broken flow is restored.
- Confirm no new 500s were introduced.

## Troubleshooting
### Build fails on workspace imports
- Ensure monorepo “include files outside root directory” is enabled.
- Ensure install runs at repo root.

### Build fails due to Prisma
- Ensure Prisma generate runs (repo has `postinstall` which runs `db:generate`).
- Ensure `DATABASE_URL` exists at build time if generation requires it.

### Runtime fails due to missing env
- Check logs.
- Compare against `.env.example`.
- Add missing env vars and redeploy.

### Domain works but callbacks fail
- Check Paystack webhook URLs
- Check `NEXTAUTH_URL` matches the deployed domain
