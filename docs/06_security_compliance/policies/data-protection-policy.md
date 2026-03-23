# Data Protection Policy

**Document ID:** VAYVA-DPP-001
**Version:** 1.0
**Effective Date:** 2026-03-23
**Last Reviewed:** 2026-03-23
**Next Review Date:** 2026-09-23
**Classification:** Internal
**Owner:** Data Protection Officer

---

## 1. Purpose

This Data Protection Policy establishes Vayva Technologies Limited's ("Vayva") commitment to protecting personal data in accordance with the Nigeria Data Protection Regulation (NDPR) 2019, the Nigeria Data Protection Act (NDPA) 2023, and related regulatory guidance issued by the National Information Technology Development Agency (NITDA). It defines how personal data is collected, processed, stored, and disposed of across the Vayva commerce platform.

## 2. Scope

This policy applies to:

- All personal data processed by Vayva, whether in electronic or physical form
- All personnel, contractors, and third parties who process personal data on behalf of Vayva
- All systems and applications that store or process personal data, including the PostgreSQL database, Redis cache, AI processing pipelines, WhatsApp messaging infrastructure, and payment processing flows

## 3. Definitions

| Term | Definition |
|------|-----------|
| **Personal Data** | Any information relating to an identified or identifiable natural person (data subject) |
| **Sensitive Personal Data** | Data revealing racial/ethnic origin, political opinions, religious beliefs, health data, biometric data, or financial data |
| **Data Subject** | An individual whose personal data is processed by Vayva (merchants, customers, end users) |
| **Data Controller** | Vayva Technologies Limited, which determines the purposes and means of processing |
| **Data Processor** | Any entity that processes personal data on behalf of Vayva (e.g., Paystack, OpenRouter) |
| **Processing** | Any operation performed on personal data, including collection, storage, retrieval, use, disclosure, or deletion |
| **NITDA** | National Information Technology Development Agency, the regulatory body for data protection in Nigeria |
| **DPIA** | Data Protection Impact Assessment |

## 4. NDPR Compliance Framework

### 4.1 Legal Basis for Processing

Vayva processes personal data under the following legal bases as permitted by the NDPR:

| Processing Activity | Legal Basis | Justification |
|---------------------|-------------|---------------|
| Merchant account creation | Consent + Contract | Necessary for service delivery |
| Customer order processing | Contract | Fulfillment of purchase agreement |
| Payment processing (via Paystack) | Contract + Legal obligation | Transaction completion and financial records |
| AI-powered customer conversations | Consent + Legitimate interest | Service feature opted into by merchant |
| WhatsApp messaging | Consent | Explicit opt-in by end customer |
| Marketing communications | Consent | Explicit opt-in with easy withdrawal |
| Analytics and platform improvement | Legitimate interest | Anonymized/aggregated data for service improvement |
| Legal and regulatory compliance | Legal obligation | Required by Nigerian law |

### 4.2 Data Protection Principles

All data processing must adhere to these principles:

1. **Lawfulness, Fairness, and Transparency:** Data is processed lawfully with clear communication to data subjects
2. **Purpose Limitation:** Data collected for specified, explicit, and legitimate purposes only
3. **Data Minimization:** Only data adequate, relevant, and limited to what is necessary is collected
4. **Accuracy:** Personal data is kept accurate and up to date
5. **Storage Limitation:** Data retained only as long as necessary for the stated purpose
6. **Integrity and Confidentiality:** Data protected against unauthorized processing, loss, or damage
7. **Accountability:** Vayva demonstrates compliance with all principles

## 5. Data Classification

### 5.1 Classification Scheme

| Classification | Description | Examples | Storage Requirements |
|---------------|-------------|----------|---------------------|
| **Restricted** | Data whose exposure would cause severe harm to individuals or the business | Payment card tokens, bank account details, API secrets, encryption keys | AES-256 encryption at rest; access limited to named individuals; full audit logging |
| **Confidential** | Personal data and sensitive business information | Customer names, phone numbers, email addresses, delivery addresses, order histories, WhatsApp conversations, AI chat logs | Encrypted at rest; RBAC enforced; audit logging; anonymized for analytics |
| **Internal** | Business information not intended for public release | Merchant aggregate analytics, internal reports, configuration data | Access restricted to authorized personnel; stored on approved systems |
| **Public** | Information intended for or already in the public domain | Published product listings, public storefront content, marketing materials | No special restrictions |

### 5.2 Classification Responsibilities

- Data owners are responsible for classifying data at the point of creation or collection
- Classification must be reviewed when data is shared, combined, or repurposed
- When in doubt, apply the higher classification level

## 6. Data Collection Principles

### 6.1 Collection Requirements

Before collecting personal data, the following must be established:

1. **Purpose:** A clear, specific, and documented reason for collection
2. **Legal Basis:** A valid legal basis under the NDPR
3. **Notice:** A privacy notice provided to the data subject before or at the point of collection
4. **Minimization:** Only data fields necessary for the stated purpose are collected

### 6.2 Data Collected by Category

#### Merchant Data
- Business name, business registration number
- Owner name, email address, phone number
- Business address
- Bank account details (for settlement via Paystack)
- Store configuration preferences
- AI assistant customization settings
- Subscription tier and billing history

#### Customer Data (End Users of Merchant Stores)
- Name, email address, phone number
- Delivery address
- Order history and transaction records
- WhatsApp conversation history (where opted in)
- AI conversation logs (interactions with merchant AI assistants)
- Device and browser information (for fraud prevention)

#### Technical Data
- IP addresses, browser user agent strings
- Session tokens and authentication data
- Platform usage logs (anonymized)

### 6.3 Prohibited Collection

The following data must not be collected unless expressly required and approved:

- Government-issued ID numbers (NIN, BVN) unless legally required
- Biometric data
- Health information
- Political or religious affiliation
- Data from minors under 13 years of age without verifiable parental consent

## 7. Consent Management

### 7.1 Consent Requirements

Where consent is the legal basis for processing:

- Consent must be **freely given, specific, informed, and unambiguous**
- Consent must be obtained through a **clear affirmative action** (no pre-ticked boxes)
- The data subject must be informed of their **right to withdraw consent** at any time
- Withdrawal must be as **easy as giving consent**
- Records of consent must be maintained with **timestamp, scope, and method**

### 7.2 Consent Records

The platform must maintain a consent ledger recording:

| Field | Description |
|-------|-------------|
| Data Subject ID | Unique identifier for the individual |
| Consent Type | Category of processing consented to |
| Date/Time Given | Timestamp of consent |
| Method | How consent was obtained (web form, WhatsApp opt-in, etc.) |
| Scope | Specific processing activities covered |
| Status | Active, withdrawn, or expired |
| Withdrawal Date | Timestamp if consent was withdrawn |

### 7.3 WhatsApp Consent

For WhatsApp messaging via Evolution API:

- Customers must explicitly opt in to receive messages from a merchant
- Opt-in must be recorded with timestamp
- Opt-out instructions must be included in every message or available via a simple keyword (e.g., "STOP")
- Opt-out must be processed within 24 hours

## 8. Data Subject Rights

Under the NDPR, data subjects have the following rights. Vayva must respond to all valid requests within **30 days**.

### 8.1 Right of Access

- Data subjects may request a copy of all personal data held about them
- Response must include: data categories, purposes of processing, recipients, retention periods, and the source of data
- Data must be provided in a commonly used, machine-readable format (JSON or CSV)

### 8.2 Right to Rectification

- Data subjects may request correction of inaccurate or incomplete data
- Corrections must be applied within 7 business days
- Third parties who received the data must be notified of the correction

### 8.3 Right to Erasure (Right to be Forgotten)

- Data subjects may request deletion of their personal data when:
  - The data is no longer necessary for the original purpose
  - Consent has been withdrawn
  - The data was unlawfully processed
- Erasure requests must be fulfilled within 30 days
- Exceptions: data required for legal compliance, defense of legal claims, or public interest

### 8.4 Right to Restrict Processing

- Data subjects may request restriction of processing in certain circumstances
- Restricted data may be stored but not further processed without consent

### 8.5 Right to Data Portability

- Data subjects may request their data in a structured, commonly used format
- Export functionality must be available through the platform dashboard or via request to the DPO

### 8.6 Right to Object

- Data subjects may object to processing based on legitimate interest
- Processing must cease unless Vayva demonstrates compelling legitimate grounds

### 8.7 Request Handling Process

1. Request received via email (dpo@vayva.africa), platform dashboard, or customer support
2. Identity of the requester verified within 3 business days
3. Request logged in the Data Subject Request Register
4. Request fulfilled or valid grounds for refusal communicated within 30 days
5. Requester notified of outcome and any appeal rights

## 9. Cross-Border Data Transfer

### 9.1 General Principle

Personal data must be stored and processed within Nigeria wherever practicable. Cross-border transfers are permitted only when adequate safeguards are in place.

### 9.2 Current Cross-Border Transfers

| Destination | Provider | Data Transferred | Safeguard |
|-------------|----------|------------------|-----------|
| United States | Vercel | Frontend application code, environment variables | Standard Contractual Clauses; Vercel SOC 2 Type II |
| United States | OpenRouter | AI conversation content | Data Processing Agreement; content anonymized where feasible |
| Variable | Paystack | Payment transaction data | PCI DSS Level 1; Data Processing Agreement |

### 9.3 Transfer Requirements

Before transferring personal data outside Nigeria:

1. Conduct a Transfer Impact Assessment
2. Implement appropriate safeguards (Standard Contractual Clauses, adequacy determination, or binding corporate rules)
3. Obtain DPO approval
4. Document the transfer in the Data Transfer Register
5. Ensure the receiving country or organization provides adequate protection

### 9.4 NDPR Compliance for Transfers

Per NDPR requirements:

- The data controller (Vayva) remains responsible for data protection regardless of transfer location
- NITDA must be notified of significant cross-border transfers as part of annual audit filings
- Data subjects must be informed of cross-border transfers via the privacy notice

## 10. Data Retention

### 10.1 Retention Schedule

| Data Category | Retention Period | Justification | Disposal Method |
|--------------|-----------------|---------------|-----------------|
| Active merchant account data | Duration of account + 2 years | Service delivery and post-termination obligations | Secure deletion from database |
| Inactive merchant account data | 2 years after last activity | Re-activation possibility | Anonymization, then deletion |
| Customer PII | Duration of merchant relationship + 1 year | Order fulfillment and support | Secure deletion |
| Transaction records | 7 years | Nigerian tax and financial regulations | Archived, then secure deletion |
| AI conversation logs | 90 days (active); anonymized summaries retained | Service improvement and dispute resolution | Automatic purge; anonymized aggregates retained |
| WhatsApp message logs | 90 days | Customer support and dispute resolution | Automatic purge |
| Session and authentication logs | 90 days | Security monitoring | Automatic purge |
| System access logs | 1 year | Security audit trail | Automatic purge |
| Backup data | 30 days (rolling) | Disaster recovery | Secure overwrite |
| Consent records | Duration of processing + 3 years | Regulatory compliance and accountability | Secure deletion |

### 10.2 Retention Review

- Retention periods are reviewed annually
- Data past its retention period must be securely deleted or anonymized within 30 days
- Automated retention enforcement should be implemented where feasible

## 11. Data Breach Notification

### 11.1 72-Hour Rule

Under the NDPR, Vayva must notify NITDA of a personal data breach within **72 hours** of becoming aware of it, where the breach is likely to result in a risk to the rights and freedoms of data subjects.

### 11.2 Notification to NITDA

The notification must include:

1. Nature of the breach, including categories and approximate number of data subjects affected
2. Name and contact details of the DPO
3. Description of likely consequences
4. Measures taken or proposed to address the breach
5. Measures taken to mitigate possible adverse effects

### 11.3 Notification to Data Subjects

When a breach poses a **high risk** to individuals' rights and freedoms, affected data subjects must be notified **without undue delay**. The notification must:

- Describe the nature of the breach in clear, plain language
- Provide the DPO's contact information
- Describe the likely consequences
- Describe the measures taken and recommended actions for the individual

### 11.4 Breach Register

A Data Breach Register must be maintained recording all breaches, whether or not they were reported to NITDA, including:

- Date and time of breach detection
- Nature and scope of the breach
- Data categories and number of subjects affected
- Root cause analysis
- Actions taken
- Reporting decisions and rationale

Refer to the Data Breach Response Procedure (VAYVA-DBR-001) for detailed operational steps.

## 12. Data Protection Impact Assessments (DPIAs)

### 12.1 When Required

A DPIA must be conducted before:

- Introducing new technologies that process personal data
- Large-scale processing of sensitive personal data
- Systematic monitoring of publicly accessible areas
- Automated decision-making that significantly affects individuals
- Any new processing activity involving cross-border data transfer

### 12.2 DPIA Process

1. Describe the proposed processing and its purpose
2. Assess the necessity and proportionality of processing
3. Identify and assess risks to data subjects
4. Define measures to mitigate identified risks
5. Document findings and obtain DPO sign-off
6. Submit to NITDA if residual risk remains high

### 12.3 Vayva-Specific DPIAs

The following features require completed DPIAs:

- AI-powered customer conversation processing (GPT-4o Mini, Llama 3.3 70B)
- WhatsApp messaging integration via Evolution API
- Customer behavior analytics and order pattern analysis
- Automated AI responses to customer inquiries (Autopilot mode)

## 13. Data Processor Management

### 13.1 Processor Requirements

All data processors must:

- Process data only on documented instructions from Vayva
- Ensure personnel are bound by confidentiality obligations
- Implement appropriate technical and organizational security measures
- Assist Vayva in responding to data subject requests
- Delete or return all personal data at the end of the engagement
- Submit to audits and inspections

### 13.2 Data Processing Agreements

Written Data Processing Agreements (DPAs) must be in place with all processors. Each DPA must specify:

- Subject matter and duration of processing
- Nature and purpose of processing
- Types of personal data processed
- Categories of data subjects
- Obligations and rights of Vayva as controller
- Sub-processor approval requirements

## 14. Training and Awareness

- All personnel must complete data protection training within their first week
- Annual refresher training is mandatory
- Training records must be maintained
- Specialized training for personnel handling sensitive data or operating AI systems

## 15. Annual Audit and Filing

### 15.1 NDPR Audit Requirement

As required by the NDPR, Vayva must:

- Conduct an annual data protection audit
- Engage a licensed Data Protection Compliance Organization (DPCO) for the audit
- Submit the audit report to NITDA within the prescribed timeframe
- Address all findings from the audit within agreed remediation timelines

### 15.2 Internal Audits

- Quarterly internal reviews of data protection compliance
- Annual review of all data processing activities
- Bi-annual review of data processor agreements
- Continuous monitoring of data subject request response times

## 16. Policy Enforcement

Non-compliance with this policy may result in:

- Formal warning and mandatory retraining
- Restriction or revocation of data access privileges
- Disciplinary action up to and including termination of employment or contract
- Reporting to NITDA where required by regulation
- Legal action for willful or negligent breach

## 17. Related Documents

- Information Security Policy (VAYVA-ISP-001)
- Privacy Policy (VAYVA-PP-001)
- Incident Response Plan (VAYVA-IRP-001)
- Data Breach Response Procedure (VAYVA-DBR-001)
- Access Control Procedures (VAYVA-ACP-001)

---

**Approved by:** ___________________________
**Title:** Chief Executive Officer
**Date:** ___________________________

**Reviewed by:** ___________________________
**Title:** Data Protection Officer
**Date:** ___________________________
