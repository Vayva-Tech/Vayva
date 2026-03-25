# Vayva Technologies -- Operational Expenses

**Document Classification:** Confidential -- Financial Planning
**Last Updated:** March 2026
**Version:** 1.0
**Exchange Rate Assumption:** $1 = ₦1,600 (March 2026 default for repo docs)

---

## 1. Executive Summary

This document provides a comprehensive breakdown of Vayva's operational expenses across infrastructure, third-party services, and development tools. We split costs into:

- **Fixed monthly** (baseline infrastructure + core tooling)
- **Variable** (AI usage, payment fees, delivery costs, WhatsApp costs if applicable)
- **Prepaid deposits** (cash-flow items that are not recurring “monthly bills”)

Baseline launch costs (fixed monthly) are intentionally lean, while the biggest scaling driver is variable AI + delivery/payment volume.

**Launch-phase envelope (see §5.0):** infrastructure + OpenRouter prepay + **paid marketing** (per `docs/09_business/marketing-plan.md` §9.0–9.1) + tooling (GitHub Team per seat, Resend Pro when volume exceeds the free tier).

---

## 2. Infrastructure Costs

### 2.1 Vercel (Frontend Hosting)

| Item | Plan | Monthly Cost (USD) | Monthly Cost (₦) |
|---|---|---|---|
| Vercel (all projects) | Pro | **$20** | **₦32,000** |

**Note:** This reflects the current baseline you provided (**$20/mo total**). If you later decide to split projects or add seats, update this line accordingly.

**Scaling notes:**
- Vercel Pro includes 1TB bandwidth, 100GB-hours serverless function execution
- At ~1,000 merchants, bandwidth may approach limits; consider Enterprise ($500+/mo) or migrating static assets to Cloudflare
- Serverless function costs scale with SSR page loads; merchant storefronts are the primary driver

### 2.2 VPS (Backend Servers)

| Server | Provider | Role | Monthly Cost (USD) | Monthly Cost (₦) |
|---|---|---|---:|---:|
| VPS (database) | **InterServer** | PostgreSQL (primary DB) | **$35** | **₦56,000** |
| VPS (app/services) | **InterServer** | Core API + self-hosted services | **$35** | **₦56,000** |

**Self-hosted services on VPS (no additional cost):**
- PostgreSQL (database) *(on the DB VPS)*
- Redis (caching, session management, queues)
- Evolution API (WhatsApp Business integration)
- MinIO (S3-compatible file storage) *hosted on this VPS*

**Scaling triggers:**
- **100 merchants:** Current infrastructure sufficient
- **500 merchants:** Upgrade appserver to 8 vCPU/16GB RAM (+$20--30/mo); add read replica for PostgreSQL
- **1,000 merchants:** Dedicated database server upgrade to 8 vCPU/32GB RAM; consider managed database migration
- **5,000+ merchants:** Multi-server architecture, load balancers, move to managed Kubernetes or dedicated infrastructure

### 2.3 Domain & DNS

| Item | Provider | Annual Cost | Monthly Equivalent |
|---|---|---|---|
| vayva.ng domain | **hosting.com** | **₦20,000/year** | **₦1,667** |
| DNS | Vercel/Cloudflare (free) | $0 | ₦0 |
| Wildcard SSL (storefront subdomains) | PositiveSSL Wildcard (DV) | **$90/year** | **₦12,000** |
| **Total Domain** | | **₦164,000/year** | **₦13,667/mo** |

### 2.4 Business Email (hosting.com)

| Item | Provider | Monthly Cost (USD) | Monthly Cost (₦) |
|---|---|---:|---:|
| `@vayva.ng` business inboxes | **hosting.com** | **$5** | **₦8,000** |

**Important:** This is the mailbox provider for staff inboxes. Transactional emails are sent via **Resend**.

### 2.4 Infrastructure Cost Summary

| Category | Monthly (USD) | Monthly (₦) | Annual (₦) |
|---|---|---|---|
| Vercel | **$20** | **₦32,000** | **₦384,000** |
| VPS | **$70** | **₦112,000** | **₦1,344,000** |
| Business email | **$5** | **₦8,000** | **₦96,000** |
| Domain & SSL | $8.5 | ₦13,667 | ₦164,000 |
| **Total Infrastructure (baseline)** | **$103.5** | **₦165,667** | **₦1,988,000** |

---

## 3. Third-Party Service Costs

### 3.0 OpenRouter launch deposit (prepaid)

| Item | Type | Cost (USD) | Cost (₦) | Notes |
|---|---|---:|---:|---|
| OpenRouter initial deposit | **Prepaid deposit (cash-flow)** | **$50** | **₦80,000** | We re-deposit from merchant revenue once subscriptions start. Not a “monthly bill”. |

### 3.1 OpenRouter (AI Models)

Model pricing varies by model/provider. For Vayva’s current baseline assumptions and NGN conversions, see:
- `docs/08_reference/ai-pricing-and-credits.md`

**Per-merchant AI cost estimation:**

| Tier | Monthly Credits | Est. Tokens/Mo | Est. AI Cost (USD) | Est. AI Cost (₦) |
|---|---|---|---|---|
| STARTER | 5,000 | ~20.8M tokens | $5.85 | ₦900--₦1,500 |
| PRO | 10,000 | ~41.7M tokens | $11.70 | ₦1,500--₦2,500 |
| PRO PLUS | 25,000 | ~104.2M tokens | $29.25 | ₦3,000--₦5,000 |

**Scaling projections:**

| Merchants | Est. Monthly AI Spend (USD) | Est. Monthly AI Spend (₦) |
|---|---|---|
| 100 | $600--1,000 | ₦930K--₦1.55M |
| 1,000 | $5,000--8,500 | ₦7.75M--₦13.2M |
| 10,000 | $40,000--70,000 | ₦62M--₦108.5M |

### 3.2 Paystack (Payment Processing)

| Fee Component | Rate | Cap |
|---|---|---|
| Transaction fee | 1.5% + ₦100 per transaction | ₦2,000 per transaction |
| Monthly fee | ₦0 | -- |
| Payout fee | Free (next-day settlement) | -- |
| Chargebacks | ₦1,000 per dispute | -- |

**Note:** Paystack fees are borne by the paying customer in most configurations or deducted from merchant receipts. These are not a direct Vayva expense unless Vayva absorbs them for subscription billing.

**Vayva subscription billing costs (Paystack deductions):**

| Merchants | Subscription Transactions/Mo | Est. Paystack Fees/Mo |
|---|---|---|
| 100 | 100 | ₦385,000 (1.5% on ₦25K avg + ₦100) |
| 1,000 | 1,000 | ₦3.85M |
| 10,000 | 10,000 | ₦38.5M |

### 3.3 Resend (Transactional Email)

| Plan | Included volume | Monthly Cost (USD) | Monthly Cost (₦)* |
|---|---|---|---|
| Free | Up to 3,000 emails/mo | $0 | ₦0 |
| **Pro** | **50,000 emails/mo** | **$20** | **₦32,000** |
| Business | Up to 100,000 emails/mo | $80 | ₦128,000 |

\*At $1 = ₦1,600.

**Pro plan (baseline when you outgrow Free):**
- **Overage:** **$0.90 per 1,000** emails beyond 50,000 (budget explicitly when scaling; e.g. **60,000** sent = **10,000** over → **10 × $0.90 = $9**; **150,000** on Pro = **100,000** over → **$90** overage that month).
- **Included capabilities (plan positioning):** sending and receiving, ticket support, **30-day** data retention, **up to 10 domains**, **no daily send cap** (still subject to fair use / reputation — monitor bounces and complaints).

**Scaling playbook:**
- Stay on **Free** until consistent volume approaches ~2,500 emails/mo (headroom for spikes).
- Move to **Pro** before breaching 3,000/mo; track merchant count × emails/merchant (see estimates below).
- Above 50,000/mo: model **$20 + ($0.90 × (thousands over 50k))** until **Business** (100k) or enterprise negotiation makes sense.

**Email volume estimates:**
- Per merchant: ~30--100 emails/mo (order confirmations, receipts, notifications)
- 100 merchants: ~5,000--10,000 emails/mo (typically **Pro** once off Free)
- 1,000 merchants: ~30,000--100,000 emails/mo (Pro with possible overage, or **Business**)
- 10,000 merchants: 300,000--1M emails/mo (Enterprise negotiation required)

### 3.4 Sentry (Error Monitoring)

| Plan | Events/Month | Monthly Cost (USD) | Monthly Cost (₦) |
|---|---|---|---|
| Developer (Free) | 5,000 | $0 | ₦0 |
| Team | 50,000 | $26 | ₦40,300 |
| Business | 100,000 | $80 | ₦124,000 |

**Current:** Free tier sufficient during early growth. Upgrade to Team at ~200+ merchants when error volume exceeds free limits.

### 3.5 Storage (MinIO / S3-compatible)

Vayva does **not** use Cloudinary. Uploads are stored in **MinIO / S3-compatible storage** (often self-hosted).\n
If MinIO is self-hosted on the VPS, the main cost drivers are **disk + bandwidth** and are captured under VPS.

### 3.6 Evolution API (WhatsApp)

| Component | Cost |
|---|---|
| Evolution API (self-hosted) | ₦0 (runs on VPS) |
| WhatsApp Business API (Meta) | **Not used** (we use Evolution API) |

**Note:** Vayva does **not** use Meta’s official WhatsApp Cloud API today. WhatsApp messaging cost is captured as VPS cost + operational overhead, not per-conversation fees.

### 3.7 Third-Party Services Cost Summary

| Service | 100 Merchants (₦/mo) | 1,000 Merchants (₦/mo) | 10,000 Merchants (₦/mo) |
|---|---|---|---|
| OpenRouter (AI) | ₦1.2M | ₦10.5M | ₦85M |
| Paystack (sub billing) | ₦385K | ₦3.85M | ₦38.5M |
| Resend (email) | ₦32K+ | ₦128K+ | ₦500K+ |
| Sentry | ₦0 | ₦40K | ₦124K |
| Storage (MinIO self-hosted) | ₦0 | ₦0 | ₦0 |
| WhatsApp (Evolution API) | ₦0 | ₦0 | ₦0 |
| **Total** | **₦1.83M** | **₦16.75M** | **₦145.5M** |

---

## 4. Development Tools

### 4.1 GitHub

| Plan | Cost | Notes |
|---|---|---|
| Free (public/private repos) | $0 | Unlimited repos, 2,000 CI/CD minutes/mo |
| **Team** | **$4 per user / month** | Per-seat billing on the org (see [GitHub Pricing](https://github.com/pricing)); fine-grained permissions, required policies, more CI minutes than Free |

**Budgeting:** `monthly USD = $4 × (number of paid seats)`; at ₦1,600/$, one seat ≈ **₦6,400/mo**, four seats ≈ **₦25,600/mo**.

**Current:** Free plan is enough for early solo/small team. Move to **Team** when you need org-level branch protection, required reviewers, or centralized secrets across multiple collaborators — add seats only as headcount justifies it.

### 4.2 Development Environment

| Tool | Cost | Notes |
|---|---|---|
| VS Code | Free | Primary IDE |
| Claude Code (Anthropic) | Variable | AI-assisted development |
| pnpm | Free | Package manager |
| TurboRepo | Free (open source) | Monorepo build system |

### 4.3 Development Tools Summary

| Category | Current (₦/mo) | At 5-Person Team (₦/mo) |
|---|---|---|
| GitHub Team (≈5 seats @ $4) | ₦0 | ₦32,000 |
| CI/CD (GitHub Actions) | ₦0 | ₦15,500 (if exceeding free tier) |
| Dev tools & licenses | ₦0 | ₦0 |
| **Total** | **₦0** | **₦47,500** |

---

## 5. Total Cost of Operations

### 5.0 Launch phase (Month 1 envelope)

Use this when planning **cash needed to open publicly**: fixed infra, one-time AI prepay, **minimum paid marketing**, and optional tooling if you are already on paid tiers.

| Line item | Type | Amount | Notes |
|---|---|---:|---|
| Infrastructure (Vercel + VPS + business email + domain/SSL equiv.) | Recurring monthly | **₦165,667** | §2 |
| OpenRouter initial deposit | One-time prepaid | **₦80,000** ($50) | Not monthly; §3.0 |
| **Paid marketing (launch)** | Recurring monthly | **₦200,000 – ₦250,000** | **₦50,000/week** paid ads (Meta + TikTok split) ≈ **₦200,000/mo**; optional **₦0 – ₦50,000/mo** content — see `docs/09_business/marketing-plan.md` §9.0–9.1 and §11.1 |
| Resend | Recurring | **₦0** or **₦32,000+** | **Free** until ~3k emails/mo; then **Pro $20/mo** + possible **$0.90/1k** overage — §3.3 |
| GitHub | Recurring | **₦0** or **₦6,400 × seats** | **Team @ $4/user/mo** when the org moves off Free — §4.1 |
| Variable (AI, Paystack, etc.) | Usage-based | **₦0+** | Grows with merchants and GMV — §3 |

**Indicative launch Month 1 cash (infra + OpenRouter deposit + minimum marketing, excluding variable AI/Paystack):**

| Scenario | ₦ (approx.) |
|---|---:|
| Lean (no Resend Pro, no GitHub Team, **₦200k** marketing) | **₦445,667** |
| With Resend Pro + **₦250k** marketing | **₦477,667** |
| Above + **2× GitHub Team** seats | **+₦12,800** |

**After Month 1:** you still pay **₦165,667/mo** infra + **₦200k–₦250k/mo** marketing for the “₦50k/week” launch cadence until you change the marketing plan; OpenRouter deposit is not repeated.

### 5.1 Current State (Pre-Launch / Early Merchants)

| Category | Monthly (₦) | Annual (₦) |
|---|---|---|
| Infrastructure (Vercel + VPS + email + domain) | **₦165,667** | **₦1,988,000** |
| Third-party services (variable usage) | **₦0+** | **₦0+** |
| OpenRouter initial deposit (prepaid) | **₦80,000** | **₦80,000** |
| Development tools | ₦0 | ₦0 |
| **Total Baseline (launch month cash)** | **₦245,667** | **₦2,068,000** |

**Note:** **₦245,667** is **infra + OpenRouter deposit only** (no marketing, assumes Free-tier tooling). For **public launch** with paid acquisition, use **§5.0**.

### 5.2 Scaling Cost Projections

| Category | 100 Merchants | 1,000 Merchants | 10,000 Merchants |
|---|---|---|---|
| Infrastructure | ₦300K | ₦620K | ₦2.5M |
| AI Compute (OpenRouter) | ₦1.2M | ₦10.5M | ₦85M |
| WhatsApp (Evolution API) | ₦0 | ₦0 | ₦0 |
| Paystack (billing fees) | ₦385K | ₦3.85M | ₦38.5M |
| Email (Resend) | ₦31K | ₦124K | ₦500K |
| Monitoring & media | ₦0 | ₦178K | ₦471K |
| Development tools | ₦0 | ₦46K | ₦155K |
| **Total Operational** | **₦2.13M** | **₦17.4M** | **₦148M** |
| **Per Merchant** | **₦21,300** | **₦17,400** | **₦14,800** |

### 5.3 Cost Per Merchant Trend

The per-merchant cost decreases at scale due to fixed infrastructure costs being amortized across more merchants:

| Scale | Operational Cost/Merchant | Revenue/Merchant (ARPU) | Gross Contribution |
|---|---|---|---|
| 100 merchants | ₦21,300 | ₦35,000 | ₦13,700 (39%) |
| 1,000 merchants | ₦17,400 | ₦38,000 | ₦20,600 (54%) |
| 10,000 merchants | ₦14,800 | ₦42,000 | ₦27,200 (65%) |

**Note:** These operational costs exclude team salaries, office costs, and marketing. Including those, see the Financial Projections document for full P&L analysis.

### 5.4 Expense strategy (launch → scale)

1. **Lock the fixed stack first:** Vercel + dual VPS + domain/email are predictable; review quarterly against §2 scaling triggers.
2. **Model variables before they bite:** OpenRouter (largest COGS at scale), Paystack deductions on subscription volume, Resend **$0.90/1k** overage above 50k — put **alerts** on provider dashboards at 70% of tier limits.
3. **Marketing is a dial, not a surprise:** Launch at **₦50k/week** (`marketing-plan.md` §9.0); ramp only when CAC and activation metrics justify **§11.2** (Months 1–3 **₦1.05M/mo** is a different phase — align with cash runway).
4. **Tooling tracks headcount:** GitHub Team **$4/seat**; add seats when a human needs org permissions, not preemptively.
5. **Monitoring and support tiers:** Stay on Sentry Free until error volume forces Team (§3.4); keep support SLAs aligned with merchant count.
6. **FX and prepay:** USD vendors (Vercel, Resend, GitHub, OpenRouter) — see **§6.4**; prepay annual plans when Naira/USD is favorable.
7. **Contingency buffer:** Hold **≥1 month** of (infra + marketing + estimated AI) in liquid reserves before aggressive spend; full P&L scenarios in `docs/09_business/financial-projections.md`.

---

## 6. Cost Optimization Strategies

### 6.1 Immediate Optimizations (0--3 Months)

| Strategy | Potential Savings | Implementation |
|---|---|---|
| Vercel Team plan consolidation | Up to ₦62K/mo | Switch from 4x Pro to Team plan if 1--2 developers |
| AI response caching (Redis) | 10--20% AI cost reduction | Cache common product queries, FAQ responses |
| Image compression before storage | Reduce bandwidth + disk usage | Client-side compression in merchant dashboard |
| Batch WhatsApp messages | Reduce WhatsApp ops overhead | Group notification messages + rate-limit to avoid spam |

### 6.2 Medium-Term Optimizations (3--12 Months)

| Strategy | Potential Savings | Implementation |
|---|---|---|
| Fine-tune smaller AI model | 30--50% AI cost reduction | Train custom model on Nigerian commerce conversations |
| Move to Contabo for VPS | 20--40% infrastructure savings | Contabo offers equivalent specs at lower prices |
| Self-host email (SMTP) | 80% email cost reduction | Run Postal/Mailtrain on VPS; keep Resend as fallback |
| Negotiate Paystack volume pricing | 0.2--0.5% reduction in fees | Available at 10,000+ transactions/month |

### 6.3 Long-Term Optimizations (12+ Months)

| Strategy | Potential Savings | Implementation |
|---|---|---|
| On-premise GPU for AI inference | 50--70% AI cost reduction | Run quantized Llama models on dedicated GPU servers |
| CDN migration to Cloudflare | 40--60% Vercel cost reduction | Serve static assets via Cloudflare; reduce Vercel to SSR only |
| Volume pricing across all vendors | 15--25% aggregate savings | Negotiate annual contracts at scale |
| Multi-cloud arbitrage | 10--20% infrastructure savings | Use cheapest provider per workload type |

### 6.4 Currency Risk Mitigation

All major service providers bill in USD. With Naira volatility, the following strategies reduce currency exposure:

1. **Pre-pay annual plans** when Naira is strong (Vercel, domain, GitHub)
2. **Maintain USD reserves** for operational expenses (3-month buffer recommended)
3. **Shift to local/self-hosted alternatives** where quality is equivalent
4. **Price services in Naira** with quarterly review clauses tied to exchange rate bands

---

## 7. Cost Monitoring & Governance

### 7.1 Key Cost Metrics to Track

| Metric | Target | Alert Threshold |
|---|---|---|
| AI cost per merchant | < ₦2,500/mo | > ₦3,500/mo |
| Infrastructure cost per merchant | < ₦1,000/mo | > ₦1,500/mo |
| Total COGS as % of revenue | < 20% | > 30% |
| USD-denominated costs as % of total | < 40% | > 50% |
| Month-over-month cost growth | < merchant growth rate | Exceeding by > 10% |

### 7.2 Review Cadence

- **Weekly:** AI compute spend dashboard review
- **Monthly:** Full operational expense review, vendor invoice reconciliation
- **Quarterly:** Vendor negotiations, plan optimization, currency exposure assessment
- **Annually:** Full vendor audit, competitive pricing analysis, build-vs-buy review

---

*This document is confidential and intended for internal financial planning and investor communications. Cost estimates are based on published vendor pricing as of March 2026 and may vary with negotiated rates, usage patterns, and exchange rate fluctuations.*
