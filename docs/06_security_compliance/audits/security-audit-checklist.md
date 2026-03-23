# Security Audit Checklist

**Document ID:** VAYVA-SAC-001
**Version:** 1.0
**Effective Date:** 2026-03-23
**Last Reviewed:** 2026-03-23
**Next Review Date:** 2026-09-23
**Classification:** Confidential
**Owner:** Chief Technology Officer

---

## 1. Purpose

This checklist provides a structured framework for conducting security audits of the Vayva commerce platform. It covers application security, infrastructure security, data protection, access management, dependency management, and compliance verification. Audits should be conducted quarterly (internal) and annually (external) to identify vulnerabilities, verify control effectiveness, and ensure regulatory compliance.

## 2. Audit Schedule

| Audit Type | Frequency | Conducted By | Scope |
|-----------|-----------|-------------|-------|
| Internal security review | Quarterly | CTO / Engineering Lead | Application, infrastructure, access |
| NDPR compliance audit | Annually | Licensed DPCO (external) | Full data protection compliance |
| Penetration test | Semi-annually | External security firm | Application and infrastructure |
| Dependency scan | Continuous (CI/CD) + monthly review | Engineering team | All dependencies |
| Access review | Quarterly (monthly for privileged) | CTO + Department Leads | All user access |
| Third-party vendor review | Semi-annually | CTO + DPO | All data processors |

## 3. Application Security (OWASP Top 10)

### 3.1 A01: Broken Access Control

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 3.1.1 | RBAC enforced on all API endpoints (merchant, admin, ops, customer) | | | |
| 3.1.2 | Merchants cannot access other merchants' data (tenant isolation) | | | |
| 3.1.3 | Customers cannot access other customers' data | | | |
| 3.1.4 | Admin panel protected by authentication and authorization | | | |
| 3.1.5 | API endpoints enforce object-level authorization (e.g., merchant can only access own orders) | | | |
| 3.1.6 | Direct object reference (IDOR) vulnerabilities tested | | | |
| 3.1.7 | Rate limiting implemented on authentication endpoints | | | |
| 3.1.8 | CORS policy correctly configured (only authorized origins) | | | |
| 3.1.9 | JWT/session token validation on every authenticated request | | | |
| 3.1.10 | Function-level access control (admin functions not accessible to merchants) | | | |

### 3.2 A02: Cryptographic Failures

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 3.2.1 | TLS 1.2+ enforced on all external connections | | | |
| 3.2.2 | Passwords hashed with bcrypt (cost >= 12) or Argon2id | | | |
| 3.2.3 | PII encrypted at rest in PostgreSQL (AES-256) | | | |
| 3.2.4 | API keys and secrets not stored in source code | | | |
| 3.2.5 | Database connection uses SSL/TLS | | | |
| 3.2.6 | Backup files encrypted | | | |
| 3.2.7 | No sensitive data in URL parameters | | | |
| 3.2.8 | Proper key management (keys stored separately from data) | | | |
| 3.2.9 | No deprecated or weak cryptographic algorithms in use | | | |

### 3.3 A03: Injection

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 3.3.1 | Parameterized queries / ORM used for all database operations | | | |
| 3.3.2 | SQL injection testing performed on all input fields | | | |
| 3.3.3 | NoSQL injection testing (if applicable) | | | |
| 3.3.4 | Command injection prevention (no shell commands from user input) | | | |
| 3.3.5 | XSS prevention: output encoding on all user-generated content | | | |
| 3.3.6 | XSS prevention: Content Security Policy (CSP) headers configured | | | |
| 3.3.7 | AI prompt injection testing (user input to GPT-4o Mini / Llama 3.3) | | | |
| 3.3.8 | Template injection prevention | | | |
| 3.3.9 | LDAP / XML injection prevention (if applicable) | | | |

### 3.4 A04: Insecure Design

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 3.4.1 | Threat modeling completed for core flows (auth, payment, AI chat) | | | |
| 3.4.2 | Security requirements defined for each feature | | | |
| 3.4.3 | Multi-tenant isolation design reviewed | | | |
| 3.4.4 | AI assistant access scoped to merchant's own data only | | | |
| 3.4.5 | Payment flow security design reviewed (Paystack integration) | | | |
| 3.4.6 | Data flow diagrams current and accurate | | | |

### 3.5 A05: Security Misconfiguration

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 3.5.1 | Default credentials changed on all systems | | | |
| 3.5.2 | Unnecessary features, services, and ports disabled | | | |
| 3.5.3 | Error messages do not expose stack traces or system details | | | |
| 3.5.4 | Security headers configured (X-Frame-Options, X-Content-Type-Options, HSTS, CSP) | | | |
| 3.5.5 | Directory listing disabled on web servers | | | |
| 3.5.6 | Debug mode disabled in production | | | |
| 3.5.7 | Vercel environment variables correctly scoped (production vs. preview) | | | |
| 3.5.8 | Redis not exposed to public network | | | |
| 3.5.9 | PostgreSQL not exposed to public network | | | |

### 3.6 A06: Vulnerable and Outdated Components

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 3.6.1 | npm/pnpm audit shows no critical or high vulnerabilities | | | |
| 3.6.2 | All frameworks and libraries at supported versions | | | |
| 3.6.3 | Node.js runtime at supported LTS version | | | |
| 3.6.4 | PostgreSQL at supported version | | | |
| 3.6.5 | Redis at supported version | | | |
| 3.6.6 | Operating system patches current on VPS | | | |
| 3.6.7 | Automated dependency scanning in CI/CD pipeline | | | |
| 3.6.8 | Dependabot or equivalent enabled on GitHub repository | | | |

### 3.7 A07: Identification and Authentication Failures

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 3.7.1 | Account lockout after 5 failed attempts | | | |
| 3.7.2 | MFA enabled for admin and privileged accounts | | | |
| 3.7.3 | Password complexity requirements enforced | | | |
| 3.7.4 | Session tokens securely generated (sufficient entropy) | | | |
| 3.7.5 | Session tokens invalidated on logout | | | |
| 3.7.6 | Session timeout configured (24 hours for web, 15 minutes for SSH) | | | |
| 3.7.7 | Password reset flow secure (token-based, time-limited) | | | |
| 3.7.8 | Credential stuffing protections in place (rate limiting, CAPTCHA) | | | |
| 3.7.9 | NextAuth/Better Auth configured securely | | | |

### 3.8 A08: Software and Data Integrity Failures

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 3.8.1 | CI/CD pipeline integrity verified (no unauthorized modifications) | | | |
| 3.8.2 | Dependencies verified via lockfile (pnpm-lock.yaml integrity) | | | |
| 3.8.3 | Signed commits recommended/enforced for production branches | | | |
| 3.8.4 | Webhook signatures verified (Paystack webhooks) | | | |
| 3.8.5 | Deserialization of untrusted data prevented | | | |

### 3.9 A09: Security Logging and Monitoring Failures

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 3.9.1 | Authentication events logged (success and failure) | | | |
| 3.9.2 | Authorization failures logged | | | |
| 3.9.3 | Input validation failures logged | | | |
| 3.9.4 | Admin actions logged with user identity and timestamp | | | |
| 3.9.5 | Logs protected from tampering | | | |
| 3.9.6 | Log retention meets policy requirements (1 year for auth, 2 years for admin) | | | |
| 3.9.7 | Alerting configured for suspicious patterns | | | |
| 3.9.8 | Logs do not contain sensitive data (passwords, API keys, PII) | | | |

### 3.10 A10: Server-Side Request Forgery (SSRF)

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 3.10.1 | User-supplied URLs validated and restricted | | | |
| 3.10.2 | Internal network access prevented from application layer | | | |
| 3.10.3 | Webhook callback URLs validated | | | |
| 3.10.4 | AI-generated URLs not automatically fetched without validation | | | |

## 4. Infrastructure Security

### 4.1 VPS Security (163.245.209.x)

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 4.1.1 | SSH key-based authentication only (password auth disabled) | | | |
| 4.1.2 | Root SSH login disabled | | | |
| 4.1.3 | SSH on non-standard port (or fail2ban configured) | | | |
| 4.1.4 | Firewall (ufw/iptables) configured and active | | | |
| 4.1.5 | Only necessary ports open (22/SSH, 443/HTTPS, application ports) | | | |
| 4.1.6 | fail2ban installed and configured | | | |
| 4.1.7 | Unattended security updates enabled | | | |
| 4.1.8 | System logs monitored | | | |
| 4.1.9 | Intrusion detection (IDS) installed or planned | | | |
| 4.1.10 | File integrity monitoring in place or planned | | | |
| 4.1.11 | No unnecessary services running | | | |
| 4.1.12 | Regular vulnerability scans conducted | | | |

### 4.2 Database Security (PostgreSQL)

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 4.2.1 | Database not exposed to public network | | | |
| 4.2.2 | SSL/TLS required for all connections | | | |
| 4.2.3 | Individual database user accounts (no shared credentials) | | | |
| 4.2.4 | Least privilege database permissions | | | |
| 4.2.5 | Default 'postgres' superuser account secured | | | |
| 4.2.6 | Automated daily backups configured | | | |
| 4.2.7 | Backup encryption enabled | | | |
| 4.2.8 | Backup restoration tested (last test date: ___) | | | |
| 4.2.9 | Audit logging enabled for sensitive tables | | | |
| 4.2.10 | Connection pooling configured with appropriate limits | | | |

### 4.3 Redis Security

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 4.3.1 | Authentication (requirepass) enabled | | | |
| 4.3.2 | Bound to localhost / private network only | | | |
| 4.3.3 | Not exposed to public network | | | |
| 4.3.4 | Dangerous commands disabled or renamed (FLUSHALL, CONFIG, DEBUG) | | | |
| 4.3.5 | TTL set on all session/cache data | | | |
| 4.3.6 | No PII stored without encryption | | | |

### 4.4 Vercel Security

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 4.4.1 | Team members have appropriate roles | | | |
| 4.4.2 | Environment variables correctly scoped | | | |
| 4.4.3 | Production secrets not in preview deployments | | | |
| 4.4.4 | Deployment protection configured | | | |
| 4.4.5 | HTTPS enforced on all custom domains | | | |
| 4.4.6 | Security headers configured in next.config or middleware | | | |

### 4.5 Network Security

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 4.5.1 | All external traffic over HTTPS/TLS | | | |
| 4.5.2 | Internal service communication secured | | | |
| 4.5.3 | DNS configured correctly (no dangling records) | | | |
| 4.5.4 | DDoS mitigation in place or planned | | | |
| 4.5.5 | WAF configured or planned for API endpoints | | | |

## 5. Data Protection Audit

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 5.1 | Data inventory/register is current and complete | | | |
| 5.2 | Privacy notices are accurate and up to date | | | |
| 5.3 | Consent records are maintained with timestamps | | | |
| 5.4 | Data subject request process is functional and tested | | | |
| 5.5 | Data retention schedule is implemented and enforced | | | |
| 5.6 | Data deletion/anonymization processes work correctly | | | |
| 5.7 | Cross-border data transfer safeguards in place (Vercel, OpenRouter) | | | |
| 5.8 | Data Processing Agreements signed with all processors | | | |
| 5.9 | DPIAs completed for high-risk processing (AI conversations, WhatsApp) | | | |
| 5.10 | Breach notification procedure tested | | | |
| 5.11 | Data minimization principle verified (no unnecessary data collected) | | | |
| 5.12 | AI conversation data retention (90 days) enforced | | | |
| 5.13 | WhatsApp message retention (90 days) enforced | | | |

## 6. Access Review

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 6.1 | All user accounts match active personnel roster | | | |
| 6.2 | No orphaned accounts (former employees/contractors) | | | |
| 6.3 | No dormant accounts (90+ days inactive) | | | |
| 6.4 | Privileged accounts justified and documented | | | |
| 6.5 | MFA enabled on all admin and privileged accounts | | | |
| 6.6 | API keys rotated within policy period (90 days) | | | |
| 6.7 | SSH keys audited (no unauthorized keys) | | | |
| 6.8 | Database user permissions match role requirements | | | |
| 6.9 | Third-party access is current and justified | | | |
| 6.10 | Service accounts have minimum necessary permissions | | | |

## 7. Dependency Scanning

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 7.1 | `pnpm audit` run — critical vulnerabilities: ___ high: ___ | | | |
| 7.2 | All critical vulnerabilities remediated or accepted with justification | | | |
| 7.3 | All high vulnerabilities remediated or scheduled | | | |
| 7.4 | Dependabot / Renovate enabled and alerts reviewed | | | |
| 7.5 | No dependencies with known supply chain compromises | | | |
| 7.6 | License compliance verified (no GPL in proprietary code, etc.) | | | |
| 7.7 | Dependencies pinned to specific versions (lockfile) | | | |

## 8. Penetration Testing

### 8.1 Schedule

| Test Type | Frequency | Last Conducted | Next Scheduled |
|-----------|-----------|---------------|----------------|
| External network penetration test | Semi-annually | | |
| Web application penetration test | Semi-annually | | |
| API penetration test | Semi-annually | | |
| Social engineering assessment | Annually | | |
| AI/LLM-specific security assessment | Annually | | |

### 8.2 Penetration Test Scope

Each penetration test must include:

- [ ] Authentication and session management
- [ ] Authorization and access control (multi-tenant isolation)
- [ ] Input validation and injection attacks
- [ ] Business logic flaws (payment flows, AI interactions)
- [ ] API security (all endpoints)
- [ ] Infrastructure security (VPS, database exposure)
- [ ] Third-party integration security (Paystack webhooks, Evolution API)
- [ ] AI-specific attacks (prompt injection, data extraction via AI)

### 8.3 Penetration Test Findings Management

- Critical findings: remediate within 7 days
- High findings: remediate within 30 days
- Medium findings: remediate within 90 days
- Low findings: remediate within 180 days or accept with documented justification
- All findings tracked to closure
- Retest to verify remediation

## 9. Compliance Verification

| # | Check Item | Status | Evidence | Notes |
|---|-----------|--------|----------|-------|
| 9.1 | NDPR annual audit completed and filed with NITDA | | | |
| 9.2 | DPO appointed and registered with NITDA | | | |
| 9.3 | Data protection policies current and approved | | | |
| 9.4 | Privacy policy published and up to date | | | |
| 9.5 | Security awareness training completed by all personnel | | | |
| 9.6 | Incident response plan tested within last 12 months | | | |
| 9.7 | Business continuity plan tested within last 12 months | | | |
| 9.8 | All regulatory findings from previous audits addressed | | | |
| 9.9 | Data processing agreements in place with all third parties | | | |
| 9.10 | Cross-border data transfer mechanisms documented | | | |

## 10. Audit Findings Template

### Finding Report

| Field | Details |
|-------|---------|
| **Finding ID** | VAYVA-AUDIT-[YYYY]-[NNN] |
| **Date** | |
| **Auditor** | |
| **Category** | Application / Infrastructure / Data Protection / Access / Compliance |
| **Severity** | Critical / High / Medium / Low / Informational |
| **Description** | |
| **Affected System(s)** | |
| **Risk** | |
| **Recommendation** | |
| **Remediation Owner** | |
| **Remediation Deadline** | |
| **Status** | Open / In Progress / Remediated / Accepted / Closed |
| **Verification Date** | |

## 11. Audit Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Audit Lead | | | |
| CTO | | | |
| DPO | | | |
| CEO | | | |

---

**Approved by:** ___________________________
**Title:** Chief Technology Officer
**Date:** ___________________________
