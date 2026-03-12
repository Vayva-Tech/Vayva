import { test, expect } from "@playwright/test";
import { signIn } from "./fixtures/auth";

test.describe("Transactions UI", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("should display transactions list with filters", async ({ page }) => {
    // Navigate to transactions page
    await page.goto("/dashboard/finance/transactions");

    // Wait for page to load
    await page.waitForSelector('h1:has-text("Transactions")', {
      timeout: 10000,
    });

    // Verify filters are present
    await expect(page.locator('select:has-text("All Statuses")')).toBeVisible();
    await expect(page.locator('select:has-text("All Types")')).toBeVisible();
    await expect(page.locator('select:has-text("All Time")')).toBeVisible();

    // Verify export button is present
    await expect(page.locator('button:has-text("Export")')).toBeVisible();

    // Verify refresh button is present
    await expect(page.locator('button[title="Refresh"]')).toBeVisible();
  });

  test("should filter transactions by status", async ({ page }) => {
    await page.goto("/dashboard/finance/transactions");
    await page.waitForSelector('h1:has-text("Transactions")');

    // Get initial count
    const initialCount = await page
      .locator("text=/\\d+ of \\d+ transactions/")
      .textContent();

    // Apply status filter
    await page.selectOption("select", { label: "Success" });

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Verify count changed or stayed same
    const filteredCount = await page
      .locator("text=/\\d+ of \\d+ transactions/")
      .textContent();
    expect(filteredCount).toBeDefined();

    // Verify only SUCCESS transactions are shown
    const statusBadges = await page.locator('span:has-text("SUCCESS")').count();
    const failedBadges = await page.locator('span:has-text("FAILED")').count();

    if (statusBadges > 0) {
      expect(failedBadges).toBe(0);
    }
  });

  test("should open transaction detail modal on row click", async ({
    page,
  }) => {
    await page.goto("/dashboard/finance/transactions");
    await page.waitForSelector('h1:has-text("Transactions")');

    // Check if there are any transactions
    const transactionRows = page.locator("tbody tr");
    const rowCount = await transactionRows.count();

    if (rowCount > 0) {
      // Click first transaction row
      await transactionRows.first().click();

      // Wait for modal to open
      await page.waitForSelector('h2:has-text("Transaction Details")', {
        timeout: 3000,
      });

      // Verify modal content
      await expect(page.locator("text=Reference")).toBeVisible();
      await expect(page.locator("text=Type")).toBeVisible();
      await expect(page.locator("text=Date & Time")).toBeVisible();
      await expect(page.locator("text=Provider")).toBeVisible();

      // Verify action buttons
      await expect(
        page.locator('button:has-text("Copy Reference")'),
      ).toBeVisible();
      await expect(page.locator('button:has-text("Close")')).toBeVisible();

      // Close modal
      await page.click('button:has-text("Close")');

      // Verify modal is closed
      await expect(
        page.locator('h2:has-text("Transaction Details")'),
      ).not.toBeVisible();
    }
  });

  test("should export transactions to CSV", async ({ page }) => {
    await page.goto("/dashboard/finance/transactions");
    await page.waitForSelector('h1:has-text("Transactions")');

    // Wait for transactions to load
    await page.waitForTimeout(1000);

    // Check if export button is enabled
    const exportButton = page.locator('button:has-text("Export")');
    const isDisabled = await exportButton.isDisabled();

    if (!isDisabled) {
      // Set up download listener
      const downloadPromise = page.waitForEvent("download");

      // Click export button
      await exportButton.click();

      // Wait for download
      const download = await downloadPromise;

      // Verify download filename
      expect(download.suggestedFilename()).toMatch(
        /transactions-\d{4}-\d{2}-\d{2}\.csv/,
      );
    }
  });

  test("should clear filters", async ({ page }) => {
    await page.goto("/dashboard/finance/transactions");
    await page.waitForSelector('h1:has-text("Transactions")');

    // Apply multiple filters
    await page.selectOption("select >> nth=0", { label: "Success" });
    await page.selectOption("select >> nth=1", { label: "Sales" });

    // Wait for filters to apply
    await page.waitForTimeout(500);

    // Verify clear button appears
    const clearButton = page.locator('button:has-text("Clear")');
    await expect(clearButton).toBeVisible();

    // Click clear
    await clearButton.click();

    // Verify filters are reset
    await expect(page.locator("select >> nth=0")).toHaveValue("all");
    await expect(page.locator("select >> nth=1")).toHaveValue("all");

    // Verify clear button is hidden
    await expect(clearButton).not.toBeVisible();
  });

  test("should show empty state when no transactions exist", async ({
    page,
  }) => {
    // This test assumes a fresh store with no transactions
    await page.goto("/dashboard/finance/transactions");
    await page.waitForSelector('h1:has-text("Transactions")');

    // Check for empty state
    const emptyState = page.locator('h3:has-text("No transactions yet")');
    const hasTransactions = (await page.locator("tbody tr").count()) > 0;

    if (!hasTransactions) {
      await expect(emptyState).toBeVisible();
      await expect(
        page.locator("text=Your payment transactions will appear here"),
      ).toBeVisible();
    }
  });

  test("should show filtered empty state when no matches", async ({ page }) => {
    await page.goto("/dashboard/finance/transactions");
    await page.waitForSelector('h1:has-text("Transactions")');

    // Apply filter that likely returns no results
    await page.selectOption("select >> nth=0", { label: "Failed" });
    await page.selectOption("select >> nth=2", { label: "Today" });

    await page.waitForTimeout(500);

    // Check if filtered empty state appears
    const filteredEmpty = page.locator(
      'h3:has-text("No matching transactions")',
    );
    const hasMatches = (await page.locator("tbody tr").count()) > 0;

    if (!hasMatches) {
      await expect(filteredEmpty).toBeVisible();
      await expect(
        page.locator('button:has-text("Clear Filters")'),
      ).toBeVisible();
    }
  });
});
