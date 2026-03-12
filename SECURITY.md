
# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Vayva Platform seriously. If you have discovered a security vulnerability, please report it to us immediately.

### How to Report

Please do NOT report security vulnerabilities through public GitHub issues.

Instead, please send an email to **<security@vayva.ng>**.

Please include as much information as possible to help us reproduce and resolve the issue:

- Type of vulnerability (e.g., XSS, SQL Injection, Auth Bypass)
- Affected URL or component
- Steps to reproduce
- Proof of Concept (PoC) code or screenshots

### Response Timeline

- **Acknowledgement**: We will acknowledge your report within 24 hours.
- **Assessment**: We will assess the severity and impact within 3 days.
- **Resolution**: We aim to release a fix for critical vulnerabilities within 7 days.

### Safe Harbor

If you conduct security research on Vayva Platform:

- You must comply with all applicable laws.
- You must not disrupt production systems or access data belonging to others.
- You must give us reasonable time to fix the vulnerability before public disclosure.

We will not take legal action against researchers who follow these guidelines.

## Security Features

### Authentication

- All access requires secure authentication via NextAuth.
- Multi-factor authentication is enforced for sensitive admin actions.

### Data Protection

- User passwords are never stored in plain text.
- All API communication is encrypted via TLS 1.2+.
- Tenant data is isolated using strict ownership verification hooks.

### Rate Limiting

- Public endpoints are rate-limited to prevent abuse.
- Mutation endpoints (e.g., checkout, disputes) have strict limits.

### Monitoring

- Sensitive actions are audit-logged (`AdminAuditLog`).
- Unusual activity patterns trigger internal alerts.
