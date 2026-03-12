# Maintenance Procedures

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026

---

## Overview

This document outlines routine maintenance procedures for the Vayva platform.

## Maintenance Windows

### Scheduled Maintenance

| Type | Frequency | Window | Duration |
|------|-----------|--------|----------|
| Database Maintenance | Monthly | Sunday 2-4 AM WAT | 2 hours |
| Security Updates | Weekly | Tuesday 2-4 AM WAT | 1 hour |
| Dependency Updates | Bi-weekly | Thursday 2-4 AM WAT | 1 hour |
| Infrastructure Review | Quarterly | Scheduled | 4 hours |

### Emergency Maintenance

Unscheduled maintenance for:
- Critical security patches
- Hardware failures
- Data corruption recovery

## Database Maintenance

### Monthly Tasks

**1. Vacuum and Analyze**
```sql
-- Run during maintenance window
VACUUM ANALYZE;
```

**2. Index Maintenance**
```sql
-- Check for bloated indexes
SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes 
ORDER BY pg_relation_size(indexrelid) DESC;

-- Reindex if needed
REINDEX INDEX CONCURRENTLY idx_name;
```

**3. Backup Verification**
```bash
# Test restore from backup
neonctl backup restore --backup-id <id> --to test-db
# Verify data integrity
# Drop test database
```

### Quarterly Tasks

**1. Archive Old Data**
```sql
-- Archive orders older than 2 years
-- Move to cold storage
-- Update retention policies
```

**2. Performance Review**
- Review slow query log
- Analyze query patterns
- Optimize indexes
- Update statistics

## Security Maintenance

### Weekly Security Updates

**1. Dependency Scanning**
```bash
# Check for vulnerabilities
pnpm audit

# Update if needed
pnpm update

# Test changes
pnpm test
```

**2. Secret Rotation**
```bash
# Rotate API keys (quarterly)
# Update environment variables
# Verify services restart correctly
```

### Monthly Security Tasks

**1. Access Review**
- Review user access levels
- Remove inactive accounts
- Audit API keys
- Check SSH keys

**2. Log Review**
- Review authentication logs
- Check for suspicious activity
- Verify audit trail completeness

## Infrastructure Maintenance

### Server Maintenance

**Weekly:**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Check disk space
df -h

# Check memory usage
free -h

# Review system logs
journalctl --since "1 week ago"
```

**Monthly:**
```bash
# Clean up old logs
sudo journalctl --vacuum-time=30d

# Clean up Docker
sudo docker system prune -f

# Review and rotate logs
sudo logrotate -f /etc/logrotate.conf
```

### SSL Certificate Renewal

**Automatic (Let's Encrypt):**
```bash
# Certificates auto-renew via certbot
# Verify renewal
sudo certbot renew --dry-run
```

**Manual Check:**
```bash
# Check certificate expiry
echo | openssl s_client -servername vayva.ng -connect vayva.ng:443 2>/dev/null | openssl x509 -noout -dates
```

## Application Maintenance

### Log Management

**Log Rotation:**
```bash
# Application logs rotated daily
# Keep 30 days of logs
# Archive to S3 after 30 days
```

**Log Cleanup:**
```bash
# Remove old logs
find /var/log/vayva -name "*.log" -mtime +30 -delete
```

### Cache Management

**Redis Maintenance:**
```bash
# Monitor memory usage
redis-cli INFO memory

# Clear old keys if needed
redis-cli --eval cleanup.lua

# Backup Redis
redis-cli BGSAVE
```

### Queue Maintenance

**BullMQ Queue Cleanup:**
```bash
# Clean completed jobs older than 7 days
# Clean failed jobs (after investigation)
# Monitor queue depths
```

## Monitoring Maintenance

### Dashboard Review

**Weekly:**
- Review alert thresholds
- Update dashboards
- Check metric accuracy

**Monthly:**
- Analyze alert fatigue
- Tune alert rules
- Update runbooks

### Alert Maintenance

**Quarterly Review:**
- Which alerts fire frequently?
- Which alerts are ignored?
- Update alert routing
- Review on-call rotation

## Data Retention

### Retention Policies

| Data Type | Retention Period | Action |
|-----------|------------------|--------|
| Application Logs | 90 days | Archive to S3 |
| Audit Logs | 7 years | Keep in database |
| Order Data | 7 years | Archive after 2 years |
| Session Data | 30 days | Auto-delete |
| Failed Jobs | 30 days | Manual review |
| Email Logs | 1 year | Archive |

### Data Cleanup

**Automated Cleanup:**
```sql
-- Clean old sessions
DELETE FROM sessions WHERE expires_at < NOW() - INTERVAL '30 days';

-- Archive old orders
INSERT INTO orders_archive SELECT * FROM orders WHERE created_at < NOW() - INTERVAL '2 years';
DELETE FROM orders WHERE created_at < NOW() - INTERVAL '2 years';
```

## Maintenance Checklist

### Daily

- [ ] Check system health dashboards
- [ ] Review overnight alerts
- [ ] Verify backup completion
- [ ] Check queue depths

### Weekly

- [ ] Review error rates
- [ ] Check disk space
- [ ] Update dependencies (security)
- [ ] Review performance metrics

### Monthly

- [ ] Database maintenance
- [ ] Security updates
- [ ] Access review
- [ ] Log archive
- [ ] SSL certificate check

### Quarterly

- [ ] Infrastructure review
- [ ] Disaster recovery test
- [ ] Capacity planning
- [ ] Documentation update
- [ ] Runbook review

## Maintenance Notifications

### Before Maintenance

**48 Hours:**
- Schedule maintenance window
- Notify team
- Prepare rollback plan

**24 Hours:**
- Post status page notice (if customer-facing)
- Final checks
- Confirm team availability

**1 Hour:**
- Begin maintenance
- Update status page
- Monitor closely

### After Maintenance

- Verify all systems operational
- Remove status page notice
- Document any issues
- Update maintenance log

## Emergency Maintenance

### When Required

- Critical security vulnerability
- Data corruption
- Hardware failure
- Service degradation

### Process

1. Assess urgency
2. Notify team
3. Update status page
4. Execute maintenance
5. Verify resolution
6. Post-incident review

---

**Questions?** Contact ops@vayva.ng
