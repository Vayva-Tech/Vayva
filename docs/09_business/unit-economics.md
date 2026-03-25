# Vayva Technologies -- Unit Economics

**Document Classification:** Confidential -- Financial Planning
**Last Updated:** March 2026
**Version:** 1.0
**Exchange Rate Assumption:** $1 = ₦1,550 (March 2026)

---

## 1. Executive Summary

Vayva's unit economics demonstrate a high-margin SaaS business with strong contribution per merchant. At a blended ARPU of ₦35,000--₦42,000 (subscription + withdrawal fees + AI credit top-ups), the direct cost to serve each merchant is approximately ₦5,000--₦7,100, yielding **gross margins of 84--90%** depending on tier. The business achieves contribution margin positivity from the first paying merchant, with operating breakeven projected at **~357 active merchants** (Month 10--14).

---

## 2. Revenue Per Merchant by Tier

### 2.1 Subscription Revenue

| Tier | Monthly Subscription | Annual Value | Target Segment |
|---|---|---|---|
| STARTER | ₦25,000 | ₦300,000 | Solo merchants, new businesses |
| PRO | ₦35,000 | ₦420,000 | Growing SMBs, high-volume sellers |
| PRO PLUS | ₦50,000 | ₦600,000 | Established brands, multi-location |

### 2.2 Total Revenue Per Merchant (All Streams)

| Revenue Stream | STARTER | PRO | PRO PLUS |
|---|---|---|---|
| Subscription | ₦25,000 | ₦35,000 | ₦50,000 |
| Withdrawal fees (3% on GMV) | ₦15,000 | ₦30,000 | ₦60,000 |
| AI credit top-ups (avg) | ₦1,500 | ₦3,000 | ₦2,000 |
| **Total Monthly Revenue** | **₦41,500** | **₦68,000** | **₦112,000** |
| **Total Annual Revenue** | **₦498,000** | **₦816,000** | **₦1,344,000** |

**GMV assumptions:**
- STARTER merchants: ₦500,000/mo average GMV through Vayva
- PRO merchants: ₦1,000,000/mo average GMV through Vayva
- PRO PLUS merchants: ₦2,000,000/mo average GMV through Vayva

**Top-up assumptions:**
- STARTER: 20% buy top-ups, average ₦7,500/mo when they do (blended ₦1,500)
- PRO: 25% buy top-ups, average ₦12,000/mo when they do (blended ₦3,000)
- PRO PLUS: 10% buy top-ups, average ₦20,000/mo when they do (blended ₦2,000)

### 2.3 Blended ARPU Over Time

| Period | STARTER % | PRO % | PRO PLUS % | Blended Subscription ARPU | Blended Total ARPU |
|---|---|---|---|---|---|
| Month 1--6 | 70% | 25% | 5% | ₦28,250 | ₦47,250 |
| Month 7--12 | 55% | 35% | 10% | ₦31,250 | ₦54,500 |
| Month 13--18 | 45% | 38% | 17% | ₦34,100 | ₦62,800 |
| Month 19--24 | 35% | 40% | 25% | ₦37,500 | ₦72,500 |

---

## 3. Cost Per Merchant

### 3.1 Direct Costs (COGS) by Tier

| Cost Component | STARTER | PRO | PRO PLUS | Notes |
|---|---|---|---|---|
| **AI compute (OpenRouter)** | ₦1,500 | ₦2,500 | ₦4,500 | Proportional to included credits |
| **Infrastructure allocation** | ₦800 | ₦1,000 | ₦1,200 | VPS + Vercel amortized per merchant |
| **WhatsApp API (Meta)** | ₦500 | ₦800 | ₦1,200 | Conversation-based pricing |
| **Payment processing overhead** | ₦200 | ₦300 | ₦400 | Paystack fees on Vayva subscription billing |
| **Email (Resend)** | ₦50 | ₦80 | ₦120 | Transactional email allocation |
| **Customer support allocation** | ₦2,000 | ₦2,500 | ₦3,000 | Time-weighted support cost |
| **Total Direct Cost** | **₦5,050** | **₦7,180** | **₦10,420** |

### 3.2 Infrastructure Cost Allocation Methodology

Infrastructure costs are allocated per merchant using an activity-based model:

| Component | Monthly Cost | Allocation Method | Per-Merchant (at 500) |
|---|---|---|---|
| VPS (Appserver) | ₦62,000 | Equal per active merchant | ₦124 |
| VPS (Dbserver) | ₦77,500 | Weighted by data volume | ₦155 |
| Vercel (4 projects) | ₦124,000 | Weighted by page views (storefronts heavy) | ₦248 |
| Storage (MinIO self-hosted) | ₦0 | Included in VPS allocation | ₦0 |
| Sentry | ₦0--40,000 | Equal per project | ₦0--80 |
| **Total infra/merchant** | | | **₦527--₦883** |

At low merchant counts, infrastructure cost per merchant is higher. The ₦800--₦1,200 figures in Section 3.1 reflect expected levels at 200--500 merchants.

### 3.3 AI Cost Deep Dive

| Parameter | Value |
|---|---|
| Credit-to-token ratio | 0.24 credits = 1,000 tokens |
| 1 credit | = 4,167 tokens |
| GPT-4o Mini blended cost | $0.375 / 1M tokens = ₦0.58 / 1K tokens |
| Llama 3.3 70B cost | $0.21 / 1M tokens = ₦0.33 / 1K tokens |
| Model mix (estimated) | 70% GPT-4o Mini, 30% Llama 3.3 |
| Blended cost per 1K tokens | ₦0.50 |
| Cost per credit | ₦2.10 |

**AI cost per tier (at plan limits):**

| Tier | Included Credits | Token Equivalent | AI Cost at Full Usage |
|---|---|---|---|
| STARTER | 5,000 | 20.8M tokens | ₦10,417 |
| PRO | 10,000 | 41.7M tokens | ₦20,833 |
| PRO PLUS | 25,000 | 104.2M tokens | ₦52,083 |

**Actual utilization rates (estimated):**

| Tier | Avg. Utilization Rate | Actual AI Cost/Mo |
|---|---|---|
| STARTER | 15--25% | ₦1,500--₦2,600 |
| PRO | 20--30% | ₦2,500--₦4,200 |
| PRO PLUS | 15--25% | ₦4,500--₦7,800 |

Most merchants do not exhaust their monthly credit allotment. This unused capacity represents margin upside.

---

## 4. Gross Margin Analysis

### 4.1 Gross Margin by Tier

| Metric | STARTER | PRO | PRO PLUS |
|---|---|---|---|
| Total revenue/merchant | ₦41,500 | ₦68,000 | ₦112,000 |
| Total direct cost/merchant | ₦5,050 | ₦7,180 | ₦10,420 |
| **Gross profit/merchant** | **₦36,450** | **₦60,820** | **₦101,580** |
| **Gross margin** | **87.8%** | **89.4%** | **90.7%** |

### 4.2 Subscription-Only Gross Margin

Excluding withdrawal fees and top-ups (subscription revenue only):

| Metric | STARTER | PRO | PRO PLUS |
|---|---|---|---|
| Subscription revenue | ₦25,000 | ₦35,000 | ₦50,000 |
| Direct cost (excl. support) | ₦3,050 | ₦4,680 | ₦7,420 |
| **Sub-only gross margin** | **87.8%** | **86.6%** | **85.2%** |

Even on subscription revenue alone (ignoring withdrawal fees), gross margins exceed 85% across all tiers.

### 4.3 Gross Margin Sensitivity

| Scenario | STARTER GM | PRO GM | PRO PLUS GM |
|---|---|---|---|
| **Base case** | 87.8% | 89.4% | 90.7% |
| AI costs 2x (model price increase) | 84.2% | 85.8% | 86.7% |
| Naira devaluation 30% (USD costs up) | 84.9% | 86.8% | 88.2% |
| Both AI 2x + Naira 30% devaluation | 80.5% | 83.2% | 85.0% |
| AI costs 0.5x (model optimization) | 89.6% | 91.3% | 92.7% |

---

## 5. Contribution Margin

### 5.1 Contribution Margin (After Allocated Fixed Costs)

Fixed costs allocated per merchant include a share of: team salaries, marketing spend, office/admin, legal/compliance, and software tools.

| Period | Fixed Costs/Mo | Active Merchants | Fixed Allocation/Merchant | Blended Gross Profit/Merchant | Contribution Margin/Merchant |
|---|---|---|---|---|---|
| Month 6 | ₦6.3M | 200 | ₦31,500 | ₦36,450 | ₦4,950 (10.5%) |
| Month 12 | ₦12M | 750 | ₦16,000 | ₦42,800 | ₦26,800 (49.5%) |
| Month 18 | ₦20M | 3,200 | ₦6,250 | ₦52,300 | ₦46,050 (73.3%) |
| Month 24 | ₦33M | 7,500 | ₦4,400 | ₦58,200 | ₦53,800 (74.1%) |

### 5.2 Operating Leverage

Vayva exhibits strong operating leverage: fixed costs grow linearly while revenue grows with merchant count. The fixed cost allocation per merchant drops dramatically:

| Scale | Fixed Cost % of Revenue | Variable Cost % of Revenue | Operating Margin |
|---|---|---|---|
| 100 merchants | 105% | 12% | -17% (pre-breakeven) |
| 357 merchants | 56% | 12% | 0% (breakeven) |
| 750 merchants | 31% | 12% | 49% |
| 3,200 merchants | 10% | 11% | 73% |
| 7,500 merchants | 6% | 10% | 74% |

---

## 6. Breakeven Analysis

### 6.1 Merchant Breakeven

| Parameter | Value |
|---|---|
| Monthly fixed costs (Month 12 estimate) | ₦12,000,000 |
| Blended gross profit per merchant | ₦42,800 |
| **Breakeven merchant count** | **~281 active merchants** |
| Estimated month to reach 281 active | **Month 8--10** |

### 6.2 Breakeven Scenarios

| Scenario | Fixed Costs/Mo | Gross Profit/Merchant | Breakeven Merchants | Est. Month |
|---|---|---|---|---|
| Lean (solo founder + 1 dev) | ₦4M | ₦36,450 | 110 | Month 4--5 |
| Current plan | ₦12M | ₦42,800 | 281 | Month 8--10 |
| Accelerated hiring | ₦20M | ₦42,800 | 467 | Month 11--14 |
| Aggressive expansion | ₦35M | ₦45,000 | 778 | Month 13--16 |

### 6.3 Cash Breakeven vs. Accounting Breakeven

| Metric | Accounting Breakeven | Cash Breakeven |
|---|---|---|
| Definition | Revenue = Total costs (incl. depreciation) | Cash inflows = Cash outflows |
| Estimated timing | Month 10--14 | Month 12--18 |
| Key difference | Includes non-cash items | Includes prepaid annual contracts, delayed collections |

---

## 7. Customer Lifetime Value (LTV)

### 7.1 LTV Calculation

| Parameter | STARTER | PRO | PRO PLUS | Blended |
|---|---|---|---|---|
| Monthly revenue | ₦41,500 | ₦68,000 | ₦112,000 | ₦54,500 |
| Gross margin | 87.8% | 89.4% | 90.7% | 89.0% |
| Monthly gross profit | ₦36,450 | ₦60,820 | ₦101,580 | ₦48,505 |
| Monthly churn rate | 8% | 6% | 4% | 6.5% |
| Average lifetime (1/churn) | 12.5 months | 16.7 months | 25 months | 15.4 months |
| **LTV (gross profit)** | **₦455,625** | **₦1,015,694** | **₦2,539,500** | **₦746,977** |

### 7.2 LTV Improvement Over Time

As the platform matures, churn decreases and ARPU increases through tier upgrades and growing merchant GMV:

| Period | Blended ARPU | Blended Churn | Avg Lifetime | LTV |
|---|---|---|---|---|
| Month 1--6 | ₦47,250 | 8% | 12.5 mo | ₦525,938 |
| Month 7--12 | ₦54,500 | 6.5% | 15.4 mo | ₦746,977 |
| Month 13--18 | ₦62,800 | 5% | 20 mo | ₦1,117,760 |
| Month 19--24 | ₦72,500 | 4% | 25 mo | ₦1,613,750 |

### 7.3 LTV by Cohort Quality

| Cohort | Characteristics | Expected LTV | LTV Index |
|---|---|---|---|
| Early adopters (M1--6) | Tech-forward, high engagement | ₦850K | 1.14x |
| Growth phase (M7--12) | Referral-driven, medium engagement | ₦750K | 1.00x |
| Scale phase (M13--18) | Paid acquisition, mixed quality | ₦600K | 0.80x |
| Mature phase (M19--24) | Brand-aware, diverse segments | ₦700K | 0.94x |

---

## 8. Customer Acquisition Cost (CAC)

### 8.1 CAC Estimation

| Channel | CAC Estimate | % of Acquisitions | Weighted CAC |
|---|---|---|---|
| WhatsApp community outreach | ₦2,000--3,000 | 40% | ₦1,000 |
| Referral program (₦5K credit/referral) | ₦5,000 | 25% | ₦1,250 |
| Social media (organic) | ₦3,000--5,000 | 20% | ₦800 |
| Paid digital (Facebook/Instagram ads) | ₦10,000--15,000 | 10% | ₦1,250 |
| Events/partnerships | ₦8,000--12,000 | 5% | ₦500 |
| **Blended CAC** | | **100%** | **₦4,800** |

### 8.2 CAC Trajectory

| Period | Blended CAC | Primary Channels |
|---|---|---|
| Month 1--6 | ₦3,000--5,000 | WhatsApp outreach, personal network |
| Month 7--12 | ₦5,000--8,000 | Referrals, social media, initial paid ads |
| Month 13--18 | ₦7,000--12,000 | Paid acquisition increasing share |
| Month 19--24 | ₦8,000--15,000 | Scaled paid channels, brand marketing |

### 8.3 CAC Payback Period

| Tier | CAC | Monthly Gross Profit | Payback Period |
|---|---|---|---|
| STARTER | ₦5,000 | ₦36,450 | **< 1 month** |
| PRO | ₦5,000 | ₦60,820 | **< 1 month** |
| PRO PLUS | ₦5,000 | ₦101,580 | **< 1 month** |
| Blended (at M12 CAC of ₦7,000) | ₦7,000 | ₦48,505 | **< 1 month** |
| Blended (at M24 CAC of ₦12,000) | ₦12,000 | ₦58,200 | **< 1 month** |

**Key insight:** Even at aggressive CAC levels, payback is under 1 month due to the high gross profit per merchant. This gives Vayva permission to spend aggressively on growth while maintaining capital efficiency.

---

## 9. LTV:CAC Ratio

### 9.1 Current and Projected

| Period | LTV | CAC | LTV:CAC | Benchmark |
|---|---|---|---|---|
| Month 6 | ₦525,938 | ₦4,000 | **131x** | Early-stage, high-touch |
| Month 12 | ₦746,977 | ₦7,000 | **107x** | Still founder-led sales |
| Month 18 | ₦1,117,760 | ₦10,000 | **112x** | Referral engine kicking in |
| Month 24 | ₦1,613,750 | ₦12,000 | **134x** | Brand + product-led growth |

### 9.2 Context and Caveats

These ratios are exceptionally high, driven by:

1. **Near-zero CAC** in early stages (founder-led sales, WhatsApp communities)
2. **Very high gross margins** (85--90%) due to low AI compute costs relative to subscription pricing
3. **Revenue stacking** -- subscription + withdrawal fees + top-ups create multi-stream per-merchant revenue

**Expected normalization:** As Vayva scales into paid acquisition channels and hires a sales team, CAC will increase significantly. A realistic steady-state LTV:CAC of **15--25x** is achievable and would still be best-in-class for African SaaS. The current ratios reflect the capital-efficient early stage, not a sustainable long-term equilibrium.

### 9.3 Investment Efficiency

| Metric | Value | SaaS Benchmark | Assessment |
|---|---|---|---|
| LTV:CAC | 107x (M12) | > 3x is healthy | Exceptional |
| CAC payback | < 1 month | < 12 months is healthy | Exceptional |
| Gross margin | 89% | 70--80% is typical SaaS | Above average |
| Net revenue retention | ~105% (estimated) | > 100% is best-in-class | Healthy |

---

## 10. Sensitivity Analysis

### 10.1 Impact of Key Variables on Unit Economics

| Variable Change | Impact on Gross Margin | Impact on LTV | Impact on LTV:CAC |
|---|---|---|---|
| ARPU -20% | -2.4pp (to 86.6%) | -20% | -20% |
| AI costs +100% | -3.6pp (to 85.4%) | -4% | -4% |
| Churn +50% (6.5% to 9.75%) | No change | -33% | -33% |
| CAC +100% | No change | No change | -50% |
| Naira devaluation -30% | -2.9pp (to 86.1%) | -3% | -3% |

### 10.2 Worst-Case Scenario

All negative factors combined: ARPU -20%, AI costs +100%, churn at 10%, CAC at ₦15,000:

| Metric | Base Case | Worst Case | Still Viable? |
|---|---|---|---|
| Gross margin | 89% | 79% | Yes |
| LTV | ₦747K | ₦346K | Yes |
| CAC | ₦7,000 | ₦15,000 | Yes |
| LTV:CAC | 107x | 23x | Yes -- still healthy |
| Breakeven merchants | 281 | 520 | Yes -- achievable |

**Conclusion:** Vayva's unit economics are robust even under severely adverse conditions. The business model is inherently defensible due to high gross margins and multi-stream revenue per merchant.

---

*This document is confidential and intended for internal financial planning and investor communications. Unit economics are based on estimated costs and projected revenues as of March 2026 and will be validated against actual data as the merchant base grows.*
