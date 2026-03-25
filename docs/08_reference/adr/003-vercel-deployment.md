# ADR 003 — Deploying Frontends to Vercel

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2024 (initial) |
| Deciders | Engineering team |
| Last reviewed | March 2026 |

---

## Context

Vayva requires a reliable, low-operational-overhead deployment platform for its four Next.js frontends. The team is small and must ship features quickly; maintaining self-hosted infrastructure for frontend deployments would consume engineering time that is better spent on product.

The key requirements for the deployment platform were:

1. **Zero-config Next.js support** — no custom server setup, no Nginx/Caddy configuration.
2. **Preview deployments** — every PR should get a unique, shareable URL for review.
3. **Custom domains with automatic TLS** — production domains (`vayva.ng`, `merchant.vayva.ng`, `ops.vayva.ng`, `*.vayva.ng`) must serve HTTPS with auto-renewed certificates.
4. **Edge CDN** — static assets and ISR pages must be served from a global CDN without manual cache invalidation.
5. **Monorepo support** — the build system must support pnpm workspaces and TurboRepo without custom CI scripts.
6. **Minimal ops burden** — the team should not need to manage servers, containers, or load balancers for frontend workloads.

---

## Decision

Deploy all four Next.js frontends to **Vercel** under the "itsfredrick's projects" team account.

Each frontend is a separate Vercel project connected to the same GitHub repository, with different root directories:

| Frontend | Vercel project | Root directory | Production domain |
|----------|---------------|----------------|-------------------|
| Marketing | vayva-marketing | `Frontend/marketing` | vayva.ng |
| Merchant | vayva-merchant | `Frontend/merchant` | merchant.vayva.ng |
| Ops console | vayva-ops-console | `Frontend/ops-console` | ops.vayva.ng |
| Storefront | vayva-storefront | `Frontend/storefront` | *.vayva.ng |

All projects use:

- **Build command:** `next build --webpack`
- **Framework preset:** Next.js (auto-detected)
- **Node.js version:** 20.x

### Branch-to-environment mapping

| Git branch | Vercel environment |
|------------|--------------------|
| `main` | Production |
| `Vayva` | Preview (staging) |
| All other branches / PRs | Ephemeral preview |

Pushing to `main` triggers production deployments across all four projects simultaneously. Pushing to `Vayva` or opening a PR creates a preview deployment accessible via a generated URL.

### Backend `core-api` on Vercel (when used)

The Next.js app in [`Backend/core-api`](../../Backend/core-api) may be deployed as its own Vercel project for App Router API routes and **Cron Jobs** (see `Backend/core-api/vercel.json`). Scheduled handlers expect:

| Variable | Purpose |
|----------|---------|
| `CRON_SECRET` | Sent as `Authorization: Bearer <value>` on cron invocations |
| `OPENROUTER_API_KEY` | Autopilot LLM calls via OpenRouter (when Autopilot is enabled) |
| `AUTOPILOT_CRON_MAX_STORES` | Store batch size per Autopilot cron loop (default 40) |
| `AUTOPILOT_CRON_MAX_BATCHES` | Max batches per cron HTTP invocation (default 5) |
| `AUTOPILOT_INBOUND_SECRET` | Optional; auth for `POST /api/internal/autopilot/context` |

Autopilot cron responses may include `nextCursor` and `hasMore`; a follow-up request can use `GET .../autopilot-evaluate?cursor=<storeId>` with the same bearer token to drain remaining stores without raising `maxDuration` on a single run.

---

## Alternatives Considered

### Self-hosted frontends on the existing VPS (163.245.209.203)

The project already operates a VPS for PostgreSQL (`163.245.209.203:5432`), Redis (`163.245.209.203:6379`), and the Evolution API WhatsApp gateway (`163.245.209.202:8080`). Hosting the frontends on the same or a sibling VPS was evaluated.

**Rejected** because:

- Self-hosting Next.js requires maintaining a Node.js process manager (PM2 or systemd), a reverse proxy (Nginx or Caddy), TLS certificate renewal (certbot), and log management. This is significant ops overhead for a team focused on product delivery.
- Next.js Image Optimisation, ISR, and Edge Functions are either unavailable or require additional configuration on self-hosted setups.
- A single VPS is a single point of failure. Vercel's global edge network provides geographic redundancy automatically.
- Preview deployments per PR require significant tooling to replicate (e.g., GitHub Actions + Docker + dynamic Nginx config), whereas Vercel provides them for free.

### AWS Amplify

AWS Amplify supports Next.js deployments and preview environments. Rejected because:

- Amplify's Next.js support has historically lagged behind Vercel's (e.g., App Router support was delayed).
- The team had existing familiarity with Vercel, reducing onboarding time.
- Amplify's pricing model and configuration complexity are higher for a small team.

### Cloudflare Pages

Cloudflare Pages supports Next.js via the `@cloudflare/next-on-pages` adapter. Rejected because:

- The adapter imposes constraints on what Next.js APIs can be used (no Node.js runtime APIs, no `fs`, etc.), which would require auditing and potentially rewriting API routes.
- Some `@vayva/*` packages use Node.js-specific modules that are incompatible with Cloudflare's edge runtime.

### Docker containers on Kubernetes (k8s)

Kubernetes was evaluated for hosting. For frontends specifically, K8s was rejected as the primary target because the operational overhead exceeds the benefit for stateless Next.js applications. Backend APIs today ship as containers or Node services on the team’s chosen host (VPS, PaaS, or managed Kubernetes elsewhere); the monorepo does not ship in-repo K8s manifests so deployment config stays with the environment that actually runs the cluster.

---

## Consequences

### Positive

- **No ops overhead for frontends.** The team does not manage TLS, CDN configuration, or Node.js process management for frontend workloads.
- **Instant preview URLs.** Every PR gets a live preview environment automatically. This dramatically improves the review process for UI changes.
- **Optimised Next.js runtime.** Vercel builds and runs Next.js with optimisations that are not available elsewhere (e.g., Partial Prerendering, Skew Protection, automatic Static/Dynamic split).
- **Environment variable management.** Vercel's project settings provide a secure, auditable store for secrets per environment (Production / Preview / Development), with no risk of secrets being committed to the repository.
- **Automatic deployments.** Pushing to `main` immediately triggers production deployments without any manual step or CI pipeline configuration for the frontend tier.
- **`@vercel/analytics` and `@vercel/speed-insights`** are already installed at the root and active on all frontends, providing performance and usage data without additional instrumentation.

### Negative / Trade-offs

- **Vendor lock-in.** Some Next.js features (Partial Prerendering, Vercel Edge Middleware behaviour, ISR revalidation via Vercel's CDN) are optimised for or specific to Vercel. Migrating to another platform would require testing and potentially rewriting some edge cases.
- **Cost at scale.** Vercel's pricing scales with bandwidth, function invocations, and build minutes. At high traffic volumes, the cost may justify moving to self-hosted infrastructure. This should be revisited when monthly Vercel costs exceed a self-managed VPS + ops overhead.
- **Build minutes are shared.** All four projects share the team's Vercel build quota. If multiple branches are pushed simultaneously, builds may queue.
- **Backend workloads split.** The worker (`Backend/worker`) and database are not on Vercel. The Next.js merchant API (`Backend/core-api`) may run on Vercel (API routes + crons) **or** on VPS/Docker depending on environment—deployment pipelines must stay aligned when URLs or secrets change.
- **`next build --webpack` requirement.** Turbopack is the Vercel-preferred bundler for Next.js 16, but it has module resolution issues with this monorepo's workspace packages. All projects currently build with `--webpack`. This will be revisited as Turbopack stabilises (see ADR 002).

---

## References

- `Frontend/*/vercel.json` — per-app Vercel configuration overrides (where present)
- `Frontend/*/package.json` — build scripts (`"build": "next build --webpack"`)
- `turbo.json` — `globalPassThroughEnv` lists all environment variables forwarded during Vercel builds
- ADR 001 — Monorepo Architecture
- ADR 002 — Next.js App Router
- [Vercel documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
