# Batch 4 Design Document: SAAS Industry Dashboard
## Signature Clean Design with Multi-Tenant Analytics

**Document Version:** 1.0  
**Industry:** SaaS & Software Platform  
**Design Category:** Signature Clean  
**Plan Tier Support:** Basic → Pro  
**Last Updated:** 2026-03-11

---

## 1. Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (Clean Professional - SaaS Platform)                                    │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo]  Dashboard  Subscriptions  Features  Usage  Tenants  Analytics  ▼      │  │
│  │                                                                  [🔔] [👤 Pro] │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  PLATFORM OVERVIEW                    [+ New Plan] [📊 MRR Report]             │  │
│  │  "CloudTech SaaS | March 2026"                                                │  │
│  │  Active Tenants: 847 | Uptime: 99.98% | Support Tickets: 12                    │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │     MRR     │ │    ARR      │ │  CHURN      │ │  ACTIVE     │ │   LTV       │   │
│  │   $84.2K    │ │   $1.01M    │ │    2.4%     │ │    847      │ │   $12,450   │   │
│  │   ↑ 12.8%   │ │   ↑ 15.3%   │ │   ↓ 0.8%    │ │   ↑ 8.2%    │ │   ↑ 18.4%   │   │
│  │   [Spark]   │ │   [Spark]   │ │   [Spark]   │ │   [Spark]   │ │   [Spark]   │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       RECURRING REVENUE                 │ │       TENANT GROWTH              │   │
│  │                                         │ │                                  │   │
│  │  MRR Breakdown: $84,200                 │ │  Tenant Growth (12 months):      │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │  Subscription Tiers:              │  │ │  │                            │  │   │
│  │  │  ┌─────────────────────────────┐  │  │ │  │  [Line Chart]              │  │   │
│  │  │  │ Starter    │ $18,420 (22%)  │  │  │ │  │                            │  │   │
│  │  │  │ ████████░░░░░░░░░░░░        │  │  │ │  │  Jan'25: 420 tenants       │  │   │
│  │  │  │                             │  │  │ │  │  Mar'26: 847 tenants       │  │   │
│  │  │  │ Professional │ $42,500 (50%)│  │  │ │  │  Growth: +101%             │  │   │
│  │  │  │ ██████████████████░░        │  │  │ │  │                            │  │   │
│  │  │  │                             │  │  │ │  │  This Month:               │  │   │
│  │  │  │ Enterprise │ $23,280 (28%)  │  │  │ │  │  • New: 42 tenants         │  │   │
│  │  │  │ ██████████░░░░░░░░░░        │  │  │ │  │  • Churned: 8 tenants      │  │   │
│  │  │  │                             │  │  │ │  │  • Net: +34 tenants        │  │   │
│  │  │  └─────────────────────────────┘  │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │  [View Tenant List]         │  │   │
│  │  │  Add-ons Revenue: $8,420 (10%)    │  │ │  │                            │  │   │
│  │  │  Expansion MRR: $12,450           │  │ │  │  Cohort Retention:          │  │   │
│  │  │  Contraction MRR: $3,240          │  │ │  │  Month 1: 98% ✓             │  │   │
│  │  │                                   │  │ │  │  Month 3: 94% ✓             │  │   │
│  │  │  [Revenue Analytics]              │  │ │  │  Month 6: 89% ⚠️            │  │   │
│  │  │                                   │  │ │  │  Month 12: 82% ⚠️           │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       FEATURE FLAGS                     │ │       USAGE ANALYTICS            │   │
│  │                                         │ │                                  │   │
│  │  Active Features: 24                    │ │  API Calls (Last 24h): 2.84M     │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ ✅ AI Dashboard (v2.4)            │  │ │  │  Usage by Endpoint:        │  │   │
│  │  │    Rollout: 100% (847 tenants)    │  │ │  │  ┌──────────────────────┐  │  │   │
│  │  │    Status: Stable ✓               │  │ │  │  │ /api/v1/data  42%    │  │  │   │
│  │  │    [Toggle] [Configure]           │  │ │  │  │ /api/v1/users 28%    │  │  │   │
│  │  │                                   │  │ │  │  │ /api/v1/reports 18%  │  │  │   │
│  │  │ 🟡 Dark Mode (v2.5)               │  │ │  │  │ /api/v1/auth   12%   │  │  │   │
│  │  │    Rollout: 45% (381 tenants)     │  │ │  │  └──────────────────────┘  │  │   │
│  │  │    Status: Monitoring ⚠️          │  │ │  │                            │  │   │
│  │  │    [Toggle] [Configure]           │  │ │  │  Bandwidth Usage:          │  │   │
│  │  │                                   │  │ │  │  Today: 847 GB             │  │   │
│  │  │ 🔴 Beta Analytics (v3.0)          │  │ │  │  This Month: 18.4 TB       │  │   │
│  │  │    Rollout: 5% (42 tenants)       │  │ │  │  Avg. per tenant: 21.7 GB  │  │   │
│  │  │    Status: Testing 🧪             │  │ │  │                            │  │   │
│  │  │    [Toggle] [Configure]           │  │ │  │  [Usage Dashboard]         │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ [Manage Features] [A/B Tests]     │  │ │  │  Top Consumers:            │  │   │
│  │  │                                   │  │ │  │ 1. Acme Corp - 84 GB/day   │  │   │
│  │  │  Upcoming Releases:               │  │ │  │ 2. TechStart - 62 GB/day   │  │   │
│  │  │ • Mobile App v2.6 (Apr 1)         │  │ │  │ 3. GlobalInc - 48 GB/day   │  │   │
│  │  │ • API v3 (Apr 15)                 │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       TENANT HEALTH                     │ │       CHURN RISK                 │   │
│  │                                         │ │                                  │   │
│  │  Tenant Satisfaction Score: 4.6/5.0     │ │  At-Risk Tenants: 24             │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 🟢 Healthy (742 tenants - 88%)    │  │ │  │ 🔴 High Risk (8 tenants)   │  │   │
│  │  │    • Active usage                 │  │ │  │ • TechCorp Inc             │  │   │
│  │  │    • Payments current             │  │ │  │   Last login: 14 days ago  │  │   │
│  │  │    • Support tickets < 3          │  │ │  │   Usage: -42% this month   │  │   │
│  │  │                                   │  │ │  │   [Intervene] [Email]      │  │   │
│  │  │ 🟡 At Risk (81 tenants - 9%)      │  │ │  │                            │  │   │
│  │  │    • Declining usage              │  │ │  │ • StartupXYZ               │  │   │
│  │  │    • Payment issues               │  │ │  │   Last login: 9 days ago   │  │   │
│  │  │    • Open support tickets > 5     │  │ │  │   Usage: -28% this month   │  │   │
│  │  │                                   │  │ │  │   [Intervene] [Call]       │  │   │
│  │  │ 🔴 Critical (24 tenants - 3%)     │  │ │  │                            │  │   │
│  │  │    • No login > 14 days           │  │ │  │ 🟡 Medium Risk (16)        │  │   │
│  │  │    • Usage decline > 30%          │  │ │  │ • Various tenants          │  │   │
│  │  │    • Cancellation requested       │  │ │  │   Monitoring active        │  │   │
│  │  │                                   │  │ │  │   [View All] [Actions]     │  │   │
│  │  │ [View All Tenants] [Health Report]│  │ │  │                            │  │   │
│  │  │                                   │  │ │  │ Churn Prediction Accuracy: │  │   │
│  │  │  NPS Score: 72 (Promoters: 68%)   │  │ │  │ 87% (Last 30 days)         │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                         AI INSIGHTS (Pro Tier Only)                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ 💡 Churn Alert: 3 enterprise tenants showing risk signals               │  │  │
│  │  │    Based on: Usage decline, support ticket patterns, login frequency    │  │  │
│  │  │    Recommendation: Schedule success calls, offer training sessions      │  │  │
│  │  │    Impact: Prevent $8,400 MRR churn                                     │  │  │
│  │  │  [View Risk List] [Create Campaign]                                     │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Category Application

### Signature Clean Design System

**Primary Palette:**
```
Background Primary:   #FFFFFF (Pure white)
Background Secondary: #F8FAFC (Light gray-blue)
Background Tertiary:  #F1F5F9 (Subtle panels)

Accent Primary:       #3B82F6 (Professional blue)
Accent Secondary:     #60A5FA (Soft blue)
Accent Tertiary:      #DBEAFE (Light blue highlight)

Text Primary:         #0F172A (Dark slate)
Text Secondary:       #475569 (Medium slate)
Text Tertiary:        #94A3B8 (Light slate)

Status Colors:
  Success:  #10B981 (Green)
  Warning:  #F59E0B (Amber)
  Error:    #EF4444 (Red)
  Info:     #3B82F6 (Blue)
```

---

*Continuing with complete specification...*

## 3. Component Hierarchy

```
SaaSDashboard (Root)
├── DashboardHeader
│   ├── BreadcrumbNav
│   ├── ActionButtons
│   │   ├── NewPlanButton
│   │   └── MRRReportButton
│   └── PlatformStatus
├── KPIRow (5 metrics)
│   └── SaaSMetricCard × 5
│       ├── SparklineChart
│       ├── TrendIndicator
│       └── ValueDisplay
├── ContentGrid (2 columns)
│   ├── LeftColumn
│   │   ├── RecurringRevenue
│   │   │   ├── MRRBreakdown
│   │   │   ├── TierChart
│   │   │   └── RevenueMetrics
│   │   ├── FeatureFlags
│   │   │   ├── FeatureCard × N
│   │   │   ├── RolloutSlider
│   │   │   └── StatusBadge
│   │   └── TenantHealth
│   │       ├── HealthScore
│   │       ├── TenantCategory × 3
│   │       └── NPSScore
│   └── RightColumn
│       ├── TenantGrowth
│       │   ├── GrowthChart
│       │   ├── MonthlyStats
│       │   └── CohortRetention
│       ├── UsageAnalytics
│       │   ├── APICallsChart
│       │   ├── EndpointBreakdown
│       │   └── TopConsumers
│       └── ChurnRisk
│           ├── AtRiskList
│           ├── RiskCard × N
│           └── PredictionAccuracy
└── AIInsightsPanel (Pro Tier)
    └── ChurnAlert
```

---

## 4. 5 Theme Presets

### Theme 1: Professional Blue (Default)
```
Primary:    #3B82F6
Secondary:  #60A5FA
Background: #FFFFFF
Surface:    #F8FAFC
Accent:     linear-gradient(135deg, #3B82F6, #60A5FA)
```

### Theme 2: Tech Purple
```
Primary:    #8B5CF6
Secondary:  #A78BVA
Background: #FFFFFF
Surface:    #F5F3FF
Accent:     linear-gradient(135deg, #8B5CF6, #A78BVA)
```

### Theme 3: Growth Green
```
Primary:    #10B981
Secondary:  #34D399
Background: #FFFFFF
Surface:    #ECFDF5
Accent:     linear-gradient(135deg, #10B981, #34D399)
```

### Theme 4: Enterprise Slate
```
Primary:    #64748B
Secondary:  #94A3B8
Background: #FFFFFF
Surface:    #F1F5F9
Accent:     linear-gradient(135deg, #64748B, #94A3B8)
```

### Theme 5: Innovation Orange
```
Primary:    #F97316
Secondary:  #FB923C
Background: #FFFFFF
Surface:    #FFF7ED
Accent:     linear-gradient(135deg, #F97316, #FB923C)
```

---

## 5. API Endpoints Mapping

### Required APIs for SaaS Dashboard

| Feature | API Endpoint | Method | Priority |
|---------|--------------|--------|----------|
| **Dashboard** ||||
| Get aggregate metrics | `/api/dashboard/aggregate` | GET | P0 |
| Get MRR data | `/api/saas/subscriptions/mrr` | GET | P0 |
| Get tenant growth | `/api/saas/tenants/growth` | GET | P0 |
| **Subscriptions** ||||
| List subscriptions | `/api/saas/subscriptions` | GET | P0 |
| Create subscription | `/api/saas/subscriptions` | POST | P0 |
| Update subscription | `/api/saas/subscriptions/:id` | PUT | P1 |
| Get subscription plans | `/api/saas/subscriptions/plans` | GET | P1 |
| Create plan | `/api/saas/subscriptions/plans` | POST | P1 |
| Update plan | `/api/saas/subscriptions/plans/:id` | PUT | P1 |
| **Features** ||||
| List features | `/api/saas/features` | GET | P1 |
| Create feature | `/api/saas/features` | POST | P1 |
| Update feature | `/api/saas/features/:id` | PUT | P1 |
| Get feature usage | `/api/saas/features/usage` | GET | P2 |
| **Usage** ||||
| Get usage metrics | `/api/saas/usage/metrics` | GET | P1 |
| Get usage by tenant | `/api/saas/usage/by-tenant` | GET | P1 |
| Get usage trends | `/api/saas/usage/trends` | GET | P2 |
| Get usage limits | `/api/saas/usage/limits` | GET | P1 |
| Create usage alert | `/api/saas/usage/alerts` | POST | P2 |
| **Tenants** ||||
| List tenants | `/api/saas/tenants` | GET | P0 |
| Create tenant | `/api/saas/tenants` | POST | P0 |
| Get tenant details | `/api/saas/tenants/:id` | GET | P1 |
| Update tenant | `/api/saas/tenants/:id` | PUT | P1 |
| Delete tenant | `/api/saas/tenants/:id` | DELETE | P2 |
| **API Keys** ||||
| List API keys | `/api/saas/api-keys` | GET | P2 |
| Create API key | `/api/saas/api-keys` | POST | P2 |
| Delete API key | `/api/saas/api-keys/:id` | DELETE | P2 |
| **Webhooks** ||||
| List webhooks | `/api/saas/webhooks` | GET | P2 |
| Create webhook | `/api/saas/webhooks` | POST | P2 |
| Update webhook | `/api/saas/webhooks/:id` | PUT | P2 |
| **Churn** ||||
| Get churn analysis | `/api/saas/churn/analysis` | GET | P2 |
| Get churn risk score | `/api/saas/churn/risk-score` | GET | P2 |

---

*Document generated as part of Batch 4 Design Documents - SaaS Industry*
