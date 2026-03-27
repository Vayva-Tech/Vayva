/**
 * Email Campaign Monitoring & Alerting Configuration
 * 
 * Prometheus/Grafana alert rules for monitoring email campaign health,
 * worker performance, and conversion metrics.
 */

export const EMAIL_CAMPAIGN_ALERTS = `
# ============================================
# EMAIL DELIVERY ALERTS
# ============================================

# Alert: High Email Bounce Rate
- alert: EmailBounceRateHigh
  expr: |
    (
      rate(email_bounces_total[1h]) 
      / 
      rate(email_sent_total[1h])
    ) > 0.05
  for: 15m
  labels:
    severity: warning
  annotations:
    summary: "High email bounce rate detected"
    description: "Email bounce rate is above 5% (current value: {{ $value | humanizePercentage }})"

# Alert: Email Delivery Failures
- alert: EmailDeliveryFailures
  expr: |
    rate(email_delivery_failures_total[15m]) > 0.01
  for: 10m
  labels:
    severity: critical
  annotations:
    summary: "Email delivery failures detected"
    description: "More than 1% of emails are failing to send (current rate: {{ $value | humanizePercentage }})"

# Alert: Email Queue Backlog
- alert: EmailQueueBacklog
  expr: |
    bullmq_queue_waiting_jobs{queue="email-outbound"} > 1000
  for: 30m
  labels:
    severity: warning
  annotations:
    summary: "Email queue backlog building up"
    description: "Email outbound queue has {{ $value }} waiting jobs"

# Alert: Email Queue Processing Stalled
- alert: EmailQueueStalled
  expr: |
    rate(bullmq_queue_processed_jobs_total{queue="email-outbound"}[5m]) == 0
    and
    bullmq_queue_waiting_jobs{queue="email-outbound"} > 0
  for: 15m
  labels:
    severity: critical
  annotations:
    summary: "Email queue processing has stalled"
    description: "No emails processed in last 5 minutes but {{ $value }} jobs waiting"

# ============================================
# WORKER EXECUTION ALERTS
# ============================================

# Alert: Trial Nurture Worker Failures
- alert: TrialNurtureWorkerFailures
  expr: |
    rate(worker_execution_errors_total{worker="trial-nurture"}[1h]) > 0.05
  for: 15m
  labels:
    severity: warning
  annotations:
    summary: "Trial nurture worker experiencing failures"
    description: "Trial nurture worker failure rate above 5%"

# Alert: Win-Back Worker Failures
- alert: WinBackWorkerFailures
  expr: |
    rate(worker_execution_errors_total{worker="winback-campaign"}[1h]) > 0.05
  for: 15m
  labels:
    severity: warning
  annotations:
    summary: "Win-back campaign worker failures"
    description: "Win-back worker failure rate above 5%"

# Alert: Milestone Tracker Worker Failures
- alert: MilestoneTrackerWorkerFailures
  expr: |
    rate(worker_execution_errors_total{worker="milestone-tracker"}[1h]) > 0.05
  for: 15m
  labels:
    severity: warning
  annotations:
    summary: "Milestone tracker worker failures"
    description: "Milestone tracker worker failure rate above 5%"

# Alert: Worker Not Running
- alert: WorkerNotRunning
  expr: |
    up{job="worker"} == 0
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Worker process is not running"
    description: "No worker processes detected for over 5 minutes"

# Alert: Worker Execution Time Spike
- alert: WorkerExecutionTimeSpike
  expr: |
    histogram_quantile(0.95, 
      rate(worker_execution_duration_seconds_bucket{worker="trial-nurture"}[1h])
    ) > 300
  for: 30m
  labels:
    severity: warning
  annotations:
    summary: "Worker execution time spike detected"
    description: "95th percentile execution time is above 5 minutes"

# ============================================
# TRIAL CONVERSION ALERTS
# ============================================

# Alert: Trial Conversion Rate Drop
- alert: TrialConversionRateDrop
  expr: |
    (
      rate(trial_conversions_total[7d]) 
      / 
      rate(trials_started_total[7d])
    ) < 0.15
  for: 1h
  labels:
    severity: warning
  annotations:
    summary: "Trial conversion rate dropped significantly"
    description: "7-day trial conversion rate below 15% (current: {{ $value | humanizePercentage }})"

# Alert: Trial Expiry Spike
- alert: TrialExpirySpike
  expr: |
    rate(trials_expired_total[1d]) > 2 * rate(trials_expired_total[7d] offset 7d)
  for: 6h
  labels:
    severity: info
  annotations:
    summary: "Unusual spike in trial expirations"
    description: "Trial expirations are {{ $value | humanize }}x higher than last week"

# ============================================
# WIN-BACK CAMPAIGN ALERTS
# ============================================

# Alert: Win-Back Recovery Rate Low
- alert: WinBackRecoveryRateLow
  expr: |
    (
      rate(win_back_successes_total[30d]) 
      / 
      rate(win_back_emails_sent_total[30d])
    ) < 0.05
  for: 24h
  labels:
    severity: warning
  annotations:
    summary: "Win-back campaign recovery rate is low"
    description: "Win-back recovery rate below 5% (current: {{ $value | humanizePercentage }})"

# Alert: Win-Back Email Open Rate Low
- alert: WinBackOpenRateLow
  expr: |
    (
      rate(win_back_email_opens_total[7d]) 
      / 
      rate(win_back_emails_sent_total[7d])
    ) < 0.20
  for: 12h
  labels:
    severity: info
  annotations:
    summary: "Win-back email open rate is low"
    description: "Win-back email open rate below 20% (current: {{ $value | humanizePercentage }})"

# ============================================
# MILESTONE CELEBRATION ALERTS
# ============================================

# Alert: Milestone Detection Gap
- alert: MilestoneDetectionGap
  expr: |
    time() - timestamp(milestone_detected_total) > 7200
  for: 1h
  labels:
    severity: warning
  annotations:
    summary: "No milestones detected in over 2 hours"
    description: "Milestone tracker may not be functioning properly"

# Alert: Milestone Email Send Failures
- alert: MilestoneEmailFailures
  expr: |
    rate(milestone_email_failures_total[1h]) > 0.10
  for: 30m
  labels:
    severity: warning
  annotations:
    summary: "Milestone celebration email failures"
    description: "More than 10% of milestone emails are failing"

# ============================================
# SENTRY ERROR TRACKING ALERTS
# ============================================

# Alert: Sentry Error Spike
- alert: SentryErrorSpike
  expr: |
    rate(sentry_events_total{level="error"}[1h]) > 10
  for: 15m
  labels:
    severity: warning
  annotations:
    summary: "High rate of errors reported to Sentry"
    description: "{{ $value }} errors per second being reported to Sentry"

# Alert: Critical Sentry Errors
- alert: SentryCriticalErrors
  expr: |
    sentry_events_total{level="fatal"} > 0
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Fatal errors detected in Sentry"
    description: "{{ $value }} fatal errors detected"

# ============================================
# DATABASE PERFORMANCE ALERTS
# ============================================

# Alert: Database Query Slowdown
- alert: DatabaseQuerySlowdown
  expr: |
    histogram_quantile(0.95, 
      rate(prisma_query_duration_seconds_bucket[1h])
    ) > 1.0
  for: 30m
  labels:
    severity: warning
  annotations:
    summary: "Database queries running slow"
    description: "95th percentile query time is above 1 second"

# Alert: Database Connection Pool Exhaustion
- alert: DatabaseConnectionPoolExhausted
  expr: |
    prisma_connections_used / prisma_connections_max > 0.9
  for: 15m
  labels:
    severity: critical
  annotations:
    summary: "Database connection pool nearly exhausted"
    description: "Database connection pool at {{ $value | humanizePercentage }} capacity"

# ============================================
# REDIS PERFORMANCE ALERTS
# ============================================

# Alert: Redis Memory Usage High
- alert: RedisMemoryUsageHigh
  expr: |
    redis_memory_used_bytes / redis_memory_max_bytes > 0.85
  for: 30m
  labels:
    severity: warning
  annotations:
    summary: "Redis memory usage is high"
    description: "Redis memory at {{ $value | humanizePercentage }} of max capacity"

# Alert: Redis Connection Failures
- alert: RedisConnectionFailures
  expr: |
    rate(redis_connection_errors_total[5m]) > 0
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Redis connection failures detected"
    description: "Unable to connect to Redis cluster"
`;

export const GRAFANA_DASHBOARD_PANELS = `
# ============================================
# GRAFANA DASHBOARD CONFIGURATION
# Email Campaign Performance Dashboard
# ============================================

{
  "dashboard": {
    "title": "Email Campaign Performance",
    "panels": [
      {
        "id": 1,
        "title": "Email Send Rate (Last 24h)",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(email_sent_total[1h])",
            "legendFormat": "Emails Sent"
          }
        ]
      },
      {
        "id": 2,
        "title": "Email Bounce Rate",
        "type": "gauge",
        "targets": [
          {
            "expr": "(rate(email_bounces_total[1h]) / rate(email_sent_total[1h])) * 100",
            "legendFormat": "Bounce Rate %"
          }
        ],
        "thresholds": [
          { "value": 0, "color": "green" },
          { "value": 3, "color": "yellow" },
          { "value": 5, "color": "red" }
        ]
      },
      {
        "id": 3,
        "title": "Queue Depth",
        "type": "graph",
        "targets": [
          {
            "expr": "bullmq_queue_waiting_jobs{queue=\\"email-outbound\\"}",
            "legendFormat": "Waiting Jobs"
          },
          {
            "expr": "bullmq_queue_active_jobs{queue=\\"email-outbound\\"}",
            "legendFormat": "Active Jobs"
          }
        ]
      },
      {
        "id": 4,
        "title": "Worker Execution Time",
        "type": "heatmap",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(worker_execution_duration_seconds_bucket[1h]))",
            "legendFormat": "P95 Execution Time"
          }
        ]
      },
      {
        "id": 5,
        "title": "Trial Conversion Funnel",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(rate(trials_started_total[7d]))",
            "legendFormat": "Trials Started (7d)"
          },
          {
            "expr": "sum(rate(trial_nurture_emails_sent_total[7d]))",
            "legendFormat": "Nurture Emails Sent"
          },
          {
            "expr": "sum(rate(trial_conversions_total[7d]))",
            "legendFormat": "Conversions"
          }
        ]
      },
      {
        "id": 6,
        "title": "Win-Back Campaign Performance",
        "type": "table",
        "targets": [
          {
            "expr": "sum(rate(win_back_emails_sent_total[7d])) by (template)",
            "legendFormat": "{{template}}"
          }
        ]
      },
      {
        "id": 7,
        "title": "Milestone Celebrations",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(increase(milestone_detected_total[24h]))",
            "legendFormat": "Milestones (24h)"
          }
        ]
      },
      {
        "id": 8,
        "title": "Sentry Error Count",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(sentry_events_total{level=\\"error\\"}[1h])",
            "legendFormat": "Errors/sec"
          }
        ]
      }
    ]
  }
}
`;

export const MONITORING_SETUP_INSTRUCTIONS = `
# Email Campaign Monitoring Setup

## Prerequisites
- Prometheus instance
- Grafana dashboard
- Alertmanager configured for notifications

## Step 1: Deploy Alert Rules
\`\`\`bash
# Copy alert rules to Prometheus
cp email-campaign-alerts.yml /etc/prometheus/rules/

# Reload Prometheus rules
curl -X POST http://prometheus:9090/-/reload
\`\`\`

## Step 2: Import Grafana Dashboard
\`\`\`bash
# Import dashboard via API
curl -X POST \\\n  -H "Content-Type: application/json" \\\n  -d @grafana-dashboard.json \\\n  http://grafana:3000/api/dashboards/import
\`\`\`

## Step 3: Configure Alert Notifications
\`\`\`yaml
# alertmanager/config.yml
route:
  receiver: 'slack-notifications'
  group_by: ['alertname', 'severity']
  
receivers:
  - name: 'slack-notifications'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts-email-campaigns'
        send_resolved: true
\`\`\`

## Step 4: Verify Metrics Exporters
Ensure the following exporters are running:
- Node exporter (system metrics)
- Redis exporter (Redis metrics)
- Postgres exporter (database metrics)
- Custom app metrics (email counters, worker stats)

## Step 5: Test Alerts
Run these commands to verify alerts trigger correctly:

\`\`\`bash
# Simulate high bounce rate
for i in {1..100}; do
  echo "email_bounce" | nc -u localhost 9100
done

# Check Prometheus targets
curl http://prometheus:9090/api/v1/targets

# Verify alert rules loaded
curl http://prometheus:9090/api/v1/rules
\`\`\`

## Notification Channels
Configure the following notification channels:
- Slack: #alerts-email-campaigns
- PagerDuty: Email Campaign On-Call
- Email: ops-team@vayva.com (for critical alerts)

## Runbook Links
Each alert should link to a runbook:
- https://wiki.vayva.com/runbooks/email-bounce-rate-high
- https://wiki.vayva.com/runbooks/worker-failures
- https://wiki.vayva.com/runbooks/queue-backlog
`;
