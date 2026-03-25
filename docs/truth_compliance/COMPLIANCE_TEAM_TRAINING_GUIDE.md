# Compliance Team Training Guide

**Version:** 1.0  
**Date:** March 18, 2026  
**Audience:** Compliance Officers, Support Team, Engineering Leads  

---

## 📚 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Subprocessor Management](#subprocessor-management)
3. [Cookie Consent Analytics](#cookie-consent-analytics)
4. [Accessibility Issues Tracker](#accessibility-issues-tracker)
5. [SLA Monitoring & Breach Notifications](#sla-monitoring--breach-notifications)
6. [PDF Export & Reporting](#pdf-export--reporting)
7. [Escalation Procedures](#escalation-procedures)

---

## 🎯 OVERVIEW

### What's Been Built

Vayva has implemented a **zero-cost, self-built compliance infrastructure** that enables the team to:

✅ Manage subprocessors (GDPR Article 28 transparency)  
✅ Track cookie consent rates (GDPR ePrivacy compliance)  
✅ Monitor accessibility issues (WCAG 2.1 AA progress)  
✅ Enforce SLA targets with automated breach notifications  
✅ Generate professional PDF reports for audits  

### Access Points

| System | URL | Audience |
|--------|-----|----------|
| **Subprocessor Admin** | `ops.vayva.ng/admin/subprocessors` | Compliance Team |
| **Cookie Analytics** | `ops.vayva.ng/analytics/cookie-consent` | Compliance + Marketing |
| **Accessibility Tracker** | `ops.vayva.ng/support/accessibility` | Support + Engineering |

---

## ⚖️ SUBPROCESSOR MANAGEMENT

### What Is a Subprocessor?

A **subprocessor** is any third-party service provider that processes personal data on behalf of Vayva merchants. Examples:

- **Paystack** - Payment processing
- **MinIO** - Cloud storage
- **Cloudflare** - CDN & security
- **Google Analytics** - Analytics
- **Hotjar** - User behavior analytics

### GDPR Requirements

Under **GDPR Article 28(3)**, you must:

1. ✅ Maintain public list of all subprocessors
2. ✅ Ensure each subprocessor has signed DPA with Standard Contractual Clauses (SCCs)
3. ✅ Give merchants 30 days notice before adding new subprocessors
4. ✅ Allow merchants to object to new subprocessors

### How to Add a New Subprocessor

#### Step 1: Collect Required Information

Navigate to: **Ops Console → Admin → Subprocessors → Add Subprocessor**

You'll need:

```
- Service Provider Name (e.g., "SendGrid Inc.")
- Category (select from dropdown)
- Purpose (what data processing they perform)
- Data Processed (categories of personal data)
- Location (countries where data is processed)
- Safeguards (certifications: SOC 2, ISO 27001, PCI DSS, etc.)
- Website URL (privacy policy link)
- DPA Status (Signed with SCCs / Pending)
```

#### Step 2: Risk Assessment

Before adding, verify:

- ☐ Subprocessor has adequate security certifications
- ☐ DPA with SCCs is signed (for international transfers)
- ☐ Privacy policy reviewed and acceptable
- ☐ No history of data breaches (Google it!)

#### Step 3: Merchant Notification

Once added to the system:

1. System automatically logs addition date
2. Send email to all active merchants:
   ```
   Subject: New Subprocessor Added - [Name]
   
   Dear Merchant,
   
   We're adding [Subprocessor Name] to our authorized subprocessors list.
   They provide [service description] to enhance our platform.
   
   Your rights:
   - Review details: vayva.ng/legal/subprocessors
   - Object within 30 days: support@vayva.ng
   - Full data processing agreement available on request
   
   Best regards,
   Vayva Compliance Team
   ```

#### Step 4: Quarterly Audits

Every quarter, review each subprocessor:

- ☐ Still in business?
- ☐ Any data breaches since last review?
- ☐ Certifications still valid?
- ☐ DPA needs renewal?

**Pro Tip:** Set calendar reminder for first week of each quarter.

---

## 🍪 COOKIE CONSENT ANALYTICS

### Why This Matters

Under **GDPR Article 7(1)**, you must be able to **demonstrate** valid consent. The analytics dashboard shows:

- How many users accepted vs rejected cookies
- Consent trends over time (are we getting more privacy-conscious?)
- Geographic breakdown (EU users tend to reject more)
- Compliance health indicators

### Dashboard Metrics Explained

Navigate to: **Ops Console → Analytics → Cookie Consent**

#### Key Metrics

| Metric | What It Means | Good Range |
|--------|---------------|------------|
| **Consent Rate** | % who accepted or customized | 45-65% |
| **Rejection Rate** | % who rejected all cookies | 25-40% |
| **Customize Rate** | % who picked granular options | 15-25% |
| **Trend** | 7-day comparison | Stable or ↑ |

#### Understanding the Numbers

**Example Scenario:**

```
Total Visitors: 45,678
Consent Rate: 52.3%
  → Accept All: 32.7%
  → Customize: 19.6%
Rejection Rate: 28.1%
```

**Interpretation:**
- ✅ Healthy balance - not everyone accepts (shows banner is not manipulative)
- ✅ Customize rate shows users value granular control
- ✅ Rejection rate is reasonable (not suspiciously low)

**Red Flags:**
- ❌ Consent rate >90% (banner might be manipulative)
- ❌ Rejection rate <5% (dark patterns suspected)
- ❌ Trend declining (users becoming more privacy-conscious or banner fatigue)

### Monthly Reporting

**First Monday of each month:**

1. Go to Cookie Analytics dashboard
2. Set date range to "Last 30 days"
3. Click "Export Report"
4. Save PDF to: `compliance/reports/cookie-consent/YYYY-MM.pdf`
5. Email summary to CTO:
   ```
   Subject: Monthly Cookie Consent Report - [Month YYYY]
   
   Hi [CTO],
   
   Cookie consent metrics for [month]:
   - Total visitors: XX,XXX
   - Consent rate: XX.X% (↑/↓ X% from last month)
   - Rejection rate: XX.X%
   - Trend: Improving/Stable/Declining
   
   No compliance concerns identified.
   
   Full report attached.
   
   Best,
   Compliance Team
   ```

---

## ♿ ACCESSIBILITY ISSUES TRACKER

### WCAG 2.1 AA Compliance

Vayva is committed to achieving **WCAG 2.1 Level AA** conformance. This tracker manages:

- User-reported accessibility barriers
- Internal audit findings
- JONAPWD (Nigeria) partnership feedback
- Community suggestions

### Severity Levels

| Severity | Definition | SLA Target | Example |
|----------|------------|-----------|---------|
| **Critical** | Completely blocks users with disabilities | 7 days | Checkout page not keyboard-accessible |
| **High** | Major feature difficult to use | 14 days | Product images missing alt text |
| **Medium** | Some users experience difficulty | 30 days | Low contrast text in some areas |
| **Low** | Minor inconvenience | 90 days | Focus indicator could be more visible |

### How to Log an Accessibility Issue

#### Option 1: User Report via Email

When user emails `accessibility@vayva.ng`:

1. **Acknowledge within 24 hours:**
   ```
   Subject: Re: Accessibility Issue - [Brief Description]
   
   Dear [Name],
   
   Thank you for reporting this accessibility concern. We take these matters seriously.
   
   Reference number: ACC-XXX
   Assigned to: Accessibility Team
   Target resolution: [Date based on severity]
   
   We'll update you within 48 hours with our action plan.
   
   Best regards,
   Vayva Accessibility Team
   ```

2. **Create issue in Ops Console:**
   - Navigate to: **Support → Accessibility Issues → Add Issue**
   - Fill in all fields
   - Upload screenshots if provided
   - Tag as `user-reported`

#### Option 2: Internal Audit Finding

During monthly accessibility audits:

1. Use axe DevTools, WAVE, or Lighthouse
2. Document each issue found
3. Create ticket with severity assessment
4. Assign to appropriate engineering team

### Triage Process

**Every Monday morning:**

1. Review newly reported issues (status: `reported`)
2. Assess severity using WCAG criteria
3. Update status to `triaged`
4. Assign to engineering team lead
5. Set target resolution date

**Severity Assessment Questions:**

```
Q: Does this prevent task completion?
   Yes → Critical or High
   No → Continue

Q: Does this affect multiple pages or just one?
   Multiple → Increase severity level
   Single → Keep as-is

Q: Is there a workaround?
   Yes → Decrease severity level
   No → Increase severity level

Q: How many users affected?
   All screen reader users → High+
   Some users → Medium
   Few users → Low
```

### Monitoring Progress

**Weekly Check-ins:**

- Review issues approaching SLA deadline (7-day warning)
- Unblock engineering teams if needed
- Escalate critical breaches to CTO

**Monthly Reports:**

- Total issues resolved vs opened
- Average resolution time
- Current compliance rate
- Top 3 recurring themes

---

## 🚨 SLA MONITORING & BREACH NOTIFICATIONS

### Automated System Overview

The SLA monitoring system runs **daily at 9:00 AM WAT** and:

1. Checks all open accessibility issues
2. Calculates days remaining until deadline
3. Sends warning emails (7 days before deadline)
4. Sends breach notifications (past deadline)
5. Sends weekly summary to leadership if ≥3 breaches

### Notification Types

#### 1. Warning Notification (7 Days Before Deadline)

**Recipients:** Assigned engineer + Compliance team  
**Subject:** ⚠️ SLA Warning: X Issue(s) Approaching Deadline

**Content:**
- List of issues due within 7 days
- Direct links to Ops Console
- Severity badges
- Days remaining countdown

#### 2. Breach Notification (Past Deadline)

**Recipients:** Assigned engineer + Compliance + CTO  
**Subject:** 🚨 SLA BREACH: X Issue(s) Overdue - Action Required

**Content:**
- List of breached issues
- Days overdue
- Severity highlighting (critical = red alert)
- Immediate action required checklist

#### 3. Leadership Summary (If ≥3 Breaches)

**Recipients:** CTO, Compliance Lead  
**Subject:** 📊 Weekly SLA Breach Summary: X Issues Overdue

**Content:**
- Table of all breaches
- Severity distribution
- Team performance insights
- Resource allocation recommendations

### Your Role in the Process

#### Compliance Officer Responsibilities

**Daily (automated):**
- System checks for breaches
- You receive breach notification emails
- Review and follow up with assignees

**Weekly:**
- Monday: Review previous week's breaches
- Wednesday: Check on issues approaching deadline
- Friday: Prepare weekly summary if needed

**Monthly:**
- Compile SLA compliance rate
- Identify patterns (which teams consistently miss deadlines?)
- Recommend process improvements

#### When You Receive a Breach Alert

**Immediate Actions (within 2 hours):**

1. **Review the breach:**
   - Is it marked correctly?
   - Was work actually done but not updated in system?
   - Is the assignee correct?

2. **Contact assignee:**
   ```
   Hi [Name],
   
   I see ACC-XXX ([Issue Title]) is now X days overdue.
   
   Can you please:
   1. Confirm current status
   2. Provide updated ETA
   3. Let me know if you need any support
   
   Thanks,
   Compliance Team
   ```

3. **Update issue record:**
   - Change status if needed
   - Add comment documenting conversation
   - Adjust target date if legitimately blocked

#### Escalation Matrix

| Situation | Action | Timeline |
|-----------|--------|----------|
| 1-2 breaches | Email assignee | Within 2 hours |
| 3-5 breaches | Email assignee + Team Lead | Same day |
| 6+ breaches | Email assignee + Team Lead + CTO | Same day |
| Critical breach | Call assignee + Email CTO | Immediately |
| Repeat offender (3+ breaches/month) | Performance review flag | End of month |

---

## 📄 PDF EXPORT & REPORTING

### Available Reports

You can generate professional PDF reports for:

1. **Cookie Consent Analytics** - Monthly compliance documentation
2. **Subprocessors List** - On-demand for procurement due diligence
3. **Accessibility Summary** - Quarterly WCAG progress reports

### How to Export Reports

#### Cookie Consent Report

1. Navigate to: **Analytics → Cookie Consent**
2. Select date range (usually "Last 30 days")
3. Click **"Export Report"** button
4. Browser print dialog opens
5. Select **"Save as PDF"** as destination
6. Filename auto-populated: `cookie-consent-report-YYYY-MM-DD.pdf`
7. Save to: `compliance/reports/cookie-consent/`

**What's Included:**
- Executive summary with key metrics
- Detailed breakdown (Accept/Reject/Customize)
- 7-day trend visualization
- Geographic distribution
- Compliance documentation notes

#### Subprocessors Report

1. Navigate to: **Admin → Subprocessors**
2. Click **"Export to PDF"**
3. Follow same save process as above
4. Save to: `compliance/reports/subprocessors/`

**Use Cases:**
- Enterprise sales procurement requests
- Investor due diligence
- Regulatory audits
- Annual compliance reviews

### Report Retention Policy

**Keep for 7 years:**
- Monthly cookie consent reports
- Subprocessors lists (quarterly versions)
- Accessibility audit summaries
- SLA compliance reports

**Storage:**
- Primary: Google Drive (`compliance/reports/`)
- Backup: MinIO (`vayva-compliance-archive/`)
- Access: Compliance team + CTO + Legal counsel

---

## 🔗 ESCALATION PROCEDURES

### Level 1: Team Resolution (0-24 hours)

**Handled by:** Assigned engineer + Compliance officer

**Process:**
1. Identify issue (breach, user complaint, audit finding)
2. Assess severity
3. Attempt direct resolution
4. Document actions taken

**Success Criteria:**
- Issue resolved within SLA
- User satisfied (if external complaint)
- No systemic pattern

### Level 2: Management Escalation (24-72 hours)

**Triggered when:**
- Team cannot resolve independently
- Multiple related breaches
- User threatens legal action
- Pattern of repeat violations

**Involved:**
- Team Lead
- Compliance Manager
- Department Head

**Actions:**
1. Emergency triage meeting
2. Root cause analysis
3. Resource reallocation if needed
4. Communication plan for affected users

### Level 3: Executive Escalation (Immediate)

**Triggered when:**
- Critical accessibility breach affecting core functionality
- Data breach involving subprocessor
- Regulatory investigation initiated
- Class-action threat

**Involved:**
- CTO
- Legal Counsel
- CEO (if existential risk)

**Actions:**
1. All-hands emergency response
2. External communications (PR, legal approval)
3. Regulatory notification (if required)
4. Customer communication plan

### Documentation Requirements

For **all escalations**, maintain:

- ✅ Timeline of events (who, what, when)
- ✅ Screenshots/error messages
- ✅ User communications (if applicable)
- ✅ Remediation steps taken
- ✅ Post-mortem analysis
- ✅ Process improvements implemented

**Storage:** `compliance/incidents/YYYY/MM/DD-incident-name/`

---

## 📞 CONTACT INFORMATION

### Internal Contacts

| Role | Email | Slack |
|------|-------|-------|
| Compliance Team | compliance@vayva.ng | #compliance |
| Accessibility Lead | accessibility@vayva.ng | #a11y |
| CTO | cto@vayva.ng | @cto |
| Support | support@vayva.ng | #support |

### External Partners

| Organization | Contact | Purpose |
|--------------|---------|---------|
| JONAPPWD | info@jonapwpd.org | Accessibility partnership |
| NDPC (Nigeria) | info@ndpc.gov.ng | Data protection regulator |
| ICO (UK) | casework@ico.org.uk | UK data protection complaints |

---

## 🎓 CONTINUING EDUCATION

### Recommended Training

**Quarterly:**
- IAAP CPACC certification prep (accessibility)
- IAPP CIPP/E certification (privacy)
- WCAG 2.1 deep-dive webinars

**Monthly:**
- Accessibility testing workshops
- Privacy law updates (Nigeria, EU, UK)
- Engineering team brown-bag sessions

### Resources

- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **GDPR Text:** https://gdpr-info.eu/
- **NDPR 2019:** https://ndpb.gov.ng/data-protection-act/
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **WAVE Accessibility Tool:** https://wave.webaim.org/

---

## ✅ CHECKLIST: FIRST WEEK ON THE JOB

**Day 1:**
- ☐ Access granted to Ops Console
- ☐ Join #compliance and #a11y Slack channels
- ☐ Read this training guide
- ☐ Meet with Compliance Lead

**Day 2-3:**
- ☐ Shadow accessibility issue triage session
- ☐ Review last month's cookie consent report
- ☐ Tour subprocessor admin dashboard

**Day 4-5:**
- ☐ Practice logging test accessibility issue
- ☐ Generate sample PDF report
- ☐ Review escalation procedures quiz

**End of Week 1:**
- ☐ Pass compliance systems quiz (80%+)
- ☐ Handle first real user inquiry (supervised)
- ☐ Set up SLA breach notification filters in email

---

**Document Version:** 1.0  
**Last Updated:** March 18, 2026  
**Next Review:** June 18, 2026  
**Owner:** VP of Compliance

*This is a living document. Submit improvement suggestions to compliance@vayva.ng*
