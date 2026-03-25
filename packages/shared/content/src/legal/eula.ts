import type { LegalDocument } from "../types";

export const eula: LegalDocument = {
  slug: "eula",
  title: "End User License Agreement",
  lastUpdated: "March 18, 2026",
  version: "1.0",
  summary:
    "This agreement governs your use of the Vayva application and related services.",
  sections: [
    {
      heading: "1. Agreement to Terms",
      content: [
        "This End User License Agreement is a legal agreement between you and Vayva Tech regarding your use of the Vayva application. By installing or using the application, you agree to be bound by this agreement.",
      ],
      type: "text",
    },
    {
      heading: "2. License",
      content: [
        "Vayva grants you a revocable, nonexclusive, nontransferable, limited license to download, install, and use the application in accordance with this agreement.",
      ],
      type: "text",
    },
    {
      heading: "3. Content Standards",
      content: [
        "You must not post or share content that is unlawful, abusive, harassing, or harmful. Vayva may remove content and suspend accounts that violate these standards.",
      ],
      type: "text",
    },
    {
      heading: "4. Disclaimer of Warranties",
      content: [
        "The application is provided on an as is basis without warranties of any kind.",
      ],
      type: "text",
    },
    {
      heading: "5. Contact",
      content: [
        "For legal inquiries or to report violations, contact support@vayva.ng.",
      ],
      type: "text",
    },
  ],
};
