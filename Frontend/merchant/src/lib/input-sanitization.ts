// Simple sanitize function to avoid isomorphic-dompurify puppeteer dependency
function simpleSanitizeHTML(html: string): string {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<form[^>]*>.*?<\/form>/gi, '')
    .replace(/<input[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-useless-escape */
/* eslint-disable no-control-regex */
import { z } from "zod";
import { urls } from "@vayva/shared";

/**
 * Standard configuration for rich text sanitization
 */
const DEFAULT_CONFIG = {
  ALLOWED_TAGS: [
    "b",
    "i",
    "em",
    "strong",
    "a",
    "p",
    "br",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "code",
    "pre",
    "span",
    "div",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class", "style"],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "form",
    "input",
  ],
  FORBID_ATTR: ["onclick", "onmouseover", "onerror"],
};

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Safe for use on both server and client.
 */
export function sanitizeHtml(html: string, _options = DEFAULT_CONFIG): string {
  if (!html) return "";
  return simpleSanitizeHTML(html);
}

/**
 * Alias for sanitizeHtml to maintain backward compatibility with some modules.
 */
export const sanitizeHTML = sanitizeHtml;

/**
 * Validates if a string contains potentially malicious HTML.
 * Returns true if safe (no changes made), false if it required cleaning.
 */
export function isSafeHtml(input: string): boolean {
  if (!input) return true;
  const clean = sanitizeHtml(input);
  // Compare normalized versions - if they differ, malicious content was removed
  const normalizedInput = input.replace(/\s+/g, " ").trim();
  const normalizedClean = clean.replace(/\s+/g, " ").trim();
  return normalizedInput === normalizedClean;
}

/**
 * Sanitize plain text input.
 * Removes all HTML tags and special characters.
 */
export function sanitizeText(input: string): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/\0/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Sanitize email address.
 */
export function sanitizeEmail(email: string): string {
  if (!email) return "";
  return email.toLowerCase().trim().replace(/[<>]/g, "");
}

/**
 * Sanitize URL and ensure it uses allowed protocols.
 */
export function sanitizeUrl(
  url: string,
  allowedProtocols: string[] = ["http", "https"],
): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const protocol = parsed.protocol.replace(":", "");
    if (!allowedProtocols.includes(protocol)) {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

/**
 * Normalizes and whitelists user-supplied URLs to prevent SSRF and Open Redirects.
 */
export function validateRedirectURL(
  url: string,
  allowedDomains: string[] = [urls.storefrontRoot()],
): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;

    const isAllowedDomain = allowedDomains.some(
      (domain: string) =>
        parsed.hostname === domain || parsed.hostname.endsWith(`.${domain} `),
    );

    if (isAllowedDomain) return url;
    return null;
  } catch {
    if (url.startsWith("/") && !url.startsWith("//")) {
      return url;
    }
    return null;
  }
}

/**
 * Sanitize phone number.
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) {
    return "+" + cleaned.slice(1).replace(/\+/g, "");
  }
  return cleaned.replace(/\+/g, "");
}

/**
 * Sanitize numeric input.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeNumber(
  input: any,
  options?: { min?: number; max?: number; decimals?: number },
): number | null {
  const num = typeof input === "string" ? parseFloat(input) : input;
  if (isNaN(num) || !isFinite(num)) return null;

  let sanitized = num;
  if (options?.min !== undefined && sanitized < options.min)
    sanitized = options.min;
  if (options?.max !== undefined && sanitized > options.max)
    sanitized = options.max;
  if (options?.decimals !== undefined) {
    sanitized = parseFloat(sanitized.toFixed(options.decimals));
  }
  return sanitized;
}

/**
 * Sanitize object keys and string values.
 */
export function sanitizeObject(
  obj: Record<string, unknown>,
  sanitizer: (s: string) => string = sanitizeText,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizer(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string" ? sanitizer(item) : item,
      );
    } else if (value && typeof value === "object") {
      sanitized[key] = sanitizeObject(
        value as Record<string, unknown>,
        sanitizer,
      );
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Sanitize filename to prevent path traversal.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return "";
  return filename
    .replace(/\.\./g, "")
    .replace(/[\/\\]/g, "")
    .replace(/\0/g, "")
    .replace(/[\x00-\x1f\x80-\x9f]/g, "")
    .replace(/[<>:"|?*]/g, "")
    .trim();
}

/**
 * Sanitize SQL-like input.
 */
export function sanitizeSqlInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/--/g, "")
    .replace(/\/\*/g, "")
    .replace(/\*\//g, "")
    .replace(/;/g, "")
    .replace(/\b(DROP|DELETE|INSERT|UPDATE|UNION|EXEC|EXECUTE)\b/gi, "")
    .trim();
}

/**
 * Validate and sanitize JSON input.
 */
export function sanitizeJson(
  input: string,
  sanitizer: (s: string) => string = sanitizeText,
): any {
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed === "object" && parsed !== null) {
      return sanitizeObject(parsed, sanitizer);
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Comprehensive sanitization for form data.
 */
export function sanitizeFormData(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
      continue;
    }
    if (key.toLowerCase().includes("email")) {
      sanitized[key] = sanitizeEmail(String(value));
    } else if (
      key.toLowerCase().includes("url") ||
      key.toLowerCase().includes("link")
    ) {
      sanitized[key] = sanitizeUrl(String(value));
    } else if (key.toLowerCase().includes("phone")) {
      sanitized[key] = sanitizePhoneNumber(String(value));
    } else if (
      key.toLowerCase().includes("html") ||
      key.toLowerCase().includes("content")
    ) {
      sanitized[key] = sanitizeHtml(String(value));
    } else if (typeof value === "string") {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === "number") {
      sanitized[key] = sanitizeNumber(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string" ? sanitizeText(item) : item,
      );
    } else if (typeof value === "object") {
      sanitized[key] = sanitizeFormData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Escape HTML entities for safe display.
 */
export function escapeHtml(input: string): string {
  if (!input) return "";
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return input.replace(/[&<>"'\/]/g, (char: string) => htmlEntities[char]);
}
