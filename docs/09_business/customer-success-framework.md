# Vayva -- Customer Success Framework

**Document Classification:** Confidential -- Operations
**Last Updated:** March 2026
**Version:** 1.0

---

## 1. Customer Success Philosophy

At Vayva, customer success means one thing: **our merchants are making more money because of us.**

We do not measure success by feature adoption scores or login frequency. We measure it by revenue impact. When a merchant's sales increase because their AI agent is handling customers 24/7, that is success. When a merchant upgrades because they need more capacity to handle growing demand, that is success. When a merchant refers three colleagues because Vayva transformed their business, that is success.

Our customer success function exists to ensure every merchant gets from signup to revenue growth as quickly and smoothly as possible, and stays growing on our platform for years.

---

## 2. Merchant Lifecycle

### 2.1 Lifecycle Stages

```
AWARENESS -> TRIAL -> ACTIVATION -> GROWTH -> EXPANSION -> ADVOCACY
                                      |
                                      v
                                   AT RISK -> CHURN
```

| Stage | Definition | Key Metrics | Owner |
|---|---|---|---|
| **Awareness** | Merchant discovers Vayva | Website visits, social media reach | Marketing |
| **Trial** | Merchant signs up for free trial (1 month STARTER) | Signup rate, trial starts | Marketing/Product |
| **Activation** | Merchant completes setup and processes first AI-assisted sale | Time to first sale, setup completion | Customer Success |
| **Growth** | Merchant is active, AI agent handling regular orders | Monthly orders, GMV, AI conversations | Customer Success |
| **Expansion** | Merchant upgrades tier or purchases AI credits | Upgrade rate, credit purchases | Customer Success |
| **Advocacy** | Merchant refers others, leaves reviews, shares success | Referrals, NPS, testimonials | Customer Success/Marketing |
| **At Risk** | Declining usage, support issues, payment failures | Usage decline, ticket volume, payment failures | Customer Success |
| **Churn** | Merchant cancels subscription | Churn rate, churn reasons | Customer Success |

---

## 3. Onboarding Process

### 3.1 Onboarding Goals
1. Merchant completes store setup within 24 hours of signup
2. AI agent is live and connected to WhatsApp within 48 hours
3. First AI-assisted sale within 7 days
4. Merchant reaches "aha moment" (sees AI agent handle a customer conversation successfully) within 72 hours

### 3.2 Onboarding Journey

#### Day 0: Welcome (Automated)
- Welcome email with setup guide link
- WhatsApp welcome message from Vayva support
- In-app onboarding checklist appears on dashboard

**Checklist:**
- [ ] Complete business profile
- [ ] Add first 10 products (with photos, prices, descriptions)
- [ ] Connect WhatsApp number
- [ ] Configure AI agent personality and tone
- [ ] Set up Paystack for payments
- [ ] Review AI agent test conversation
- [ ] Share storefront link with first 5 customers

#### Day 1: Setup Support (Proactive)
- Automated check: Has merchant completed profile?
- If not: WhatsApp nudge with quick-start video
- If yes: Congratulations message + next step prompt
- Offer: "Need help adding products? Send us photos and we will set them up for you"

#### Day 2-3: AI Agent Launch
- Automated check: Is WhatsApp connected? Are products live?
- If not: Personal WhatsApp call from success team to assist
- If yes: "Your AI agent is live! Here is how to test it" + test conversation guide
- Send test customer message to demonstrate AI agent capability

#### Day 4-7: First Sale Push
- Automated check: Has merchant had any customer conversations through AI?
- If not: "Share your store link on your WhatsApp Status -- here is a template"
- If yes: "Your AI agent handled [X] conversations! Here is how to optimize it"
- Provide WhatsApp Status templates and Instagram post templates

#### Day 7-14: Optimization
- Review AI agent performance with merchant
- Suggest product catalog improvements (better descriptions, photos)
- Introduce advanced features (discount codes, inventory management)
- Schedule 15-minute check-in call for high-value merchants (PRO/PRO PLUS)

#### Day 14-30: Habit Formation
- Weekly performance digest email (orders, revenue, conversations handled)
- "Your AI agent closed [X] sales this week -- that is [Y] more than last week"
- Introduce community (WhatsApp group, merchant forum)
- Begin tier upgrade suggestions if usage warrants

### 3.3 Onboarding KPIs

| Metric | Target | Measurement |
|---|---|---|
| Setup completion rate (Day 3) | 80% | % of signups completing full setup |
| Time to first AI conversation | < 48 hours | Median time from signup to first AI customer interaction |
| Time to first sale | < 7 days | Median time from signup to first AI-assisted sale |
| Day 7 retention | 85% | % of signups active on day 7 |
| Day 30 retention | 70% | % of signups active on day 30 |
| Onboarding NPS | > 50 | Survey at day 14 |

---

## 4. Merchant Health Scoring

### 4.1 Health Score Model

Each merchant receives a health score from 0-100, calculated weekly, based on weighted factors:

| Factor | Weight | Healthy (Green) | Warning (Yellow) | Critical (Red) |
|---|---|---|---|---|
| **AI Conversations (7d)** | 25% | 20+ conversations | 5-19 conversations | < 5 conversations |
| **Orders (7d)** | 25% | 10+ orders | 3-9 orders | < 3 orders |
| **Login Frequency (7d)** | 15% | 3+ logins | 1-2 logins | 0 logins |
| **Payment Status** | 15% | Current | 1-7 days overdue | 7+ days overdue |
| **Support Tickets (30d)** | 10% | 0-1 tickets | 2-3 tickets | 4+ tickets (frustration) |
| **Feature Adoption** | 10% | Using 5+ features | Using 3-4 features | Using 1-2 features |

### 4.2 Health Score Ranges

| Score | Status | Action |
|---|---|---|
| 80-100 | **Healthy** | Upsell/expansion conversations. Ask for referrals. |
| 60-79 | **Stable** | Monitor. Proactive tips to increase engagement. |
| 40-59 | **Warning** | Personal outreach within 48 hours. Identify issues. |
| 20-39 | **At Risk** | Immediate intervention. Call merchant. Offer support. |
| 0-19 | **Critical** | Emergency outreach. Retention offer if warranted. |

### 4.3 Automated Health Score Actions

| Trigger | Action |
|---|---|
| Score drops below 60 | Alert to customer success manager |
| Score drops below 40 | Automated WhatsApp message: "We noticed your AI agent has been quiet. Need help?" |
| Score drops below 20 | Personal call from success team within 24 hours |
| Score increases above 80 | Automated congratulations + referral program reminder |
| Score sustained above 90 for 30 days | Upgrade suggestion with ROI projection |

---

## 5. Churn Prevention

### 5.1 Early Warning Signals

| Signal | Detection Method | Response |
|---|---|---|
| No login for 7+ days | Dashboard analytics | WhatsApp check-in message |
| AI conversations declining week-over-week | Conversation analytics | Tips to increase customer engagement |
| Products not updated for 30+ days | Product catalog monitoring | "Need help updating your catalog?" |
| Payment failed | Billing system | Immediate WhatsApp notification + retry instructions |
| Multiple support tickets in 7 days | Support system | Escalate to senior support. Personal call. |
| Merchant asks "how do I cancel?" | Support conversation | Immediate escalation to retention team |

### 5.2 Retention Playbooks

#### Playbook 1: Inactive Merchant (No login 14+ days)
1. Day 14: WhatsApp message -- "Your AI agent is still working! Here are your stats this week."
2. Day 18: Email -- "5 ways to get more from your Vayva AI agent"
3. Day 21: Personal WhatsApp call -- "Just checking in. Is everything okay with your business?"
4. Day 28: Offer -- "We would love to keep you. Here is 50% off next month."

#### Playbook 2: Unhappy Merchant (3+ support tickets, negative sentiment)
1. Immediate: Escalate to senior support for ticket resolution
2. Within 24h: Personal call from customer success manager
3. Within 48h: Follow-up with documented resolution and improvement plan
4. Within 7 days: Check-in to confirm satisfaction
5. Ongoing: Monthly personal check-ins for 3 months

#### Playbook 3: Price-Sensitive Merchant (Payment failure or price complaint)
1. Confirm payment method is valid (card expiry, insufficient funds)
2. Offer to switch to a lower tier if appropriate
3. If churning due to price: "Your AI agent processed ₦X in orders last month. That is Y times your subscription cost."
4. Last resort: 1 month at 50% off to demonstrate continued value

#### Playbook 4: Competitor Switch (Merchant mentions competitor)
1. Understand why -- is it price, features, or experience?
2. Address specific concerns with factual comparison
3. If feature gap: fast-track feature request, communicate timeline
4. If price: ROI calculation showing Vayva's total value
5. Never disparage competitors. Win on merit.

### 5.3 Churn Exit Interview

When a merchant cancels, collect structured feedback:

1. **Primary reason for leaving** (single select):
   - Too expensive
   - Not enough sales/ROI
   - AI agent quality issues
   - Technical problems
   - Business closed
   - Switched to competitor
   - Other

2. **What could we have done differently?** (open text)

3. **Would you consider returning if [X]?** (open text)

4. **NPS at time of churn** (0-10)

**Data usage:** Monthly churn analysis report to product and leadership team. Identify patterns. Prioritize fixes.

---

## 6. Expansion Revenue (Upsell)

### 6.1 Upgrade Triggers

| Current Tier | Trigger | Suggested Action |
|---|---|---|
| STARTER | Approaching 100 product limit | "You are at 85/100 products. PRO gives you 1,000. Upgrade?" |
| STARTER | Approaching 500 order limit | "Great month! You hit 400 orders. PRO gives unlimited orders." |
| STARTER | AI credits running low repeatedly | "Your AI is popular! PRO gives 10,000 credits/month." |
| PRO | Using industry-specific features would add value | "PRO PLUS includes a dashboard built for [their vertical]." |
| PRO | High GMV (₦2M+/month) | "You are a power seller. PRO PLUS gives you visual workflows and 25K credits." |
| Any | Seasonal peak approaching | "Prep for [holiday]. Top up AI credits to handle the rush." |

### 6.2 Upsell Approach

1. **Data-driven:** Always lead with the merchant's own data. "You processed X orders last month."
2. **ROI-focused:** Show the merchant how upgrading will increase their revenue, not just add features.
3. **No pressure:** Present the option. If they are not ready, follow up next month.
4. **In-context:** Surface upgrade suggestions at natural moments (when hitting limits, during strong months).

### 6.3 Expansion Revenue Targets

| Metric | Month 6 | Month 12 | Month 24 |
|---|---|---|---|
| Upgrade rate (monthly) | 3% | 5% | 7% |
| AI credit top-up rate | 20% of merchants | 25% | 35% |
| Net Revenue Retention | 105% | 115% | 125% |
| Expansion MRR | ₦200K | ₦2M | ₦25M |

---

## 7. Satisfaction Measurement

### 7.1 Net Promoter Score (NPS)

**Methodology:**
- Survey sent via WhatsApp (not email -- higher response rate in Nigeria)
- Single question: "How likely are you to recommend Vayva to a fellow business owner? (0-10)"
- Follow-up: "What is the primary reason for your score?"
- Frequency: Every 90 days per merchant
- Sample: All active merchants

**Score Interpretation:**
| Score Range | Category | Action |
|---|---|---|
| 9-10 | **Promoter** | Ask for referral, testimonial, case study |
| 7-8 | **Passive** | Identify friction. One improvement could convert them to promoter. |
| 0-6 | **Detractor** | Immediate outreach. Understand and resolve issues. |

**Targets:**
| Period | NPS Target |
|---|---|
| Month 6 | 40 |
| Month 12 | 55 |
| Month 24 | 65 |

### 7.2 Customer Satisfaction Score (CSAT)

**Methodology:**
- Post-support interaction survey: "How satisfied were you with the support you received? (1-5)"
- Sent via WhatsApp after every support ticket closure
- Target: 4.5+ average

### 7.3 Customer Effort Score (CES)

**Methodology:**
- Post-onboarding survey (Day 7): "How easy was it to get started with Vayva? (1-7)"
- Post-feature adoption: "How easy was it to [set up / use feature]? (1-7)"
- Target: 6.0+ average

### 7.4 Merchant Revenue Impact Score

**Unique to Vayva.** We measure the actual business impact:
- "How much has your revenue changed since joining Vayva?" (Decreased / Same / Increased 1-25% / Increased 25-50% / Increased 50%+)
- Sent quarterly
- Target: 70%+ report revenue increase

---

## 8. Success Milestones

### 8.1 Merchant Achievement Milestones

We celebrate merchant milestones to drive engagement and advocacy:

| Milestone | Trigger | Recognition |
|---|---|---|
| **First Sale** | First AI-assisted sale | WhatsApp congratulations + social media feature (with permission) |
| **100 Orders** | Cumulative 100 orders via AI | Badge on dashboard + merchant community shoutout |
| **₦1M GMV** | Cumulative ₦1M in AI-processed transactions | Certificate + case study invitation |
| **500 AI Conversations** | AI agent handles 500th customer | "AI Power Seller" badge + feature spotlight |
| **1 Year Anniversary** | 12 months on Vayva | Thank you message from founder + loyalty discount |
| **First Referral** | Refers another merchant | Referral reward + community recognition |
| **5-Star AI Agent** | Customer satisfaction rating > 4.5 | Featured in "Top AI Agents" showcase |

### 8.2 Internal Success Milestones

| Milestone | Definition | Team Celebration |
|---|---|---|
| 100 active merchants | 100 merchants with AI agent active | Team dinner |
| ₦100M cumulative GMV | Total GMV processed through platform | Company announcement |
| NPS > 50 | Net Promoter Score exceeds 50 | Team recognition |
| < 5% monthly churn | Monthly churn drops below 5% | Team bonus trigger |
| 1,000 merchants | Total merchant count reaches 1,000 | Major company milestone |

---

## 9. Quarterly Business Reviews (QBR) -- PRO PLUS Merchants

### 9.1 QBR Purpose

PRO PLUS merchants invest ₦50,000/month and represent our highest-value segment. They deserve a structured, consultative relationship. Quarterly Business Reviews provide:
- Performance review and benchmarking
- Strategic recommendations for AI optimization
- Product roadmap preview and feedback collection
- Relationship deepening and churn prevention

### 9.2 QBR Agenda (60 minutes)

| Section | Duration | Content |
|---|---|---|
| **Business Review** | 15 min | Revenue trends, order volume, customer growth, comparison to previous quarter |
| **AI Performance** | 15 min | Conversation volume, response quality, conversion rates, areas for improvement |
| **Optimization Recommendations** | 15 min | Product catalog improvements, AI training suggestions, marketing tips |
| **Roadmap Preview** | 10 min | Upcoming features relevant to their business, beta access opportunities |
| **Feedback & Planning** | 5 min | Merchant feedback, action items, next quarter goals |

### 9.3 QBR Deliverables

**Before QBR:**
- Merchant performance dashboard (PDF/presentation)
- AI agent analytics report
- Industry benchmark comparison

**After QBR:**
- Summary email with action items (for both Vayva and merchant)
- Updated optimization recommendations
- Next QBR scheduled

### 9.4 QBR Metrics Tracked

| Metric | Comparison |
|---|---|
| Total Revenue (through Vayva) | QoQ change |
| AI Conversations Handled | QoQ change |
| AI Conversion Rate | QoQ change + industry benchmark |
| Average Order Value | QoQ change |
| Customer Retention | Repeat purchase rate |
| AI Credit Usage | Trend and forecast |
| Support Tickets | Volume and resolution time |
| Feature Adoption | New features used |

---

## 10. Customer Success Team Structure

### 10.1 Current Team (0-500 Merchants)

| Role | Count | Responsibility |
|---|---|---|
| Head of Customer Success | 1 | Strategy, playbooks, metrics, team management |
| Customer Success Manager | 1 | Onboarding, health monitoring, upsell, QBRs |
| Support Agent | 1 | Tier 1 support, WhatsApp and email |

**Merchant-to-CSM ratio:** 250:1 (manageable with automation)

### 10.2 Scaled Team (500-2,000 Merchants)

| Role | Count | Responsibility |
|---|---|---|
| Head of Customer Success | 1 | Strategy, team management |
| Senior CSM (PRO PLUS) | 1 | Dedicated to PRO PLUS merchants, QBRs |
| CSM (PRO) | 2 | PRO merchant onboarding and success |
| CSM (STARTER) | 1 | STARTER merchant onboarding (heavily automated) |
| Support Lead | 1 | Support team management, escalations |
| Support Agent | 3 | Tier 1 support across channels |

**Merchant-to-CSM ratio:** 400:1 (with tiered automation)

### 10.3 Tools & Technology

| Tool | Purpose |
|---|---|
| Merchant Dashboard (internal) | Health scores, merchant data, playbook triggers |
| WhatsApp Business | Primary merchant communication channel |
| Email (automated sequences) | Onboarding, lifecycle, re-engagement |
| CRM | Merchant records, interaction history, pipeline |
| Analytics | Usage data, health scoring, churn prediction |

---

## 11. Escalation Framework

### 11.1 Escalation Levels

| Level | Trigger | Owner | Response Time |
|---|---|---|---|
| **L1** | General questions, how-to, basic troubleshooting | Support Agent | < 2 hours |
| **L2** | Technical issues, billing disputes, feature requests | CSM | < 4 hours |
| **L3** | Platform bugs, payment processing issues, AI failures | Engineering + CSM | < 1 hour |
| **L4** | Merchant threatening churn, data issues, legal concerns | Head of CS + Leadership | < 30 minutes |
| **L5** | Security incident, data breach, compliance issue | CTO + CEO | Immediate |

### 11.2 Escalation Communication

- **L1-L2:** WhatsApp or email response
- **L3:** WhatsApp message + phone call + internal Slack alert
- **L4:** Phone call + leadership briefing within 1 hour
- **L5:** All-hands alert + incident response protocol

---

## 12. Success Framework KPIs Summary

| Category | KPI | Target (Month 12) |
|---|---|---|
| **Onboarding** | Setup completion rate | 80% |
| **Onboarding** | Time to first sale | < 7 days |
| **Health** | % of merchants in Healthy status | 65% |
| **Health** | % of merchants in Critical status | < 5% |
| **Retention** | Monthly churn rate | 6% |
| **Retention** | Annual net revenue retention | 115% |
| **Satisfaction** | NPS | 55 |
| **Satisfaction** | CSAT (support) | 4.5/5 |
| **Expansion** | Monthly upgrade rate | 5% |
| **Expansion** | AI credit top-up rate | 25% |
| **Efficiency** | Merchant-to-CSM ratio | 400:1 |
| **Efficiency** | L1 support resolution time | < 2 hours |

---

*This document is confidential and intended for the customer success and operations teams. Distribution outside these groups requires written approval.*
