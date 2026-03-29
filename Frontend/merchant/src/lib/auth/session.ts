import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";
import { api } from '@/lib/api-client';
import { getSessionUser } from "@/lib/session.server";

type AuthSession = Session & {
    user: {
        id: string;
        email?: string;
        name?: string;
        storeId: string;
        emailVerified?: boolean;
    };
}

export function toAuthErrorResponse(error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Unauthorized" || message.startsWith("Unauthorized")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (message.startsWith("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return null;
}

export async function requireAuth(): Promise<AuthSession> {
    const session = await getServerSession(authOptions);

    if (session?.user?.id) {
        try {
            const response = await api.get(`/auth/users/${session.user.id}/verify`);
            const user = response.data;
            if (!user) {
                throw new Error("Unauthorized - User not found");
            }
            return session as AuthSession;
        } catch {
            throw new Error("Unauthorized - User not found");
        }
    }

    const fallbackUser = await getSessionUser();
    if (!fallbackUser) {
        throw new Error("Unauthorized");
    }

    try {
        const response = await api.get(`/auth/users/${fallbackUser.id}/verify`);
        const user = response.data;
        if (!user) {
            throw new Error("Unauthorized - User not found");
        }
        return {
            user: {
                ...fallbackUser,
                emailVerified: Boolean(user.isEmailVerified),
            },
        } as AuthSession;
    } catch {
        throw new Error("Unauthorized - User not found");
    }
}

export async function requireStoreAccess(storeId?: string) {
    const session = await requireAuth();
    if (storeId && session.user?.storeId !== storeId) {
        throw new Error("Forbidden: Access to this store denied");
    }
    return session;
}

type RouteHandler = (request: NextRequest, session: AuthSession) => Promise<NextResponse>;

export function withAuth(handler: RouteHandler) {
    return async (request: NextRequest) => {
        try {
            const session = await requireAuth();
            return await handler(request, session);
        }
        catch (error) {
            const authRes = toAuthErrorResponse(error);
            if (authRes)
                return authRes;
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
    };
}
