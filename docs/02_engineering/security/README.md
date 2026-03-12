# Security

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026

---

## Overview

Security is a core pillar of Vayva's platform. This document outlines our security practices, compliance measures, and recommendations.

## Security Principles

1. **Defense in Depth** - Multiple layers of security
2. **Least Privilege** - Minimal access rights
3. **Secure by Default** - Safe configurations out of the box
4. **Transparency** - Clear security practices

## Authentication

### Better Auth

Vayva uses [Better Auth](https://better-auth.com) for authentication:

- Session-based authentication
- Secure cookie handling
- CSRF protection
- Rate limiting on auth endpoints

### Session Management

- Sessions stored in Redis
- 30-day session expiration
- Secure, httpOnly cookies
- SameSite=strict enforcement

### Password Policy

- Minimum 8 characters
- Complexity requirements
- Bcrypt hashing (cost factor 12)
- No plaintext storage

## Authorization

### Role-Based Access Control (RBAC)

**Merchant Roles:**

| Role | Permissions |
|------|-------------|
| Owner | Full access |
| Admin | Manage products, orders, staff |
| Manager | Manage orders, view reports |
| Staff | View orders, update status |

**Ops Console Roles:**

| Role | Permissions |
|------|-------------|
| Super Admin | Full platform access |
| Support | View merchants, manage tickets |
| Finance | View transactions, process refunds |
| Analyst | View analytics, generate reports |

### Permission Checks

All API endpoints validate permissions:

```typescript
// Example permission check
if (!hasPermission(user, 'order:update', merchantId)) {
  throw new ForbiddenError('Insufficient permissions');
}
```

## Data Protection

### Encryption at Rest

- PostgreSQL data encrypted
- Redis data encrypted
- Backups encrypted
- File uploads encrypted (AES-256)

### Encryption in Transit

- TLS 1.3 for all connections
- HSTS headers enforced
- Certificate pinning for mobile

### PII Handling

**Collected PII:**
- Names
- Email addresses
- Phone numbers
- Addresses
- Payment information (via Paystack)

**PII Protection:**
- Redacted in logs
- Access audit trails
- Data minimization
- Retention limits

## API Security

### Rate Limiting

| Endpoint Type | Limit |
|---------------|-------|
| Authentication | 5 requests/minute |
| General API | 60-300 requests/minute (by plan) |
| Webhooks | 1000 requests/minute |

### Input Validation

- All inputs validated with Zod
- SQL injection prevention (Prisma ORM)
- XSS protection (output encoding)
- File upload restrictions

### CORS Policy

```
Allowed Origins:
- https://vayva.ng
- https://*.vayva.ng
- https://vayva.vercel.app
```

## Infrastructure Security

### Network Security

- VPC isolation
- Security groups
- DDoS protection (Cloudflare)
- WAF rules

### Server Security

- Regular OS updates
- Minimal attack surface
- SSH key authentication only
- Automated security scanning

### Database Security

- Private network access only
- Connection encryption
- Regular backups
- Point-in-time recovery

## Compliance

### PCI DSS

- Paystack handles card data
- No card data stored on Vayva servers
- PCI SAQ A compliance

### NDPR (Nigeria Data Protection Regulation)

- Lawful data processing
- Data subject rights
- Breach notification procedures
- Data protection officer

### GDPR (for international users)

- Consent management
- Right to deletion
- Data portability
- Privacy by design

## Incident Response

### Security Incident Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| P0 | Active breach | Immediate |
| P1 | Data exposure | 1 hour |
| P2 | Vulnerability | 24 hours |
| P3 | Security concern | 7 days |

### Response Process

1. **Detect** - Monitoring alerts
2. **Contain** - Limit impact
3. **Investigate** - Root cause analysis
4. **Remediate** - Fix and verify
5. **Communicate** - Notify affected parties
6. **Learn** - Update procedures

## Security Monitoring

### Automated Scanning

- Dependency vulnerability scanning
- Static code analysis
- Container scanning
- Infrastructure scanning

### Logging

Security events logged:
- Authentication attempts
- Permission changes
- Data exports
- Configuration changes
- Failed access attempts

### Alerts

Alerts triggered for:
- Multiple failed logins
- Unusual API usage
- Permission escalations
- Data access anomalies

## Secure Development

### Code Review

- Security-focused reviews
- OWASP Top 10 checks
- Secret scanning

### Secrets Management

- No secrets in code
- Environment variables
- Secret rotation
- Access auditing

### Testing

- Security unit tests
- Integration security tests
- Penetration testing (quarterly)

## Third-Party Security

### Vendor Assessment

All third-party services assessed for:
- Security certifications
- Data handling practices
- Incident history
- Compliance status

### Key Vendors

| Vendor | Purpose | Security |
|--------|---------|----------|
| Paystack | Payments | PCI DSS Level 1 |
| Vercel | Hosting | SOC 2 Type 2 |
| Neon | Database | SOC 2 Type 2 |
| Upstash | Redis | SOC 2 Type 2 |

## Security Checklist

### For Developers

- [ ] No secrets in code
- [ ] Input validation on all endpoints
- [ ] Proper error handling (no info leakage)
- [ ] Permission checks on all routes
- [ ] Secure dependencies only

### For DevOps

- [ ] Regular security updates
- [ ] Backup encryption verified
- [ ] Access logs reviewed
- [ ] SSL certificates valid
- [ ] Security groups audited

### For Product

- [ ] Privacy policy current
- [ ] Data retention limits set
- [ ] User consent flows reviewed
- [ ] Security features documented

## Reporting Security Issues

If you discover a security vulnerability:

1. **Email:** security@vayva.ng
2. **Do not** disclose publicly
3. Include detailed description
4. Allow 90 days for resolution

We offer bug bounties for verified vulnerabilities.

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Better Auth Docs](https://better-auth.com/docs)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/security)

---

**Questions?** Contact security@vayva.ng
