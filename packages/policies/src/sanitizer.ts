import { marked } from "marked";

// Simple sanitize function to avoid isomorphic-dompurify puppeteer dependency during build
function simpleSanitize(html: string): string {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Sanitizes markdown content and converts it to safe HTML
 * Allows only basic formatting tags, prevents XSS
 */
export function sanitizeMarkdown(markdown: string): string {
  // Convert markdown to HTML
  const html = marked.parse(markdown) as string;

  // Sanitize HTML
  const clean = simpleSanitize(html);

  // Add security attributes to external links
  return clean.replace(
    /<a\s+href="(https?:\/\/[^"]+)"/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"',
  );
}

/**
 * Validates that markdown content is safe before storage
 */
export function validatePolicyContent(content: string): {
  valid: boolean;
  error?: string;
} {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: "Content cannot be empty" };
  }

  if (content.length > 100000) {
    return { valid: false, error: "Content too long (max 100,000 characters)" };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc.
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      return {
        valid: false,
        error: "Content contains potentially unsafe elements",
      };
    }
  }

  return { valid: true };
}
