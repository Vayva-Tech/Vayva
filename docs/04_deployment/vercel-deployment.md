# Vercel Deployment

> Deployment configuration for the Vayva platform on Vercel

## Architecture

The Vayva monorepo deploys four separate Vercel projects from a single GitHub repository (`Vayva-Tech/Vayva`, branch `Vayva`). Each project targets a different `Frontend/` subdirectory as its root.

```
GitHub Repo: Vayva-Tech/Vayva (branch: Vayva)
├── Frontend/merchant    → merchant.vayva.ng
├── Frontend/ops-console → ops.vayva.ng
├── Frontend/storefront  → store.vayva.ng
└── Frontend/marketing   → vayva.ng
```

---

## Vercel Project Configuration

### Merchant Dashboard

| Setting | Value |
|---------|-------|
| **Root Directory** | `Frontend/merchant` |
| **Framework** | Next.js |
| **Build Command** | `next build` |
| **Install Command** | `pnpm install` |
| **Output Directory** | `.next` |
| **Domain** | `merchant.vayva.ng` |
| **Redirect** | `app.vayva.ng` → `merchant.vayva.ng` |

Additional features:
- Cron job: `/api/jobs/cron/trial-reminders` at `0 8 * * *` (daily 08:00 UTC)
- CSP header configured for Paystack, Vercel Analytics, and `*.vayva.ng`
- Standalone output mode for middleware support

### Ops Console

| Setting | Value |
|---------|-------|
| **Root Directory** | `Frontend/ops-console` |
| **Framework** | Next.js |
| **Build Command** | `next build` |
| **Install Command** | `pnpm install` |
| **Output Directory** | `.next` |
| **Domain** | `ops.vayva.ng` |

- TypeScript build errors are ignored (`ignoreBuildErrors: true`) due to pending Prisma migrations
- React Compiler enabled

### Storefront

| Setting | Value |
|---------|-------|
| **Root Directory** | `Frontend/storefront` |
| **Framework** | Next.js |
| **Build Command** | `next build` |
| **Install Command** | `pnpm install` |
| **Output Directory** | `.next` |
| **Domain** | `store.vayva.ng` |

- Uses `version: 2` in vercel.json
- React Compiler enabled
- TypeScript build errors ignored

### Marketing

| Setting | Value |
|---------|-------|
| **Root Directory** | `Frontend/marketing` |
| **Framework** | Next.js |
| **Build Command** | `next build` |
| **Install Command** | `pnpm install` |
| **Output Directory** | `.next` |
| **Domains** | `vayva.ng`, `www.vayva.ng` |

- Minimal next.config.js (ESM, no standalone output)
- No custom security headers in vercel.json (handled in next.config)

---

## Domain Configuration

| Domain | Target App | Notes |
|--------|-----------|-------|
| `vayva.ng` | marketing | Primary domain |
| `www.vayva.ng` | marketing | Redirect to apex or alias |
| `merchant.vayva.ng` | merchant | Primary merchant dashboard domain |
| `app.vayva.ng` | merchant | Legacy redirect to `merchant.vayva.ng` |
| `ops.vayva.ng` | ops-console | Internal team access only |
| `store.vayva.ng` | storefront | Customer-facing stores |

---

## GitHub Integration

- **Repository**: `Vayva-Tech/Vayva`
- **Production Branch**: `Vayva`
- **Auto-deploy**: Each Vercel project watches the same repo but only rebuilds when files in its root directory change (Vercel's Ignored Build Step or file-change detection)
- **Preview deployments**: Generated for pull requests

---

## Security Headers

All apps (except marketing) configure security headers in both `vercel.json` and `next.config.js`:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

The merchant app additionally sets a `Content-Security-Policy` header restricting script sources, connect sources to `*.vayva.ng`, `*.paystack.co`, and Vercel analytics domains.

---

## .vercelignore

The root `.vercelignore` file excludes unnecessary files from the Vercel upload to speed up deployments:

```
node_modules
.next
.git
.pnpm-store
.agents
*.md
/docs
/tests
/governance
platform/ci
platform/scripts
apps/desktop
apps/merchant
Backend/worker
Backend/workflow
Frontend/mobile
*.test.ts
*.test.tsx
*.spec.ts
coverage
playwright-report
test-results
.windsurf
.claude
```

Key points:
- `/docs`, `/tests`, `/governance` are scoped to root only (leading `/`)
- `*.md` is globally ignored — documentation files are not uploaded
- Desktop and mobile apps, backend workers, and CI scripts are excluded
- Test files and coverage reports are excluded

---

## Troubleshooting

### Middleware Crashes

**Symptom**: Deployment succeeds but all requests return 500 errors.

**Cause**: Middleware importing server-only packages (e.g., Sentry, Prisma) that are not available in the Edge runtime.

**Fix**:
- Ensure `output: "standalone"` is set in `next.config.js` — this generates the `.nft.json` trace files Vercel needs for middleware
- Do not wrap the Next.js config with Sentry's `withSentryConfig()` or PWA wrappers — these can inject server-only code into middleware
- Keep middleware lightweight: only use Edge-compatible APIs
- Check `serverExternalPackages` in next.config.js to exclude heavy server packages

### Path Doubling in Rewrites

**Symptom**: API requests go to `/api/api/endpoint` instead of `/api/endpoint`.

**Cause**: The rewrite `source` and `destination` both include `/api/`, and the backend URL also includes `/api/`.

**Fix**: In the merchant `next.config.js`, rewrites are configured to forward `/api/:path*` to `${MERCHANT_API_URL}/api/:path*`. Ensure `MERCHANT_API_URL` does NOT include a trailing `/api` — it should be the base URL only (e.g., `https://api.vayva.ng`).

### .vercelignore Excluding Wrong Files

**Symptom**: Build fails because needed files are excluded.

**Cause**: Overly broad patterns in `.vercelignore`.

**Fix**:
- Use leading `/` for root-scoped exclusions: `/docs` only matches `<root>/docs`, not `Frontend/merchant/docs`
- `*.md` is global — if you need `.md` files in the build, add negation patterns or be more specific
- After editing `.vercelignore`, verify with `vercel build --debug` locally

### Build Failing on TypeScript Errors

**Symptom**: Build fails due to type errors in ops-console or storefront.

**Cause**: Prisma models or shared types not yet migrated.

**Current workaround**: `ignoreBuildErrors: true` in `next.config.js` for ops-console and storefront. The merchant app does NOT ignore TS errors — all type errors must be fixed before deploying.

### pnpm Install Issues in Monorepo

**Symptom**: Build fails during dependency installation.

**Fix**:
- All apps use `pnpm install` as the install command (set in `vercel.json`)
- The install runs from the project root directory, picking up the root `pnpm-workspace.yaml`
- Ensure the root `package.json` and `pnpm-lock.yaml` are committed
- Vercel automatically detects pnpm when `pnpm-lock.yaml` is present

### Turbopack Root Path

**Symptom**: Module resolution fails in development or build.

**Fix**: All apps set `turbopack.root` to `path.resolve(__dirname, "../..")` which points to the monorepo root. Do not use absolute paths (like `/Users/fredrick/...`) as these break in CI.
