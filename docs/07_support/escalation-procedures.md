# Escalation Procedures

> Defines how support issues move through escalation levels, handoff protocols, and resolution tracking.

---

## 1. Escalation Levels

### L1 — Frontline Support

**Staffed by**: Support Agents
**Channel**: WhatsApp, email, in-app chat
**Scope**:
- Account and login assistance
- Basic billing questions (plan details, pricing, trial status)
- Product/order FAQ and how-to guidance
- WhatsApp reconnection (QR code re-scanning)
- AI credit balance inquiries and top-up guidance
- Canned response delivery
- Storefront access verification

**Tools available**: Ops Console (read-only merchant data), canned responses, FAQ knowledge base

**Resolution target**: 70% of tickets resolved at L1

---

### L2 — Technical Support

**Staffed by**: Senior Support Agents, Technical Support Engineers
**Channel**: Internal handoff from L1, direct for Pro+ merchants
**Scope**:
- WhatsApp instance troubleshooting (Evolution API status checks, instance recreation)
- Paystack transaction verification and reconciliation
- Storefront build failures and DNS configuration
- AI agent behaviour investigation (conversation log review)
- Data discrepancies (order counts, credit balances not matching)
- Subscription state corrections via Ops Console
- Webhook delivery verification

**Tools available**: Ops Console (read/write), Paystack Dashboard, Evolution API admin, application logs, Vercel dashboard

**Resolution target**: Resolve within 24 hours of handoff

---

### L3 — Engineering

**Staffed by**: Backend and Frontend Engineers
**Channel**: Internal ticket system (from L2)
**Scope**:
- Bug fixes requiring code changes
- Database corrections and migrations
- API integration failures (OpenRouter, Paystack, Evolution API)
- Infrastructure issues (server errors, memory leaks, deployment failures)
- Performance degradation investigation
- Webhook endpoint repairs
- Credit calculation discrepancies requiring code review

**Tools available**: Full codebase access, database (Prisma/PostgreSQL), server SSH, Vercel deployment, monitoring dashboards

**Resolution target**: P1 bugs within 4 hours, P2 within 24 hours, P3 within 72 hours

---

### L4 — Management

**Staffed by**: Engineering Lead, Product Lead, CEO
**Channel**: Direct communication (Slack, phone)
**Scope**:
- Platform-wide outages affecting multiple merchants
- Security incidents and data breaches
- Legal and compliance matters (NDPR violations, disputes)
- High-value merchant churn risk (merchants threatening to leave)
- Financial discrepancies > ₦100,000
- PR-sensitive issues (public complaints, social media escalations)
- Strategic decisions on SLA exceptions or goodwill gestures

**Resolution target**: Immediate acknowledgement, resolution per severity

---

## 2. Escalation Criteria

### When to Escalate from L1 to L2

Escalate immediately if any of the following apply:

- [ ] The issue cannot be resolved using canned responses or the FAQ
- [ ] The merchant reports a payment that Paystack shows as successful but the platform does not reflect
- [ ] WhatsApp instance shows as disconnected and standard reconnection steps fail
- [ ] The AI agent is producing incorrect or harmful responses
- [ ] The merchant is on a Pro+ plan and requests priority handling
- [ ] The issue has been open for more than 4 hours without resolution
- [ ] The merchant explicitly requests to speak with a technical specialist

### When to Escalate from L2 to L3

Escalate immediately if any of the following apply:

- [ ] The issue requires a code change or database modification
- [ ] A Paystack webhook is not being received or processed correctly
- [ ] The Evolution API is returning errors that cannot be resolved through configuration
- [ ] OpenRouter API is returning errors or the AI model is unavailable
- [ ] Storefront builds are failing on Vercel with deployment errors
- [ ] Credit deductions are mathematically incorrect (suspected calculation bug)
- [ ] The issue affects more than one merchant simultaneously
- [ ] L2 has spent more than 4 hours investigating without identifying root cause

### When to Escalate from L3 to L4

Escalate immediately if any of the following apply:

- [ ] Platform-wide outage (multiple merchants affected, core service down)
- [ ] Confirmed security breach or data exposure
- [ ] Financial discrepancy exceeding ₦100,000
- [ ] Merchant with > ₦500,000 monthly volume threatens to churn
- [ ] Legal threat or regulatory inquiry received
- [ ] Issue requires external vendor escalation (Paystack, Meta/WhatsApp)
- [ ] Resolution requires a policy or pricing change

---

## 3. Handoff Procedures

### L1 to L2 Handoff

1. **Document the issue** in the ticket system with:
   - Merchant ID and store name
   - Plan tier (Starter / Pro / Pro+)
   - Channel of contact (WhatsApp / email / in-app)
   - Detailed description of the problem
   - Steps already taken and their results
   - Screenshots or conversation logs if available
   - Merchant's emotional state (calm, frustrated, angry)

2. **Notify the merchant**:
   ```
   Hi [Name], I'm connecting you with our technical support team for further
   assistance. They have all the details of your issue and will reach out
   within [SLA time]. Your reference number is #[Ticket ID].
   ```

3. **Assign the ticket** to the L2 queue with the appropriate priority tag.

4. **Warm handoff preferred**: If the L2 agent is available, introduce them directly in the conversation rather than making the merchant repeat their issue.

### L2 to L3 Handoff

1. **Create an engineering ticket** with:
   - Ticket reference from support system
   - Technical diagnosis and findings so far
   - Relevant logs, error messages, and stack traces
   - Steps to reproduce the issue
   - Affected merchant(s) and their plan tier
   - Business impact assessment (revenue at risk, number of merchants affected)

2. **Tag the appropriate engineering domain**:
   - `backend` — API, database, billing, credits
   - `frontend` — Dashboard, storefront, UI
   - `infra` — Deployment, servers, DNS
   - `integrations` — Paystack, Evolution API, OpenRouter

3. **Continue merchant communication**: L2 remains the merchant-facing contact while L3 investigates. The merchant should not be bounced to engineering directly.

### L3 to L4 Handoff

1. **Incident report** including:
   - Severity classification and business impact
   - Technical root cause (if identified)
   - Number of merchants affected
   - Revenue impact estimate
   - Timeline of events
   - Actions taken so far

2. **Direct communication**: Call or message the relevant L4 person immediately for P1 issues. Do not rely on ticket assignment alone.

3. **Status page update**: If the issue is platform-wide, update the status page and prepare merchant-facing communication.

---

## 4. Resolution Tracking

### Ticket Lifecycle

```
OPEN → IN PROGRESS → WAITING ON MERCHANT → ESCALATED → RESOLVED → CLOSED
```

### Required Fields for Resolution

Every resolved ticket must include:

| Field | Description |
|-------|-------------|
| **Root cause** | What caused the issue |
| **Resolution** | What was done to fix it |
| **Time to resolve** | Total elapsed time from ticket creation to resolution |
| **Escalation path** | Which levels were involved (L1, L2, L3, L4) |
| **SLA met** | Whether the response and resolution SLAs were met |
| **Prevention** | What can be done to prevent recurrence (if applicable) |
| **Credits/goodwill** | Any credits or compensation offered to the merchant |

### Weekly Metrics to Track

- Total tickets by category and priority
- Average first response time by channel
- Average resolution time by priority
- Escalation rate (% of tickets escalated from L1)
- SLA compliance rate
- First contact resolution rate
- Customer satisfaction score (CSAT)
- Top 5 recurring issues

---

## 5. Post-Resolution Follow-Up

### Within 24 Hours of Resolution

1. **Confirm resolution with the merchant**:
   ```
   Hi [Name], we wanted to confirm that the [issue description] has been
   resolved. Is everything working correctly now? Please let us know if
   you experience any further issues.
   ```

2. **Send CSAT survey** (1–5 scale):
   ```
   How would you rate your support experience? (1 = Very Poor, 5 = Excellent)
   ```

### Within 48 Hours (for P1 and P2 issues)

3. **Internal post-mortem** (for P1 issues only):
   - What happened?
   - Why did it happen?
   - How was it detected?
   - How was it resolved?
   - What will prevent recurrence?

4. **Knowledge base update**: If the issue represents a new pattern, add it to the FAQ and canned responses.

### Within 1 Week (for Escalated Issues)

5. **Proactive check-in**:
   ```
   Hi [Name], just checking in to make sure everything has been running
   smoothly since we resolved [issue]. Is there anything else we can
   help with?
   ```

6. **Churn risk assessment**: If the merchant expressed strong dissatisfaction, flag for account management review and consider a goodwill gesture (bonus credits, plan discount).

---

## 6. Emergency Procedures

### Platform Outage (P1 — All Merchants Affected)

1. Engineering lead notified immediately (phone call, not just message)
2. Status page updated within 15 minutes
3. Merchant-facing message sent via email and WhatsApp within 30 minutes
4. Engineering war room opened — all hands until resolved
5. Updates posted every 30 minutes until resolved
6. Post-mortem within 24 hours of resolution
7. Merchant communication with root cause and prevention steps within 48 hours

### Security Incident

1. Immediately isolate affected systems
2. Notify CEO and legal counsel
3. Assess scope of data exposure
4. Notify affected merchants within 72 hours (NDPR requirement)
5. Engage incident response procedures per security policy
6. File regulatory notification if required

### Payment Processing Failure

1. Verify Paystack API status at [status.paystack.com](https://status.paystack.com)
2. If Paystack is down: notify merchants, pause order processing, monitor for recovery
3. If Vayva webhook is down: engineering L3 immediate response, manual order reconciliation
4. Post-recovery: reconcile all pending transactions, notify affected merchants
