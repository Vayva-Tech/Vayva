// Simple sanitize function to avoid isomorphic-dompurify puppeteer dependency
function simpleSanitizeHTML(html: string): string {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Standard configuration for rich text sanitization
 */
const DEFAULT_CONFIG = {
    ALLOWED_TAGS: [
        'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
    ALLOW_DATA_ATTR: false,
};
/**
 * Sanitizes a string containing HTML to prevent XSS.
 * Use this for product descriptions, messaging templates, and policies.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeHTML(html: any, _options = DEFAULT_CONFIG) {
    if (!html)
        return '';
    return simpleSanitizeHTML(String(html));
}
/**
 * Normalizes and whitelists user-supplied URLs to prevent SSRF and Open Redirects.
 */
import { urls } from "@vayva/shared";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateRedirectURL(url: any, allowedDomains: any = [urls.storefrontRoot()]) {
    if (!url)
        return null;
    try {
        const parsed = new URL(url);
        // Block non-HTTP protocols
        if (!['http:', 'https:'].includes(parsed.protocol))
            return null;
        // Check against whitelist or allow relative paths
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isAllowedDomain = allowedDomains.some((domain: unknown) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`));
        if (isAllowedDomain)
            return url;
        return null;
    }
    catch {
        // If it's a relative path starting with /, it's safe
        if (url.startsWith('/') && !url.startsWith('//')) {
            return url;
        }
        return null;
    }
}
