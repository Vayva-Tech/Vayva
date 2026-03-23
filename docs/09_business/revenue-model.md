# Vayva -- Revenue Model & Financial Projections

**Document Classification:** Confidential -- Financial Planning
**Last Updated:** March 2026
**Version:** 1.0

---

## 1. Revenue Streams Overview

Vayva generates revenue through four complementary streams, designed to align company incentives with merchant success.

| Stream | Description | % of Revenue (Y1) | % of Revenue (Y2) |
|---|---|---|---|
| **Subscription MRR** | Monthly SaaS fees across three tiers | 70% | 60% |
| **Withdrawal Fees** | 3% fee on merchant withdrawals from Vayva wallet | 20% | 28% |
| **AI Credit Top-ups** | Additional AI conversation credits purchased beyond plan limits | 8% | 10% |
| **Premium Add-ons** | Future revenue from advanced features and integrations | 2% | 2% |

---

## 2. Stream 1: Subscription Revenue

### 2.1 Tier Pricing

| Tier | Monthly Price | Annual Equivalent | Target Segment |
|---|---|---|---|
| **STARTER** | ₦25,000 | ₦300,000 | Solo merchants, new businesses |
| **PRO** | ₦35,000 | ₦420,000 | Growing SMBs, high-volume sellers |
| **PRO PLUS** | ₦50,000 | ₦600,000 | Established brands, multi-location |

### 2.2 Tier Distribution Assumptions

| Period | STARTER | PRO | PRO PLUS | Blended ARPU |
|---|---|---|---|---|
| Month 6 | 70% | 25% | 5% | ₦28,250 |
| Month 12 | 55% | 35% | 10% | ₦31,250 |
| Month 18 | 45% | 38% | 17% | ₦34,100 |
| Month 24 | 35% | 40% | 25% | ₦37,500 |

**Rationale for tier migration:** As merchants grow their businesses on Vayva, they naturally upgrade to access unlimited orders (PRO) and industry-specific dashboards (PRO PLUS). Historical SaaS data suggests 30-40% of users upgrade within 12 months when they experience clear ROI.

### 2.3 MRR Projection (Subscription Only)

| Month | Total Merchants | Active Merchants | Blended ARPU | Subscription MRR |
|---|---|---|---|---|
| 3 | 100 | 80 | ₦26,500 | ₦2.12M |
| 6 | 250 | 200 | ₦28,250 | ₦5.65M |
| 9 | 500 | 400 | ₦29,750 | ₦11.9M |
| 12 | 1,000 | 750 | ₦31,250 | ₦23.4M |
| 18 | 4,000 | 3,200 | ₦34,100 | ₦109.1M |
| 24 | 10,000 | 7,500 | ₦37,500 | ₦281.3M |

### 2.4 Promotional Impact

**Current Promotion:** 1 month free on STARTER tier.

- Estimated conversion rate from free trial to paid: 65-75%
- Revenue impact: Delays first payment by 1 month per merchant
- Strategic value: Removes all risk for merchant, dramatically reduces acquisition friction
- Cost: ₦25,000 in deferred revenue per trial merchant (not a cash cost since AI compute costs ~₦1,500/month)

---

## 3. Stream 2: Withdrawal Fees (3%)

### 3.1 Mechanics

When merchants receive payments through their Vayva-powered stores (via Paystack), funds accumulate in their Vayva wallet. A 3% fee is applied when merchants withdraw funds to their bank account.

**Why 3%:**
- Below the 4-5% that payment aggregators typically charge for full-service commerce
- Psychologically acceptable because the merchant sees net deposits
- Aligns Vayva's revenue with merchant success -- we only earn when they earn
- Competitive with other Nigerian commerce platform fees

### 3.2 GMV and Withdrawal Fee Projections

| Month | Active Merchants | Avg GMV/Merchant/Mo | Total GMV | Withdrawal Fee Revenue (3%) |
|---|---|---|---|---|
| 6 | 200 | ₦500,000 | ₦100M | ₦3M |
| 12 | 750 | ₦700,000 | ₦525M | ₦15.75M |
| 18 | 3,200 | ₦900,000 | ₦2.88B | ₦86.4M |
| 24 | 7,500 | ₦1,100,000 | ₦8.25B | ₦247.5M |

**Assumptions:**
- Average GMV per merchant grows as AI agent effectiveness improves and merchants add more products
- Not all GMV flows through Vayva wallet (some merchants collect payments directly); assumed 60-70% capture rate
- GMV figures represent amount processed through Vayva, not total merchant revenue

### 3.3 Note on Paystack Fees
Paystack charges its own fees (1.5% + ₦100 per transaction, capped at ₦2,000). These are separate from Vayva's 3% withdrawal fee and are deducted at the point of payment. Vayva's 3% is applied at withdrawal, on the net amount received.

---

## 4. Stream 3: AI Credit Top-ups

### 4.1 Credit System Economics

| Parameter | Value |
|---|---|
| Credit rate | 0.24 credits per 1,000 tokens |
| GPT-4o Mini cost | $0.375 per million tokens |
| Llama 3.3 70B cost | $0.21 per million tokens |
| Blended cost per credit | ~₦0.65 |
| Top-up pricing | ₦1.50 per credit (130% markup) |

### 4.2 Plan Inclusions

| Tier | Monthly Credits | Approx. Conversations | Top-up Trigger |
|---|---|---|---|
| STARTER | 5,000 | ~300-500 | Medium-volume merchants exceed by month 2-3 |
| PRO | 10,000 | ~600-1,000 | High-volume merchants during peak seasons |
| PRO PLUS | 25,000 | ~1,500-2,500 | Rarely exceeded; safety net for viral moments |

### 4.3 Top-up Packages

| Package | Credits | Price | Per Credit |
|---|---|---|---|
| **Small** | 2,000 | ₦3,000 | ₦1.50 |
| **Medium** | 5,000 | ₦6,500 | ₦1.30 |
| **Large** | 15,000 | ₦16,500 | ₦1.10 |
| **Bulk** | 50,000 | ₦45,000 | ₦0.90 |

### 4.4 Credit Revenue Projections

| Month | Merchants Buying Top-ups | Avg Top-up Spend/Mo | Credit Revenue |
|---|---|---|---|
| 6 | 40 (20% of active) | ₦4,500 | ₦180K |
| 12 | 188 (25% of active) | ₦5,500 | ₦1.03M |
| 18 | 960 (30% of active) | ₦6,500 | ₦6.24M |
| 24 | 2,625 (35% of active) | ₦8,000 | ₦21M |

**Growth drivers:**
- As merchants see AI agent effectiveness, they want more conversations handled
- Seasonal peaks (holiday shopping, Valentine's Day, Sallah, Christmas) drive temporary spikes
- Natural business growth increases conversation volume beyond plan limits

---

## 5. Stream 4: Premium Add-ons (Future)

### 5.1 Planned Add-ons (Year 2+)

| Add-on | Price | Description |
|---|---|---|
| **Advanced Analytics** | ₦10,000/mo | Customer behavior analytics, sales forecasting, AI performance insights |
| **Multi-Location** | ₦15,000/mo per location | Manage multiple store locations from one dashboard |
| **API Access** | ₦20,000/mo | Integrate Vayva AI with existing systems |
| **Custom AI Training** | ₦50,000 one-time | Train AI on merchant-specific scripts and scenarios |
| **Priority AI** | ₦5,000/mo | Faster AI response times, higher-quality model routing |
| **White Label** | ₦100,000/mo | Remove Vayva branding, custom domain for AI agent |

---

## 6. Unit Economics

### 6.1 Per-Merchant Economics (STARTER Tier)

| Item | Monthly |
|---|---|
| **Revenue** | |
| Subscription | ₦25,000 |
| Withdrawal fees (3% on ₦500K GMV) | ₦15,000 |
| AI credits (average top-up) | ₦1,500 |
| **Total Revenue** | **₦41,500** |
| | |
| **Direct Costs** | |
| AI compute (OpenRouter) | ₦1,500 |
| Infrastructure (hosting, DB, cache) | ₦800 |
| WhatsApp API (Evolution) | ₦500 |
| Payment processing overhead | ₦200 |
| Customer support allocation | ₦2,000 |
| **Total Direct Costs** | **₦5,000** |
| | |
| **Gross Profit** | **₦36,500** |
| **Gross Margin** | **88%** |

### 6.2 Per-Merchant Economics (PRO Tier)

| Item | Monthly |
|---|---|
| **Revenue** | |
| Subscription | ₦35,000 |
| Withdrawal fees (3% on ₦1M GMV) | ₦30,000 |
| AI credits | ₦3,000 |
| **Total Revenue** | **₦68,000** |
| | |
| **Direct Costs** | |
| AI compute | ₦2,500 |
| Infrastructure | ₦1,000 |
| WhatsApp API | ₦800 |
| Payment processing overhead | ₦300 |
| Customer support allocation | ₦2,500 |
| **Total Direct Costs** | **₦7,100** |
| | |
| **Gross Profit** | **₦60,900** |
| **Gross Margin** | **90%** |

### 6.3 Key Unit Economics Summary

| Metric | Current | Target (Month 18) | Target (Month 24) |
|---|---|---|---|
| **Blended ARPU (all revenue)** | ₦35,000 | ₦48,000 | ₦58,000 |
| **CAC** | ₦7,000 | ₦5,000 | ₦4,500 |
| **Gross Margin** | 84% | 87% | 89% |
| **Monthly Churn** | 8% | 5% | 4% |
| **Average Customer Lifetime** | 12.5 months | 20 months | 25 months |
| **LTV (gross profit)** | ₦367,500 | ₦835,200 | ₦1,290,500 |
| **LTV:CAC** | 52x | 167x | 287x |
| **CAC Payback Period** | < 1 month | < 1 month | < 1 month |

### 6.4 LTV:CAC Analysis

The exceptionally high LTV:CAC ratio (52x+) is driven by:
1. **Very low CAC** -- WhatsApp-native acquisition in merchant communities is extremely cost-effective
2. **High gross margins** -- AI compute costs are minimal relative to subscription price
3. **Transaction revenue** -- Withdrawal fees add significant recurring revenue on top of subscriptions
4. **Low churn potential** -- Once AI agent is integrated into daily operations, switching costs are high

**Note:** These ratios are characteristic of early-stage companies with small-scale, high-touch acquisition. As we scale to paid channels, CAC will increase and LTV:CAC will normalize to 10-20x, which is still excellent for SaaS.

---

## 7. Financial Projections

### 7.1 Revenue Projection -- Conservative Scenario

| Month | Merchants | Active | Sub MRR | Withdrawal | Credits | Total MRR |
|---|---|---|---|---|---|---|
| 3 | 100 | 80 | ₦2.1M | ₦0.6M | ₦0.1M | ₦2.8M |
| 6 | 250 | 200 | ₦5.7M | ₦3M | ₦0.2M | ₦8.9M |
| 9 | 500 | 400 | ₦11.9M | ₦8.4M | ₦0.5M | ₦20.8M |
| 12 | 1,000 | 750 | ₦23.4M | ₦15.8M | ₦1M | ₦40.2M |
| 18 | 4,000 | 3,200 | ₦109M | ₦86.4M | ₦6.2M | ₦201.6M |
| 24 | 10,000 | 7,500 | ₦281M | ₦247.5M | ₦21M | ₦549.5M |

### 7.2 Revenue Projection -- Optimistic Scenario

| Month | Merchants | Active | Total MRR |
|---|---|---|---|
| 6 | 400 | 340 | ₦14.5M |
| 12 | 2,000 | 1,600 | ₦85M |
| 18 | 8,000 | 6,400 | ₦420M |
| 24 | 20,000 | 16,000 | ₦1.2B |

### 7.3 Revenue Projection -- Pessimistic Scenario

| Month | Merchants | Active | Total MRR |
|---|---|---|---|
| 6 | 120 | 90 | ₦4M |
| 12 | 500 | 350 | ₦18M |
| 18 | 2,000 | 1,400 | ₦85M |
| 24 | 5,000 | 3,500 | ₦230M |

### 7.4 Annual Revenue Summary

| Metric | Year 1 | Year 2 |
|---|---|---|
| **Conservative ARR (exit)** | ₦482M | ₦6.6B |
| **Optimistic ARR (exit)** | ₦1.02B | ₦14.4B |
| **Pessimistic ARR (exit)** | ₦216M | ₦2.76B |

---

## 8. Cost Structure

### 8.1 Variable Costs (Scale with Merchants)

| Cost Category | Per Merchant/Mo | At 1,000 Merchants | At 10,000 Merchants |
|---|---|---|---|
| AI Compute (OpenRouter) | ₦1,500-2,500 | ₦2M | ₦18M |
| Infrastructure | ₦800-1,000 | ₦0.9M | ₦8M |
| WhatsApp API | ₦500-800 | ₦0.6M | ₦5M |
| Payment overhead | ₦200-300 | ₦0.25M | ₦2M |
| **Total Variable** | **₦3,000-4,600** | **₦3.75M** | **₦33M** |

### 8.2 Fixed Costs (Monthly)

| Cost Category | Month 6 | Month 12 | Month 24 |
|---|---|---|---|
| Team (salaries) | ₦3M | ₦6M | ₦20M |
| Office & admin | ₦0.5M | ₦1M | ₦2M |
| Marketing | ₦2.5M | ₦4.5M | ₦10M |
| Tools & software | ₦0.2M | ₦0.3M | ₦0.5M |
| Legal & compliance | ₦0.1M | ₦0.2M | ₦0.5M |
| **Total Fixed** | **₦6.3M** | **₦12M** | **₦33M** |

### 8.3 Path to Profitability

| Milestone | Estimated Timeline |
|---|---|
| Contribution margin positive (per merchant) | Already positive |
| Operating breakeven | Month 14-18 |
| Cash flow positive | Month 18-22 |
| Net profit positive | Month 20-24 |

**Breakeven Analysis:**
- At blended total ARPU of ₦40,000 and 84% gross margin, each merchant contributes ₦33,600/month
- With ₦12M in monthly fixed costs at Month 12, breakeven requires ~357 active merchants
- At 750 active merchants (Month 12), the business generates ₦25.2M in gross profit vs. ₦12M in fixed costs = ₦13.2M operating profit

---

## 9. Sensitivity Analysis

### 9.1 Revenue Sensitivity to Key Variables

| Variable | -20% Impact | Base | +20% Impact |
|---|---|---|---|
| ARPU | MRR drops 20% | ₦40.2M (M12) | MRR increases 20% |
| Active merchant count | MRR drops 20% | ₦40.2M (M12) | MRR increases 20% |
| Churn rate (6% to 10%) | MRR drops 30% | ₦40.2M (M12) | N/A |
| Withdrawal fee (3% to 2%) | MRR drops 7% | ₦40.2M (M12) | N/A |

### 9.2 Cost Sensitivity

| Risk | Impact | Mitigation |
|---|---|---|
| AI compute cost increase (2x) | Gross margin drops from 84% to 78% | Model optimization, caching, fine-tuning smaller models |
| Naira devaluation (30%) | USD-denominated costs (AI compute) increase | Negotiate volume pricing, local GPU infrastructure |
| CAC increases (2x) | LTV:CAC drops from 52x to 26x (still healthy) | Optimize acquisition channels, increase referral share |

---

## 10. Revenue Optimization Levers

### 10.1 Short-term (0-6 months)
1. **Optimize trial-to-paid conversion** -- Target 75%+ conversion rate
2. **Reduce time-to-first-sale** -- AI agent that generates a sale within 24 hours of setup
3. **Increase withdrawal fee capture** -- Ensure merchants use Vayva wallet vs. direct payment
4. **Launch referral program** -- Organic growth reduces blended CAC

### 10.2 Medium-term (6-18 months)
1. **Drive tier upgrades** -- In-app prompts when merchants hit STARTER limits
2. **Increase AI credit consumption** -- Better AI = more conversations = more credits used
3. **Launch premium add-ons** -- Analytics, multi-location, API access
4. **Annual billing discount** -- 2 months free for annual commitment (improves cash flow)

### 10.3 Long-term (18+ months)
1. **Platform marketplace** -- Revenue share on third-party integrations
2. **White-label/enterprise** -- High-ARPU contracts with large merchants and agencies
3. **Financial services** -- Merchant lending based on transaction data (partnership model)
4. **Cross-border commerce** -- Enable Nigerian merchants to sell to diaspora and international customers

---

*This document is confidential and intended for financial planning and investor communications. All projections are based on assumptions and estimates as of March 2026.*
