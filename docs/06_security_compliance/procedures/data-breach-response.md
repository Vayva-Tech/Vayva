# Data Breach Response Procedure

**Document ID:** VAYVA-DBR-001
**Version:** 1.0
**Effective Date:** 2026-03-23
**Last Reviewed:** 2026-03-23
**Next Review Date:** 2026-09-23
**Classification:** Confidential
**Owner:** Data Protection Officer

---

## 1. Purpose

This procedure provides a structured, step-by-step response framework for handling personal data breaches affecting the Vayva commerce platform. It ensures compliance with the Nigeria Data Protection Regulation (NDPR) 72-hour breach notification requirement and the Nigeria Data Protection Act (NDPA) 2023, while minimizing harm to affected data subjects and the business.

## 2. Scope

This procedure covers breaches involving:

- Personal data of merchants (identity, business, financial information)
- Personal data of customers (identity, contact, delivery, transaction data)
- AI conversation logs containing personal information
- WhatsApp message histories
- Payment-related data (note: card data is held by Paystack, not Vayva)
- Any unauthorized access, disclosure, alteration, or destruction of personal data

## 3. Definitions

| Term | Definition |
|------|-----------|
| **Personal Data Breach** | A breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to, personal data |
| **Confidentiality Breach** | Unauthorized or accidental disclosure of, or access to, personal data |
| **Integrity Breach** | Unauthorized or accidental alteration of personal data |
| **Availability Breach** | Accidental or unauthorized loss of access to, or destruction of, personal data |
| **Data Subject** | The individual whose personal data has been breached |
| **72-Hour Clock** | Starts from the moment Vayva becomes "aware" of the breach (i.e., has a reasonable degree of certainty that a breach has occurred) |

## 4. Breach Response Team

| Role | Person | Responsibilities |
|------|--------|-----------------|
| **Breach Response Lead** | Data Protection Officer | Overall coordination; regulatory notification; data subject communication |
| **Technical Investigator** | CTO / Senior Engineer | Technical investigation; forensics; containment |
| **Business Impact Assessor** | CEO / COO | Business impact evaluation; executive decisions |
| **Communications Manager** | CEO / Marketing Lead | External communications; media handling |
| **Legal Advisor** | Legal Counsel (internal or external) | Legal assessment; regulatory liaison; liability evaluation |

## 5. Breach Response Procedure

### Phase 1: Detection and Initial Assessment (Hours 0-4)

#### Step 1: Breach Detection

Breaches may be detected through:

- Security monitoring and alerting systems
- Employee or contractor report
- Merchant or customer complaint
- Third-party notification (Paystack, OpenRouter, hosting provider)
- Law enforcement notification
- Media or public report
- Routine security audit or access review

**Whoever detects a potential breach must immediately notify the DPO and CTO.**

#### Step 2: Initial Assessment (Within 2 Hours of Detection)

The DPO and Technical Investigator must conduct an initial assessment:

**Assessment Checklist:**

| Question | Finding |
|----------|---------|
| What type of breach occurred? (Confidentiality / Integrity / Availability) | |
| When did the breach occur? (Estimated date and time) | |
| When was it detected? | |
| Is the breach ongoing? | |
| What systems are affected? | |
| What categories of personal data are involved? | |
| How many data subjects are potentially affected? | |
| Are merchants, customers, or both affected? | |
| Is financial data (bank accounts, transactions) involved? | |
| Are AI conversation logs or WhatsApp messages involved? | |
| What is the likely cause? (External attack / Internal error / System failure / Third-party breach) | |
| Has data been exfiltrated? | |
| Has the vulnerability been contained? | |

#### Step 3: Confirm or Rule Out Breach

Based on the initial assessment:

- **Confirmed Breach:** Proceed to Phase 2
- **Suspected Breach (insufficient evidence):** Continue investigation; escalate to Phase 2 if not ruled out within 24 hours
- **Ruled Out:** Document findings; close with rationale; file in Breach Register as "Investigated - No Breach"

#### Step 4: Start the 72-Hour Clock

The 72-hour NITDA notification clock starts when the DPO has a **reasonable degree of certainty** that a personal data breach has occurred. Record the exact date and time.

**72-Hour Clock Started:** ___ [Date] ___ [Time] UTC+1

**NITDA Notification Deadline:** ___ [Date] ___ [Time] UTC+1

### Phase 2: Containment (Hours 2-12)

#### Step 5: Immediate Containment

Take immediate action to stop the breach from continuing or expanding:

| Breach Type | Containment Actions |
|-------------|---------------------|
| **Unauthorized database access** | Revoke compromised credentials; block source IP; restrict database access to incident team; enable enhanced logging |
| **API key compromise** | Rotate affected keys (Paystack, OpenRouter, Evolution API); revoke old keys; verify no unauthorized transactions |
| **Account compromise (admin)** | Lock compromised account; terminate all sessions; reset credentials; review admin actions log |
| **Account compromise (merchant)** | Lock merchant account; notify merchant; reset credentials; review recent account activity |
| **Data exposure (public)** | Remove exposed data from public access; request search engine cache removal if applicable; preserve evidence |
| **Malware / Ransomware** | Isolate affected systems; preserve forensic image; do not pay ransom |
| **Third-party breach (Paystack, OpenRouter)** | Contact provider security team; assess Vayva data impact; implement additional monitoring |
| **WhatsApp data exposure** | Disable affected Evolution API instance; revoke WhatsApp session; notify affected merchants |
| **AI conversation data leak** | Disable AI features for affected merchants; purge cached conversation data; rotate OpenRouter keys |

#### Step 6: Evidence Preservation

During containment:

- Capture and preserve all relevant logs (application, server, database, access)
- Create forensic copies of affected systems before remediation
- Screenshot any evidence that may be transient
- Maintain chain of custody documentation
- Do not delete, modify, or overwrite evidence

### Phase 3: Assessment and Investigation (Hours 4-48)

#### Step 7: Detailed Investigation

Conduct a thorough investigation to determine:

1. **Root Cause:** How did the breach occur? What vulnerability was exploited?
2. **Timeline:** When did the breach start? How long were systems exposed?
3. **Scope:** Exactly what data was accessed, disclosed, altered, or destroyed?
4. **Attribution:** Who caused the breach? (External attacker, insider, accident, third-party)
5. **Exfiltration:** Was data actually extracted, or only accessed?

#### Step 8: Impact Assessment

**Data Impact Matrix:**

| Data Category | Number of Records | Sensitivity | Risk Level |
|--------------|-------------------|-------------|------------|
| Customer names and contact info | | Confidential | |
| Customer delivery addresses | | Confidential | |
| Customer order/transaction history | | Confidential | |
| Merchant business information | | Confidential | |
| Merchant financial details (bank accounts) | | Restricted | |
| Payment transaction references | | Restricted | |
| AI conversation logs | | Confidential | |
| WhatsApp message content | | Confidential | |
| Authentication credentials | | Restricted | |
| API keys and secrets | | Restricted | |

**Risk Assessment Factors:**

- Can the data be used for identity theft or fraud?
- Can affected individuals suffer financial loss?
- Can the data cause reputational harm to individuals?
- Is the data encrypted (and is the key also compromised)?
- How many individuals are affected?
- Are vulnerable individuals (children, elderly) among those affected?

#### Step 9: Determine Notification Obligations

**Notify NITDA if:**
- The breach involves personal data AND
- Is likely to result in a risk to the rights and freedoms of individuals

**Notify affected data subjects if:**
- The breach is likely to result in a HIGH risk to their rights and freedoms

**Document decision rationale** whether or not notification is required.

### Phase 4: Notification (Within 72 Hours of Awareness)

#### Step 10: NITDA Notification

**Deadline: Within 72 hours of the DPO becoming aware of the breach.**

If the full details are not available within 72 hours, provide information in phases:

**Initial Notification (within 72 hours) must include:**

1. Nature of the personal data breach:
   - Categories of data subjects affected (merchants, customers, or both)
   - Approximate number of data subjects affected
   - Categories of personal data records affected
   - Approximate number of records affected

2. Name and contact details of the DPO:
   - Name: [DPO Name]
   - Email: dpo@vayva.africa
   - Phone: [DPO Phone]

3. Description of the likely consequences of the breach

4. Description of measures taken or proposed to:
   - Address the breach
   - Mitigate possible adverse effects

**Submission Channel:** NITDA's designated breach notification channel / portal

**Supplementary Notification:** If additional information becomes available after the initial notification, submit supplementary reports to NITDA without undue delay.

#### Step 11: Notification to Affected Data Subjects

When notification to individuals is required:

**Content of Notification:**
- Description of the breach in clear, plain language (appropriate for a Nigerian consumer audience)
- Categories of personal data that were affected
- Likely consequences
- Measures Vayva has taken to address the breach
- Recommended actions the individual should take (e.g., change passwords, monitor bank statements)
- DPO contact information

**Notification Channels:**
- Email to registered email address
- In-platform notification
- WhatsApp message (if the individual opted in to WhatsApp communications)
- For large-scale breaches: public notice on Vayva website

**Language:** Notifications must be in clear, simple English. Avoid legal jargon. Consider providing key information in Pidgin English or other Nigerian languages for broad consumer breaches.

**Timing:** Without undue delay after completing the assessment. Do not wait for the full investigation to conclude if high risk is established.

#### Step 12: Notification to Merchants

If the breach affects merchant customer data:

- Notify affected merchants immediately so they can inform their customers
- Provide merchants with a notification template and guidance
- Coordinate messaging to avoid conflicting communications
- Support merchants in responding to customer inquiries

### Phase 5: Remediation (Hours 24-168)

#### Step 13: Eradication

- Remove the root cause of the breach
- Patch vulnerabilities that were exploited
- Remove malware, backdoors, or unauthorized access mechanisms
- Rotate all credentials on affected systems
- Harden systems based on investigation findings

#### Step 14: Recovery

- Restore affected systems from clean backups if necessary
- Verify system integrity
- Implement enhanced monitoring for recurrence
- Validate all integrations (Paystack, OpenRouter, Evolution API)
- Confirm merchant stores are operational
- Validate data integrity

#### Step 15: Additional Protective Measures for Data Subjects

Depending on breach severity:

- Force password reset for affected accounts
- Invalidate active sessions for affected users
- Enable enhanced authentication requirements
- Provide affected merchants with credit monitoring guidance if financial data was exposed
- Offer affected customers clear instructions on protective steps

### Phase 6: Post-Breach Review (Within 14 Days)

#### Step 16: Post-Breach Review Meeting

Convene the Breach Response Team and relevant stakeholders within 14 days:

**Agenda:**

1. **Timeline Review:** Complete chronological reconstruction of the breach
2. **Root Cause Analysis:** Confirmed cause and contributing factors
3. **Response Evaluation:** Was the response timely and effective?
4. **Communication Review:** Were notifications appropriate, timely, and clear?
5. **Regulatory Compliance:** Were all NDPR obligations met?
6. **Gaps Identified:** What security controls failed or were missing?
7. **Lessons Learned:** What would we do differently?
8. **Action Items:** Preventive measures with owners and deadlines

#### Step 17: Post-Breach Report

Produce a comprehensive written report:

**Report Contents:**

1. Executive Summary
2. Breach Description and Classification
3. Complete Timeline
4. Root Cause Analysis
5. Data Impact Assessment (categories, volumes, sensitivity)
6. Response Actions Taken
7. Notifications Issued (NITDA, data subjects, merchants)
8. Remediation Actions Completed
9. Outstanding Remediation Actions (with deadlines and owners)
10. Lessons Learned
11. Recommendations for Prevention
12. Appendices (evidence logs, notification copies, timeline diagrams)

#### Step 18: Breach Register Update

Update the Data Breach Register with:

| Field | Details |
|-------|---------|
| Breach Reference ID | VAYVA-BR-[YYYY]-[NNN] |
| Date/Time of Breach | |
| Date/Time of Detection | |
| Date/Time of Awareness (72-hour clock start) | |
| Breach Type | Confidentiality / Integrity / Availability |
| Root Cause | |
| Data Categories Affected | |
| Number of Data Subjects Affected | |
| NITDA Notified | Yes / No |
| NITDA Notification Date | |
| Data Subjects Notified | Yes / No |
| Data Subject Notification Date | |
| Containment Date | |
| Eradication Date | |
| Resolution Date | |
| Lessons Learned Reference | |
| Post-Breach Report Reference | |

### Phase 7: Lessons Learned and Prevention

#### Step 19: Implement Preventive Measures

Based on the post-breach review:

- Implement recommended security controls and process changes
- Update security policies and procedures as needed
- Conduct additional training if human error was a factor
- Enhance monitoring and detection capabilities
- Schedule follow-up review to verify preventive measures are effective

#### Step 20: Update Documentation

- Update this Data Breach Response Procedure if gaps were identified
- Update the Incident Response Plan
- Update the Information Security Policy if structural changes are needed
- Update risk assessments
- Update DPIA for affected processing activities

## 6. Breach Severity Classification

| Severity | Criteria | NITDA Notification | Data Subject Notification |
|----------|----------|-------------------|--------------------------|
| **Critical** | Large-scale breach of restricted data (financial data, credentials); high risk of fraud or identity theft; > 1,000 data subjects | Required within 72 hours | Required without undue delay |
| **High** | Breach of confidential data with likely risk to individuals; 100-1,000 data subjects; data may enable harm | Required within 72 hours | Required without undue delay |
| **Medium** | Limited breach of confidential data; < 100 data subjects; low likelihood of harm; data encrypted | Assessment required; may not trigger notification | Case-by-case assessment |
| **Low** | Breach of internal data; no personal data involved; or personal data was effectively encrypted and key not compromised | Document; typically not required | Typically not required |

## 7. Specific Breach Scenarios

### 7.1 Paystack Integration Breach

If Paystack notifies Vayva of a breach affecting Vayva merchants or customers:

1. Obtain full details from Paystack security team
2. Determine which Vayva merchants and customers are affected
3. Assess whether Vayva-held data was also compromised
4. Coordinate notification with Paystack
5. Note: Vayva does not store payment card data — Paystack manages PCI DSS compliance

### 7.2 OpenRouter / AI Data Breach

If AI conversation data is exposed:

1. Immediately disable AI features for affected merchants
2. Rotate OpenRouter API keys
3. Assess what conversation content was exposed (may contain customer PII, order details, addresses)
4. Determine if conversations can be linked to identifiable individuals
5. Notify affected merchants and their customers

### 7.3 Evolution API / WhatsApp Breach

If WhatsApp message data is exposed:

1. Shut down affected Evolution API instances
2. Revoke WhatsApp sessions
3. Assess message content for personal data (phone numbers, names, addresses, order details)
4. Notify affected merchants and their customers
5. Report to WhatsApp/Meta if required by their terms

### 7.4 Database Breach

If the PostgreSQL database is directly compromised:

1. Immediately restrict all database access
2. Determine scope: which tables were accessed
3. Assess encryption status of accessed data
4. High likelihood of NITDA notification due to PII content
5. Force password reset for all platform accounts
6. Rotate all database credentials and application secrets

### 7.5 Insider Threat

If a current or former employee/contractor is responsible:

1. Immediately revoke all access (see Deprovisioning procedures)
2. Preserve all evidence of unauthorized access
3. Engage legal counsel
4. Consider law enforcement involvement
5. Conduct full audit of the individual's access history

## 8. Regulatory Contacts

| Organization | Contact | Purpose |
|-------------|---------|---------|
| **NITDA** | https://nitda.gov.ng | Data breach notification; regulatory inquiries |
| **Nigeria Police Force (Cybercrime Unit)** | https://npf.gov.ng | Criminal investigation |
| **Economic and Financial Crimes Commission (EFCC)** | https://efcc.gov.ng | Financial crime related to data breach |
| **Paystack Security** | [Paystack partner support] | Payment-related breach coordination |

## 9. Training and Readiness

- All Breach Response Team members must review this procedure quarterly
- Tabletop breach simulation exercises conducted semi-annually
- New team members must review this procedure during onboarding
- Procedure tested end-to-end annually (including simulated NITDA notification)

## 10. Related Documents

- Information Security Policy (VAYVA-ISP-001)
- Data Protection Policy (VAYVA-DPP-001)
- Incident Response Plan (VAYVA-IRP-001)
- Access Control Procedures (VAYVA-ACP-001)
- Privacy Policy (VAYVA-PP-001)

---

**Approved by:** ___________________________
**Title:** Chief Executive Officer
**Date:** ___________________________

**Reviewed by:** ___________________________
**Title:** Data Protection Officer
**Date:** ___________________________
