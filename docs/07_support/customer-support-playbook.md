# Customer Support Playbook

> Last updated: 2026-03-23 | Version: 1.0

## 1. Support Channels

| Channel | Hours | Use Case | Tool |
|---------|-------|----------|------|
| **WhatsApp** | 24/7 (AI) + 8am–8pm WAT (human) | Quick questions, order issues, account help | Evolution API via dedicated support number |
| **Email** | support@vayva.ng | Billing disputes, account recovery, formal complaints | Shared inbox (help desk) |
| **In-App Chat** | 24/7 (AI) + 8am–8pm WAT (human) | Feature guidance, onboarding, bug reports | Merchant dashboard widget |
| **Phone** | 9am–5pm WAT (Mon–Fri) | Escalated issues, VIP merchants (Pro+ only) | Direct line |

### Channel Routing Rules

- All inbound messages are triaged by the AI support bot first.
- If the AI cannot resolve within 2 exchanges, it hands off to a human agent.
- WhatsApp is the primary channel for Nigerian merchants; prioritise it.

---

## 2. Ticket Categories

| Category Code | Category | Description | Default Priority |
|---------------|----------|-------------|-----------------|
| `BILLING` | Billing & Payments | Subscription charges, withdrawals, Paystack issues | P2 |
| `AI_AGENT` | AI Agent | Credits depleted, agent misbehaviour, autopilot errors | P2 |
| `WHATSAPP` | WhatsApp Setup | Instance creation, QR pairing, message delivery failures | P2 |
| `STOREFRONT` | Storefront | Domain issues, page not loading, template problems | P3 |
| `PRODUCTS` | Product Management | Upload failures, variant issues, inventory sync | P3 |
| `ORDERS` | Order Management | Missing orders, fulfilment errors, status updates | P2 |
| `ACCOUNT` | Account & Security | Login issues, password reset, account lockout | P1 |
| `ONBOARDING` | Onboarding | New merchant setup, first-time configuration | P3 |
| `BUG` | Bug Report | Platform errors, crashes, unexpected behaviour | P2 |
| `FEATURE_REQ` | Feature Request | Enhancement suggestions, new capability requests | P4 |

---

## 3. Response Time SLAs

| Priority | Definition | First Response | Resolution Target | Examples |
|----------|-----------|---------------|-------------------|----------|
| **P1 — Critical** | Service down, payment processing broken, account compromised | **1 hour** | 4 hours | Paystack webhook failure, merchant locked out, storefront 502 |
| **P2 — High** | Major feature impaired, significant revenue impact | **4 hours** | 24 hours | AI agent not responding, orders not syncing, withdrawal stuck |
| **P3 — Medium** | Feature degraded, workaround available | **24 hours** | 72 hours | Template rendering issue, product image upload fails, analytics gap |
| **P4 — Low** | Cosmetic issue, feature request, general inquiry | **48 hours** | 1 week | UI alignment, colour preference, feature suggestion |

### SLA Escalation Triggers

- P1 not acknowledged within 30 minutes: auto-escalate to L2 + notify engineering lead.
- P2 not resolved within 12 hours: auto-escalate to L2.
- Any ticket open > 5 days without update: auto-flag for manager review.

---

## 4. Common Issues and Resolutions

### 4.1 Billing & Payments

| Issue | Root Cause | Resolution |
|-------|-----------|------------|
| "I was charged but my plan didn't activate" | Paystack webhook delayed or failed | Verify transaction on Paystack dashboard. If successful, manually activate plan via Ops Console. |
| "My withdrawal is pending" | Paystack transfer queue or insufficient balance | Check Paystack transfer status. 3% withdrawal fee may have reduced available amount. Inform merchant of processing time (24–48 hours). |
| "I want a refund" | Trial ended, double charge, or dissatisfaction | Check refund eligibility (within 7-day trial = full refund). Process via Paystack refund API. Escalate to billing manager for amounts > ₦50,000. |
| "Why is there a 3% fee on withdrawals?" | Platform fee structure | Explain: Vayva charges a 3% fee on every withdrawal to cover payment processing and platform costs. This is standard across the platform. |

### 4.2 AI Agent & Credits

| Issue | Root Cause | Resolution |
|-------|-----------|------------|
| "My AI agent stopped responding" | Credits depleted | Check credit balance via Ops Console. Guide merchant to purchase top-up (₦3,000 for 3,000 credits). |
| "The AI gave wrong information to my customer" | Insufficient product data or hallucination | Review conversation logs. Update product descriptions. Adjust AI agent instructions in merchant dashboard. |
| "How do I get more credits?" | Needs top-up information | Share top-up packages: Small (3K credits / ₦3,000), Medium (8K / ₦7,000), Large (20K / ₦15,000). |
| "AI Autopilot is not available" | Starter plan limitation | AI Autopilot requires Pro plan or higher. Guide to upgrade path. |

### 4.3 WhatsApp

| Issue | Root Cause | Resolution |
|-------|-----------|------------|
| "I can't scan the QR code" | QR expired or instance not created | Regenerate QR via `WhatsappManager.connectInstance()`. Ensure instance exists first. |
| "Messages are not being delivered" | Instance disconnected, rate limited, or phone offline | Check instance status via Evolution API. Verify phone has internet. Check for WhatsApp Business policy violations. |
| "I got logged out of WhatsApp" | Multi-device session ended | Re-pair the instance. Instruct merchant to keep the connected phone online. |

### 4.4 Storefront

| Issue | Root Cause | Resolution |
|-------|-----------|------------|
| "My storefront is not loading" | DNS misconfiguration or build failure | Check `*.vayva.ng` subdomain assignment. Verify build status. Clear CDN cache if needed. |
| "I want a custom domain" | Feature requires Pro plan | Custom domains are available on Pro and Pro+ plans. Guide upgrade or configure subdomain. |

### 4.5 Account & Security

| Issue | Root Cause | Resolution |
|-------|-----------|------------|
| "I forgot my password" | Standard password reset | Send password reset link via email. Verify identity with registered phone number. |
| "Someone accessed my account" | Potential security breach | Immediately reset password, revoke active sessions, review recent activity logs, escalate to security team. |

---

## 5. Escalation Matrix

| Level | Role | Handles | Response Time |
|-------|------|---------|--------------|
| **L1 — Frontline** | Support Agent | FAQs, account queries, billing questions, basic troubleshooting | Immediate |
| **L2 — Technical** | Senior Support / Tech Lead | Complex integrations, API issues, WhatsApp reconnection, data discrepancies | 2 hours |
| **L3 — Engineering** | Engineering Team | Bug fixes, infrastructure issues, Paystack webhook failures, database problems | 4 hours |
| **L4 — Management** | Product / Engineering Lead | Service outages, data breaches, legal/compliance, merchant churn risk | 1 hour |

See [Escalation Procedures](./escalation-procedures.md) for detailed handoff protocols.

---

## 6. Tools Used

| Tool | Purpose | Access |
|------|---------|--------|
| **Ops Console** | Merchant management, subscription status, credit balance, usage analytics | Internal web app |
| **Paystack Dashboard** | Payment verification, refunds, transfer status | paystack.com |
| **Evolution API Dashboard** | WhatsApp instance management, connection status, message logs | Self-hosted |
| **Vercel Dashboard** | Storefront deployment status, build logs, domain management | vercel.com |
| **Database (Prisma)** | Direct data queries for edge cases (engineering only) | CLI / pgAdmin |
| **Logging (Application Logs)** | Error tracing, request debugging | Server logs |

---

## 7. Canned Responses

### 7.1 Greeting

```
Hi [Name]! Welcome to Vayva Support. I'm here to help you with your store. What can I assist you with today?
```

### 7.2 Credit Balance Inquiry

```
Hi [Name], I've checked your account. You currently have [X] AI credits remaining out of [Y] total.

Your plan ([Plan Name]) includes [Z] credits per month. If you need more, you can purchase a top-up:
- 3,000 credits — ₦3,000
- 8,000 credits — ₦7,000
- 20,000 credits — ₦15,000

Would you like to top up?
```

### 7.3 Plan Comparison

```
Here's a quick comparison of our plans:

Starter (₦25,000/mo): 500 products, 1 staff seat, 5,000 AI credits, WhatsApp automation, 7-day free trial
Pro (₦35,000/mo): 1,000 products, 3 staff seats, 10,000 AI credits, AI Autopilot, custom domain, 7-day free trial
Pro+ (₦50,000/mo): Unlimited products, 5 staff seats, 25,000 AI credits, visual workflow builder, industry dashboards, priority support

All plans include Paystack payments, storefront at yourname.vayva.ng, and WhatsApp integration.
```

### 7.4 Withdrawal Fee Explanation

```
Hi [Name], Vayva charges a 3% processing fee on all withdrawals. For example, if you withdraw ₦100,000, the fee would be ₦3,000, and you'd receive ₦97,000.

This fee covers payment processing costs through our banking partner. The fee is deducted automatically when you initiate a withdrawal.
```

### 7.5 WhatsApp Disconnection

```
Hi [Name], it looks like your WhatsApp connection has been disconnected. This can happen if:

1. Your phone lost internet connection
2. You logged into WhatsApp Web on another device
3. The session expired

To reconnect:
1. Go to your Vayva dashboard → Settings → WhatsApp
2. Click "Reconnect WhatsApp"
3. Scan the QR code with your phone (WhatsApp → Linked Devices → Link a Device)

If the issue persists, please let me know and I'll escalate to our technical team.
```

### 7.6 Trial Ending Soon

```
Hi [Name], your 7-day free trial for the [Plan] plan ends on [Date].

To continue using Vayva without interruption, please add a payment method in your dashboard under Settings → Billing. Your card will be charged ₦[Amount] on your billing date.

If you have any questions about the platform before committing, I'm happy to help!
```

### 7.7 Subscription Cancellation

```
Hi [Name], I'm sorry to hear you're considering cancelling. Before you go, I'd love to understand what's not working for you so we can try to help.

If you'd still like to cancel:
1. Go to Settings → Billing → Manage Subscription
2. Click "Cancel Subscription"
3. Your access will continue until the end of your current billing period

Your data will be retained for 30 days after cancellation in case you change your mind.
```

### 7.8 Bug Report Acknowledgement

```
Hi [Name], thank you for reporting this issue. I've logged it with our engineering team with the following details:

Issue: [Brief description]
Reference: #[Ticket ID]
Priority: [P level]

We'll investigate and get back to you within [SLA timeframe]. In the meantime, [workaround if available].
```

### 7.9 Feature Not Available on Current Plan

```
Hi [Name], the [Feature Name] feature is available on the [Required Plan] plan and above. You're currently on the [Current Plan] plan.

Would you like to upgrade? You can do so directly from your dashboard under Settings → Billing → Upgrade Plan. The price difference will be prorated for the remainder of your billing cycle.
```

### 7.10 Closing a Resolved Ticket

```
Hi [Name], glad we could resolve that for you! I'm closing this ticket now.

If you need anything else, don't hesitate to reach out. We're always here to help your business grow. Have a great day!
```

---

## 8. Support Quality Standards

- **Tone**: Professional, warm, and empathetic. Use the merchant's name. Avoid jargon.
- **Language**: English is primary. Support Pidgin English informally on WhatsApp if the merchant initiates.
- **Follow-up**: All P1 and P2 tickets require a follow-up message within 24 hours of resolution.
- **CSAT**: Send satisfaction survey after every resolved ticket. Target: 90%+ satisfaction.
- **First Contact Resolution (FCR)**: Target 70% of tickets resolved on first contact.
- **Knowledge Base**: Update canned responses and FAQ when a new recurring issue is identified (3+ occurrences).
