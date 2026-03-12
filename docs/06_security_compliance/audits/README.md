# Security Audits

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026

---

## Overview

Vayva conducts regular security audits to ensure platform security and compliance.

## Audit Types

### Internal Audits

| Type | Frequency | Scope | Owner |
|------|-----------|-------|-------|
| Access Review | Quarterly | User permissions | Security Team |
| Code Review | Continuous | All code changes | Engineering |
| Configuration Audit | Monthly | Infrastructure | DevOps |
| Policy Compliance | Semi-annual | Security policies | CISO |

### External Audits

| Type | Frequency | Provider |
|------|-----------|----------|
| Penetration Test | Annual | Third-party firm |
| Compliance Audit | Annual | External auditor |
| Vulnerability Assessment | Quarterly | Security vendor |

## Access Review Audit

### Process

1. **Generate Access Report**
   ```
   - Export all user accounts
   - List all permissions
   - Identify inactive accounts
   ```

2. **Manager Review**
   ```
   - Send access lists to managers
   - Request confirmation
   - Flag unnecessary access
   ```

3. **Remediation**
   ```
   - Remove orphaned access
   - Revoke unnecessary permissions
   - Document changes
   ```

### Checklist

- [ ] All active employees verified
- [ ] Contractors reviewed
- [ ] Service accounts verified
- [ ] Inactive accounts removed
- [ ] Privileged access confirmed

## Code Security Audit

### Automated Scanning

**Tools:**
- GitHub Advanced Security
- Snyk (dependencies)
- SonarQube (code quality)
- Custom linting rules

**Scanning:**
```bash
# Dependency vulnerabilities
pnpm audit

# Secret detection
# (runs on every commit)

# Static analysis
# (runs on PR)
```

### Manual Review

**Security-Focused Review:**
- Input validation
- Authentication checks
- Authorization logic
- Data handling
- Error handling

**Checklist:**
- [ ] No secrets in code
- [ ] Input validated
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] CSRF protection
- [ ] Secure defaults

## Infrastructure Audit

### Configuration Review

**Monthly Checks:**
```
- Security group rules
- IAM policies
- SSL certificates
- Backup configurations
- Logging settings
```

### Tools

- AWS Config
- Terraform compliance
- Custom scripts

### Compliance Checks

| Control | Check | Frequency |
|---------|-------|-----------|
| Encryption at rest | Verify | Monthly |
| Encryption in transit | Verify | Monthly |
| Access logging | Verify | Monthly |
| Backup enabled | Verify | Weekly |
| MFA enabled | Verify | Monthly |

## Penetration Testing

### Scope

**In-Scope:**
- Web applications
- APIs
- Mobile apps
- Infrastructure

**Out-of-Scope:**
- Third-party services
- Physical security
- Social engineering

### Process

1. **Planning**
   - Define scope
   - Set rules of engagement
   - Schedule testing

2. **Execution**
   - Reconnaissance
   - Vulnerability scanning
   - Exploitation attempts
   - Post-exploitation

3. **Reporting**
   - Executive summary
   - Technical findings
   - Risk ratings
   - Remediation guidance

4. **Remediation**
   - Fix vulnerabilities
   - Retest
   - Verify fixes

### Timeline

| Phase | Duration |
|-------|----------|
| Planning | 1 week |
| Testing | 2 weeks |
| Reporting | 1 week |
| Remediation | 30-90 days |
| Retest | 1 week |

## Compliance Audit

### NDPR Compliance

**Requirements:**
- Lawful processing
- Data subject rights
- Security measures
- Breach notification

**Evidence:**
- Privacy policy
- Consent records
- Security controls
- Training records
- Incident logs

### PCI DSS (SAQ A)

**Requirements:**
- No card data storage
- Secure transmission
- Access controls
- Regular testing

**Evidence:**
- Network diagram
- Security policies
- Scan reports
- Penetration test

## Audit Documentation

### Audit Reports

**Structure:**
```
1. Executive Summary
2. Scope and Methodology
3. Findings
   - Severity
   - Description
   - Evidence
   - Recommendation
4. Remediation Plan
5. Appendices
```

### Finding Severity

| Rating | CVSS Score | Action |
|--------|------------|--------|
| Critical | 9.0-10.0 | Immediate |
| High | 7.0-8.9 | 7 days |
| Medium | 4.0-6.9 | 30 days |
| Low | 0.1-3.9 | 90 days |
| Informational | 0 | Track |

## Remediation Tracking

### Process

1. **Receive Finding**
   - Review audit report
   - Understand risk
   - Assign owner

2. **Plan Remediation**
   - Define solution
   - Estimate effort
   - Set timeline

3. **Implement Fix**
   - Develop solution
   - Test thoroughly
   - Deploy to production

4. **Verify**
   - Confirm fix
   - Update audit log
   - Close finding

### Tracking

| Finding | Owner | Due Date | Status |
|---------|-------|----------|--------|
| F-001 | John | 2026-03-15 | In Progress |
| F-002 | Jane | 2026-03-30 | Open |

## Audit Schedule

### Annual Calendar

| Month | Audit |
|-------|-------|
| Q1 | Penetration test |
| Q2 | Compliance audit |
| Q3 | Access review |
| Q4 | Policy review |

### Continuous

- Code scanning (every commit)
- Vulnerability scanning (weekly)
- Configuration audit (monthly)

---

**Questions?** Contact security@vayva.ng
