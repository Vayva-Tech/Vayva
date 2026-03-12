import { test, expect } from "@playwright/test";
import { PUBLIC_ROUTES } from "../routes"; // relative import from tests folder
import { checkContentCompleteness } from "../helpers/contentChecks";

// TODO: Create missing public pages before enabling these tests
test.describe.skip("Public Routes Coverage", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`check ${route}`, async ({ page }) => {
      await page.goto(route);
      await checkContentCompleteness(page);
    });
  }
});
