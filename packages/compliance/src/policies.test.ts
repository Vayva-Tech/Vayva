import { describe, it, expect } from "vitest";
import { generateDefaultPolicies } from "./policies";

describe("generateDefaultPolicies", () => {
  it("should generate all required policy templates", () => {
    const options = {
      storeName: "Test Store",
      storeSlug: "test-store",
      supportEmail: "support@teststore.com",
    };

    const policies = generateDefaultPolicies(options);

    expect(policies).toHaveLength(5);
    
    const types = policies.map(p => p.type);
    expect(types).toContain("TERMS");
    expect(types).toContain("PRIVACY");
    expect(types).toContain("RETURNS");
    expect(types).toContain("REFUNDS");
    expect(types).toContain("SHIPPING_DELIVERY");
  });

  it("should include store name in policies", () => {
    const options = {
      storeName: "My Awesome Store",
      storeSlug: "my-awesome-store",
    };

    const policies = generateDefaultPolicies(options);

    // Only TERMS and PRIVACY include store name
    const termsPolicy = policies.find(p => p.type === "TERMS");
    const privacyPolicy = policies.find(p => p.type === "PRIVACY");
    expect(termsPolicy?.contentMd).toContain("My Awesome Store");
    expect(privacyPolicy?.contentMd).toContain("My Awesome Store");
  });

  it("should use default support email if not provided", () => {
    const options = {
      storeName: "Test Store",
      storeSlug: "test-store",
    };

    const policies = generateDefaultPolicies(options);

    // TERMS, PRIVACY, RETURNS, and REFUNDS include support email
    const termsPolicy = policies.find(p => p.type === "TERMS");
    const privacyPolicy = policies.find(p => p.type === "PRIVACY");
    const returnsPolicy = policies.find(p => p.type === "RETURNS");
    const refundsPolicy = policies.find(p => p.type === "REFUNDS");
    expect(termsPolicy?.contentMd).toContain("support@vayva.com");
    expect(privacyPolicy?.contentMd).toContain("support@vayva.com");
    expect(returnsPolicy?.contentMd).toContain("support@vayva.com");
    expect(refundsPolicy?.contentMd).toContain("support@vayva.com");
  });

  it("should use provided support email", () => {
    const options = {
      storeName: "Test Store",
      storeSlug: "test-store",
      supportEmail: "help@teststore.com",
    };

    const policies = generateDefaultPolicies(options);

    // TERMS, PRIVACY, RETURNS, and REFUNDS include support email
    const termsPolicy = policies.find(p => p.type === "TERMS");
    const privacyPolicy = policies.find(p => p.type === "PRIVACY");
    const returnsPolicy = policies.find(p => p.type === "RETURNS");
    const refundsPolicy = policies.find(p => p.type === "REFUNDS");
    expect(termsPolicy?.contentMd).toContain("help@teststore.com");
    expect(privacyPolicy?.contentMd).toContain("help@teststore.com");
    expect(returnsPolicy?.contentMd).toContain("help@teststore.com");
    expect(refundsPolicy?.contentMd).toContain("help@teststore.com");
  });

  it("should include current date in terms of service", () => {
    const options = {
      storeName: "Test Store",
      storeSlug: "test-store",
    };

    const policies = generateDefaultPolicies(options);
    const termsPolicy = policies.find(p => p.type === "TERMS");

    expect(termsPolicy?.contentMd).toContain("Last updated:");
    expect(termsPolicy?.contentMd).toContain(new Date().toLocaleDateString());
  });
});
