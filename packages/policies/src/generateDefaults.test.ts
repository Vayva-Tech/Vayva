import { describe, it, expect } from "vitest";
import { generateDefaultPolicies } from "../src/generateDefaults";
import { sanitizeMarkdown, validatePolicyContent } from "../src/sanitizer";

describe("Policy Generator", () => {
  it("generates all 5 policies", () => {
    const policies = generateDefaultPolicies({
      storeName: "Test Store",
      storeSlug: "test-store",
    });

    expect(policies).toHaveLength(5);
    expect(policies.map((p) => p.type)).toEqual([
      "terms",
      "privacy",
      "returns",
      "refunds",
      "shipping_delivery",
    ]);
  });

  it("fills placeholders correctly", () => {
    const policies = generateDefaultPolicies({
      storeName: "My Shop",
      storeSlug: "my-shop",
      merchantSupportWhatsApp: "+2341234567890",
      returnsWindowDays: 14,
    });

    const termsPolicy = policies.find((p) => p.type === "terms");
    expect(termsPolicy?.contentMd).toContain("My Shop");
    expect(termsPolicy?.contentMd).toContain("+2341234567890");

    const returnsPolicy = policies.find((p) => p.type === "returns");
    expect(returnsPolicy?.contentMd).toContain("14 days");
  });

  it("includes Nigeria-specific content", () => {
    const policies = generateDefaultPolicies({
      storeName: "Test Store",
      storeSlug: "test-store",
      dispatchMode: "self",
    });

    const shippingPolicy = policies.find((p) => p.type === "shipping_delivery");
    expect(shippingPolicy?.contentMd).toContain("Self-Dispatch");
    expect(shippingPolicy?.contentMd).toContain("WhatsApp");
    expect(shippingPolicy?.contentMd).toContain("landmarks");
  });
});

describe("Markdown Sanitizer", () => {
  it("removes script tags", () => {
    const dirty = '# Title\n<script>alert("xss")</script>\nContent';
    const clean = sanitizeMarkdown(dirty);

    expect(clean).not.toContain("<script>");
    expect(clean).not.toContain("alert");
    expect(clean).toContain("Title");
    expect(clean).toContain("Content");
  });

  it("allows safe HTML tags", () => {
    const markdown = "# Heading\n**Bold** and *italic*\n- List item";
    const html = sanitizeMarkdown(markdown);

    expect(html).toContain("<h1>");
    expect(html).toContain("<strong>");
    expect(html).toContain("<em>");
    expect(html).toContain("<li>");
  });

  it("adds security attributes to external links", () => {
    const markdown = "[External](https://example.com)";
    const html = sanitizeMarkdown(markdown);

    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });
});

describe("Content Validation", () => {
  it("rejects empty content", () => {
    const result = validatePolicyContent("");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("empty");
  });

  it("rejects content that is too long", () => {
    const longContent = "a".repeat(100001);
    const result = validatePolicyContent(longContent);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("too long");
  });

  it("rejects suspicious patterns", () => {
    const patterns = [
      "<script>alert()</script>",
      "javascript:void(0)",
      '<iframe src="evil.com"></iframe>',
      '<img onerror="alert()" />',
    ];

    patterns.forEach((pattern) => {
      const result = validatePolicyContent(pattern);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("unsafe");
    });
  });

  it("accepts valid content", () => {
    const valid =
      "# Policy\n\nThis is a valid policy with **bold** and *italic* text.";
    const result = validatePolicyContent(valid);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
