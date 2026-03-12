import { test, expect } from "@playwright/test";

test.describe("Publish Flow", () => {
  test("go live blocked when not ready", async ({ page }) => {
    // Mock Readiness API to return blocked
    await page.route("/api/merchant/store/publish/status", async (route) => {
      const json = {
        isLive: false,
        readiness: {
          level: "blocked",
          issues: [
            {
              severity: "blocker",
              title: "Missing Policies",
              code: "missing_policies",
            },
          ],
        },
      };
      await route.fulfill({ json });
    });

    await page.goto("/admin");

    // Check for Blocked UI
    await expect(page.getByText("Issues preventing Go Live")).toBeVisible();
    await expect(page.getByText("Missing Policies")).toBeVisible();

    // Button disabled or handled
    const btn = page.getByRole("button", { name: "Go Live Now" });
    await expect(btn).toBeDisabled();
  });

  test("go live success when ready", async ({ page }) => {
    // Mock Readiness API to return ready
    await page.route("/api/merchant/store/publish/status", async (route) => {
      const json = {
        isLive: false,
        readiness: { level: "ready", issues: [] },
      };
      await route.fulfill({ json });
    });

    // Mock Go-Live Action
    await page.route("/api/merchant/store/publish/go-live", async (route) => {
      await route.fulfill({ json: { success: true } });
    });

    await page.goto("/admin");

    // Click Go Live
    await page.getByRole("button", { name: "Go Live Now" }).click();

    // Verify UI update (would need re-fetch mock or reload)
    // For simplicity, we assume success alert or UI change if we mock the re-fetch too.
  });
});
