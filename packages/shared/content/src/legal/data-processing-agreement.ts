import { LegalDocument } from "../types";

export const dataProcessingAgreement: LegalDocument = {
  slug: "dpa",
  title: "Data Processing Agreement",
  lastUpdated: "March 18, 2026",
  version: "1.0",
  summary:
    "This Data Processing Agreement governs the processing of personal data in accordance with GDPR, UK GDPR, NDPR, CCPA, and other applicable data protection laws globally.",
  sections: [
    {
      heading: "1. Definitions and Interpretation",
      content: [
        "In this Agreement, unless the context otherwise requires: 'Controller' means the entity that determines the purposes and means of processing personal data; 'Processor' means Vayva Tech as the entity that processes personal data on behalf of the Controller; 'Personal Data' means any information relating to an identified or identifiable natural person; 'Processing' means any operation performed on personal data; 'GDPR' means the EU General Data Protection Regulation (EU) 2016/679; 'UK GDPR' means the UK General Data Protection Regulation; 'NDPR' means the Nigeria Data Protection Regulation 2019; 'CCPA' means the California Consumer Privacy Act.",
      ],
      type: "definitions",
    },
    {
      heading: "2. Scope and Purpose",
      content: [
        "This Agreement applies to all Processing of Personal Data by Vayva Tech on behalf of merchants using the Vayva platform. The purpose of Processing is to provide e-commerce software services, including order management, payment processing, customer communications, analytics, and related business tools.",
        "Merchants act as Controllers determining what data is collected and why. Vayva acts as a Processor, processing data only according to Merchant instructions and as necessary to provide the Service.",
      ],
      type: "text",
    },
    {
      heading: "3. Obligations of the Controller (Merchant)",
      content: [
        "The Merchant shall ensure that all Processing instructions comply with applicable Data Protection Laws. The Merchant is responsible for obtaining valid consent from data subjects where required, providing privacy notices, and responding to data subject requests unless Vayva is contractually engaged to assist.",
        "The Merchant warrants that it has lawful basis for transferring Personal Data to Vayva for Processing. The Merchant shall maintain records of Processing activities under its control as required by law.",
      ],
      type: "text",
    },
    {
      heading: "4. Obligations of the Processor (Vayva)",
      content: [
        "Vayva shall process Personal Data only on documented instructions from the Merchant, including when making international transfers, unless required to do so by applicable law. Vayva shall inform the Merchant if it believes an instruction infringes Data Protection Laws.",
        "Vayva shall ensure that persons authorized to process Personal Data are committed to confidentiality. Vayva shall take appropriate security measures as described in Schedule 2 (Technical and Organizational Measures).",
        "Vayva shall not engage another processor (subprocessor) without prior specific or general written authorization. Vayva maintains a public list of authorized subprocessors at vayva.ng/subprocessors. Merchants may object to new subprocessors within 30 days of notice.",
        "The specific details of processing are documented in Schedule 1 (Details of Processing), which forms an integral part of this Agreement.",
      ],
      type: "text",
    },
    {
      heading: "5. International Data Transfers",
      content: [
        "Where Personal Data is transferred outside the jurisdiction in which it was collected, Vayva shall ensure appropriate safeguards are in place. For transfers from the EEA, UK, Nigeria, California, or other jurisdictions with data transfer restrictions to third countries, Vayva relies on adequacy decisions, Standard Contractual Clauses (SCCs), Binding Corporate Rules, UK International Data Transfer Addendum, or other lawful transfer mechanisms.",
        "Vayva uses cloud infrastructure providers with data centers in multiple jurisdictions globally. Merchant data may be processed wherever Vayva or its subprocessors operate facilities.",
      ],
      type: "text",
    },
    {
      heading: "6. Data Subject Rights",
      content: [
        "Vayva shall provide appropriate technical and organizational measures to enable Merchants to respond to data subject requests, including access, rectification, erasure, restriction, portability, and objection.",
        "Taking into account the nature of Processing, Vayva shall assist the Merchant in responding to requests within statutory timeframes (typically one month under GDPR, 30 days under NDPR). Vayva may charge reasonable fees based on administrative costs for excessive or manifestly unfounded requests.",
      ],
      type: "text",
    },
    {
      heading: "7. Data Breach Notification",
      content: [
        "Vayva shall notify the Merchant without undue delay (and in any event within 48 hours) after becoming aware of a Personal Data Breach. The notification shall describe the nature of the breach, categories and approximate number of data subjects affected, likely consequences, and proposed mitigation measures.",
        "Vayva shall cooperate with the Merchant in investigating the breach and provide information necessary for the Merchant to meet notification obligations to supervisory authorities and data subjects where required.",
      ],
      type: "text",
    },
    {
      heading: "8. Data Protection Impact Assessment",
      content: [
        "Vayva shall assist the Merchant in carrying out Data Protection Impact Assessments (DPIAs) where Processing is likely to result in high risk to data subjects. This includes providing information about Vayva's Processing activities, security measures, and subprocessors.",
        "Vayva shall cooperate with supervisory authorities in the performance of their tasks and consult with authorities where required by applicable law.",
      ],
      type: "text",
    },
    {
      heading: "9. Audit and Inspection Rights",
      content: [
        "The Merchant has the right to audit Vayva's compliance with this Agreement, including through inspections and independent audits. Vayva shall provide annual SOC 2 Type II reports or equivalent third-party audit certifications demonstrating compliance with security and privacy controls.",
        "Vayva may restrict audit access to protect trade secrets, confidential information, or the security of systems. In such cases, Vayva shall provide alternative evidence of compliance.",
      ],
      type: "text",
    },
    {
      heading: "10. Return or Deletion of Data",
      content: [
        "Upon termination of services, Vayva shall return or securely delete all Personal Data processed on behalf of the Merchant, unless required by law to retain it. Vayva provides data export tools enabling Merchants to download their data in commonly used formats.",
        "Vayva may retain backup copies for disaster recovery purposes for up to 90 days after termination, after which all Personal Data shall be irretrievably destroyed.",
      ],
      type: "text",
    },
    {
      heading: "11. Liability and Indemnification",
      content: [
        "Each party shall be liable for damages caused by its breach of this Agreement or Data Protection Laws. Where both parties are responsible for damage arising from the same Processing operation, liability shall be apportioned based on respective fault.",
        "Vayva's aggregate liability shall not exceed the total fees paid by the Merchant to Vayva in the 12 months preceding the event giving rise to the claim, except in cases of gross negligence, willful misconduct, or breach of confidentiality obligations.",
      ],
      type: "text",
    },
    {
      heading: "12. Term and Termination",
      content: [
        "This Agreement remains in effect for as long as Vayva processes Personal Data on behalf of the Merchant. Either party may terminate this Agreement upon material breach if the breaching party fails to cure within 30 days of notice.",
        "Termination of this Agreement shall not relieve either party of obligations accrued prior to termination, including data deletion, confidentiality, and liability provisions.",
      ],
      type: "text",
    },
    {
      heading: "13. Governing Law and Jurisdiction",
      content: [
        "This Agreement is governed by the laws of the Federal Republic of Nigeria. However, for Merchants or Data Subjects established in the EEA, UK, California, or other jurisdictions with mandatory data protection laws, those local laws shall apply to the extent required for consumer protection.",
        "For commercial disputes: Parties may elect to have disputes resolved in the courts of the Merchant's establishment (EEA/UK) or Nigeria, at the option of either party.",
        "Notwithstanding the foregoing, data subjects may bring claims in their jurisdiction of residence as permitted by applicable Data Protection Laws including GDPR Article 79, UK GDPR Article 79, and similar provisions globally.",
      ],
      type: "text",
    },
    {
      heading: "14. Contact Information",
      content: [
        "For questions about this DPA or to exercise data protection rights, contact Vayva's Data Protection Officer at: support@vayva.ng",
      ],
      type: "text",
    },
  ],
};

/**
 * DPA SCHEDULES
 * 
 * These schedules form an integral part of this Data Processing Agreement:
 * 
 * Schedule 1: Details of Processing
 * - Nature and purpose of processing
 * - Categories of data subjects
 * - Categories of personal data
 * - Duration and frequency of processing
 * - Geographic scope
 * 
 * Schedule 2: Technical and Organizational Measures
 * - Encryption & cryptographic controls
 * - Access control & authentication
 * - Network security
 * - Application security
 * - Data protection & privacy engineering
 * - Incident response & business continuity
 * - Physical security
 * - Organizational measures
 * - Subprocessor management
 * - Testing & assurance
 * 
 * Both schedules are available at vayva.ng/legal/dpa-schedules
 */
