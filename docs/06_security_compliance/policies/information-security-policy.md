# Information Security Policy

**Document ID:** VAYVA-ISP-001
**Version:** 1.0
**Effective Date:** 2026-03-23
**Last Reviewed:** 2026-03-23
**Next Review Date:** 2026-09-23
**Classification:** Internal
**Owner:** Chief Technology Officer / Data Protection Officer

---

## 1. Purpose

This Information Security Policy establishes the framework for protecting the confidentiality, integrity, and availability of all information assets owned, controlled, or processed by Vayva Technologies Limited ("Vayva"). It defines the security requirements, responsibilities, and controls necessary to safeguard merchant data, customer personally identifiable information (PII), payment information, and business-critical systems.

## 2. Scope

This policy applies to:

- All employees, contractors, and third-party service providers with access to Vayva systems
- All information assets including data, software, hardware, and network infrastructure
- All environments: production, staging, development, and disaster recovery
- All platforms: Vercel-hosted frontends, VPS backend infrastructure, PostgreSQL databases, Redis caches, and third-party integrations
- All data processed through the Vayva platform including merchant data, customer PII, transaction records, AI conversation logs, and WhatsApp messaging data

### 2.1 Out of Scope

- Payment card data processing, which is handled exclusively by Paystack under their PCI DSS certification
- Third-party service provider internal security (OpenRouter, Evolution API, Vercel), governed by their respective security policies and our vendor agreements

## 3. Policy Objectives

1. **Protect** merchant and customer data from unauthorized access, disclosure, alteration, or destruction
2. **Comply** with the Nigeria Data Protection Regulation (NDPR) 2019, the Nigeria Data Protection Act (NDPA) 2023, and other applicable regulations
3. **Maintain** the availability and reliability of the Vayva commerce platform
4. **Establish** a security-aware culture across all teams
5. **Enable** rapid detection and response to security incidents
6. **Support** business continuity through resilient security architecture

## 4. Roles and Responsibilities

### 4.1 Executive Management

- Approve and endorse the information security policy
- Allocate adequate resources for security initiatives
- Receive and review quarterly security reports
- Ensure compliance with NDPR and other regulatory requirements

### 4.2 Data Protection Officer (DPO)

- Serve as the primary contact for the National Information Technology Development Agency (NITDA)
- Oversee data protection impact assessments (DPIAs)
- Monitor compliance with data protection regulations
- Manage data subject access requests
- Conduct or commission periodic privacy audits

### 4.3 Chief Technology Officer (CTO)

- Own the overall information security program
- Approve security architecture decisions
- Review and approve access to production systems
- Oversee vulnerability management and patching

### 4.4 Engineering Team

- Implement security controls in application code
- Follow secure coding standards (OWASP guidelines)
- Conduct code reviews with security focus
- Report potential vulnerabilities through established channels

### 4.5 Operations Team

- Maintain infrastructure security configurations
- Monitor security events and alerts
- Execute incident response procedures
- Manage backup and recovery systems

### 4.6 All Personnel

- Complete security awareness training upon onboarding and annually thereafter
- Report security incidents and suspicious activity immediately
- Comply with acceptable use policies
- Protect credentials and access tokens

## 5. Information Asset Classification

### 5.1 Classification Levels

| Level | Description | Examples | Handling Requirements |
|-------|-------------|----------|-----------------------|
| **Restricted** | Highest sensitivity; unauthorized disclosure causes severe damage | Database credentials, API keys, encryption keys, Paystack secret keys, OpenRouter API keys, SSH private keys | Encrypted at rest and in transit; access limited to named individuals; logged access; no local storage |
| **Confidential** | Sensitive business or personal data | Customer PII, merchant business data, transaction records, AI conversation logs, WhatsApp messages, session tokens | Encrypted at rest and in transit; role-based access; audit logging |
| **Internal** | For internal use; not intended for public disclosure | Architecture documents, internal procedures, development configurations, sprint plans | Access restricted to employees and authorized contractors; stored on approved platforms |
| **Public** | Intended for public distribution | Marketing materials, published API documentation, public-facing website content | No special handling required |

### 5.2 Asset Inventory

An information asset register shall be maintained and reviewed quarterly. The register must include:

- Asset description and owner
- Classification level
- Storage location(s)
- Access permissions
- Retention period
- Disposal method

## 6. Access Control Policy

### 6.1 Principles

- **Least Privilege:** Users receive only the minimum access necessary to perform their duties
- **Separation of Duties:** Critical operations require multiple authorized individuals
- **Need-to-Know:** Access to confidential and restricted information is granted only when required for a specific role or task

### 6.2 Authentication Requirements

| System | Minimum Requirement |
|--------|---------------------|
| Production VPS (163.245.209.x) | SSH key-based authentication only; password authentication disabled |
| PostgreSQL production database | Individual credentials; connections via SSH tunnel or private network only |
| Redis production cache | Authentication required; access via private network only |
| Vercel dashboard | SSO or strong password with MFA |
| GitHub repository | SSO or strong password with MFA; signed commits recommended |
| Paystack dashboard | MFA required |
| Admin panel | NextAuth/Better Auth session with MFA for admin roles |

### 6.3 Role-Based Access Control (RBAC)

The platform implements the following roles:

| Role | Access Scope |
|------|-------------|
| **Super Admin** | Full platform access; infrastructure; all merchant data |
| **Admin** | Platform administration; merchant management; no infrastructure access |
| **Operations** | Order management; customer support; read-only merchant data |
| **Merchant (Owner)** | Own store data; products; orders; customers; AI assistant configuration |
| **Merchant (Staff)** | Limited store data as configured by merchant owner |
| **Customer** | Own profile; order history; messaging |

### 6.4 Access Reviews

- Quarterly access reviews for all systems
- Immediate access revocation upon role change or termination
- Monthly review of privileged access accounts
- Annual review of service account permissions

## 7. Acceptable Use Policy

### 7.1 Permitted Use

- Business-related activities on Vayva systems
- Development, testing, and deployment of Vayva platform features
- Communication with merchants and customers through authorized channels

### 7.2 Prohibited Activities

- Accessing merchant or customer data without legitimate business purpose
- Sharing credentials or access tokens with unauthorized individuals
- Installing unauthorized software on production systems
- Using production data in development or testing environments without anonymization
- Transmitting restricted or confidential data over unencrypted channels
- Disabling or circumventing security controls
- Accessing AI conversation logs for purposes other than debugging, quality assurance, or responding to data subject requests

### 7.3 Personal Use

Limited personal use of company devices is permitted provided it does not interfere with work duties, violate any policy, or introduce security risks.

## 8. Password Policy

### 8.1 Requirements

| Parameter | Requirement |
|-----------|-------------|
| Minimum length | 12 characters |
| Complexity | Must contain uppercase, lowercase, numeric, and special characters |
| Maximum age | 90 days for user accounts; 180 days for service accounts |
| History | Cannot reuse the last 12 passwords |
| Lockout | Account locked after 5 failed attempts; 30-minute lockout period |
| Storage | Passwords must be hashed using bcrypt (cost factor >= 12) or Argon2id |

### 8.2 Additional Requirements

- Passwords must not contain dictionary words, usernames, or common patterns
- Default passwords must be changed immediately upon first login
- Shared or group passwords are prohibited
- Password managers are required for all personnel

### 8.3 API Keys and Tokens

- API keys (Paystack, OpenRouter, Evolution API) must be stored in environment variables, never in source code
- API keys must be rotated every 90 days or immediately upon suspected compromise
- Session tokens must expire after 24 hours of inactivity
- Refresh tokens must expire after 30 days

## 9. Encryption Standards

### 9.1 Data in Transit

| Channel | Standard |
|---------|----------|
| HTTPS (all web traffic) | TLS 1.2 minimum; TLS 1.3 preferred |
| API communications | TLS 1.2 minimum |
| SSH access to VPS | SSH protocol 2 with Ed25519 or RSA-4096 keys |
| Database connections | SSL/TLS required for all PostgreSQL connections |
| Redis connections | TLS where supported; private network isolation where not |
| WebSocket (WhatsApp/Evolution API) | WSS (WebSocket Secure) |

### 9.2 Data at Rest

| Data Type | Standard |
|-----------|----------|
| Database fields containing PII | AES-256 application-level encryption |
| Backup files | AES-256 encryption |
| Environment variables and secrets | Encrypted via platform secrets management (Vercel, VPS keyring) |
| File uploads | Encrypted storage with access-controlled retrieval |

### 9.3 Key Management

- Encryption keys must be stored separately from encrypted data
- Key rotation must occur at least annually or upon suspected compromise
- Key access is limited to the CTO and designated security personnel
- Hardware security modules (HSMs) should be used for production key management when feasible

## 10. Network Security

### 10.1 VPS Infrastructure

- Firewall configured to allow only required ports (22/SSH, 443/HTTPS, application-specific ports)
- SSH access restricted to authorized IP addresses where feasible
- Intrusion detection/prevention system (IDS/IPS) deployed or planned
- Regular vulnerability scanning of exposed services

### 10.2 Application Security

- Web Application Firewall (WAF) recommended for production endpoints
- Rate limiting on all API endpoints
- CORS configured to allow only authorized origins
- Content Security Policy (CSP) headers configured on all frontends
- Input validation and output encoding on all user-facing endpoints

## 11. Incident Reporting

### 11.1 Reporting Obligations

All personnel must report suspected security incidents immediately via:

1. **Urgent (P1/P2):** Direct message to CTO and DPO; followed by incident report within 1 hour
2. **Non-urgent (P3/P4):** Incident report submitted within 24 hours

### 11.2 What to Report

- Unauthorized access or attempted access to systems or data
- Loss or theft of devices containing Vayva data
- Suspected data breach or data exposure
- Phishing attempts targeting Vayva personnel
- Unusual system behavior or suspected malware
- Violation of any security policy

### 11.3 External Reporting

- Data breaches involving personal data must be reported to NITDA within 72 hours as required by the NDPR
- Affected data subjects must be notified without undue delay when the breach poses a high risk to their rights
- See the Data Breach Response Procedure (VAYVA-DBR-001) for detailed steps

## 12. Third-Party Security

### 12.1 Vendor Assessment

All third-party service providers with access to Vayva data must:

- Undergo security assessment before onboarding
- Maintain appropriate security certifications
- Sign data processing agreements (DPAs) where applicable
- Be subject to periodic security reviews

### 12.2 Current Third-Party Providers

| Provider | Data Shared | Security Posture |
|----------|-------------|------------------|
| **Paystack** | Payment transaction data | PCI DSS Level 1 certified |
| **OpenRouter** | AI conversation content (anonymized where possible) | Enterprise security; data processing agreement required |
| **Evolution API** | WhatsApp message content | Self-hosted instance; secured by Vayva |
| **Vercel** | Frontend application code; environment variables | SOC 2 Type II certified |
| **GitHub** | Source code | SOC 2 Type II certified; branch protection enforced |

## 13. Physical Security

### 13.1 Data Center

- VPS hosted in a data center with physical access controls, environmental monitoring, and redundant power
- Physical access restricted to authorized data center personnel

### 13.2 Endpoint Devices

- Full-disk encryption required on all devices used for Vayva development or administration
- Auto-lock enabled (maximum 5 minutes of inactivity)
- Remote wipe capability for company-managed devices

## 14. Business Continuity

- Daily automated backups of PostgreSQL database
- Backup integrity verification performed weekly
- Recovery Time Objective (RTO): 4 hours
- Recovery Point Objective (RPO): 1 hour
- Disaster recovery procedures documented and tested semi-annually

## 15. Security Awareness and Training

- All new personnel complete security awareness training within their first week
- Annual refresher training for all personnel
- Specialized training for developers on secure coding practices
- Phishing simulation exercises conducted quarterly

## 16. Compliance

This policy aligns with:

- Nigeria Data Protection Regulation (NDPR) 2019
- Nigeria Data Protection Act (NDPA) 2023
- NITDA Guidelines
- OWASP Application Security Verification Standard (ASVS)
- ISO 27001 principles (as a guiding framework)

## 17. Policy Enforcement

Violations of this policy may result in:

- Formal warning
- Restriction or revocation of access privileges
- Disciplinary action up to and including termination
- Legal action where warranted

## 18. Policy Review

This policy is reviewed semi-annually and updated as necessary to reflect changes in:

- Regulatory requirements
- Business operations
- Technology infrastructure
- Threat landscape

---

**Approved by:** ___________________________
**Title:** Chief Executive Officer
**Date:** ___________________________

**Reviewed by:** ___________________________
**Title:** Data Protection Officer
**Date:** ___________________________
