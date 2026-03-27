# Email Campaign Monitoring & Alerts Configuration

## Overview
This document defines monitoring alerts and dashboard queries for the dual trial mode email campaign system.

---

## 📊 Key Metrics to Monitor

### **1. Email Delivery Metrics**

#### **Email Queue Health**
```sql
-- Query: Email queue depth over time
SELECT 
  DATE_TRUNC('minute', created_at) as minute,
  COUNT(*) as queued_emails,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM email_jobs
WHERE queue_name = 'email-outbound'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY 1
ORDER BY 1;
```

**Alert Threshold:** Queue depth > 100 emails for > 5 minutes  
**Severity:** WARNING

#### **Email Bounce Rate**
```sql
-- Query: Bounce rate by campaign type
SELECT 
  headers->>'X-Email-Type' as campaign_type,
  COUNT(*) as total_sent,
  SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced,
  ROUND(
    100.0 * SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) / COUNT(*), 
    2
  ) as bounce_rate_percent
FROM email_jobs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY 1
HAVING COUNT(*) > 10;
```

**Alert Threshold:** Bounce rate > 5%  
**Severity:** CRITICAL

---

### **2. Campaign Performance Metrics**

#### **Trial Nurture Email Performance**
```sql
-- Query: Trial nurture sequence effectiveness
SELECT 
  headers->>'X-Trial-Days-Remaining' as days_remaining,
  COUNT(*) as sent,
  SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opens,
  SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicks,
  ROUND(100.0 * SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate,
  ROUND(100.0 * SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as click_rate
FROM email_jobs
WHERE headers->>'X-Email-Type' = 'trial-nurture'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY 1
ORDER BY 1;
```

**Expected Benchmarks:**
- Open rate: > 40%
- Click rate: > 15%

#### **Win-Back Campaign Performance**
```sql
-- Query: Win-back sequence conversion
SELECT 
  headers->>'X-Days-Since-Expiry' as days_since_expiry,
  COUNT(*) as sent,
  SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opens,
  SUM(CASE WHEN c.converted_at IS NOT NULL THEN 1 ELSE 0 END) as conversions,
  ROUND(100.0 * SUM(CASE WHEN c.converted_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_rate
FROM email_jobs e
LEFT JOIN merchant_ai_subscriptions c ON e.recipient_email = c.owner_email
WHERE headers->>'X-Email-Type' = 'win-back'
  AND e.created_at > NOW() - INTERVAL '30 days'
GROUP BY 1
ORDER BY 1;
```

**Expected Benchmarks:**
- Win-back recovery rate: 10-15%

---

### **3. Worker Execution Metrics**

#### **Worker Success Rate**
```sql
-- Query: Worker execution success/failure
SELECT 
  worker_name,
  DATE_TRUNC('hour', executed_at) as hour,
  COUNT(*) as executions,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
  ROUND(100.0 * SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM worker_executions
WHERE executed_at > NOW() - INTERVAL '24 hours'
GROUP BY 1, 2
ORDER BY 1, 2;
```

**Alert Threshold:** Success rate < 95%  
**Severity:** WARNING

#### **Worker Execution Duration**
```sql
-- Query: Worker execution time percentiles
SELECT 
  worker_name,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as p50_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99_ms,
  MAX(duration_ms) as max_ms
FROM worker_executions
WHERE executed_at > NOW() - INTERVAL '24 hours'
GROUP BY worker_name;
```

**Alert Threshold:** P95 duration > 5 minutes  
**Severity:** WARNING

---

### **4. Trial Conversion Metrics**

#### **Daily Trial Conversion Rate**
```sql
-- Query: Trial to paid conversion funnel
WITH daily_trials AS (
  SELECT 
    DATE(created_at) as trial_date,
    COUNT(*) as trials_started
  FROM merchant_ai_subscriptions
  WHERE status = 'TRIAL_ACTIVE'
  GROUP BY 1
),
daily_conversions AS (
  SELECT 
    DATE(trial_start_date) as trial_date,
    COUNT(*) as converted_to_paid
  FROM merchant_ai_subscriptions
  WHERE status IN ('SUBSCRIPTION_ACTIVE', 'SUBSCRIPTION_PAUSED')
    AND trial_start_date IS NOT NULL
  GROUP BY 1
)
SELECT 
  t.trial_date,
  t.trials_started,
  COALESCE(c.converted_to_paid, 0) as converted_to_paid,
  ROUND(
    100.0 * COALESCE(c.converted_to_paid, 0) / NULLIF(t.trials_started, 0), 
    2
  ) as conversion_rate
FROM daily_trials t
LEFT JOIN daily_conversions c ON t.trial_date = c.trial_date
WHERE t.trial_date > CURRENT_DATE - INTERVAL '30 days'
ORDER BY 1;
```

**Expected Improvement:** +30-40% increase after implementation

#### **Trial Expiry Analysis**
```sql
-- Query: Trial expiry outcomes
SELECT 
  CASE 
    WHEN status = 'TRIAL_ACTIVE' THEN 'Active'
    WHEN status = 'TRIAL_EXPIRED_GRACE' THEN 'Expired (Grace)'
    WHEN status = 'SUBSCRIPTION_ACTIVE' THEN 'Converted'
    WHEN status = 'SOFT_CLOSED' THEN 'Churned'
    ELSE 'Other'
  END as outcome,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM merchant_ai_subscriptions
WHERE trial_start_date > CURRENT_DATE - INTERVAL '90 days'
GROUP BY 1
ORDER BY 2 DESC;
```

---

## 🚨 Alert Configurations

### **Alert 1: Email Queue Backup**
```yaml
name: Email Queue Backup
condition: |
  avg(email_queue_depth{queue="email-outbound"}) > 100 
  for 5m
severity: warning
annotations:
  summary: "Email queue has backup"
  description: "Queue depth is {{ $value }} emails"
runbook_url: https://wiki.vayva.ng/runbooks/email-queue-backup
```

### **Alert 2: High Bounce Rate**
```yaml
name: High Email Bounce Rate
condition: |
  (
    sum(rate(email_bounces_total[1h])) / 
    sum(rate(email_sent_total[1h]))
  ) > 0.05
severity: critical
annotations:
  summary: "Email bounce rate exceeds 5%"
  description: "Current bounce rate is {{ $value | humanizePercentage }}"
runbook_url: https://wiki.vayva.ng/runbooks/high-bounce-rate
```

### **Alert 3: Worker Failure Spike**
```yaml
name: Worker Failure Spike
condition: |
  (
    sum(rate(worker_execution_errors_total{worker=~"trial-nurture|winback-campaign"}[5m])) / 
    sum(rate(worker_execution_total{worker=~"trial-nurture|winback-campaign"}[5m]))
  ) > 0.10
severity: warning
annotations:
  summary: "Worker failure rate exceeds 10%"
  description: "Failure rate is {{ $value | humanizePercentage }}"
runbook_url: https://wiki.vayva.ng/runbooks/worker-failures
```

### **Alert 4: Trial Conversion Drop**
```yaml
name: Trial Conversion Rate Drop
condition: |
  (
    avg(trial_conversion_rate_7d) < 0.15
  )
severity: warning
annotations:
  summary: "Trial conversion rate below target"
  description: "7-day average conversion rate is {{ $value | humanizePercentage }}"
runbook_url: https://wiki.vayva.ng/runbooks/trial-conversion-drop
```

### **Alert 5: Sentry Error Spike**
```yaml
name: Sentry Error Spike
condition: |
  sum(rate(sentry_events_total{environment="production", worker="true"}[5m])) > 10
severity: warning
annotations:
  summary: "High error rate in workers"
  description: "{{ $value }} errors per minute"
runbook_url: https://wiki.vayva.ng/runbooks/sentry-error-spike
```

---

## 📈 Dashboard Panels

### **Panel 1: Email Campaign Overview**
```promql
# Emails Sent (Last 24h)
sum(rate(email_sent_total[1h]))

# Email Open Rate
sum(rate(email_opens_total[1h])) / sum(rate(email_sent_total[1h]))

# Email Click Rate
sum(rate(email_clicks_total[1h])) / sum(rate(email_sent_total[1h]))
```

### **Panel 2: Worker Health**
```promql
# Worker Success Rate
sum(rate(worker_execution_success_total[5m])) / sum(rate(worker_execution_total[5m]))

# Worker Execution Duration (P95)
histogram_quantile(0.95, rate(worker_execution_duration_seconds_bucket[5m]))

# Active Workers
count(worker_last_heartbeat_timestamp > time() - 300)
```

### **Panel 3: Trial Funnel**
```promql
# Active Trials
merchant_ai_subscriptions{status="TRIAL_ACTIVE"}

# Trials Expiring Soon (≤3 days)
count(merchant_ai_subscriptions{status="TRIAL_ACTIVE"} AND trial_days_remaining <= 3)

# Trial Conversion Rate (7d avg)
avg_over_time(trial_conversion_rate[7d])
```

### **Panel 4: Revenue Impact**
```promql
# Conversions Today
sum(increase(subscription_activations_total[1d]))

# Recovered Churned Users (Win-back)
sum(increase(win_back_conversions_total[1d]))

# Estimated MRR from Conversions
sum(increase(subscription_activations_total[1d])) * avg_subscription_value
```

---

## 🔧 Grafana Dashboard JSON Template

```json
{
  "dashboard": {
    "title": "Email Campaign Performance",
    "panels": [
      {
        "title": "Email Queue Depth",
        "type": "graph",
        "targets": [
          {
            "expr": "email_queue_depth{queue=\"email-outbound\"}",
            "legendFormat": "Queue Depth"
          }
        ],
        "alert": {
          "name": "Email Queue Backup",
          "conditions": [
            {
              "evaluator": { "params": [100], "type": "gt" },
              "operator": { "type": "and" },
              "query": { "params": ["A", "5m", "now"] },
              "reducer": { "type": "avg" }
            }
          ]
        }
      },
      {
        "title": "Email Performance",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(rate(email_sent_total[1h]))",
            "legendFormat": "Sent/hour"
          },
          {
            "expr": "sum(rate(email_opens_total[1h])) / sum(rate(email_sent_total[1h])) * 100",
            "legendFormat": "Open Rate %"
          }
        ]
      },
      {
        "title": "Worker Health",
        "type": "table",
        "targets": [
          {
            "expr": "sum(rate(worker_execution_success_total[5m])) by (worker) / sum(rate(worker_execution_total[5m])) by (worker) * 100",
            "legendFormat": "{{worker}} Success Rate"
          }
        ]
      }
    ]
  }
}
```

---

## 🎯 Action Runbooks

### **Runbook: High Email Bounce Rate**

**Trigger:** Bounce rate > 5%

**Steps:**
1. Check email provider status (Resend dashboard)
2. Review recent email sends for spam patterns
3. Verify sender domain reputation
4. Check for invalid email addresses in database
5. Review email content for spam triggers
6. If issue persists, pause campaigns and investigate

### **Runbook: Worker Failures**

**Trigger:** Worker failure rate > 10%

**Steps:**
1. Check Sentry dashboard for error details
2. Verify database connectivity
3. Check Redis queue health
4. Review worker logs for stack traces
5. Restart worker if needed
6. Scale workers if load-related

### **Runbook: Low Trial Conversion**

**Trigger:** Conversion rate < 15% for 7+ days

**Steps:**
1. Review trial nurture email open/click rates
2. A/B test email subject lines
3. Check product tour completion rates
4. Survey churned users for feedback
5. Review pricing competitiveness
6. Consider extending trial period

---

## 📞 Escalation Contacts

| Severity | Contact | Response Time |
|----------|---------|---------------|
| CRITICAL | On-call Engineer | 15 minutes |
| WARNING | Engineering Slack Channel | 2 hours |
| INFO | Email in Next Sprint Planning | Next sprint |

---

*Last Updated: March 26, 2026*  
*Owner: Engineering Team*
