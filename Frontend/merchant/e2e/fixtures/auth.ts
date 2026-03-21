import { Page } from "@playwright/test";

export interface TestUser {
  email: string;
  password: string;
  storeId: string;
  firstName: string;
  lastName: string;
}

export const TEST_USER: TestUser = {
  email: "e2e-merchant@vayva.test",
  password: "E2eTest2026!",
  storeId: "test-store-id",
  firstName: "E2E",
  lastName: "Merchant",
};

/**
 * Sign in to merchant
 * Assumes user already exists in database
 */
export async function signIn(page: Page, user: TestUser = TEST_USER) {
  // Reset auth state so tests are deterministic.
  try {
    await page.context().clearCookies();
  } catch {
    // ignore
  }
  try {
    await page.goto("/signin", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      try {
        localStorage.removeItem("vayva_token");
        localStorage.removeItem("vayva_user");
      } catch {
        // ignore
      }
    });
  } catch {
    // ignore
  }

  // If already authenticated (e.g. storage/cookies), don't try to fill the sign-in form.
  if (await isAuthenticated(page)) {
    await page.goto("/dashboard");
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    return;
  }

  // Ensure a known-good verified user exists in local/dev environments.
  // This avoids OTP/Resend dependencies during E2E runs.
  try {
    await page.request.post("/api/dev/quick-user");
  } catch {
    // ignore
  }

  // Create a real merchant session cookie (vayva_session) using the dev OTP bypass.
  // `/api/auth/merchant/me` relies on this cookie, not the NextAuth cookie.
  try {
    const verify = await page.request.post("/api/auth/merchant/verify-otp", {
      data: { email: user.email, otp: "123456" },
    });
    if (verify.ok()) {
      await page.goto("/dashboard");
      await page.waitForURL(/\/dashboard/, { timeout: 20000 });
      return;
    }
  } catch {
    // ignore
  }

  await page.goto("/signin", { waitUntil: "domcontentloaded" });

  // Some auth guards may redirect to /dashboard if a token exists.
  if ((page.url() || "").includes("/dashboard")) {
    return;
  }

  // Fallback: UI login (may require OTP depending on environment)
  // Dismiss cookie banner if present so it doesn't block inputs.
  const acceptAll = page.getByRole("button", { name: "Accept All" });
  if (await acceptAll.isVisible().catch(() => false)) {
    await acceptAll.click();
  }

  const emailInput = page.getByLabel("Email address");
  const passwordInput = page.getByTestId("auth-signin-password");

  await emailInput.fill(user.email);
  await passwordInput.fill(user.password);
  await page.getByTestId("auth-signin-submit").click();

  // Wait for redirect to dashboard/onboarding/verify
  await page.waitForURL(/\/(dashboard|onboarding|verify)/, { timeout: 30000 });

  // In non-production, /verify can auto-verify if otp query param is present.
  if ((page.url() || "").includes("/verify")) {
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30000 });
  }
}

/**
 * Sign out from merchant
 */
export async function signOut(page: Page) {
  // Click user menu
  await page.click("#user-menu-button");
  // Click sign out
  await page.click("text=Sign out");
  // Wait for redirect to signin
  await page.waitForURL("/signin", { timeout: 5000 });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    const response = await page.request.get("/api/auth/merchant/me");
    return response.ok();
  } catch {
    return false;
  }
}
