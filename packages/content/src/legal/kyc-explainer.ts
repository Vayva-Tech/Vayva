import { LegalDocument } from "../types";

export const kycExplainer: LegalDocument = {
  slug: "kyc-explainer",
  title: "Why We Ask for KYC",
  lastUpdated: "February 6, 2026",
  summary: "Understanding our identity and business verification process.",
  sections: [
    {
      heading: "1. Why Verification Is Required",
      content: [
        "We verify identity and business details to protect merchants and customers, prevent fraud, and meet compliance obligations tied to payment processing.",
      ],
    },
    {
      heading: "2. What We Request",
      content: [
        "We may request NIN, BVN, and CAC details depending on your account type and risk profile.",
      ],
    },
    {
      heading: "3. How Verification Works",
      content: [
        "We may use Paystack for BVN checks and manual review for CAC through our Ops Console. Other verification checks may be manual or use third-party providers depending on availability and compliance requirements.",
      ],
    },
    {
      heading: "4. If You Do Not Verify",
      content: [
        "You can create a store and list products, but withdrawals may be restricted until verification is complete.",
      ],
    },
  ],
};
