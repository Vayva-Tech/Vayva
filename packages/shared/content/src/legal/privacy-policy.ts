import { LegalDocument } from "../types";

export const privacyPolicy: LegalDocument = {
  slug: "privacy",
  title: "Privacy Policy",
  lastUpdated: "March 18, 2026",
  version: "1.0",
  summary:
    "Comprehensive explanation of how we collect, use, store, and protect personal data when you use the Vayva platform, in compliance with GDPR, NDPR, UK GDPR, CCPA, and other applicable data protection laws globally.",
  sections: [
    {
      heading: "1. Introduction",
      content: [
        "This Privacy Policy explains how Vayva Tech collects, uses, and protects personal data when you use the Vayva platform.",
      ],
    },
    {
      heading: "2. Who We Are",
      content: [
        "Vayva Tech is responsible for personal data processed for the Service. Contact us at support@vayva.ng.",
      ],
    },
    {
      heading: "3. Data We Collect",
      content: [
        "We collect account and business details such as name, email, phone, business name, business address, and account credentials.",
        "We collect verification data such as identity details (NIN, BVN), business registration details (CAC), and documents you submit for KYC and compliance checks.",
        "We collect transaction data such as orders, payments, refunds, delivery details, and customer interactions stored in your workspace.",
        "We collect usage data such as log data, device and browser information, IP addresses, and analytics events.",
        "We collect support data such as messages and files you send to support.",
        "We do NOT collect special category data including racial or ethnic origin, political opinions, religious beliefs, genetic data, biometric data for identification, health data, or sexual orientation data unless voluntarily provided for accessibility purposes.",
      ],
    },
    {
      heading: "4. How We Use Data",
      content: [
        "We use data to provide and maintain the Service, verify identity and business information, process payments, prevent fraud and abuse, provide support, improve product performance, and comply with legal obligations.",
        "Specifically, we process data for the following purposes:",
        "• Service Delivery: To operate and maintain the platform, process transactions, and provide customer support (Contract necessity - GDPR Article 6(1)(b))",
        "• Verification: To verify your identity and business details for KYC/AML compliance (Legal obligation - GDPR Article 6(1)(c))",
        "• Security: To detect and prevent fraud, unauthorized access, and security incidents (Legitimate interest - GDPR Article 6(1)(f))",
        "• Communications: To send service updates, security alerts, and administrative messages (Contract necessity - GDPR Article 6(1)(b))",
        "• Analytics: To understand platform usage and improve features (Legitimate interest - GDPR Article 6(1)(f))",
        "• Marketing: To send promotional communications only with your explicit consent (Consent - GDPR Article 6(1)(a))",
      ],
    },
    {
      heading: "5. Legal Basis",
      content: [
        "We process data based on contract necessity, legitimate interests, legal obligations, and consent where required.",
      ],
    },
    {
      heading: "6. Sharing of Data",
      content: [
        "We do not sell personal data.",
        "We share data with service providers such as hosting, analytics, customer support, and communications providers.",
        "We share data with payment and verification providers for payment processing and KYC.",
        "We share data with logistics and delivery partners when you enable them.",
        "We share data with authorities when required by law and with a buyer or successor in a business transaction.",
        "We require vendors to protect data and use it only to provide services.",
      ],
    },
    {
      heading: "7. International Transfers",
      content: [
        "Vayva operates globally, and your personal data may be transferred to, stored in, and processed in countries other than your country of residence, including Nigeria, United States, European Union member states, United Kingdom, and other jurisdictions where we or our service providers operate.",
        "Safeguards for Transfers: For transfers from the European Economic Area (EEA), United Kingdom, or other jurisdictions with data transfer restrictions to third countries, we implement appropriate safeguards including: EU Standard Contractual Clauses (SCCs) approved by the European Commission; UK International Data Transfer Addendum; Binding Corporate Rules for intra-group transfers; Certification mechanisms such as adequacy decisions where applicable. You have the right to request a copy of these safeguards by contacting support@vayva.ng. By using the Service, you acknowledge and consent to these international data transfers.",
      ],
    },
    {
      heading: "8. Retention",
      content: [
        "We keep data only as long as needed for the purposes described in this policy, including compliance and audit requirements. Our specific retention periods are:",
        "• Account Data: Duration of your account plus 7 years after closure (tax and corporate law compliance)",
        "• Transaction Data: 7 years from transaction date (financial records, tax law compliance)",
        "• Verification Data (NIN/BVN/CAC): 7 years after account closure (AML/CFT regulatory requirement)",
        "• Usage & Analytics Data: 26 months from collection (Google Analytics standard retention period)",
        "• Support Communications: 3 years from last contact (customer service quality and dispute resolution)",
        "• Marketing Data: Until consent is withdrawn or 2 years from last engagement, whichever comes first",
        "After these periods, data is securely deleted or anonymized for statistical purposes where permitted by law.",
      ],
    },
    {
      heading: "9. Your Rights",
      content: [
        "Depending on applicable law you can request access, correction, or deletion, object to processing, request restriction, request data portability, withdraw consent, and lodge a complaint with the relevant regulator.",
        "To exercise your rights:",
        "1. Submit your request to support@vayva.ng with subject line 'Privacy Rights Request'",
        "2. Include proof of identity (government-issued ID or account verification via your registered email)",
        "3. Specify which right you're exercising and what personal data it concerns",
        "4. We will respond within 30 days under GDPR/UK GDPR, or 7 days for urgent NDPR requests",
        "5. There is no fee unless requests are excessive, repetitive, or manifestly unfounded",
        "Your rights include: (a) Right to access your data; (b) Right to rectification of inaccurate data; (c) Right to erasure ('right to be forgotten'); (d) Right to restrict processing; (e) Right to data portability in structured, machine-readable format; (f) Right to object to processing based on legitimate interests; (g) Right to withdraw consent at any time; (h) Right to lodge a complaint with supervisory authority (in Nigeria: NDPC; in UK: ICO; in EU: your national data protection authority).",
      ],
    },
    {
      heading: "10. Security",
      content: [
        "We use technical and organizational measures, but no system is fully secure.",
      ],
    },
    {
      heading: "11. Cookies",
      content: [
        "We use cookies and similar technologies for preferences, analytics, and security. You can control cookies in your browser.",
      ],
    },
    {
      heading: "12. Children",
      content: ["The Service is not intended for people under 18."],
    },
    {
      heading: "13. Changes",
      content: [
        "We may update this policy and provide notice for material changes.",
      ],
    },
    {
      heading: "14. Contact",
      content: ["For privacy-related questions or requests, contact us at: support@vayva.ng"],
    },
  ],
};
