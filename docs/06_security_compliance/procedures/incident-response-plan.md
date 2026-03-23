# Incident Response Plan

**Document ID:** VAYVA-IRP-001
**Version:** 1.0
**Effective Date:** 2026-03-23
**Last Reviewed:** 2026-03-23
**Next Review Date:** 2026-09-23
**Classification:** Confidential
**Owner:** Chief Technology Officer

---

## 1. Purpose

This Incident Response Plan (IRP) defines the procedures for detecting, responding to, containing, eradicating, and recovering from security incidents affecting the Vayva commerce platform. It establishes roles, responsibilities, escalation paths, and communication protocols to minimize the impact of security incidents on business operations, data integrity, and regulatory compliance.

## 2. Scope

This plan covers all security incidents affecting:

- Vayva production infrastructure (VPS at 163.245.209.x, Vercel frontends)
- PostgreSQL databases and Redis caches
- Third-party integrations (Paystack, OpenRouter, Evolution API)
- Merchant and customer data
- Internal systems and personnel
- Application-level security events

## 3. Incident Classification

### 3.1 Priority Levels

| Priority | Severity | Description | Examples | Response Time | Resolution Target |
|----------|----------|-------------|----------|---------------|-------------------|
| **P1 — Critical** | Severe business impact; data breach confirmed or imminent | Active data breach; production database compromise; ransomware; payment system compromise; complete platform outage | Immediate (within 15 minutes) | 4 hours |
| **P2 — High** | Significant impact; potential data exposure; major service degradation | Unauthorized access to admin panel; DDoS attack; credential leak; AI system generating unauthorized data access; critical vulnerability actively exploited | Within 30 minutes | 8 hours |
| **P3 — Medium** | Limited impact; no confirmed data exposure; partial service disruption | Failed brute-force attempts; suspicious login patterns; non-critical vulnerability discovered; Evolution API connectivity issues; single merchant store affected | Within 2 hours | 24 hours |
| **P4 — Low** | Minimal impact; no data at risk; informational | Phishing email received; minor configuration drift; low-severity vulnerability in non-production system; single failed authentication | Within 8 hours | 72 hours |

### 3.2 Classification Criteria

When classifying an incident, consider:

1. **Data Impact:** Is personal data or restricted data affected?
2. **Scope:** How many merchants/customers are affected?
3. **Business Impact:** Is revenue, reputation, or service availability affected?
4. **Regulatory Impact:** Does this trigger NDPR notification requirements?
5. **Active Threat:** Is the attacker still present or the vulnerability still exploitable?

## 4. Incident Response Team

### 4.1 Core Team

| Role | Responsibility | Escalation Contact |
|------|---------------|--------------------|
| **Incident Commander (IC)** | Overall incident coordination; decision authority; communications | CTO (primary); CEO (backup) |
| **Technical Lead** | Technical investigation; containment; eradication | Senior Engineer (primary); CTO (backup) |
| **Data Protection Lead** | Assess data protection impact; manage NITDA notification | DPO (primary); Legal (backup) |
| **Communications Lead** | Internal and external communications; merchant/customer notification | CEO (primary); DPO (backup) |
| **Operations Lead** | System restoration; monitoring; post-recovery validation | DevOps/SRE (primary); CTO (backup) |

### 4.2 Extended Team (Engaged as Needed)

- Legal counsel
- External forensics specialist
- Paystack security team (for payment-related incidents)
- Hosting provider support

### 4.3 Contact List

A current Incident Response Contact List must be maintained separately and accessible offline. The list must include:

- Name, role, phone number (primary and backup), email, messaging handle
- Updated quarterly or upon any personnel change
- Stored securely but accessible during incidents (not solely on potentially compromised systems)

## 5. Incident Response Phases

### Phase 1: Detection and Alerting

#### 5.1 Detection Sources

| Source | Monitoring Method |
|--------|-------------------|
| Application logs | Centralized logging; anomaly detection |
| Server logs (VPS) | System log monitoring; fail2ban alerts |
| Database audit logs | Query monitoring; access pattern analysis |
| Authentication systems | Failed login alerts; unusual session patterns |
| Vercel deployment logs | Build and deployment anomaly alerts |
| Third-party notifications | Paystack, OpenRouter security advisories |
| User reports | Merchant/customer support tickets |
| External reports | Bug bounty submissions; security researcher disclosures |
| Automated scanning | Dependency vulnerability alerts; infrastructure scans |

#### 5.2 Initial Assessment

Upon detection, the first responder must:

1. **Verify** the event is a genuine security incident (not a false positive)
2. **Classify** the incident using the priority matrix (Section 3)
3. **Document** initial findings: time of detection, affected systems, indicators of compromise
4. **Notify** the Incident Commander based on priority:
   - P1/P2: Immediate phone call + messaging notification
   - P3/P4: Messaging notification + email within response time window
5. **Preserve** initial evidence (do not modify or delete logs)

### Phase 2: Containment

#### 5.3 Short-Term Containment

Goal: Stop the incident from spreading while preserving evidence.

**Actions by incident type:**

| Incident Type | Containment Actions |
|---------------|---------------------|
| **Unauthorized access** | Revoke compromised credentials; terminate active sessions; block source IPs |
| **Data breach** | Isolate affected systems; disable compromised API keys; block data exfiltration paths |
| **Malware/Ransomware** | Isolate affected servers from network; preserve disk image for forensics |
| **DDoS** | Enable rate limiting; engage CDN/DDoS protection; block attacking IPs |
| **API key compromise** | Rotate all potentially compromised keys (Paystack, OpenRouter, Evolution API); revoke old keys |
| **Database compromise** | Restrict database access to incident response team only; enable enhanced logging |

#### 5.4 Long-Term Containment

Goal: Implement temporary fixes that allow business operations to continue while the root cause is addressed.

- Deploy patched systems or temporary workarounds
- Implement additional monitoring on affected systems
- Establish clean communication channels if primary channels are compromised
- Maintain evidence preservation throughout

### Phase 3: Eradication

#### 5.5 Root Cause Identification

1. Analyze logs, forensic images, and indicators of compromise
2. Determine the initial attack vector (how the attacker gained access)
3. Identify all affected systems, accounts, and data
4. Determine the timeline of the incident

#### 5.6 Eradication Actions

- Remove malware, backdoors, or unauthorized accounts
- Patch vulnerabilities that were exploited
- Reset all credentials on affected systems
- Update firewall rules and access controls
- Review and harden configurations on affected systems
- Scan for indicators of compromise on related systems

### Phase 4: Recovery

#### 5.7 System Restoration

1. Restore systems from known-clean backups if necessary
2. Verify system integrity before returning to production
3. Re-enable services in a controlled manner
4. Implement enhanced monitoring for recurrence
5. Validate that all eradication steps were effective

#### 5.8 Recovery Verification Checklist

- [ ] All compromised credentials have been rotated
- [ ] Affected systems have been patched and hardened
- [ ] Backups have been verified as clean
- [ ] Enhanced monitoring is active
- [ ] All API integrations (Paystack, OpenRouter, Evolution API) are functioning correctly
- [ ] Merchant stores are operational
- [ ] Payment processing is functioning
- [ ] AI assistant responses are accurate and authorized
- [ ] No indicators of compromise detected in 24-hour monitoring window

### Phase 5: Post-Incident Review

#### 5.9 Post-Incident Review Meeting

A post-incident review must be conducted within **5 business days** of incident resolution for P1/P2 incidents and within **10 business days** for P3 incidents.

**Agenda:**
1. Incident timeline reconstruction
2. Root cause analysis
3. Effectiveness of the response
4. What went well
5. What could be improved
6. Action items with owners and deadlines

#### 5.10 Post-Incident Report

A written report must be produced containing:

- Executive summary
- Detailed timeline of events
- Root cause analysis
- Impact assessment (systems, data, business, regulatory)
- Response actions taken
- Lessons learned
- Remediation actions with responsible parties and deadlines
- Recommendations for prevention

#### 5.11 Continuous Improvement

- Update this IRP based on lessons learned
- Address root causes to prevent recurrence
- Update monitoring and detection capabilities
- Revise training materials as needed
- Track remediation actions to completion

## 6. Communication Protocols

### 6.1 Internal Communication

| Audience | P1 | P2 | P3 | P4 |
|----------|----|----|----|----|
| CEO | Immediate | Within 1 hour | Daily summary | Weekly summary |
| CTO | Immediate | Immediate | Within 2 hours | Daily summary |
| DPO | Immediate (if data involved) | Within 1 hour | Within 24 hours | As needed |
| Engineering team | Within 30 minutes | Within 1 hour | Within 4 hours | As needed |
| All staff | If needed | If needed | Not typically | No |

### 6.2 External Communication

| Audience | Trigger | Timeline | Channel |
|----------|---------|----------|---------|
| **NITDA** | Personal data breach likely to result in risk to data subjects | Within 72 hours of awareness | Official NITDA reporting channel |
| **Affected merchants** | Their data or their customers' data compromised | Without undue delay after assessment | Email + in-platform notification |
| **Affected customers** | High risk to their rights and freedoms | Without undue delay | Email; WhatsApp if opted in |
| **Paystack** | Payment-related incident | Immediately | Paystack partner support channel |
| **Law enforcement** | Criminal activity suspected | As appropriate | Nigerian Cybercrime Advisory Council or relevant authority |

### 6.3 Communication Templates

#### Template 1: Initial Internal Alert (P1/P2)

```
SECURITY INCIDENT — [P1/P2]

Time Detected: [YYYY-MM-DD HH:MM UTC+1]
Detected By: [Name / System]
Incident Type: [Brief description]
Affected Systems: [List]
Current Status: [Investigating / Containing / Contained]
Incident Commander: [Name]

Immediate Actions Taken:
- [Action 1]
- [Action 2]

Next Steps:
- [Step 1]
- [Step 2]

Bridge/War Room: [Link or location]
```

#### Template 2: NITDA Breach Notification

```
DATA BREACH NOTIFICATION

To: National Information Technology Development Agency (NITDA)
From: Vayva Technologies Limited
Date: [Date]
Contact: [DPO Name], dpo@vayva.africa, [Phone]

1. Nature of Breach: [Description]
2. Date/Time of Breach: [Estimated date/time]
3. Date/Time of Discovery: [Date/time]
4. Categories of Data Affected: [List]
5. Approximate Number of Data Subjects: [Number]
6. Categories of Data Subjects: [Merchants / Customers / Both]
7. Likely Consequences: [Description]
8. Measures Taken to Address the Breach: [Description]
9. Measures Taken to Mitigate Adverse Effects: [Description]

[Signature]
[DPO Name]
Data Protection Officer
Vayva Technologies Limited
```

#### Template 3: Merchant Notification

```
Subject: Important Security Notice from Vayva

Dear [Merchant Name],

We are writing to inform you of a security incident that may have affected
your data on the Vayva platform.

What Happened:
[Clear, non-technical description of the incident]

When It Happened:
[Date range]

What Data Was Affected:
[List of data categories]

What We Are Doing:
[List of actions taken]

What You Should Do:
- [Recommended action 1]
- [Recommended action 2]

We take the security of your data seriously and sincerely apologize for
this incident. If you have any questions, please contact our Data
Protection Officer at dpo@vayva.africa.

Sincerely,
[Name]
Vayva Technologies Limited
```

#### Template 4: Customer Notification

```
Subject: Important Notice About Your Data

Dear [Customer Name],

We are contacting you because a security incident at [Merchant Name]'s
store on Vayva may have affected some of your personal information.

What Happened:
[Simple, clear description]

What Data May Have Been Affected:
[Specific data types]

What This Means for You:
[Potential consequences in plain language]

What We Recommend You Do:
- [Action 1, e.g., change password]
- [Action 2, e.g., monitor for suspicious activity]

What We Are Doing:
[Actions taken to protect data and prevent recurrence]

Contact Us:
If you have questions or concerns, contact our Data Protection Officer:
Email: dpo@vayva.africa

You also have the right to lodge a complaint with NITDA (https://nitda.gov.ng).

Sincerely,
[Name]
Vayva Technologies Limited
```

## 7. Evidence Handling

### 7.1 Evidence Collection

- Preserve system logs, database audit logs, application logs, and network captures
- Create forensic disk images before making changes to compromised systems
- Document all actions taken during the response with timestamps
- Maintain chain of custody for all evidence

### 7.2 Evidence Storage

- Store evidence in a secure, access-controlled location separate from production systems
- Apply tamper-evident controls (checksums, digital signatures)
- Retain evidence for a minimum of 3 years or as required by legal proceedings
- Access limited to the Incident Commander and authorized investigators

## 8. Testing and Maintenance

### 8.1 Plan Testing

- **Tabletop exercises:** Quarterly, simulating different incident scenarios
- **Technical drills:** Semi-annually, testing detection and containment procedures
- **Full simulation:** Annually, end-to-end incident response exercise

### 8.2 Plan Maintenance

- Review and update after every P1 or P2 incident
- Review and update semi-annually regardless of incidents
- Update contact lists quarterly
- Verify communication channels monthly

## 9. Metrics and Reporting

Track and report the following metrics quarterly:

| Metric | Target |
|--------|--------|
| Mean Time to Detect (MTTD) | < 1 hour (P1/P2) |
| Mean Time to Respond (MTTR) | < 15 minutes (P1); < 30 minutes (P2) |
| Mean Time to Contain (MTTC) | < 2 hours (P1); < 4 hours (P2) |
| Mean Time to Resolve | < 4 hours (P1); < 8 hours (P2) |
| Post-incident review completion rate | 100% for P1/P2 |
| Action item closure rate (within deadline) | > 90% |
| False positive rate | < 20% |

## 10. Related Documents

- Information Security Policy (VAYVA-ISP-001)
- Data Protection Policy (VAYVA-DPP-001)
- Data Breach Response Procedure (VAYVA-DBR-001)
- Access Control Procedures (VAYVA-ACP-001)
- Business Continuity Plan

---

**Approved by:** ___________________________
**Title:** Chief Executive Officer
**Date:** ___________________________

**Reviewed by:** ___________________________
**Title:** Chief Technology Officer
**Date:** ___________________________
