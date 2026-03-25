import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { signIn } from "./fixtures/auth";

/**
 * Per-route load QA: visits every URL in e2e/merchant-routes.json (generated from all page.tsx files).
 * Catches HTTP 5xx and hard navigation failures across the merchant app.
 *
 * Run: pnpm run test:e2e:route-stress
 * Regenerate list: pnpm run generate:merchant-routes
 */
const manifestPath = path.join(__dirname, "merchant-routes.json");
const { routes } = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
  routes: string[];
};

test.describe.configure({ mode: "serial", timeout: 120 * 60 * 1000 });

test("authenticated: load every merchant page route", async ({ page }) => {
  await signIn(page);

  const failures: { route: string; detail: string }[] = [];
  const timings: { route: string; ms: number; status?: number }[] = [];

  for (const route of routes) {
    const t0 = Date.now();
    try {
      const response = await page.goto(route, {
        waitUntil: "domcontentloaded",
        timeout: 18_000,
      });
      const ms = Date.now() - t0;
      const status = response?.status() ?? 0;
      timings.push({ route, ms, status });

      if (status >= 500) {
        failures.push({ route, detail: `HTTP ${status}` });
      }
    } catch (e) {
      const ms = Date.now() - t0;
      timings.push({ route, ms });
      failures.push({
        route,
        detail: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const slowest = [...timings].sort((a, b) => b.ms - a.ms).slice(0, 15);
  // eslint-disable-next-line no-console
  console.log("Slowest routes (ms):", slowest);
  // eslint-disable-next-line no-console
  console.log(
    `Failures: ${failures.length} / ${routes.length}`,
    failures.slice(0, 40),
  );

  expect(
    failures,
    `${failures.length} route(s) failed — see stdout for details`,
  ).toEqual([]);
});
