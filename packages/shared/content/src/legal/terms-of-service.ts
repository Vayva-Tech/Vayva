import { LegalDocument } from "../types";

export const termsOfService: LegalDocument = {
  slug: "terms",
  title: "Terms of Service",
  lastUpdated: "February 6, 2026",
  summary:
    "These terms govern use of the Vayva platform, including merchant tools, storefronts, and related services.",
  sections: [
    {
      heading: "1. Introduction",
      content: [
        "These Terms of Service govern your access to and use of the Vayva platform and related services. By using the Service you agree to these Terms.",
      ],
      type: "text",
    },
    {
      heading: "2. Eligibility",
      content: [
        "You must be at least 18 years old and have legal capacity to operate a business. You must provide accurate registration information and keep it updated.",
      ],
    },
    {
      heading: "3. Service Overview",
      content: [
        "Vayva provides software tools that help merchants organize sales, payments, inventory, delivery, and customer communications. Vayva does not buy, sell, or broker goods or services. Transactions are between you and your customers.",
      ],
    },
    {
      heading: "4. Verification and Compliance",
      content: [
        "We may require identity and business verification to comply with legal and risk controls. Verification can include NIN, BVN, and CAC checks. We may use YouVerify for NIN checks, Paystack for BVN checks, and manual review for CAC through our Ops Console. You agree to provide accurate documents and keep verification information current.",
      ],
    },
    {
      heading: "5. Merchant Responsibilities",
      content: [
        "You are responsible for the goods or services you offer, pricing, fulfillment, customer support, and compliance with applicable laws. You are responsible for ensuring that all data you enter is accurate and that you have the right to use it.",
      ],
    },
    {
      heading: "6. Prohibited Use",
      content: [
        "You may not use the Service for illegal or fraudulent activity, prohibited items, misuse of customer data, or attempts to bypass security or access controls. We may suspend or terminate accounts for violations.",
      ],
    },
    {
      heading: "7. Payments and Fees",
      content: [
        "Paid plans and fees are billed in advance unless otherwise stated. You are responsible for applicable taxes. Payment processing may involve third party providers and their terms apply to your use of those services.",
      ],
    },
    {
      heading: "8. Data and Content",
      content: [
        "You own your business data. You grant Vayva a limited, nonexclusive license to process that data to provide the Service, improve functionality, and comply with legal obligations. You are responsible for any content you upload or send through the Service.",
      ],
    },
    {
      heading: "9. Suspension and Termination",
      content: [
        "We may suspend or terminate access if you violate these Terms, fail to pay fees, or create legal or security risk. You may close your account at any time. Data export and deletion follow the Privacy Policy.",
      ],
    },
    {
      heading: "10. Disclaimers",
      content: [
        "The Service is provided on an as is and as available basis. We do not guarantee uninterrupted availability or error free operation.",
      ],
    },
    {
      heading: "11. Limitation of Liability",
      content: [
        "To the maximum extent permitted by law, Vayva is not liable for indirect, incidental, or consequential damages, loss of profits, or loss of business opportunities. Our total liability is limited to the fees paid by you in the twelve months before the event that gave rise to the claim.",
      ],
    },
    {
      heading: "12. Indemnity",
      content: [
        "You agree to indemnify and hold Vayva harmless from claims arising from your use of the Service, your content, or your violation of law or third party rights.",
      ],
    },
    {
      heading: "13. Changes",
      content: [
        "We may update these Terms. Continued use after notice means you accept the updated Terms.",
      ],
    },
    {
      heading: "14. Governing Law and Dispute Resolution",
      content: [
        "These Terms are governed by the laws of the Federal Republic of Nigeria. Parties will attempt good faith resolution before litigation.",
      ],
    },
    {
      heading: "15. Contact",
      content: ["Email: legal@vayva.ng"],
    },
  ],
};
