import { describe, expect, it, beforeEach, afterEach } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("getTenantFromHost", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.STOREFRONT_ALLOWED_HOST_SUFFIXES;
    process.env.STOREFRONT_ROOT_DOMAIN = "vayva.ng";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("accepts a valid storefront host", async () => {
    const { getTenantFromHost } = await import("./tenant");
    const t = await getTenantFromHost("acme.vayva.ng");
    expect(t.ok).toBe(true);
    if (t.ok) {
      expect(t.slug).toBe("acme");
      expect(t.host).toBe("acme.vayva.ng");
    }
  });

  it("parses port", async () => {
    const { getTenantFromHost } = await import("./tenant");
    const t = await getTenantFromHost("aa.vayva.ng:443");
    expect(t.ok).toBe(true);
    if (t.ok) {
      expect(t.slug).toBe("aa");
      expect(t.host).toBe("aa.vayva.ng");
    }
  });

  it("rejects reserved subdomains", async () => {
    const { getTenantFromHost } = await import("./tenant");
    const t1 = await getTenantFromHost("merchant.vayva.ng");
    const t2 = await getTenantFromHost("ops.vayva.ng");
    expect(t1.ok).toBe(false);
    expect(t2.ok).toBe(false);
  });

  it("rejects apex domain", async () => {
    const { getTenantFromHost } = await import("./tenant");
    const t = await getTenantFromHost("vayva.ng");
    expect(t.ok).toBe(false);
  });

  it("rejects invalid slug", async () => {
    const { getTenantFromHost } = await import("./tenant");
    const t = await getTenantFromHost("a!.vayva.ng");
    expect(t.ok).toBe(false);
  });

  it("supports allowlisted preview suffixes", async () => {
    process.env.STOREFRONT_ALLOWED_HOST_SUFFIXES =
      "vayva.ng,vercel.app,localhost";

    const { getTenantFromHost } = await import("./tenant");

    const t1 = await getTenantFromHost("acme.vayva.vercel.app");
    expect(t1.ok).toBe(true);
    if (t1.ok) expect(t1.slug).toBe("acme");

    const t2 = await getTenantFromHost("acme.localhost:3000");
    expect(t2.ok).toBe(true);
    if (t2.ok) expect(t2.slug).toBe("acme");
  });
});
