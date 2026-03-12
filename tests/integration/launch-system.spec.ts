import { test, expect } from "@playwright/test";
// @ts-expect-error - Module resolution pending
import { EnvHealth } from "../../apps/merchant-admin/src/lib/ops/envHealth";
// @ts-expect-error - Module resolution pending
import { ServiceHealth } from "../../apps/merchant-admin/src/lib/ops/serviceHealth";

test.describe("Launch System Health", () => {
  test("Env Health Logic", () => {
    const health = EnvHealth.check();
    // Likely fails/warns in local dev environment due to missing keys, which is correct behavior to verify
    // or passes if we mocked basic ones.
    expect(health).toHaveProperty("ok");
    expect(health).toHaveProperty("missing");
  });

  test("Service Health Logic", async () => {
    const health = await ServiceHealth.check();
    expect(health).toHaveProperty("ok");
    expect(health.services).toHaveProperty("database");
  });
});
