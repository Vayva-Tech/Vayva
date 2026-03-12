import { prisma } from "@vayva/db";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "test-secret";
const COOKIE_NAME = "vayva_session";
export const TEST_USERS = {
    merchant: {
        email: "merchant@test.com",
        password: "Password123!",
        firstName: "Test",
        lastName: "Merchant",
        businessName: "Vayva Test Store",
    },
    admin: {
        email: "admin@vayva.ng",
        password: "AdminPassword123!",
        firstName: "System",
        lastName: "Admin",
    },
};
/**
 * Create a new test merchant user and store for E2E testing
 */
export async function createTestMerchant(overrides = {}) {
    const userData = TEST_USERS.merchant;
    // Cleanup existing data for this test email to avoid constraints
    const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
    });
    if (existingUser) {
        await prisma.membership.deleteMany({ where: { userId: existingUser.id } });
        await prisma.merchantSession.deleteMany({
            where: { userId: existingUser.id },
        });
        await prisma.user.delete({ where: { id: existingUser.id } });
    }
    const merchantUser = await prisma.user.create({
        data: {
            email: userData.email,
            password: await bcrypt.hash(userData.password, 10),
            firstName: userData.firstName,
            lastName: userData.lastName,
            isEmailVerified: true,
        },
    });
    // Create store for merchant
    const store = await prisma.store.create({
        data: {
            name: `${userData.firstName}'s Store`,
            slug: `test-store-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            onboardingStatus: overrides.onboardingStatus || "COMPLETE",
            onboardingCompleted: overrides.onboardingStatus === "COMPLETE",
            createdAt: new Date(),
        },
    });
    // Link User to Store via Membership (Role = OWNER)
    await prisma.membership.create({
        data: {
            userId: merchantUser.id,
            storeId: store.id,
            role: "owner",
            role_enum: "OWNER",
            status: "active",
        },
    });
    return { user: merchantUser, store };
}
/**
 * Login as merchant via UI
 */
export async function loginAsMerchant(page, credentials = TEST_USERS.merchant) {
    await page.goto("/signin");
    await page.waitForLoadState("networkidle");
    // Fill in login form
    await page.fill('input[name="email"], input[type="email"]', credentials.email);
    await page.fill('input[name="password"], input[type="password"]', credentials.password);
    // Submit form
    await page.click('button[type="submit"]');
    // Wait for navigation to dashboard - timeout handled by Playwright
    await page.waitForLoadState("networkidle");
}
/**
 * Setup authenticated session using COOKIE directly (Fast Auth)
 */
export async function setupAuthenticatedSession(page, userEmail) {
    // Get user from database with membership
    const user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: { memberships: { include: { store: true } } },
    });
    if (!user || user.memberships.length === 0) {
        throw new Error(`User not found or has no store: ${userEmail}`);
    }
    const membership = user.memberships[0];
    // JWT Payload
    const payload = {
        userId: user.id,
        email: user.email,
        storeId: membership.storeId,
        storeName: membership.store.name,
        role: membership.role,
    };
    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: "1d",
        jwtid: Math.random().toString(36).substring(7) + Date.now().toString(), // Ensure uniqueness
    });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);
    const context = page.context();
    const sessionToken = token;
    // Create session in database
    await prisma.merchantSession.create({
        data: {
            userId: user.id,
            token: sessionToken,
            expiresAt: expiresAt,
            createdAt: new Date(),
        },
    });
    await context.addCookies([
        {
            name: COOKIE_NAME,
            value: sessionToken,
            url: "http://localhost",
            path: "/",
            httpOnly: true,
            secure: false, // Localhost skip secure
            sameSite: "Lax",
        },
    ]);
}
/**
 * Remove test users after suite
 */
export async function cleanupTestUsers(testEmails = [TEST_USERS.merchant.email]) {
    for (const email of testEmails) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            await prisma.membership.deleteMany({ where: { userId: user.id } });
            await prisma.merchantSession.deleteMany({ where: { userId: user.id } });
            await prisma.user.delete({ where: { id: user.id } });
        }
    }
}
/**
 * Create authenticated merchant context (use in beforeEach)
 */
export async function createAuthenticatedMerchantContext(page, overrides = {}) {
    // Create test merchant if doesn't exist
    const { user, store } = await createTestMerchant(overrides);
    // Setup session
    await setupAuthenticatedSession(page, user.email);
    return { user, store };
}
/**
 * Verify user is authenticated
 */
export async function verifyAuthenticated(page) {
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === COOKIE_NAME);
    return !!sessionCookie;
}
/**
 * Logout user
 */
export async function logout(page) {
    await page.goto("/api/auth/signout");
    await page.waitForLoadState("networkidle");
}
