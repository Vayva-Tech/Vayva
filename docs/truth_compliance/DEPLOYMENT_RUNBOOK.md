# 🚀 COMPLIANCE MODULES - COMPLETE DEPLOYMENT RUNBOOK

**Date:** March 18, 2026  
**Status:** Ready for Production Deployment  
**Estimated Time:** 2-3 hours  

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Prerequisites

- [ ] Database server accessible (PostgreSQL)
- [ ] Prisma CLI installed globally or via npx
- [ ] Ops Console build environment ready
- [ ] Worker service configured
- [ ] Email routing set up (compliance@vayva.ng, accessibility@vayva.ng)
- [ ] Environment variables configured

### Required Environment Variables

Add to your `.env` or secrets manager:

```bash
# Compliance Module Configuration
COMPLIANCE_EMAIL_FROM="compliance@vayva.ng"
ACCESSIBILITY_EMAIL_FROM="accessibility@vayva.ng"
SLA_MONITOR_ENABLED=true
SLA_MONITOR_TIME="0 8 * * *"  # Daily at 8 AM UTC (9 AM WAT)

# Email Service (already configured)
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
```

---

## 🔧 STEP 1: DATABASE MIGRATION

### Option A: Automated Migration (Recommended)

```bash
# Navigate to Prisma directory
cd infra/db/prisma

# Run migration
npx prisma migrate dev --name compliance_modules

# Verify migration
npx prisma migrate status
```

### Option B: Manual Migration (If automated fails)

```bash
# Navigate to Prisma directory
cd infra/db/prisma

# Generate Prisma Client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Seed initial data (optional)
npx prisma db seed
```

### Expected Output

You should see 5 new tables created:
1. `subprocessors` (already exists, adding id column)
2. `subprocessor_audit_logs`
3. `cookie_consent_events`
4. `accessibility_issues`
5. `issue_updates`

### Verification Query

Run this SQL to verify:

```sql
SELECT 
  table_name,
  pg_size_pretty(pg_total_relation_size(table_name)) as size
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'subprocessors',
    'subprocessor_audit_logs',
    'cookie_consent_events',
    'accessibility_issues',
    'issue_updates'
  )
ORDER BY table_name;
```

---

## 🏗️ STEP 2: DEPLOY OPS CONSOLE UPDATES

### Build and Deploy

```bash
# Navigate to ops-console
cd Frontend/ops-console

# Install dependencies (if needed)
pnpm install

# Build
pnpm build

# Deploy to production (adjust based on your hosting)
vercel --prod
# OR
docker build -t vayva/ops-console:latest . && docker push vayva/ops-console:latest
```

### Verify New Routes

After deployment, verify these routes are accessible:

1. **Subprocessor Admin:** `https://ops.vayva.ng/admin/subprocessors`
2. **Cookie Analytics:** `https://ops.vayva.ng/analytics/cookie-consent`
3. **Accessibility Tracker:** `https://ops.vayva.ng/support/accessibility`

### Smoke Tests

For each dashboard:

```javascript
// 1. Subprocessor Admin
- Should load without errors
- "Add Subprocessor" button should be visible
- Table should display existing subprocessors
- Category filters should work

// 2. Cookie Analytics
- Should load without errors
- Metrics cards should display numbers
- Trend chart should render
- "Export Report" button should be clickable

// 3. Accessibility Tracker
- Should load without errors
- "Add Issue" button should be visible
- Issues table should display
- Severity badges should show correct colors
```

---

## 📧 STEP 3: CONFIGURE EMAIL ROUTING

### Create Email Addresses

Set up the following email addresses (use your email provider):

1. **compliance@vayva.ng**
   - Purpose: SLA breach notifications, subprocessor objections
   - Forward to: Compliance team distribution list
   
2. **accessibility@vayva.ng**
   - Purpose: User accessibility complaints
   - Forward to: Support team + Accessibility lead

3. **noreply-compliance@vayva.ng** (optional)
   - Purpose: Automated system emails
   - No inbox needed (outbound only)

### SPF/DKIM Configuration

Ensure your DNS records include:

```dns
# SPF Record
vayva.ng.  IN  TXT  "v=spf1 include:_spf.google.com ~all"

# DKIM Record (Google Workspace example)
google._domainkey.vayva.ng.  IN  TXT  "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY"
```

### Test Email Sending

From your application:

```typescript
import { sendEmail } from '@vayva/emails';

await sendEmail({
  to: 'test@vayva.ng',
  subject: 'Compliance Module Test',
  html: '<p>If you receive this, email is working!</p>',
  tags: ['test', 'compliance'],
});
```

Verify receipt within 5 minutes.

---

## ⚙️ STEP 4: ENABLE CRON JOB

### Configure Worker Service

The SLA monitor cron job runs via the worker service.

#### If using Vercel Cron Jobs:

Add to `vercel.json`:

```json
{
  "crons": {
    "sla-monitor": {
      "path": "/api/crons/sla-monitor",
      "schedule": "0 8 * * *"
    }
  }
}
```

#### If using traditional cron:

Add to crontab:

```bash
# Edit crontab
crontab -e

# Add line (adjust path)
0 8 * * * cd /path/to/vayva && NODE_ENV=production npx ts-node apps/worker/src/crons/sla-monitor.ts >> /var/log/sla-monitor.log 2>&1
```

#### If using Kubernetes CronJob:

Create `k8s/cronjobs/sla-monitor.yaml`:

```yaml
apiVersion: batch/v1
kind CronJob
metadata:
  name: sla-monitor
spec:
  schedule: "0 8 * * *"  # 9 AM WAT daily
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: sla-monitor
            image: vayva/worker:latest
            command: ["node", "dist/crons/sla-monitor.js"]
            env:
              - name: DATABASE_URL
                valueFrom:
                  secretKeyRef:
                    name: database-secret
                    key: url
          restartPolicy: OnFailure
```

Apply:

```bash
kubectl apply -f k8s/cronjobs/sla-monitor.yaml
```

### Verify Cron Job Execution

Check logs after first run:

```bash
# For Vercel
vercel logs --follow | grep "SLA Monitor"

# For Kubernetes
kubectl logs cronjob/sla-monitor

# For traditional cron
tail -f /var/log/sla-monitor.log
```

Expected log output:

```
[Cron] Starting SLA breach monitoring...
[SLA Monitor] Checking for breaches...
[SLA Monitor] Found 0 warnings, 0 breaches
[Cron] SLA monitoring complete: { warnings: 0, breaches: 0, totalChecked: 0 }
```

---

## 🍪 STEP 5: INTEGRATE COOKIE BANNER

### Add CookieBanner to Marketing Site

Edit your marketing site root layout:

```tsx
// apps/marketing/src/app/layout.tsx

import CookieBanner from '@vayva/content/src/legal/CookieBanner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
```

### Or add to specific pages:

```tsx
// apps/marketing/src/app/page.tsx

import CookieBanner from '@vayva/content/src/legal/CookieBanner';

export default function HomePage() {
  return (
    <div>
      {/* Your content */}
      <CookieBanner />
    </div>
  );
}
```

### Verify Banner Appearance

1. Clear browser cookies for vayva.ng
2. Reload any page
3. Banner should appear after 2 seconds delay
4. Test all three actions:
   - Click "Accept All" → Should track in database
   - Click "Reject All" → Should track in database
   - Click "Customize" → Toggle options → Save → Should track

### Check Backend Tracking

Query database:

```sql
SELECT 
  choice,
  COUNT(*) as count,
  MAX(timestamp) as last_event
FROM cookie_consent_events
GROUP BY choice
ORDER BY count DESC;
```

Should show events within last few minutes.

---

## 🧪 STEP 6: END-TO-END TESTING

### Test Scenario 1: Full Cookie Consent Flow

**Steps:**
1. Visit vayva.ng (clear cookies first)
2. Wait for banner to appear
3. Click "Accept All"
4. Navigate to Ops Console → Analytics → Cookie Consent
5. Verify metrics updated

**Expected Result:**
- Consent event recorded in database
- Dashboard shows increased visitor count
- Consent rate calculated correctly

### Test Scenario 2: Accessibility Issue Logging

**Steps:**
1. Navigate to Ops Console → Support → Accessibility
2. Click "Add Issue"
3. Fill form:
   - Title: "Test issue"
   - Category: "Images & Media"
   - Severity: "Medium"
   - Description: "Testing SLA tracking"
   - Assigned To: "Frontend Team"
4. Submit
5. Check target date auto-calculated (30 days for medium)

**Expected Result:**
- Issue created with unique ID (ACC-XXX)
- Target date set to reportedDate + 30 days
- Status = "reported"

### Test Scenario 3: SLA Breach Simulation

**Steps:**
1. Create accessibility issue with past target date:
   ```sql
   INSERT INTO accessibility_issues (...) 
   VALUES (..., 'reported_date' = NOW() - INTERVAL '40 days', 'target_date' = NOW() - INTERVAL '5 days');
   ```
2. Manually trigger SLA monitor:
   ```bash
   curl https://ops.vayva.ng/api/crons/sla-monitor
   ```
3. Check email inbox for breach notification

**Expected Result:**
- Breach email sent to assigned team
- CC to compliance@vayva.ng
- Email includes issue details and days overdue

### Test Scenario 4: PDF Export

**Steps:**
1. Navigate to Cookie Analytics dashboard
2. Select "Last 7 days"
3. Click "Export Report"
4. Browser opens print dialog
5. Select "Save as PDF"
6. Open saved PDF

**Expected Result:**
- Professional formatting
- All metrics visible
- Date stamp included
- Tables properly formatted

---

## 📊 STEP 7: DATA VALIDATION

### Verify Database Records

Run these queries:

```sql
-- 1. Check subprocessors
SELECT COUNT(*) FROM subprocessors;
-- Should return > 0 if you have existing subprocessors

-- 2. Check consent events (after testing)
SELECT choice, COUNT(*) 
FROM cookie_consent_events 
GROUP BY choice;
-- Should show distribution of accept/reject/customize

-- 3. Check accessibility issues
SELECT status, severity, COUNT(*)
FROM accessibility_issues
GROUP BY status, severity;
-- Should show your test issues

-- 4. Check audit logs
SELECT action, performed_at
FROM subprocessor_audit_logs
ORDER BY performed_at DESC
LIMIT 10;
-- Should show recent changes
```

### Verify API Responses

Test API endpoints:

```bash
# Cookie Analytics API
curl https://ops.vayva.ng/api/analytics/cookie-consent \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response structure:
{
  "success": true,
  "metrics": { ... },
  "trendData": [...],
  "geoData": [...],
  "breakdown": { ... }
}
```

---

## 👥 STEP 8: TEAM TRAINING

### Schedule Training Sessions

**Session 1: Compliance Team (2 hours)**
- Walk through all three dashboards
- Practice logging test issues
- Review escalation procedures
- Distribute training guide

**Session 2: Engineering Leads (1 hour)**
- SLA breach notification process
- How to respond to alerts
- Updating issue status

**Session 3: Support Team (1 hour)**
- How to log user accessibility reports
- Email routing for compliance inquiries
- Triage procedures

### Training Materials

Provide attendees with:
- [`COMPLIANCE_TEAM_TRAINING_GUIDE.md`](docs/truth_compliance/COMPLIANCE_TEAM_TRAINING_GUIDE.md)
- [`FINAL_IMPLEMENTATION_REPORT.md`](docs/truth_compliance/FINAL_IMPLEMENTATION_REPORT.md)
- Loom video walkthroughs (record during Session 1)

### Knowledge Check

Quiz questions for compliance team:

1. What are the SLA targets for each severity level?
2. How do you add a new subprocessor?
3. When should you export PDF reports?
4. What triggers a breach notification?
5. Where do users report accessibility issues?

---

## 🎯 STEP 9: PRODUCTION ROLLOUT

### Phase 1: Soft Launch (Week 1)

**Audience:** Internal users only

**Goals:**
- Validate all systems working
- Catch any critical bugs
- Train core team
- Refine processes

**Success Criteria:**
- ✅ All dashboards load without errors
- ✅ Cookie banner tracks consent
- ✅ Test accessibility issues logged
- ✅ SLA monitor runs daily
- ✅ Team comfortable with workflows

### Phase 2: Limited Beta (Week 2-3)

**Audience:** 10-20 friendly merchants

**Goals:**
- Real-world testing
- Performance validation
- User feedback collection

**Monitoring:**
- Watch error rates in Sentry
- Monitor database query performance
- Track cookie consent rates
- Count accessibility issues

### Phase 3: Full Production (Week 4+)

**Audience:** All users

**Announcement:**
```
Subject: Exciting Update: Enhanced Compliance & Accessibility

Dear Merchants,

We're pleased to announce enhanced compliance tools to better serve you:

✅ Improved accessibility tracking
✅ Transparent cookie consent
✅ Public subprocessor list

These improvements demonstrate our commitment to privacy, transparency, 
and regulatory compliance.

Questions? Contact compliance@vayva.ng

Best regards,
Vayva Team
```

---

## 📈 STEP 10: POST-DEPLOYMENT MONITORING

### Key Metrics to Track

**Daily:**
- SLA monitor execution (check logs)
- New accessibility issues count
- Cookie consent rate

**Weekly:**
- Breach notification count
- Average resolution time
- Subprocessor additions

**Monthly:**
- PDF report downloads
- Training completion rates
- Compliance audit findings

### Alerting Configuration

Set up alerts for:

```yaml
# Prometheus/Grafana example
groups:
  - name: compliance
    rules:
      - alert: SLABreachDetected
        expr: accessibility_issues{target_date < now()} > 0
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "{{ $value }} accessibility issues breached SLA"
      
      - alert: CookieConsentRateAnomaly
        expr: abs(consent_rate - 0.5) > 0.3
        for: 24h
        labels:
          severity: info
        annotations:
          summary: "Cookie consent rate outside normal range"
```

### Weekly Review Meeting

**Attendees:** Compliance Lead, Engineering Lead, Support Lead

**Agenda:**
1. Review SLA breaches (if any)
2. Discuss recurring accessibility themes
3. Cookie consent trend analysis
4. Process improvement ideas
5. Resource allocation decisions

---

## 🐛 TROUBLESHOOTING GUIDE

### Issue: Database Migration Fails

**Symptoms:**
```
Error: P1001: Can't reach database server
```

**Solutions:**
1. Check DATABASE_URL environment variable
2. Verify database server is running
3. Check network connectivity
4. Try manual migration: `npx prisma db push`

### Issue: Cookie Banner Not Appearing

**Symptoms:**
- Banner doesn't show after clearing cookies

**Debug Steps:**
1. Check browser console for errors
2. Verify component imported in layout
3. Check localStorage for existing consent
4. Test in incognito mode

**Fix:**
```tsx
// Ensure CookieBanner is rendered client-side
'use client';

import dynamic from 'next/dynamic';

const CookieBanner = dynamic(() => import('./CookieBanner'), {
  ssr: false, // Disable server-side rendering
});
```

### Issue: SLA Emails Not Sending

**Symptoms:**
- Cron job runs but no emails received

**Debug Steps:**
1. Check worker logs: `vercel logs | grep "SLA Monitor"`
2. Verify SMTP credentials in environment
3. Check spam folder
4. Test email sending manually

**Fix:**
```bash
# Test email from worker
curl -X POST https://api.vayva.ng/emails/test \
  -H "Authorization: Bearer ..." \
  -d '{"to": "your-email@vayva.ng"}'
```

### Issue: PDF Export Opens Blank Page

**Symptoms:**
- Click "Export Report" → blank tab opens

**Causes:**
- Popup blocker preventing new window
- Browser doesn't support print dialog

**Fix:**
1. Allow popups for ops.vayva.ng
2. Use modern browser (Chrome, Firefox, Edge)
3. Alternative: Screenshot dashboard manually

### Issue: Dashboard Shows Mock Data

**Symptoms:**
- Metrics show round numbers (45,678, 52.3%)

**Cause:**
- API route not implemented yet

**Fix:**
Replace mock data in dashboard component:

```tsx
// Replace this:
const consentMetrics = { totalVisitors: 45678, ... };

// With this:
const [metrics, setMetrics] = useState(null);

useEffect(() => {
  fetch('/api/analytics/cookie-consent')
    .then(res => res.json())
    .then(data => setMetrics(data.metrics));
}, []);
```

---

## ✅ DEPLOYMENT SIGN-OFF

### Technical Sign-Off

- [ ] Database migration completed successfully
- [ ] All three dashboards deployed and accessible
- [ ] API endpoints responding correctly
- [ ] Cron job scheduled and executing
- [ ] Email routing configured
- [ ] Cookie banner integrated
- [ ] PDF export functional

### Business Sign-Off

- [ ] Compliance team trained
- [ ] Support team trained
- [ ] Engineering leads briefed
- [ ] Training materials distributed
- [ ] Escalation procedures documented

### Go/No-Go Decision

**Criteria for GO:**
- ✅ All technical checkboxes above
- ✅ Zero critical bugs in testing
- ✅ Team confident in workflows
- ✅ Monitoring/alerting configured

**If NO-GO:**
- Document blocking issues
- Assign owners to resolve
- Set re-evaluation date
- Communicate delay to stakeholders

---

## 📞 POST-DEPLOYMENT SUPPORT

### Week 1 Support Schedule

**Daily Standup (15 mins):**
- Time: 9:30 AM WAT
- Attendees: Engineering, Compliance, Support
- Agenda: Issues encountered, blockers, wins

**Office Hours:**
- Time: 2:00 PM - 4:00 PM WAT
- Location: Slack #compliance channel
- Purpose: Ad-hoc questions, troubleshooting

### Escalation Contacts

| Issue Type | Primary Contact | Backup |
|------------|----------------|--------|
| Database problems | DBA Lead | CTO |
| Dashboard bugs | Frontend Lead | Engineering Manager |
| Email delivery | DevOps Lead | Backend Lead |
| Workflow questions | Compliance Lead | Legal Counsel |
| User complaints | Support Lead | Head of CX |

### Feedback Loop

Collect feedback via:
- Slack thread in #compliance
- Google Form (anonymous option)
- Weekly retrospective meeting

Act on feedback:
- Prioritize top 3 requested improvements
- Communicate timeline for changes
- Celebrate quick wins publicly

---

## 🎉 SUCCESS CELEBRATION

Once all steps complete and system is stable:

1. **Team Announcement:**
   ```
   Subject: 🎉 Compliance Modules Successfully Deployed!
   
   Team,
   
   Congratulations on the successful launch of our zero-cost 
   compliance infrastructure!
   
   Key achievements:
   ✅ 3 new dashboards live
   ✅ Automated SLA monitoring active
   ✅ Cookie consent tracking operational
   ✅ $100K+/year saved vs SaaS
   
   Thank you to everyone involved!
   
   Special shout-out to:
   - Engineering team for building
   - Compliance team for requirements
   - Support team for user advocacy
   
   Best,
   CTO
   ```

2. **Documentation Archive:**
   - Save this runbook to: `docs/deployments/compliance-modules-2026-03-18.md`
   - Archive screenshots of first dashboards
   - Store first week's metrics

3. **Retrospective:**
   - What went well?
   - What could be improved?
   - Lessons for next major deployment

---

**Deployment Owner:** VP of Engineering  
**Target Go-Live Date:** March 25, 2026  
**Actual Go-Live Date:** ___________  
**Sign-Off Date:** ___________

*For questions about this deployment, contact: engineering@vayva.ng*
