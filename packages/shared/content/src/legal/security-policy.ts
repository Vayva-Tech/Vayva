import type { LegalDocument } from "../types";

export const securityPolicy: LegalDocument = {
  slug: "security",
  title: "Security Policy",
  lastUpdated: "March 18, 2026",
  version: "1.0",
  summary:
    "Our comprehensive approach to protecting your data through industry-leading security practices, controls, and certifications.",
  sections: [
    {
      heading: "1. Security Commitment",
      content: [
        "Vayva is committed to maintaining the highest standards of information security to protect merchant and customer data. We implement comprehensive technical and organizational measures designed to ensure confidentiality, integrity, and availability of all personal and business data processed through our platform.",
        "Our security program is aligned with international standards including ISO 27001, SOC 2 Type II, NIST Cybersecurity Framework, and industry best practices for e-commerce platforms.",
      ],
      type: "text",
    },
    {
      heading: "2. Data Encryption",
      content: [
        "All data transmitted between users and Vayva servers is encrypted in transit using TLS 1.3 or higher with strong cipher suites. We enforce HTTPS across all services and implement HSTS (HTTP Strict Transport Security) to prevent downgrade attacks.",
        "Sensitive data at rest, including passwords, payment information, and personal identifiers, is encrypted using AES-256 encryption. Encryption keys are managed through hardware security modules (HSMs) with strict access controls and regular rotation schedules.",
      ],
      type: "text",
    },
    {
      heading: "3. Access Controls and Authentication",
      content: [
        "Vayva implements role-based access control (RBAC) ensuring employees and contractors access only the minimum data necessary to perform their functions. All access requires multi-factor authentication (MFA) using time-based one-time passwords (TOTP) or hardware security keys.",
        "Privileged access to production systems requires additional approval workflows, is logged comprehensively, and is subject to periodic review. We maintain segregation of duties between development, staging, and production environments.",
        "Session management includes automatic timeout after periods of inactivity, secure session token generation, and protection against session hijacking through IP binding and device fingerprinting where appropriate.",
      ],
      type: "text",
    },
    {
      heading: "4. Network Security",
      content: [
        "Our infrastructure is protected by enterprise-grade firewalls, intrusion detection and prevention systems (IDS/IPS), and distributed denial of service (DDoS) mitigation. We segment networks to isolate sensitive systems and data from public-facing services.",
        "Regular vulnerability scans and penetration tests are conducted by internal security teams and independent third parties. Critical vulnerabilities are remediated within 72 hours; high-risk vulnerabilities within 7 days.",
        "We employ Web Application Firewalls (WAF) to filter malicious traffic and protect against OWASP Top 10 threats including SQL injection, cross-site scripting (XSS), and other common attack vectors.",
      ],
      type: "text",
    },
    {
      heading: "5. Secure Software Development",
      content: [
        "Vayva follows secure software development lifecycle (SDLC) practices. All code undergoes security review before deployment. Automated static application security testing (SAST) and dynamic application security testing (DAST) tools scan for vulnerabilities in every build.",
        "Developers receive annual secure coding training. Code changes require peer review and approval. We maintain a bug bounty program encouraging responsible disclosure of security vulnerabilities by external researchers.",
        "Dependencies are continuously monitored for known vulnerabilities using software composition analysis (SCA) tools. Critical dependency updates are applied within 48 hours of release.",
      ],
      type: "text",
    },
    {
      heading: "6. Incident Response",
      content: [
        "Vayva maintains a comprehensive incident response plan aligned with NIST SP 800-61. Our Computer Security Incident Response Team (CSIRT) is trained to detect, contain, investigate, and remediate security incidents.",
        "We employ 24/7 security monitoring through Security Information and Event Management (SIEM) systems that aggregate and analyze logs from all critical systems. Anomalies trigger automated alerts for immediate investigation.",
        "Post-incident reviews document lessons learned and drive continuous improvement of security controls. Affected parties are notified as required by law and contractual obligations.",
      ],
      type: "text",
    },
    {
      heading: "7. Data Breach Notification",
      content: [
        "In the event of a data breach affecting your personal data, Vayva will notify affected users without undue delay (and in any event within 72 hours where feasible). The notification will describe the nature of the breach, categories of data affected, likely consequences, and recommended mitigation measures.",
        "We will also notify relevant supervisory authorities as required by GDPR, NDPR, and other applicable data protection laws.",
      ],
      type: "callout-important",
    },
    {
      heading: "8. Security Contact",
      content: [
        "For security-related questions, concerns, or to report vulnerabilities, contact our Security Team at: support@vayva.ng",
        "For urgent security matters requiring immediate attention, use our PGP-encrypted channel. Public key available at vayva.ng/.well-known/security.txt",
      ],
      type: "text",
    },
  ],
};
