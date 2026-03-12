import { expect } from "@playwright/test";
/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page) {
    await page.waitForLoadState("networkidle");
    await page.waitForLoadState("domcontentloaded");
}
/**
 * Navigate and wait
 */
export async function navigateTo(page, url) {
    await page.goto(url);
    await waitForPageLoad(page);
}
/**
 * Fill form field by label or placeholder
 */
export async function fillField(page, label, value) {
    const input = page
        .locator(`input[placeholder*="${label}" i], input[name*="${label}" i], label:has-text("${label}") + input`)
        .first();
    await input.fill(value);
}
/**
 * Click button by text
 */
export async function clickButton(page, text) {
    const button = page
        .locator(`button:has-text("${text}"), a:has-text("${text}")`)
        .first();
    await button.click();
}
/**
 * Wait for toast/notification
 */
export async function waitForToast(page, message) {
    if (message) {
        await expect(page
            .locator(`[role="alert"], .toast, .notification`)
            .filter({ hasText: message })).toBeVisible({ timeout: 5000 });
    }
    else {
        await expect(page.locator(`[role="alert"], .toast, .notification`).first()).toBeVisible({ timeout: 5000 });
    }
}
/**
 * Wait for API response
 */
export async function waitForApiResponse(page, urlPattern) {
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
export async function elementExists(page, selector) {
    try {
        await page.locator(selector).first().waitFor({ timeout: 2000 });
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Get text content
 */
export async function getTextContent(page, selector) {
    const element = page.locator(selector).first();
    return (await element.textContent()) || "";
}
/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page, name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    await page.screenshot({
        path: `test-results/screenshots/${name}-${timestamp}.png`,
        fullPage: true,
    });
}
/**
 * Retry action with exponential backoff
 */
export async function retryAction(action, maxRetries = 3, delayMs = 1000) {
    let lastError = null;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await action();
        }
        catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, i)));
            }
        }
    }
    throw lastError;
}
/**
 * Wait for element to be stable (not moving)
 */
export async function waitForStable(page, selector) {
    const element = page.locator(selector).first();
    await element.waitFor({ state: "visible" });
    // Wait for animations to complete
    await page.waitForTimeout(300);
}
/**
 * Check if user is on login page
 */
export async function isOnLoginPage(page) {
    const url = page.url();
    return url.includes("/signin") || url.includes("/login");
}
/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page) {
    const cookies = await page.context().cookies();
    return cookies.some((c) => c.name.includes("session-token"));
}
/**
 * Mock API response
 */
export async function mockApiResponse(page, urlPattern, response) {
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
export async function waitForNetworkIdle(page, timeout = 5000) {
    await page.waitForLoadState("networkidle", { timeout });
}
/**
 * Scroll to element
 */
export async function scrollToElement(page, selector) {
    const element = page.locator(selector).first();
    await element.scrollIntoViewIfNeeded();
}
/**
 * Get all text from elements
 */
export async function getAllText(page, selector) {
    const elements = await page.locator(selector).all();
    return Promise.all(elements.map((el) => el.textContent().then((text) => text || "")));
}
/**
 * Check if page has error
 */
export async function hasPageError(page) {
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
