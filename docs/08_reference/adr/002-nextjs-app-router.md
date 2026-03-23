# ADR 002 — Next.js 16 App Router Across All Frontends

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2024 (initial) |
| Deciders | Engineering team |
| Last reviewed | March 2026 |

---

## Context

Vayva's platform requires four distinct web frontends, each with different performance, SEO, and interactivity profiles:

| Frontend | Package | Domain | Primary concerns |
|----------|---------|--------|-----------------|
| Marketing site | `@vayva/marketing` | vayva.ng | SEO, performance, landing pages, blog |
| Merchant dashboard | `@vayva/merchant` | merchant.vayva.ng | Auth-gated SPA-like UX, real-time data, forms |
| Ops console | `@vayva/ops-console` | ops.vayva.ng | Internal tool, strict auth, audit logging |
| Storefront | `@vayva/storefront` | *.vayva.ng | Per-merchant subdomain, SEO, customer-facing |

A decision was needed on the React framework and rendering model to use across all four.

### Why a single framework

Using a single framework across all frontends allows:

- Shared knowledge — engineers can contribute to any frontend without learning a different build system or router API.
- Shared packages — `@vayva/ui`, `@vayva/shared`, and all domain packages are authored once and consumed by all four apps. This requires a consistent module system and React version.
- Consistent tooling — one `tsconfig.base.json`, one ESLint config, one Prettier config, one CI pipeline.

---

## Decision

Use **Next.js 16** with the **App Router** (`app/` directory) across all four frontends. The package manager and build orchestration follow ADR 001 (pnpm + TurboRepo).

**Next.js 16** was chosen for:

- **React 19 support:** Next.js 16 targets React 19, which is used throughout the project (`"react": "19.2.3"`). React 19 brings stable Server Components, the `use()` hook, and improved concurrent features.
- **App Router:** The App Router replaces the legacy `pages/` router with a file-system routing model built on React Server Components (RSC). This enables fine-grained server/client boundary control, nested layouts, and streaming SSR — important for both the marketing site (SEO) and the merchant dashboard (complex layouts with many data-fetching boundaries).
- **Route handlers:** `app/api/` route handlers replace `pages/api/` endpoints. They support the standard `Request`/`Response` Web APIs and are easy to test.
- **Integrated server actions:** Server actions allow form submissions and mutations to call server-side code directly without a manual API route, reducing boilerplate in the merchant and storefront apps.
- **Mature ecosystem:** Next.js is the most widely adopted React meta-framework with strong Vercel integration (ADR 003), large community, and long-term support signals from Vercel.

**App Router specifically** was chosen over the legacy Pages Router for:

- Nested layouts with shared state and UI (e.g., merchant dashboard sidebar, ops console nav) are first-class.
- Per-segment data fetching with `async` Server Components eliminates prop-drilling and waterfall fetches.
- Streaming SSR with `<Suspense>` boundaries improves TTFB on data-heavy pages.
- The `metadata` API and `generateMetadata` function provide ergonomic SEO control for the marketing site and storefront.

---

## Alternatives Considered

### Next.js Pages Router

The Pages Router is still supported in Next.js 16 but is considered legacy. Migrating from Pages to App Router mid-project is costly. The decision was made to start with App Router across all apps rather than accumulate Pages Router debt.

### Remix

Remix was considered as an alternative React meta-framework. It has excellent data loading patterns but its file-based routing and loader API differ enough from Next.js that it would prevent code sharing with a mixed fleet. At the time of decision, its Vercel deployment experience was also less polished than Next.js's.

### Vite + React (SPA)

A pure Vite SPA was considered for the merchant dashboard (which is auth-gated and does not need public SEO). Rejected because:

- The storefront and marketing site require server-side rendering; using a different framework for the merchant dashboard would split the team's knowledge.
- Next.js with `"use client"` can replicate SPA-style rendering where needed, giving the flexibility to choose per-page.

### React Native / Expo (for mobile)

The repository contains a `Frontend/mobile/` directory (React Native). The decision to use Next.js applies only to web frontends. Mobile is a separate concern and is not in scope for this ADR.

---

## Consequences

### Positive

- All engineers work in the same framework, reducing context switching.
- SEO-critical routes (marketing, storefront) benefit from RSC and streaming SSR without additional configuration.
- Auth-gated routes (merchant, ops) use `"use client"` components and client-side navigation where appropriate, giving SPA-like responsiveness.
- The `@vayva/ui` component library exports both Server and Client components, enabling optimal rendering for each use case.
- Vercel's edge network has native Next.js optimisations (Image Optimisation, ISR, Edge Runtime) that are used automatically.

### Negative / Trade-offs

- **Turbopack:** Next.js 16 encourages Turbopack for development (`next dev --turbopack`). However, Turbopack has module resolution issues with some workspace packages in this monorepo. All builds explicitly use `--webpack` (`next build --webpack`) as a workaround. This will be revisited when Turbopack's workspace support matures.
- **RSC learning curve:** React Server Components introduce a new mental model (server vs. client boundary, no hooks/context on the server). Contributors unfamiliar with RSC need to understand these rules before touching App Router code.
- **Caching complexity:** Next.js App Router has an aggressive multi-layer cache (fetch cache, Router Cache, Full Route Cache). Incorrect cache configurations can serve stale data. Each team member must understand `no-store`, `revalidate`, and `cache: "force-cache"` semantics.
- **Bundle size discipline:** Because `"use client"` is easy to add, there is a risk of accidentally shifting server work to the client. Code reviews must check for unnecessary `"use client"` directives in new components.

---

## References

- `Frontend/*/next.config.js` — per-app Next.js configuration
- `Frontend/*/package.json` — confirms `"next": "16.1.6"` and `"react": "19.2.3"`
- [Next.js App Router documentation](https://nextjs.org/docs/app)
- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- ADR 001 — Monorepo Architecture
- ADR 003 — Vercel Deployment
