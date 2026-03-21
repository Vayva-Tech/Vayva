/**
 * Legal Email Helper - Generate mailto links with automatic subject lines
 * 
 * Usage: When users click email links on legal pages, this generates
 * a mailto link with a pre-filled subject line based on the page context.
 */

export interface LegalEmailConfig {
  page: string;
  documentTitle?: string;
}

/**
 * Generate a mailto link with automatic subject line based on page context
 * 
 * @param config - Page configuration
 * @returns Mailto URL with pre-filled subject
 * 
 * @example
 * // Terms page
 * generateLegalMailto({ page: 'terms' })
 * // → "mailto:support@vayva.ng?subject=Terms%20of%20Service%20Inquiry"
 * 
 * @example
 * // Privacy page with custom title
 * generateLegalMailto({ page: 'privacy', documentTitle: 'Privacy Policy' })
 * // → "mailto:support@vayva.ng?subject=Privacy%20Policy%20Inquiry"
 */
export function generateLegalMailto(config: LegalEmailConfig): string {
  const { page, documentTitle } = config;
  
  // Map pages to their default subject prefixes
  const subjectMap: Record<string, string> = {
    'terms': 'Terms of Service Inquiry',
    'privacy': 'Privacy Policy Inquiry',
    'dpa': 'Data Processing Agreement (DPA) Request',
    'copyright': 'Copyright Infringement Notice',
    'security': 'Security Vulnerability Report',
    'accessibility': 'Accessibility Support Request',
    'refund-policy': 'Refund Policy Question',
    'prohibited-items': 'Prohibited Items Report',
    'acceptable-use': 'Acceptable Use Policy Question',
    'cookies': 'Cookie Policy Question',
    'eula': 'End User License Agreement (EULA) Question',
    'kyc-safety': 'KYC & Compliance Question',
    'merchant-agreement': 'Merchant Agreement Question',
  };
  
  // Get subject from map or use document title
  const subject = documentTitle || subjectMap[page] || 'Legal Inquiry';
  
  // Encode for URL
  const encodedSubject = encodeURIComponent(`${subject} - Vayva`);
  
  return `mailto:support@vayva.ng?subject=${encodedSubject}`;
}

/**
 * Get the appropriate subject line for a legal document page
 * 
 * @param page - The page slug (e.g., 'terms', 'privacy')
 * @param documentTitle - Optional custom document title
 * @returns Formatted subject line
 */
export function getLegalEmailSubject(page: string, documentTitle?: string): string {
  const { page: _, ...config } = { page, documentTitle };
  const mailto = generateLegalMailto({ page, documentTitle });
  
  // Extract subject from mailto link
  const match = mailto.match(/subject=([^&]+)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }
  
  return 'Legal Inquiry - Vayva';
}

/**
 * Predefined mailto links for common legal pages
 */
export const LEGAL_MAILTO_LINKS = {
  terms: generateLegalMailto({ page: 'terms' }),
  privacy: generateLegalMailto({ page: 'privacy' }),
  dpa: generateLegalMailto({ page: 'dpa' }),
  copyright: generateLegalMailto({ page: 'copyright' }),
  security: generateLegalMailto({ page: 'security' }),
  accessibility: generateLegalMailto({ page: 'accessibility' }),
  refundPolicy: generateLegalMailto({ page: 'refund-policy' }),
  prohibitedItems: generateLegalMailto({ page: 'prohibited-items' }),
  acceptableUse: generateLegalMailto({ page: 'acceptable-use' }),
  cookies: generateLegalMailto({ page: 'cookies' }),
  eula: generateLegalMailto({ page: 'eula' }),
  kycSafety: generateLegalMailto({ page: 'kyc-safety' }),
  merchantAgreement: generateLegalMailto({ page: 'merchant-agreement' }),
} as const;

/**
 * Type for available legal pages
 */
export type LegalPageSlug = keyof typeof LEGAL_MAILTO_LINKS;
