import { LegalDocument } from "../types";

export const acceptableUse: LegalDocument = {
  slug: "acceptable-use",
  title: "Acceptable Use Policy",
  lastUpdated: "February 6, 2026",
  summary: "Guidelines for using the Vayva platform responsibly and safely.",
  sections: [
    {
      heading: "1. General Principles",
      content: [
        "Vayva is dedicated to providing a safe, reliable, and trustworthy platform for commerce. This policy sets out the rules for participating in the Vayva community.",
      ],
    },
    {
      heading: "2. Prohibited Actions",
      content: [
        "You must not use the platform for unlawful purposes, sell prohibited items, engage in fraud, harass others, or interfere with platform security or availability.",
      ],
    },
    {
      heading: "3. Messaging Automation",
      content: [
        "If you use messaging automation tools you must not send unsolicited mass messages, mislead customers, or collect sensitive personal information without a valid purpose.",
      ],
    },
    {
      heading: "4. Enforcement",
      content: [
        "Violation of this policy may result in suspension or termination of your account and reporting to legal authorities when required.",
      ],
    },
  ],
};
