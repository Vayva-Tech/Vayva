import { Page, expect } from "@playwright/test";

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForLoadState("domcontentloaded");
}

/**
 * Navigate and wait
 */
export async function navigateTo(page: Page, url: string) {
  await page.goto(url);
  await waitForPageLoad(page);
}

/**
 * Fill form field by label or placeholder
 */
export async function fillField(page: Page, label: string, value: string) {
  const input = page
    .locator(
      `input[placeholder*="${label}" i], input[name*="${label}" i], label:has-text("${label}") + input`,
    )
    .first();
  await input.fill(value);
}

/**
 * Click button by text
 */
export async function clickButton(page: Page, text: string) {
  const button = page
    .locator(`button:has-text("${text}"), a:has-text("${text}")`)
    .first();
  await button.click();
}

/**
 * Wait for toast/notification
 */
export async function waitForToast(page: Page, message?: string) {
  if (message) {
    await expect(
      page
        .locator(`[role="alert"], .toast, .notification`)
        .filter({ hasText: message }),
    ).toBeVisible({ timeout: 5000 });
  } else {
    await expect(
      page.locator(`[role="alert"], .toast, .notification`).first(),
    ).toBeVisible({ timeout: 5000 });
  }
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
) {
  return page.waitForResponse((response) => {
    const url = response.url();
    if (typeof urlPattern === "string") {
      return url.includes(urlPattern);
    }
    return urlPattern.test(url);
  });
}

/**
 * Check if element exists
 */
export async function elementExists(
  page: Page,
  selector: string,
): Promise<boolean> {
  try {
    await page.locator(selector).first().waitFor({ timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get text content
 */
export async function getTextContent(
  page: Page,
  selector: string,
): Promise<string> {
  const element = page.locator(selector).first();
  return (await element.textContent()) || "";
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Retry action with exponential backoff
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * Math.pow(2, i)),
        );
      }
    }
  }

  throw lastError;
}

/**
 * Wait for element to be stable (not moving)
 */
export async function waitForStable(page: Page, selector: string) {
  const element = page.locator(selector).first();
  await element.waitFor({ state: "visible" });

  // Wait for animations to complete
  await page.waitForTimeout(300);
}

/**
 * Check if user is on login page
 */
export async function isOnLoginPage(page: Page): Promise<boolean> {
  const url = page.url();
  return url.includes("/signin") || url.includes("/login");
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some((c) => c.name.includes("session-token"));
}

/**
 * Mock API response
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  response: any,
) {
  await page.route(urlPattern, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}

/**
 * Wait for network idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState("networkidle", { timeout });
}

/**
 * Scroll to element
 */
export async function scrollToElement(page: Page, selector: string) {
  const element = page.locator(selector).first();
  await element.scrollIntoViewIfNeeded();
}

/**
 * Get all text from elements
 */
export async function getAllText(
  page: Page,
  selector: string,
): Promise<string[]> {
  const elements = await page.locator(selector).all();
  return Promise.all(
    elements.map((el) => el.textContent().then((text) => text || "")),
  );
}

/**
 * Check if page has error
 */
export async function hasPageError(page: Page): Promise<boolean> {
  const errorSelectors = [
    '[role="alert"]',
    ".error",
    ".error-message",
    "text=/error/i",
    "text=/something went wrong/i",
  ];

  for (const selector of errorSelectors) {
    if (await elementExists(page, selector)) {
      return true;
    }
  }

  return false;
}
