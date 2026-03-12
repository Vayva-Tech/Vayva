import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
/**
 * Sanitizes markdown content and converts it to safe HTML
 * Allows only basic formatting tags, prevents XSS
 */
export function sanitizeMarkdown(markdown) {
    // Convert markdown to HTML
    const html = marked.parse(markdown);
    // Sanitize HTML
    const clean = DOMPurify.sanitize(html);
    // Add security attributes to external links
    return clean.replace(/<a\s+href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');
}
/**
 * Validates that markdown content is safe before storage
 */
export function validatePolicyContent(content) {
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
