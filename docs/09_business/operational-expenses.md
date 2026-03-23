# Vayva Technologies -- Operational Expenses

**Document Classification:** Confidential -- Financial Planning
**Last Updated:** March 2026
**Version:** 1.0
**Exchange Rate Assumption:** $1 = ₦1,550 (March 2026)

---

## 1. Executive Summary

This document provides a comprehensive breakdown of Vayva's operational expenses across infrastructure, third-party services, and development tools. Total baseline monthly costs at launch are approximately **₦155,000--₦220,000 ($100--$142)**, scaling to an estimated **₦5.1M--₦8.2M** at 1,000 merchants and **₦33M--₦51M** at 10,000 merchants. The cost structure is heavily weighted toward variable costs (AI compute), giving Vayva strong operating leverage at scale.

---

## 2. Infrastructure Costs

### 2.1 Vercel (Frontend Hosting)

| Item | Plan | Monthly Cost (USD) | Monthly Cost (₦) |
|---|---|---|---|
| Storefront App | Pro | $20 | ₦31,000 |
| Merchant Dashboard | Pro | $20 | ₦31,000 |
| Admin Dashboard | Pro | $20 | ₦31,000 |
| Landing/Marketing Site | Pro | $20 | ₦31,000 |
| **Total Vercel** | | **$80** | **₦124,000** |

**Alternative:** Vercel Team plan at $20/user/mo (shared across projects). At 1--2 developers, this may be more economical ($20--40/mo total). Evaluate when team size changes.

**Scaling notes:**
- Vercel Pro includes 1TB bandwidth, 100GB-hours serverless function execution
- At ~1,000 merchants, bandwidth may approach limits; consider Enterprise ($500+/mo) or migrating static assets to Cloudflare
- Serverless function costs scale with SSR page loads; merchant storefronts are the primary driver

### 2.2 VPS (Backend Servers)

| Server | Provider | Role | Specs (Estimated) | Monthly Cost (USD) | Monthly Cost (₦) |
|---|---|---|---|---|---|
| Appserver (163.245.209.202) | DigitalOcean/Contabo | API, Evolution API, application services | 4 vCPU, 8GB RAM, 200GB SSD | $30--50 | ₦46,500--₦77,500 |
| Dbserver (163.245.209.203) | DigitalOcean/Contabo | PostgreSQL, Redis | 4 vCPU, 16GB RAM, 400GB SSD | $40--60 | ₦62,000--₦93,000 |
| **Total VPS** | | | | **$70--110** | **₦108,500--₦170,500** |

**Self-hosted services on VPS (no additional cost):**
- PostgreSQL (database)
- Redis (caching, session management, queues)
- Evolution API (WhatsApp Business integration)

**Scaling triggers:**
- **100 merchants:** Current infrastructure sufficient
- **500 merchants:** Upgrade appserver to 8 vCPU/16GB RAM (+$20--30/mo); add read replica for PostgreSQL
- **1,000 merchants:** Dedicated database server upgrade to 8 vCPU/32GB RAM; consider managed database migration
- **5,000+ merchants:** Multi-server architecture, load balancers, move to managed Kubernetes or dedicated infrastructure

### 2.3 Domain & DNS

| Item | Provider | Annual Cost | Monthly Equivalent |
|---|---|---|---|
| vayva.ng domain | NiRA-accredited registrar | $15--30/year | ₦1,900--₦3,875 |
| DNS | Vercel/Cloudflare (free) | $0 | ₦0 |
| SSL certificates | Let's Encrypt / Vercel (free) | $0 | ₦0 |
| **Total Domain** | | **$15--30/year** | **₦1,900--₦3,875/mo** |

### 2.4 Infrastructure Cost Summary

| Category | Monthly (USD) | Monthly (₦) | Annual (₦) |
|---|---|---|---|
| Vercel | $80 | ₦124,000 | ₦1,488,000 |
| VPS (2 servers) | $70--110 | ₦108,500--₦170,500 | ₦1,302,000--₦2,046,000 |
| Domain & DNS | $2 | ₦2,900 | ₦34,800 |
| **Total Infrastructure** | **$152--192** | **₦235,400--₦297,400** | **₦2,824,800--₦3,568,800** |

---

## 3. Third-Party Service Costs

### 3.1 OpenRouter (AI Models)

| Model | Use Case | Input Cost | Output Cost | Blended Cost/1M Tokens |
|---|---|---|---|---|
| GPT-4o Mini | Primary AI agent | $0.15/1M tokens | $0.60/1M tokens | ~$0.375/1M |
| Llama 3.3 70B Instruct | Autopilot/routing | $0.21/1M tokens | $0.21/1M tokens | $0.21/1M |

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

| Plan | Emails/Month | Monthly Cost (USD) | Monthly Cost (₦) |
|---|---|---|---|
| Free | Up to 3,000 | $0 | ₦0 |
| Pro | Up to 50,000 | $20 | ₦31,000 |
| Business | Up to 100,000 | $80 | ₦124,000 |

**Email volume estimates:**
- Per merchant: ~30--100 emails/mo (order confirmations, receipts, notifications)
- 100 merchants: ~5,000--10,000 emails/mo (Pro plan sufficient)
- 1,000 merchants: ~30,000--100,000 emails/mo (Business plan)
- 10,000 merchants: 300,000--1M emails/mo (Enterprise negotiation required)

### 3.4 Sentry (Error Monitoring)

| Plan | Events/Month | Monthly Cost (USD) | Monthly Cost (₦) |
|---|---|---|---|
| Developer (Free) | 5,000 | $0 | ₦0 |
| Team | 50,000 | $26 | ₦40,300 |
| Business | 100,000 | $80 | ₦124,000 |

**Current:** Free tier sufficient during early growth. Upgrade to Team at ~200+ merchants when error volume exceeds free limits.

### 3.5 Cloudinary (Image/Media Management)

| Plan | Storage | Transformations | Monthly Cost (USD) | Monthly Cost (₦) |
|---|---|---|---|---|
| Free | 25GB | 25,000/mo | $0 | ₦0 |
| Plus | 100GB | 75,000/mo | $89 | ₦137,950 |
| Advanced | 300GB | 225,000/mo | $224 | ₦347,200 |

**Image volume estimates:**
- Per merchant: ~50--500 product images, ~5--20 uploads/mo
- 100 merchants: ~10GB storage, Free tier sufficient
- 1,000 merchants: ~80--100GB storage, Plus plan required
- 10,000 merchants: ~500GB+ storage, Advanced or Enterprise plan

### 3.6 Evolution API (WhatsApp)

| Component | Cost |
|---|---|
| Evolution API (self-hosted) | ₦0 (runs on VPS) |
| WhatsApp Business API (Meta) | Variable -- per-conversation pricing |

**WhatsApp Business API conversation costs (Meta pricing for Nigeria):**

| Category | Per Conversation (24h window) |
|---|---|
| Marketing | ~$0.049 (~₦76) |
| Utility | ~$0.018 (~₦28) |
| Authentication | ~$0.027 (~₦42) |
| Service (user-initiated) | Free (first 1,000/mo) |

**Estimated WhatsApp costs:**

| Merchants | Est. Conversations/Mo | Est. Cost/Mo (₦) |
|---|---|---|
| 100 | 5,000--10,000 | ₦140K--₦280K |
| 1,000 | 50,000--100,000 | ₦1.4M--₦2.8M |
| 10,000 | 500,000--1,000,000 | ₦14M--₦28M |

### 3.7 Third-Party Services Cost Summary

| Service | 100 Merchants (₦/mo) | 1,000 Merchants (₦/mo) | 10,000 Merchants (₦/mo) |
|---|---|---|---|
| OpenRouter (AI) | ₦1.2M | ₦10.5M | ₦85M |
| Paystack (sub billing) | ₦385K | ₦3.85M | ₦38.5M |
| Resend (email) | ₦31K | ₦124K | ₦500K+ |
| Sentry | ₦0 | ₦40K | ₦124K |
| Cloudinary | ₦0 | ₦138K | ₦347K |
| WhatsApp (Meta) | ₦210K | ₦2.1M | ₦21M |
| **Total** | **₦1.83M** | **₦16.75M** | **₦145.5M** |

---

## 4. Development Tools

### 4.1 GitHub

| Plan | Cost | Notes |
|---|---|---|
| Free (public/private repos) | $0 | Unlimited repos, 2,000 CI/CD minutes/mo |
| Team | $4/user/mo | Required at 5+ collaborators for advanced permissions |

**Current:** Free plan. Budget $4--16/mo ($6,200--₦24,800/mo) when team grows to 2--4 engineers.

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
| GitHub | ₦0 | ₦31,000 |
| CI/CD (GitHub Actions) | ₦0 | ₦15,500 (if exceeding free tier) |
| Dev tools & licenses | ₦0 | ₦0 |
| **Total** | **₦0** | **₦46,500** |

---

## 5. Total Cost of Operations

### 5.1 Current State (Pre-Launch / Early Merchants)

| Category | Monthly (₦) | Annual (₦) |
|---|---|---|
| Infrastructure (Vercel + VPS + Domain) | ₦266,400 | ₦3,196,800 |
| Third-party services (minimal) | ₦31,000 | ₦372,000 |
| Development tools | ₦0 | ₦0 |
| **Total Baseline** | **₦297,400** | **₦3,568,800** |

### 5.2 Scaling Cost Projections

| Category | 100 Merchants | 1,000 Merchants | 10,000 Merchants |
|---|---|---|---|
| Infrastructure | ₦300K | ₦620K | ₦2.5M |
| AI Compute (OpenRouter) | ₦1.2M | ₦10.5M | ₦85M |
| WhatsApp (Meta) | ₦210K | ₦2.1M | ₦21M |
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

---

## 6. Cost Optimization Strategies

### 6.1 Immediate Optimizations (0--3 Months)

| Strategy | Potential Savings | Implementation |
|---|---|---|
| Vercel Team plan consolidation | Up to ₦62K/mo | Switch from 4x Pro to Team plan if 1--2 developers |
| AI response caching (Redis) | 10--20% AI cost reduction | Cache common product queries, FAQ responses |
| Image compression before Cloudinary | Delay paid plan by 6+ months | Client-side compression in merchant dashboard |
| Batch WhatsApp messages | 5--10% WhatsApp cost reduction | Group notification messages within 24h windows |

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

1. **Pre-pay annual plans** when Naira is strong (Vercel, Cloudinary, GitHub)
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
