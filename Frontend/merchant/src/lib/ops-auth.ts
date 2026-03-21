import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import crypto from "crypto";
const SESSION_COOKIE_NAME = "ops_session_v1";
const SESSION_DURATION_DAYS = 7;
export class OpsAuthService {
    /**
     * Bootstraps the first Ops Owner if no users exist.
     * Uses env vars OPS_OWNER_EMAIL and OPS_OWNER_PASSWORD.
     */
    static async bootstrapOwner() {
        const count = await prisma.opsUser.count();
        if (count > 0)
            return; // Already initialized
        const email = process.env.OPS_OWNER_EMAIL;
        const password = process.env.OPS_OWNER_PASSWORD;
        if (!email || !password) {
            logger.warn("OPS_BOOTSTRAP_SKIPPED: Missing OPS_OWNER_EMAIL or OPS_OWNER_PASSWORD");
            return;
        }
        const passwordHash = await bcrypt.hash(password, 12);
        await prisma.opsUser.create({
            data: {
                email,
                password: passwordHash,
                role: "OPS_OWNER",
                name: "System Owner",
                isActive: true,
            },
        });
    }
    /**
     * Authenticate user and create session
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async login(email: any, passwordString: string) {
        const user = await prisma.opsUser.findUnique({ where: { email } });
        if (!user)
            return null;
        const isValid = await bcrypt.compare(passwordString, user.password);
        if (!isValid)
            return null;
        if (!user.isActive)
            throw new Error("Account disabled");
        // Create Session
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);
        // Record last login
        await prisma.opsUser.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        // Create OpsSession
        await prisma.opsSession.create({
            data: {
                opsUserId: user.id,
                token,
                expiresAt,
            },
        });
        // Set Cookie
        (await cookies()).set(SESSION_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: expiresAt,
            path: "/", // Scope to root so /api/ops can access it
        });
        // Audit Log
        await this.logEvent(user.id, "OPS_LOGIN_SUCCESS", { ip: "unknown" }); // IP handling in route
        return user;
    }
    /**
     * Check if IP is rate limited (Max 5 failed attempts in 15 mins)
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async isRateLimited(ip: unknown) {
        const WINDOW_MINUTES = 15;
        const MAX_ATTEMPTS = 5;
        const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
        // Fetch recent failures to check IP (JSON filtering can be DB-specific)
        const failures = await prisma.opsAuditEvent.findMany({
            where: {
                eventType: "OPS_LOGIN_FAILED",
                createdAt: { gte: windowStart },
            },
            select: { metadata: true },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const count = failures.filter((f: any) => (f.metadata as any)?.ip === ip).length;
        return count >= MAX_ATTEMPTS;
    }
    /**
     * Get current session from cookies
     */
    static async getSession() {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        if (!token)
            return null;
        const session = await prisma.opsSession.findUnique({
            where: { token },
            include: { opsUser: true },
        });
        if (!session || session.expiresAt < new Date()) {
            return null;
        }
        if (!session.opsUser.isActive)
            return null;
        return {
            user: session.opsUser,
            session,
        };
    }
    /**
     * Require session or throw
     */
    static async requireSession() {
        const session = await this.getSession();
        if (!session) {
            throw new Error("Unauthorized");
        }
        return session;
    }
    static async logout() {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        if (token) {
            await prisma.opsSession.deleteMany({ where: { token } });
        }
        cookieStore.delete(SESSION_COOKIE_NAME);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async logEvent(userId: string | null, eventType: any, metadata = {}) {
        await prisma.opsAuditEvent.create({
            data: {
                opsUserId: userId,
                eventType,
                metadata,
            },
        });
    }
    // --- User Management ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async createUser(currentUserRole: any, data: { email: string; role: string; name: string }) {
        if (currentUserRole !== "OPS_OWNER") {
            throw new Error("Unauthorized");
        }
        // Temp password
        const tempPassword = crypto.randomBytes(8).toString("hex");
        const hash = await bcrypt.hash(tempPassword, 10);
        const newUser = await prisma.opsUser.create({
            data: {
                email: data.email,
                role: data.role,
                name: data.name,
                password: hash,
                isActive: true,
            },
        });
        return { user: newUser, tempPassword };
    }
}
