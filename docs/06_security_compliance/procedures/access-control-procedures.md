# Access Control Procedures

**Document ID:** VAYVA-ACP-001
**Version:** 1.0
**Effective Date:** 2026-03-23
**Last Reviewed:** 2026-03-23
**Next Review Date:** 2026-09-23
**Classification:** Confidential
**Owner:** Chief Technology Officer

---

## 1. Purpose

This document defines the procedures for managing access to Vayva's systems, applications, data, and infrastructure. It covers user provisioning, deprovisioning, role-based access control, multi-factor authentication, API key management, and privileged access management to ensure that access is granted on a least-privilege, need-to-know basis.

## 2. Scope

These procedures apply to all access to:

- Vayva production, staging, and development environments
- PostgreSQL databases and Redis caches
- VPS infrastructure (163.245.209.x)
- Vercel deployment platform
- GitHub repositories
- Third-party service dashboards (Paystack, OpenRouter)
- The Vayva platform application (admin panel, merchant dashboard, customer-facing stores)
- API keys, secrets, and credentials

## 3. User Provisioning

### 3.1 New Employee / Contractor Onboarding

**Requesting Access:**

1. The hiring manager submits an Access Request Form specifying:
   - Individual's full name, role, department
   - Start date
   - Systems requiring access
   - Access level requested (role from RBAC matrix)
   - Duration (permanent or time-limited for contractors)
   - Business justification

2. The CTO (or designated approver) reviews and approves the request

3. Access is provisioned within 1 business day of approved request

**Provisioning Steps:**

| System | Provisioning Action | Responsible |
|--------|---------------------|-------------|
| GitHub | Invite to organization; assign to appropriate team(s); enforce MFA | CTO / Engineering Lead |
| Vercel | Add to team with appropriate role (Developer / Admin) | CTO |
| VPS (SSH) | Generate SSH key pair; add public key to authorized_keys; assign to appropriate user group | DevOps / CTO |
| PostgreSQL | Create individual database user with role-appropriate permissions; no shared accounts | DevOps / CTO |
| Platform Admin Panel | Create admin account with appropriate role; enforce MFA | CTO |
| Paystack Dashboard | Add team member with appropriate permissions; enforce MFA | Finance / CTO |
| Communication Tools | Add to appropriate channels | Operations Lead |

### 3.2 Access Provisioning Rules

- Every user receives a unique, individual account — shared accounts are prohibited
- Default access is read-only; elevated access requires explicit approval
- Contractor access is time-limited and automatically expires on contract end date
- All new accounts require password change on first login
- MFA must be configured before accessing any production system

## 4. User Deprovisioning

### 4.1 Triggers for Deprovisioning

| Trigger | Timeline | Initiator |
|---------|----------|-----------|
| Voluntary resignation | Same day as last working day | HR / Hiring Manager |
| Termination for cause | Immediate (within 1 hour) | HR / CTO |
| Contract expiration | Day of contract end | Hiring Manager |
| Role change (internal transfer) | Within 1 business day | Hiring Manager |
| Extended leave (> 30 days) | Day leave begins (suspend, not delete) | HR |

### 4.2 Deprovisioning Checklist

Upon triggering deprovisioning, the following must be completed:

- [ ] **GitHub:** Remove from organization; revoke any personal access tokens
- [ ] **Vercel:** Remove from team
- [ ] **VPS:** Remove SSH public key from all servers; remove user account
- [ ] **PostgreSQL:** Revoke all database permissions; drop user account
- [ ] **Redis:** Rotate authentication credentials if shared
- [ ] **Platform Admin Panel:** Deactivate admin account; terminate all active sessions
- [ ] **Paystack Dashboard:** Remove team member access
- [ ] **API Keys:** Rotate any API keys the individual had access to
- [ ] **Environment Variables:** Rotate any secrets the individual had access to
- [ ] **Communication Tools:** Remove from all channels
- [ ] **Email / Google Workspace:** Suspend account; set up forwarding if needed
- [ ] **Physical Access:** Collect any devices; revoke physical access cards
- [ ] **Documentation:** Log deprovisioning actions with timestamps

### 4.3 Deprovisioning Verification

- Deprovisioning must be verified by a second person within 24 hours
- A confirmation record is filed in the Access Management Log
- Any anomalies (lingering access, failed revocations) are escalated immediately

## 5. Role-Based Access Control (RBAC)

### 5.1 Platform Roles

#### Internal Roles

| Role | Platform Access | Infrastructure Access | Data Access |
|------|----------------|----------------------|-------------|
| **Super Admin** | Full platform administration; all features | VPS SSH; database direct access; Vercel admin | All merchant and customer data; all logs |
| **Admin** | Platform administration; merchant management; configuration | Vercel viewer; no direct infrastructure | All merchant data (read); customer data (read, limited write) |
| **Operations** | Order management; customer support; merchant support | No infrastructure access | Active orders; customer communications; merchant profiles (read) |
| **Developer** | Development environment; staging environment | Staging VPS; staging database; GitHub | Development/staging data only; no production data access |

#### Merchant Roles

| Role | Store Access | Data Access | Configuration |
|------|-------------|-------------|---------------|
| **Merchant Owner** | Full store access | Own store data; own customers; own orders; own AI conversations | Full store configuration; AI setup; team management |
| **Merchant Manager** | Store management; order processing | Own store data; own customers; own orders | Limited configuration; no billing access |
| **Merchant Staff** | Assigned functions only | Orders (assigned); customer communications (assigned) | No configuration access |

#### Customer Roles

| Role | Access |
|------|--------|
| **Customer** | Own profile; own order history; own conversations; own payment methods |

### 5.2 Role Assignment

- Roles are assigned based on job function, not individual preference
- Each user is assigned the minimum role necessary for their duties
- Dual roles are permitted only with explicit CTO approval and documented justification
- Role assignments are recorded in the Access Management Log

### 5.3 Privilege Escalation

- Temporary privilege escalation requires CTO approval
- Must be time-limited (maximum 72 hours)
- Must be logged with justification
- Must be reviewed and revoked upon expiration
- Automated reminders sent 24 hours before escalation expiry

## 6. Multi-Factor Authentication (MFA)

### 6.1 MFA Requirements

| System | MFA Required | Acceptable Methods |
|--------|-------------|-------------------|
| Production VPS (SSH) | Yes (SSH key = first factor; consider IP restriction as additional control) | SSH key + IP allowlisting |
| PostgreSQL Production | Access via SSH tunnel only | SSH key (tunnel) + database credentials |
| Platform Admin Panel | Yes | TOTP (authenticator app); WebAuthn/FIDO2 |
| Vercel Dashboard | Yes | TOTP; WebAuthn |
| GitHub | Yes | TOTP; WebAuthn; GitHub Mobile |
| Paystack Dashboard | Yes | As configured by Paystack |
| Merchant Dashboard (Owner/Manager) | Recommended; enforced for high-value accounts | TOTP |
| Customer Accounts | Optional (encouraged) | SMS OTP; TOTP |

### 6.2 MFA Implementation Rules

- SMS-based OTP is acceptable for customer accounts but not recommended for internal or admin accounts due to SIM-swap risks prevalent in the Nigerian market
- TOTP via authenticator app (Google Authenticator, Authy, 1Password) is the preferred method
- WebAuthn/FIDO2 hardware keys are recommended for Super Admin accounts
- Backup/recovery codes must be generated and stored securely upon MFA setup
- MFA cannot be disabled without CTO approval

### 6.3 MFA Recovery

- Lost MFA device: Identity verification required (video call with manager + government ID)
- MFA reset must be logged and reviewed
- Temporary access without MFA is not permitted

## 7. API Key Management

### 7.1 Key Inventory

| Key / Secret | Purpose | Storage Location | Rotation Frequency |
|-------------|---------|-----------------|-------------------|
| Paystack Secret Key | Payment processing | VPS environment variable | 90 days |
| Paystack Public Key | Client-side payment initialization | Frontend environment variable | 90 days |
| OpenRouter API Key | AI model access (GPT-4o Mini, Llama 3.3 70B) | VPS environment variable | 90 days |
| Evolution API Key | WhatsApp messaging | VPS environment variable | 90 days |
| NextAuth / Better Auth Secret | Session signing | VPS environment variable | 90 days |
| Database Connection String | PostgreSQL access | VPS environment variable | On compromise or personnel change |
| Redis Password | Cache authentication | VPS environment variable | On compromise or personnel change |
| Vercel API Token | Deployment automation | CI/CD secrets | 90 days |
| GitHub Deploy Key | Repository access | CI/CD secrets | 180 days |

### 7.2 Key Management Rules

1. **Never commit keys to source code** — all keys stored in environment variables or secrets management
2. **No keys in logs** — logging systems must be configured to redact sensitive values
3. **Individual accountability** — where feasible, use individual API keys rather than shared keys
4. **Rotation schedule** — all keys rotated per the schedule above or immediately on suspected compromise
5. **Rotation procedure:**
   - Generate new key in the service provider dashboard
   - Update environment variable on VPS / Vercel
   - Verify application functions correctly with new key
   - Revoke old key
   - Document rotation in the Key Management Log
6. **Key access** — only Super Admin and CTO have access to production API keys
7. **Development keys** — separate API keys for development/staging environments; never use production keys in development

### 7.3 Secrets Scanning

- Pre-commit hooks must be configured to prevent accidental key commits
- Repository scanning tools (e.g., GitHub secret scanning, git-secrets) must be enabled
- Any detected secret in source code triggers immediate rotation

## 8. Database Access

### 8.1 Production Database (PostgreSQL)

**Access Rules:**

| Who | Access Type | Method | Conditions |
|-----|-----------|--------|------------|
| Super Admin / CTO | Full read/write | SSH tunnel to VPS, then psql | Logged; justified; MFA required |
| DBA / DevOps | Schema management; performance tuning | SSH tunnel | Change management approval for schema changes |
| Application (backend) | Application-scoped read/write | Connection string via environment variable | Connection pooling; parameterized queries only |
| Developers | No direct production access | N/A | Use staging database; request production data exports (anonymized) if needed |
| Operations | No direct access | N/A | Access data through application admin panel |

**Database Security Controls:**

- All connections require SSL/TLS
- Connection restricted to localhost and SSH tunnel IPs
- Individual database user accounts (no shared credentials)
- Query logging enabled for audit trail
- Automated daily backups with encryption
- Point-in-time recovery capability maintained
- No direct internet-facing database port exposure

### 8.2 Redis Cache

**Access Rules:**

- Authentication (requirepass) enabled
- Bound to localhost / private network only
- No direct external access
- Application connects via local socket or private network
- Sensitive data in Redis must have TTL (time-to-live) set
- No persistent storage of PII in Redis without encryption

### 8.3 Data Export and Anonymization

- Production data must never be copied to development environments without anonymization
- Anonymization must remove or replace: names, email addresses, phone numbers, addresses, payment references
- Anonymization process must be documented and approved by the DPO
- Anonymized datasets must be validated to ensure re-identification is not possible

## 9. Production Environment Access

### 9.1 VPS Access (163.245.209.x)

**Access Controls:**

- SSH key-based authentication only (password authentication disabled)
- Root login via SSH disabled (use individual accounts with sudo)
- SSH access logged with timestamp, source IP, and user identity
- Firewall (ufw/iptables) configured to restrict SSH to authorized IPs where feasible
- Fail2ban configured to block brute-force attempts
- Session timeout after 15 minutes of inactivity

**Change Management:**

- All production changes require documented approval
- Changes executed during maintenance windows where possible
- Rollback plan documented before changes are applied
- Changes logged in the Change Management Log

### 9.2 Vercel Environment

- Production deployments require approval from CTO or designated reviewer
- Environment variables (secrets) managed through Vercel dashboard with restricted access
- Preview deployments do not contain production secrets
- Deployment logs retained for 90 days

### 9.3 CI/CD Pipeline

- Pipeline secrets stored in GitHub Actions secrets or equivalent
- Pipeline runs logged and auditable
- Production deployment pipeline requires manual approval gate
- Pipeline configuration changes require code review

## 10. Access Reviews

### 10.1 Review Schedule

| Review Type | Frequency | Scope | Reviewer |
|-------------|-----------|-------|----------|
| User access review | Quarterly | All user accounts across all systems | CTO + Department Leads |
| Privileged access review | Monthly | Super Admin, root, database admin accounts | CTO |
| Service account review | Quarterly | Application service accounts; API integrations | CTO + DevOps |
| Dormant account review | Monthly | Accounts with no login in 30+ days | Operations Lead |
| Third-party access review | Semi-annually | Contractor, vendor, partner access | CTO + Legal |

### 10.2 Review Procedure

1. Generate access report for all systems in scope
2. Compare current access against approved roles and active personnel roster
3. Identify discrepancies: orphaned accounts, excessive permissions, dormant accounts
4. Remediate: revoke unauthorized access, adjust permissions, disable dormant accounts
5. Document findings and remediation in the Access Review Log
6. Escalate unresolved issues to the CTO within 5 business days

### 10.3 Automated Controls

Where feasible, implement:

- Automatic session expiration (24 hours for web sessions; 15 minutes for SSH)
- Automatic account lockout after 5 failed login attempts
- Automatic alerts for unusual access patterns (e.g., access from new IP, off-hours access)
- Automatic disabling of accounts dormant for 90+ days

## 11. Emergency Access

### 11.1 Break-Glass Procedure

In exceptional circumstances where normal access is unavailable and immediate access is required to address a P1 incident:

1. The Incident Commander authorizes emergency access
2. Emergency credentials are retrieved from the secure break-glass store
3. All actions performed under emergency access are logged
4. Emergency access is revoked immediately after the incident is resolved
5. A post-incident review includes review of all emergency access actions
6. Emergency credentials are rotated after each use

### 11.2 Break-Glass Credential Storage

- Stored in a secure, offline location (encrypted USB or physical safe)
- Access requires two authorized individuals (dual control)
- Tested quarterly to ensure credentials remain valid
- Inventory of break-glass credentials reviewed monthly

## 12. Logging and Monitoring

### 12.1 Access Logging Requirements

All access events must be logged, including:

- Successful and failed authentication attempts
- Privilege escalation events
- Access to restricted data
- Administrative actions (user creation, deletion, role changes)
- Database queries involving PII (where feasible)
- API key usage

### 12.2 Log Retention

- Authentication logs: 1 year
- Administrative action logs: 2 years
- Database access logs: 1 year
- API access logs: 90 days

### 12.3 Log Protection

- Logs stored separately from application data
- Logs are append-only (no modification or deletion by application accounts)
- Log access restricted to Super Admin and designated security personnel
- Logs are included in backup and retention procedures

## 13. Related Documents

- Information Security Policy (VAYVA-ISP-001)
- Data Protection Policy (VAYVA-DPP-001)
- Incident Response Plan (VAYVA-IRP-001)
- Data Breach Response Procedure (VAYVA-DBR-001)

---

**Approved by:** ___________________________
**Title:** Chief Technology Officer
**Date:** ___________________________

**Reviewed by:** ___________________________
**Title:** Data Protection Officer
**Date:** ___________________________
