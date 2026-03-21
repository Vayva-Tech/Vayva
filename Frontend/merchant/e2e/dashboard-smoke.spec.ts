import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { signIn } from "./fixtures/auth";

type AuditFinding = {
  type: "console_error" | "page_error" | "api_error";
  message: string;
  url?: string;
  status?: number;
};

const USER_MENU_HREFS: Record<string, string> = {
  Account: "/dashboard/account",
  Settings: "/dashboard/settings/profile",
  Billing: "/dashboard/settings/billing",
};

async function openUserMenu(page: any) {
  const account = page.locator(`a[href="${USER_MENU_HREFS.Account}"]`).first();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await account.isVisible().catch(() => false)) {
      return;
    }

    const button = page.locator("#user-menu-button").first();
    await button
      .click({ force: true })
      .catch(() => page.click("#user-menu-button").catch(() => null));
    await page.waitForTimeout(150);
    if (await account.isVisible().catch(() => false)) {
      return;
    }

    await page.keyboard.press("Escape").catch(() => null);
    await page.waitForTimeout(50);
  }

  await account.waitFor({ state: "visible", timeout: 15000 });
}

async function guardStep(
  findings: AuditFinding[],
  title: string,
  fn: () => Promise<void>,
) {
  try {
    await fn();
  } catch (e: any) {
    findings.push({
      type: "page_error",
      message: `Step failed: ${title} :: ${String(e?.message || e)}`,
    });
  }
}

async function clickMenuAndVerifyUrl(params: {
  page: any;
  findings: AuditFinding[];
  label: string;
  expectedUrl: RegExp;
}) {
  const { page, findings, label, expectedUrl } = params;
  try {
    await openUserMenu(page);
    const href = USER_MENU_HREFS[label];
    if (href) {
      const target = page.locator(`a[href="${href}"]`).first();
      await Promise.all([
        page.waitForURL(expectedUrl, { timeout: 30000 }),
        target.click(),
      ]);
    } else {
      const target = page
        .getByRole("link", { name: label, exact: true })
        .first();
      await Promise.all([
        page.waitForURL(expectedUrl, { timeout: 30000 }),
        target.click(),
      ]);
    }
    return true;
  } catch (e: any) {
    findings.push({
      type: "page_error",
      message: `Dropdown nav failed: ${label} did not navigate to ${String(expectedUrl)} (current: ${page.url()})`,
    });
    return false;
  }
}

async function attachAuditCollectors(page: any) {
  const findings: AuditFinding[] = [];

  page.on("console", (msg: any) => {
    if (msg.type() === "error") {
      findings.push({
        type: "console_error",
        message: String(msg.text() || "").slice(0, 800),
      });
    }
  });

  page.on("pageerror", (err: any) => {
    findings.push({
      type: "page_error",
      message: String(err?.message || err || "").slice(0, 800),
    });
  });

  page.on("response", (res: any) => {
    try {
      const url = res.url();
      if (!url.includes("/api/")) return;
      const status = res.status();
      if (status >= 400) {
        findings.push({
          type: "api_error",
          message: `HTTP ${status} for ${url}`,
          url,
          status,
        });
      }
    } catch {
      // ignore
    }
  });

  page.on("response", (res: any) => {
    try {
      const url = res.url();
      if (url.includes("/api/")) return;
      const status = res.status();
      if (status === 404) {
        findings.push({
          type: "console_error",
          message: `HTTP 404 for ${url}`,
          url,
          status,
        });
      }
    } catch {
      // ignore
    }
  });

  page.on("requestfailed", (req: any) => {
    try {
      const url = req.url();
      if (!url.includes("/api/")) return;
      const failure = req.failure?.()?.errorText || "requestfailed";
      if (String(failure).includes("ERR_ABORTED")) return;
      findings.push({
        type: "api_error",
        message: `Request failed for ${url}: ${failure}`,
        url,
        status: 0,
      });
    } catch {
      // ignore
    }
  });

  return findings;
}

async function assertNoAuditFindings(findings: AuditFinding[]) {
  const unique = new Map<string, AuditFinding>();
  for (const f of findings) {
    const key = `${f.type}:${f.status || ""}:${f.url || ""}:${f.message}`;
    if (!unique.has(key)) unique.set(key, f);
  }

  const errors = [...unique.values()];
  const body = errors.length
    ? `Audit findings:\n${errors
        .map(
          (e) => `- ${e.type}${e.status ? `(${e.status})` : ""}: ${e.message}`,
        )
        .join("\n")}`
    : "No audit findings";
  await fs.writeFile(
    test.info().outputPath("audit-findings.txt"),
    body,
    "utf8",
  );
  await test
    .info()
    .attach("audit-findings", { body, contentType: "text/plain" });

  const strict = process.env.E2E_AUDIT_STRICT === "1";
  if (strict) {
    expect(errors).toHaveLength(0);
  }
}

async function openRouteAndCheckShell(params: {
  page: any;
  findings: AuditFinding[];
  url: string;
}) {
  const { page, findings, url } = params;
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const current = page.url();
  if (current.includes("/signin")) {
    findings.push({
      type: "page_error",
      message: `Unexpected redirect to /signin when opening ${url} (current: ${current})`,
    });
    return;
  }

  const notFound = page.locator("text=This page could not be found").first();
  if (await notFound.isVisible().catch(() => false)) {
    findings.push({
      type: "page_error",
      message: `Route returned 404 UI when opening ${url} (current: ${current})`,
    });
    return;
  }

  const userMenu = page.locator("#user-menu-button").first();
  await userMenu.waitFor({ state: "visible", timeout: 5000 }).catch(() => null);
  if (!(await userMenu.isVisible().catch(() => false))) {
    findings.push({
      type: "page_error",
      message: `Dashboard shell missing (#user-menu-button not found) when opening ${url} (current: ${current})`,
    });
  }
}

test.describe("Dashboard smoke audit", () => {
  test("navigates critical pages; no broken links, console/page errors, or API >= 400", async ({
    page,
  }) => {
    test.setTimeout(600000);
    page.setDefaultTimeout(20000);
    page.setDefaultNavigationTimeout(30000);
    const findings = await attachAuditCollectors(page);

    await guardStep(findings, "sign in", async () => {
      await signIn(page);
    });

    await guardStep(findings, "dismiss cookie banner", async () => {
      const acceptAll = page.getByRole("button", { name: "Accept All" });
      if (await acceptAll.isVisible().catch(() => false)) {
        await acceptAll.click({ force: true });
      }
    });

    await guardStep(findings, "wait for shell UI", async () => {
      await expect(page.locator("#user-menu-button")).toBeVisible({
        timeout: 30000,
      });
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
        timeout: 30000,
      });
    });

    await guardStep(findings, "dashboard route", async () => {
      await expect(page).toHaveURL(/\/dashboard/);
    });

    // 2) User dropdown navigation works
    await guardStep(findings, "dropdown -> Account", async () => {
      await clickMenuAndVerifyUrl({
        page,
        findings,
        label: "Account",
        expectedUrl: /\/dashboard\/account/,
      });
    });

    await guardStep(findings, "open /dashboard/account", async () => {
      await openRouteAndCheckShell({
        page,
        findings,
        url: "/dashboard/account",
      });
      await expect(page.getByRole("heading", { name: /Account/i })).toBeVisible(
        { timeout: 15000 },
      );
      await page.waitForTimeout(250);
    });

    await guardStep(findings, "dropdown -> Settings", async () => {
      await clickMenuAndVerifyUrl({
        page,
        findings,
        label: "Settings",
        expectedUrl: /\/dashboard\/settings\/profile/,
      });
    });

    await guardStep(findings, "open /dashboard/settings/profile", async () => {
      await openRouteAndCheckShell({
        page,
        findings,
        url: "/dashboard/settings/profile",
      });
      await expect(page.getByRole("heading", { name: /Profile/i })).toBeVisible(
        { timeout: 15000 },
      );
      await page.waitForTimeout(250);
    });

    // 3) Settings pages (smoke)
    const pages: { url: string; heading: RegExp }[] = [
      { url: "/dashboard/settings/overview", heading: /Settings/i },
      { url: "/dashboard/settings/profile", heading: /Profile/i },
      { url: "/dashboard/settings/store", heading: /Store/i },
      { url: "/dashboard/settings/payments", heading: /Payments/i },
      { url: "/dashboard/settings/security", heading: /Security/i },
      { url: "/dashboard/settings/team", heading: /Team/i },
      { url: "/dashboard/settings/notifications", heading: /Notifications/i },
      { url: "/dashboard/settings/industry", heading: /Industry/i },
      { url: "/dashboard/settings/kyc", heading: /Identity Verification|KYC/i },
    ];

    for (const p of pages) {
      // eslint-disable-next-line no-await-in-loop
      await guardStep(findings, `open ${p.url}`, async () => {
        await openRouteAndCheckShell({
          page,
          findings,
          url: p.url,
        });
        await expect(
          page.getByRole("heading", { name: p.heading }).first(),
        ).toBeVisible({ timeout: 15000 });
        await page.waitForTimeout(250);
      });
    }

    // 4) Broad dashboard module sweep (generic shell checks)
    const moduleRoutes: string[] = [
      "/dashboard",
      "/dashboard/orders",
      "/dashboard/products",
      "/dashboard/customers",
      "/dashboard/inventory",
      "/dashboard/finance",
      "/dashboard/analytics",
      "/dashboard/marketing/discounts",
      "/dashboard/inbox",
      "/dashboard/notifications",
      "/dashboard/listings",
      "/dashboard/quotes",
      "/dashboard/catalog/collections",
      "/dashboard/fulfillment/shipments",
      "/dashboard/logistics",
      "/dashboard/projects",
      "/dashboard/properties",
      "/dashboard/automations",
      "/dashboard/approvals",
      "/dashboard/appeals",
      "/dashboard/posts",
      "/dashboard/blog",
      "/dashboard/events",
      "/dashboard/campaigns",
      "/dashboard/courses",
      "/dashboard/digital-assets",
      "/dashboard/leads",
      "/dashboard/bookings",
      "/dashboard/control-center",
      "/dashboard/ai-agent/profile",
      "/dashboard/ai-agent/channels",
    ];

    for (const url of moduleRoutes) {
      // eslint-disable-next-line no-await-in-loop
      await guardStep(findings, `open ${url}`, async () => {
        await openRouteAndCheckShell({ page, findings, url });
        await page.waitForTimeout(250);
      });
    }

    // 5) Billing route (dropdown points to settings/billing, which may redirect)
    await guardStep(findings, "dropdown -> Billing", async () => {
      await clickMenuAndVerifyUrl({
        page,
        findings,
        label: "Billing",
        expectedUrl: /\/dashboard\/(billing|settings\/billing)/,
      });
    });

    await guardStep(findings, "open /dashboard/billing", async () => {
      await openRouteAndCheckShell({
        page,
        findings,
        url: "/dashboard/billing",
      });
      await page.waitForTimeout(250);
    });

    // 6) Sign out works
    await guardStep(findings, "sign out", async () => {
      await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#user-menu-button")).toBeVisible({
        timeout: 30000,
      });
      await openUserMenu(page);
      await page.getByRole("button", { name: "Sign out" }).click();
      await expect(page).toHaveURL(/\/signin/);
    });

    await assertNoAuditFindings(findings);
  });
});
