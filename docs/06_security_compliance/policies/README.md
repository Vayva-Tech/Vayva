# Security Policies

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026

---

## Overview

This document outlines Vayva's security policies and compliance framework.

## Information Security Policy

### Purpose

Protect Vayva's information assets including customer data, merchant data, and platform infrastructure.

### Scope

Applies to all employees, contractors, and third parties with access to Vayva systems.

### Policy Statements

1. **Data Classification**
   - Public: Marketing materials
   - Internal: Business processes
   - Confidential: Customer data, financials
   - Restricted: Passwords, API keys, payment data

2. **Access Control**
   - Principle of least privilege
   - Role-based access control (RBAC)
   - Regular access reviews
   - Immediate deprovisioning

3. **Data Protection**
   - Encryption at rest (AES-256)
   - Encryption in transit (TLS 1.3)
   - Secure key management
   - Regular backups

## Acceptable Use Policy

### Permitted Use

- Business-related activities
- Authorized development work
- Approved testing

### Prohibited Use

- Unauthorized access attempts
- Malware distribution
- Data exfiltration
- Personal use of production systems
- Sharing credentials

### Consequences

Violations may result in:
- Access revocation
- Disciplinary action
- Legal proceedings
- Termination

## Password Policy

### Requirements

| Requirement | Minimum |
|-------------|---------|
| Length | 12 characters |
| Complexity | Upper, lower, number, symbol |
| Rotation | 90 days |
| Reuse | No last 12 passwords |
| MFA | Required for all accounts |

### Storage

- Passwords hashed with bcrypt
- No plaintext storage
- No password hints

## Data Retention Policy

### Retention Periods

| Data Type | Retention | After Retention |
|-----------|-----------|-----------------|
| User accounts | 7 years after deletion | Permanent deletion |
| Transaction logs | 7 years | Archive |
| Application logs | 90 days | Delete |
| Session data | 30 days | Delete |
| Failed login attempts | 90 days | Delete |

### Deletion Procedures

1. Automated deletion after retention period
2. Secure wiping (overwriting)
3. Deletion confirmation
4. Audit trail maintained

## Incident Response Policy

### Reporting

- Immediate reporting required
- Report to: security@vayva.ng
- No retaliation for good-faith reports

### Response

1. Containment
2. Investigation
3. Remediation
4. Communication
5. Lessons learned

### Breach Notification

- Internal: Within 1 hour
- Customers: Within 72 hours
- Regulators: As required by law

## Third-Party Security Policy

### Vendor Assessment

Required before engagement:
- Security questionnaire
- Compliance verification
- Data handling review
- Contract security clauses

### Ongoing Monitoring

- Annual security reviews
- Incident notification
- Access audits
- Termination procedures

## Compliance Framework

### NDPR (Nigeria Data Protection Regulation)

**Requirements:**
- Lawful data processing
- Data subject rights
- Security measures
- Breach notification
- Data protection officer

**Implementation:**
- Privacy policy
- Consent management
- Data processing agreements
- Security controls

### PCI DSS

**Scope:** Payment card data

**Compliance Level:** SAQ A

**Requirements:**
- No card data storage
- Secure transmission
- Access controls
- Regular testing

### SOC 2 (Planned)

**Trust Service Criteria:**
- Security
- Availability
- Processing integrity
- Confidentiality
- Privacy

## Security Training

### Employee Training

**Onboarding:**
- Security awareness
- Policy review
- Secure coding (developers)

**Annual:**
- Security refresher
- Phishing simulation
- Policy updates

### Developer Training

- Secure coding practices
- OWASP Top 10
- Vulnerability management
- Incident response

## Audit and Review

### Internal Audits

- Quarterly: Access reviews
- Semi-annual: Policy compliance
- Annual: Full security audit

### External Audits

- Annual: Penetration testing
- Annual: Compliance audit
- As needed: Vendor audits

### Review Schedule

| Policy | Review Frequency |
|--------|------------------|
| Information Security | Annual |
| Password Policy | Annual |
| Incident Response | Semi-annual |
| Data Retention | Annual |
| Acceptable Use | Annual |

## Policy Exceptions

### Request Process

1. Submit exception request
2. Risk assessment
3. Approval by CISO
4. Time-limited (max 90 days)
5. Regular review

### Documentation

All exceptions documented with:
- Business justification
- Risk acceptance
- Mitigation measures
- Expiration date

## Enforcement

### Responsibilities

- **CISO:** Policy oversight
- **Managers:** Team compliance
- **Employees:** Individual compliance
- **HR:** Disciplinary action

### Violations

Categories:
- Minor: Unintentional, low impact
- Moderate: Intentional or medium impact
- Major: Intentional and high impact

---

**Questions?** Contact security@vayva.ng
