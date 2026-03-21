import { LegalDocument } from "../types";

export const merchantAgreement: LegalDocument = {
  slug: "merchant-agreement",
  title: "Merchant Agreement",
  lastUpdated: "March 18, 2026",
  version: "1.0",
  summary: "Specific obligations and terms for merchants selling on Vayva.",
  sections: [
    {
      heading: "1. Merchant Obligations",
      content: [
        "By selling on Vayva you agree to fulfill orders within the timeframes in your shipping policy, process returns and refunds in accordance with your store policy and applicable law, treat customers with respect, and maintain the security of customer data accessed through the platform.",
      ],
    },
    {
      heading: "2. Chargebacks and Disputes",
      content: [
        "You are responsible for chargebacks and disputes arising from your sales. If Vayva incurs losses due to your failure to deliver goods or fraudulent activity, we may recover these funds from your payout balance or registered bank account.",
      ],
    },
    {
      heading: "3. Marketplace Listings",
      content: [
        "Products may be eligible for listing on the Vayva marketplace. We reserve the right to curate, rank, or remove listings at our discretion.",
      ],
    },
    {
      heading: "4. Termination",
      content: [
        "We may terminate merchant status if you violate this agreement, the Terms of Service, or receive excessive negative feedback or disputes.",
      ],
    },
  ],
};
