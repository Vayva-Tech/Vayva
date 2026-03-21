/**
 * VAYVA EMAIL REGISTRY
 * Official Email Addresses for Legal & Compliance
 * 
 * Domain: vayva.ng (Nigeria-registered, primary operations)
 * 
 * Single Support Email Strategy:
 * All legal and compliance inquiries use support@vayva.ng
 * Automatic subject lines are generated based on page context.
 */

export const EMAIL_REGISTRY = {
  // ============================================
  // PRIMARY SUPPORT (Single Point of Contact)
  // ============================================
  support: {
    /** 
     * Universal support email for ALL legal, compliance, and general inquiries
     * Registered in brand config and Resend
     * Automatic subject line routing based on page context
     */
    universal: "support@vayva.ng",
  },
} as const;

export type EmailCategory = keyof typeof EMAIL_REGISTRY;
export type EmailType<T extends EmailCategory> = keyof typeof EMAIL_REGISTRY[T];

/**
 * Get email address by category and type
 * @example getEmail('support', 'universal') → 'support@vayva.ng'
 */
export function getEmail<T extends EmailCategory>(
  category: T,
  type: EmailType<T>
): string {
  return EMAIL_REGISTRY[category][type] as string;
}

/**
 * Validate if an email is an official Vayva email
 */
export function isOfficialVayvaEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@vayva.ng');
}
