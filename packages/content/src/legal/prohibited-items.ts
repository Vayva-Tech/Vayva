import { LegalDocument } from "../types";

export const prohibitedItems: LegalDocument = {
  slug: "prohibited-items",
  title: "Prohibited Items Policy",
  lastUpdated: "February 6, 2026",
  summary: "A list of items that are not allowed to be sold on Vayva.",
  sections: [
    {
      heading: "1. Introduction",
      content: [
        "Vayva maintains a list of prohibited items to protect users and comply with applicable laws. Merchants found listing these items may have products removed and accounts suspended.",
      ],
    },
    {
      heading: "2. Prohibited Categories",
      content: [
        "Prohibited categories include illegal substances and controlled drugs, weapons and explosives, counterfeit goods and stolen property, hazardous materials, adult content or services, and any item prohibited under applicable law.",
      ],
    },
    {
      heading: "3. Regulated Categories",
      content: [
        "Some categories require specific licensing or approval, including alcohol, tobacco, pharmaceuticals, medical devices, and financial services.",
      ],
    },
    {
      heading: "4. Enforcement and Reporting",
      content: [
        "We use automated tools and manual review to detect prohibited items. If you see a violation, report it to compliance@vayva.ng.",
      ],
    },
  ],
};
