import { LegalDocument } from "../types";

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
      heading: "6. Physical Security",
      content: [
        "Vayva uses cloud and hosting providers (including Vercel for frontends and VPS providers for application data) that implement industry-standard physical and logical security controls. Specific certifications vary by vendor; see the subprocessor list and vendor trust pages for current attestations.",
        "Physical access to servers is restricted to authorized personnel with documented business need. All visitors must be escorted and sign access logs. Equipment disposal follows secure destruction procedures including degaussing and physical destruction of storage media.",
      ],
      type: "text",
    },
    {
      heading: "7. Incident Response",
      content: [
        "Vayva maintains a comprehensive incident response plan aligned with NIST SP 800-61. Our Computer Security Incident Response Team (CSIRT) is trained to detect, contain, investigate, and remediate security incidents.",
        "We employ 24/7 security monitoring through Security Information and Event Management (SIEM) systems that aggregate and analyze logs from all critical systems. Anomalies trigger automated alerts for immediate investigation.",
        "Post-incident reviews document lessons learned and drive continuous improvement of security controls. Affected parties are notified as required by law and contractual obligations.",
      ],
      type: "text",
    },
    {
      heading: "8. Business Continuity and Disaster Recovery",
      content: [
        "Vayva maintains business continuity plans ensuring service availability even during disruptions. We operate multiple geographically distributed data centers with automatic failover capabilities. Recovery Time Objective (RTO) is less than 4 hours; Recovery Point Objective (RPO) is less than 1 hour.",
        "Regular backup procedures create redundant copies of all critical data. Backups are encrypted, tested quarterly for integrity, and stored in geographically separate locations to protect against regional disasters.",
        "Business continuity and disaster recovery plans are tested annually through tabletop exercises and technical failover drills.",
      ],
      type: "text",
    },
    {
      heading: "9. Employee Security Training",
      content: [
        "All Vayva employees complete mandatory security awareness training upon hiring and annually thereafter. Training covers phishing recognition, password hygiene, social engineering defense, data handling procedures, and incident reporting.",
        "Employees with elevated access privileges receive specialized security training relevant to their roles. Security team members maintain professional certifications such as CISSP, CISM, CEH, or equivalent.",
        "Background checks are conducted for all employees prior to employment. Employees sign confidentiality agreements acknowledging ongoing obligations to protect sensitive information.",
      ],
      type: "text",
    },
    {
      heading: "10. Third-Party Risk Management",
      content: [
        "Vendors and subprocessors undergo security assessments before engagement. We evaluate their security controls, compliance certifications, and incident history. Critical vendors must provide annual SOC 2 reports or equivalent third-party audits.",
        "Vendor contracts include data protection addendums requiring vendors to maintain appropriate security safeguards, notify us of breaches, and comply with applicable privacy laws.",
        "We continuously monitor vendor risk profiles and conduct periodic reassessments. High-risk vendors are subject to on-site audits at Vayva's discretion.",
      ],
      type: "text",
    },
    {
      heading: "11. Logging and Monitoring",
      content: [
        "Comprehensive logging captures all access to sensitive data and systems. Logs include user identity, timestamp, action performed, source IP address, and affected resources. Logs are retained for a minimum of two years for forensic analysis.",
        "Automated monitoring systems analyze logs in real-time to detect suspicious patterns, unauthorized access attempts, policy violations, and anomalous behavior. Security analysts investigate all high-severity alerts within 30 minutes.",
      ],
      type: "text",
    },
    {
      heading: "12. Compliance and Certifications",
      content: [
        "Vayva maintains current SOC 2 Type II certification covering security, availability, and confidentiality trust principles. We undergo annual audits by independent CPA firms to validate control effectiveness.",
        "We are working toward ISO 27001 certification for our information security management system (ISMS). Our compliance team monitors regulatory developments and updates security practices accordingly.",
        "For merchants processing payment card data, Vayva is PCI DSS Level 1 compliant—the highest level of payment card industry security validation.",
      ],
      type: "text",
    },
    {
      heading: "13. Vulnerability Disclosure Program",
      content: [
        "Vayva welcomes good-faith security research. If you discover a security vulnerability, please report it to security@vayva.ng. Include detailed reproduction steps, affected systems, and potential impact assessment.",
        "We commit to acknowledging reports within 72 hours, providing status updates every 7 days, and not pursuing legal action against researchers who comply with our disclosure policy. Bounties are awarded for qualifying vulnerabilities based on severity.",
        "Please allow reasonable time for remediation before public disclosure. We appreciate coordinated disclosure that protects users while vulnerabilities are being addressed.",
      ],
      type: "callout-important",
    },
    {
      heading: "14. Security Contact",
      content: [
        "For security-related questions, concerns, or to report vulnerabilities, contact our Security Team at: security@vayva.ng or write to: Chief Information Security Officer, Vayva Tech, Lagos, Nigeria.",
        "For urgent security matters requiring immediate attention, use our PGP-encrypted channel. Public key available at vayva.ng/.well-known/security.txt",
      ],
      type: "text",
    },
  ],
};
