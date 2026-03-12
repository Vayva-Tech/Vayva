import { test, expect } from "@playwright/test";
import { LEGAL_ROUTES } from "../routes";
import { checkContentCompleteness } from "../helpers/contentChecks";

// TODO: Create legal pages before enabling these tests
test.describe("Legal Routes Coverage", () => {
  for (const route of LEGAL_ROUTES) {
    test(`check ${route}`, async ({ page }) => {
      await page.goto(route);
      // Legal pages usually have less complex layout, but must have headers/text
      await checkContentCompleteness(page);
    });
  }
});
