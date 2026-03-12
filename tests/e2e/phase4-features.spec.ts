import { test, expect } from "@playwright/test";
import { loginAsRole } from "./helpers";

test.describe("B2B Wholesale Feature", () => {
  test("should display B2B dashboard for users with permission", async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto("/dashboard/b2b");
    
    await expect(page.getByText("B2B Wholesale")).toBeVisible();
    await expect(page.getByText("Quotes")).toBeVisible();
    await expect(page.getByText("Credit Accounts")).toBeVisible();
    await expect(page.getByText("Requisitions")).toBeVisible();
  });

  test("should navigate to quotes list", async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto("/dashboard/b2b/quotes");
    
    await expect(page.getByText("B2B Quotes")).toBeVisible();
    await expect(page.getByRole("button", { name: /create quote/i })).toBeVisible();
  });

  test("should navigate to credit accounts", async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto("/dashboard/b2b/credit-accounts");
    
    await expect(page.getByText("Credit Accounts")).toBeVisible();
    await expect(page.getByRole("button", { name: /create credit account/i })).toBeVisible();
  });

  test("should navigate to requisitions", async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto("/dashboard/b2b/requisitions");
    
    await expect(page.getByText("Purchase Requisitions")).toBeVisible();
    await expect(page.getByRole("button", { name: /create requisition/i })).toBeVisible();
  });

  test("should restrict access for staff without b2b permission", async ({ page }) => {
    await loginAsRole(page, "staff");
    await page.goto("/dashboard/b2b");
    
    // Staff role doesn't have b2b:view permission
    await expect(page.getByText("Access Denied").or(page.getByText("Not Found"))).toBeVisible();
  });

  test("should create new quote", async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto("/dashboard/b2b/quotes");
    
    await page.getByRole("button", { name: /create quote/i }).click();
    
    // Fill quote form
    await page.getByLabel(/customer email/i).fill("customer@example.com");
    await page.getByLabel(/valid until/i).fill(new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]);
    
    await page.getByRole("button", { name: /create/i }).click();
    
    await expect(page.getByText("Quote created successfully")).toBeVisible();
  });
});

test.describe("Events & Ticketing Feature", () => {
  test("should display events list for users with permission", async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto("/dashboard/events");
    
    await expect(page.getByText("Events")).toBeVisible();
    await expect(page.getByRole("button", { name: /create event/i })).toBeVisible();
  });

  test("should create new event", async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto("/dashboard/events");
    
    await page.getByRole("button", { name: /create event/i }).click();
    
    // Fill event form
    await page.getByLabel(/event name/i).fill("Test Event 2026");
    await page.getByLabel(/description/i).fill("Test event description");
    await page.getByLabel(/start date/i).fill(new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]);
    await page.getByLabel(/end date/i).fill(new Date(Date.now() + 8 * 86400000).toISOString().split("T")[0]);
    await page.getByLabel(/venue/i).fill("Test Venue, Lagos");
    await page.getByLabel(/capacity/i).fill("100");
    await page.getByLabel(/ticket price/i).fill("5000");
    
    await page.getByRole("button", { name: /create event/i }).click();
    
    await expect(page.getByText("Event created successfully")).toBeVisible();
  });

  test("should restrict access for staff without events permission", async ({ page }) => {
    await loginAsRole(page, "staff");
    await page.goto("/dashboard/events");
    
    await expect(page.getByText("Access Denied").or(page.getByText("Not Found"))).toBeVisible();
  });
});

test.describe("Nonprofit Feature", () => {
  test("should display nonprofit dashboard for users with permission", async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto("/dashboard/nonprofit");
    
    await expect(page.getByText("Nonprofit Management")).toBeVisible();
    await expect(page.getByText("Campaigns")).toBeVisible();
    await expect(page.getByText("Donations")).toBeVisible();
    await expect(page.getByText("Volunteers")).toBeVisible();
    await expect(page.getByText("Grants")).toBeVisible();
  });

  test("should navigate to campaigns", async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto("/dashboard/nonprofit/campaigns");
    
    await expect(page.getByText("Fundraising Campaigns")).toBeVisible();
    await expect(page.getByRole("button", { name: /create campaign/i })).toBeVisible();
  });

  test("should navigate to donations", async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto("/dashboard/nonprofit/donations");
    
    await expect(page.getByText("Donations")).toBeVisible();
  });

  test("should navigate to volunteers", async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto("/dashboard/nonprofit/volunteers");
    
    await expect(page.getByText("Volunteers")).toBeVisible();
    await expect(page.getByRole("button", { name: /add volunteer/i })).toBeVisible();
  });

  test("should create new campaign", async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto("/dashboard/nonprofit/campaigns");
    
    await page.getByRole("button", { name: /create campaign/i }).click();
    
    // Fill campaign form
    await page.getByLabel(/campaign name/i).fill("Test Fundraising Campaign");
    await page.getByLabel(/goal amount/i).fill("100000");
    await page.getByLabel(/start date/i).fill(new Date().toISOString().split("T")[0]);
    await page.getByLabel(/end date/i).fill(new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]);
    await page.getByLabel(/description/i).fill("Test campaign description");
    
    await page.getByRole("button", { name: /create campaign/i }).click();
    
    await expect(page.getByText("Campaign created successfully")).toBeVisible();
  });

  test("should restrict access for staff without nonprofit permission", async ({ page }) => {
    await loginAsRole(page, "staff");
    await page.goto("/dashboard/nonprofit");
    
    await expect(page.getByText("Access Denied").or(page.getByText("Not Found"))).toBeVisible();
  });
});
