export interface PolicyGeneratorOptions {
  storeName: string;
  storeSlug: string;
  merchantSupportWhatsApp?: string;
  supportEmail?: string;
}

export interface PolicyTemplate {
  type: string;
  title: string;
  contentMd: string;
}

export function generateDefaultPolicies(
  options: PolicyGeneratorOptions,
): PolicyTemplate[] {
  const { storeName, supportEmail } = options;
  const contactEmail = supportEmail || "support@vayva.com";

  return [
    {
      type: "TERMS_OF_SERVICE",
      title: "Terms of Service",
      contentMd: `# Terms of Service for ${storeName}\n\nLast updated: ${new Date().toLocaleDateString()}\n\nWelcome to ${storeName}. By accessing our store, you agree to these terms.\n\n## Contact\nFor questions, email us at ${contactEmail}.`,
    },
    {
      type: "PRIVACY_POLICY",
      title: "Privacy Policy",
      contentMd: `# Privacy Policy for ${storeName}\n\nWe value your privacy. This policy explains how we handle your data.\n\n## Data Collection\nWe collect only necessary information to process orders.\n\n## Contact\n${contactEmail}`,
    },
    {
      type: "REFUND_POLICY",
      title: "Refund Policy",
      contentMd: `# Refund Policy\n\nWe offer refunds within 30 days of purchase for unused items.\n\n## Process\nContact ${contactEmail} to initiate a return.`,
    },
    {
      type: "SHIPPING_POLICY",
      title: "Shipping Policy",
      contentMd: `# Shipping Policy\n\nWe ship to most locations. Standard shipping takes 3-5 business days.\n\n## Rates\nShipping rates are calculated at checkout.`,
    },
  ];
}
