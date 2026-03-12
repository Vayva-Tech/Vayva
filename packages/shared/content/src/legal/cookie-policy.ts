import { LegalDocument } from "../types";

export const cookiePolicy: LegalDocument = {
  slug: "cookies",
  title: "Cookie Policy",
  lastUpdated: "February 6, 2026",
  summary:
    "Information about how we use cookies to improve your experience on Vayva.",
  sections: [
    {
      heading: "1. What Are Cookies",
      content: [
        "Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and improve performance.",
      ],
    },
    {
      heading: "2. How We Use Cookies",
      content: [
        "We use cookies for essential site operation, preferences, analytics, and security.",
      ],
    },
    {
      heading: "3. Managing Cookies",
      content: [
        "Most browsers allow you to control cookies. If you disable cookies some parts of the site may not function properly.",
      ],
    },
    {
      heading: "4. Updates",
      content: ["We may update this Cookie Policy from time to time."],
    },
  ],
};
