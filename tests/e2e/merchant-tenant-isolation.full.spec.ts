import { test, expect, type BrowserContext } from "@playwright/test";

async function loginMerchant(context: BrowserContext, email: string) {
  const page = await context.newPage();
  await page.goto("/signin");
  await page.getByTestId("auth-signin-email").fill(email);
  await page.getByTestId("auth-signin-password").fill("TestPass123!");
  await page.getByTestId("auth-signin-submit").click();

  await page.waitForLoadState("networkidle");

  if (/\/verify(\?|$)/.test(page.url())) {
    await expect(page.getByTestId("auth-verify-otp-container")).toBeVisible({ timeout: 15000 });

    const otp = "123456";
    for (let i = 0; i < otp.length; i++) {
      await page.getByLabel(`Digit ${i + 1}`).fill(otp[i]);
    }

    await page.getByTestId("auth-verify-submit").click();
  }

  await expect(page).toHaveURL(/.*dashboard/, { timeout: 20000 });
  await page.close();
}

test.describe("@merchant Tenant Isolation (Full)", () => {
  test("@merchant merchant cannot access another store's collection by id", async ({ browser }) => {
    const a = await browser.newContext();
    const b = await browser.newContext();

    await loginMerchant(a, "e2e-merchant-a@vayva.test");
    await loginMerchant(b, "e2e-merchant-b@vayva.test");

    const handle = `e2e-tenant-${Date.now()}`;

    const createRes = await a.request.post("/api/collections", {
      data: {
        title: `E2E Tenant ${Date.now()}`,
        handle,
        description: "",
      },
    });

    expect(createRes.status()).toBe(200);
    const createJson = (await createRes.json()) as {
      success?: boolean;
      data?: { id: string };
      error?: string;
    };

    expect(createJson.success).toBeTruthy();
    const collectionId = createJson.data?.id;
    expect(collectionId).toBeTruthy();

    const bGet = await b.request.get(`/api/collections/${collectionId}`);
    expect(bGet.status()).toBe(404);

    const bDel = await b.request.delete(`/api/collections/${collectionId}`);
    expect([403, 404]).toContain(bDel.status());

    const aDel = await a.request.delete(`/api/collections/${collectionId}`);
    expect([200, 204]).toContain(aDel.status());

    await a.close();
    await b.close();
  });
});
