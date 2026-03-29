import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { KycStatus } from "@vayva/db";
import { z } from "zod";
import {
    ApiResponse,
    ApiErrorCode,
    MerchantListResponseData,
    MerchantListItem,
    KycListResponseData,
    KycListItem,
    OpsUserListItem,
    UserCreateResult,
    OpsLoginResponseData,
    logger
} from "@vayva/shared";
import { api } from '@/lib/api-client';

interface KycAuditItem {
    firstName?: string;
    lastName?: string;
    method?: string;
    provider?: string;
    [key: string]: unknown;
}

interface StoreWithRelations {
    id: string;
    name: string;
    slug: string;
    contactEmail?: string | null;
    contactPhone?: string | null;
    address?: string | null;
    createdAt: Date;
    updatedAt: Date;
    kycRecord: KycRecordWithStore | null;
    aiSubscription: AiSubscription | null;
}

interface AiSubscription {
    id: string;
    storeId: string;
    planId?: string | null;
    planKey: string;
    status: string;
    periodStart: Date;
    periodEnd: Date;
    monthTokensUsed: number;
    monthTokenLimit: number;
    apiCallsThisMonth: number;
    apiCallLimit: number;
    createdAt: Date;
    updatedAt: Date;
    closedAt?: Date | null;
}

interface KycRecordWithStore {
    id: string;
    storeId: string;
    nin?: string | null;
    cacNumber?: string | null;
    status: string;
    audit?: unknown;
    createdAt: Date;
    updatedAt: Date;
    store: StoreWithRelations | null;
}

interface OpsUser {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    lastLoginAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function handleGetMerchants(
    request: NextRequest
): Promise<NextResponse<ApiResponse<MerchantListResponseData>>> {
    const session = await OpsAuthService.getSession();
    if (!session) {
        return NextResponse.json(
            {
                success: false,
                error: { code: ApiErrorCode.UNAUTHORIZED, message: "Unauthorized" }
            },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    try {
        const response = await api.get('/ops/merchants', { query });
        const formatted: MerchantListItem[] = response.data?.merchants || [];

        return NextResponse.json({
            success: true,
            data: { merchants: formatted }
        });
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error("[OPS_GET_MERCHANTS_ERROR]", { error: error.message });
        return NextResponse.json(
            {
                success: false,
                error: { code: ApiErrorCode.INTERNAL_SERVER_ERROR, message: "Internal server error" }
            },
            { status: 500 }
        );
    }
}

export async function handleGetKyc(
    request: NextRequest
): Promise<NextResponse<ApiResponse<KycListResponseData>>> {
    const session = await OpsAuthService.getSession();
    if (!session) {
        return NextResponse.json(
            {
                success: false,
                error: { code: ApiErrorCode.UNAUTHORIZED, message: "Unauthorized" }
            },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    try {
        const response = await api.get('/ops/kyc', { status });
        const formatted: KycListItem[] = response.data?.kycRecords || [];

        return NextResponse.json({
            success: true,
            data: { kycRecords: formatted }
        });
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error("[OPS_GET_KYC_ERROR]", { error: error.message });
        return NextResponse.json(
            {
                success: false,
                error: { code: ApiErrorCode.INTERNAL_SERVER_ERROR, message: "Internal server error" }
            },
            { status: 500 }
        );
    }
}
            data: { records: formatted }
        });
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error("[OPS_GET_KYC_ERROR]", { error: error.message });
        return NextResponse.json(
            {
                success: false,
                error: { code: ApiErrorCode.INTERNAL_SERVER_ERROR, message: "Internal server error" }
            },
            { status: 500 }
        );
    }
}

export async function handleGetOpsUsers(
    req: NextRequest
): Promise<NextResponse<ApiResponse<OpsUserListItem[]>>> {
    const session = await OpsAuthService.getSession();
    if (!session || !["OPS_OWNER", "OPS_ADMIN"].includes(session.user?.role)) {
        const ip = req.headers?.get("x-forwarded-for")?.split(",")[0] || "unknown";
        await OpsAuthService.logEvent(
            session?.user?.id || null,
            "OPS_UNAUTHORIZED_ACCESS",
            {
                ip,
                path: req.nextUrl?.pathname,
                method: "GET",
                reason: "Role mismatch",
            },
        );
        return NextResponse.json(
            {
                success: false,
                error: { code: ApiErrorCode.FORBIDDEN, message: "Unauthorized" }
            },
            { status: 403 }
        );
    }

    try {
        const response = await api.get('/ops/users');
        const formatted: OpsUserListItem[] = response.data || [];

        return NextResponse.json({
            success: true,
            data: formatted
        });
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error("[OPS_GET_OPS_USERS_ERROR]", { error: error.message, context: { method: "GET", path: req.nextUrl?.pathname } });
        return NextResponse.json(
            {
                success: false,
                error: { code: ApiErrorCode.INTERNAL_SERVER_ERROR, message: "Internal server error" }
            },
            { status: 500 }
        );
    }
}

const createSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    role: z.enum(["OPS_ADMIN", "OPS_AGENT", "OPS_READONLY"]),
});

export async function handleCreateOpsUser(
    req: NextRequest
): Promise<NextResponse<ApiResponse<UserCreateResult>>> {
    const session = await OpsAuthService.getSession();
    if (!session || session.user?.role !== "OPS_OWNER") {
        const ip = req.headers?.get("x-forwarded-for")?.split(",")[0] || "unknown";
        await OpsAuthService.logEvent(
            session?.user?.id || null,
            "OPS_UNAUTHORIZED_ACCESS",
            {
                ip,
                path: req.nextUrl?.pathname,
                method: "POST",
                reason: "Not Owner",
            },
        );
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ApiErrorCode.FORBIDDEN,
                    message: "Unauthorized. Only Owner can create users."
                }
            },
            { status: 403 }
        );
    }

    try {
        const body = await req.json();
        const data = createSchema.parse(body);

        const { user, tempPassword } = await OpsAuthService.createUser(
            session.user?.role,
            data,
        );

        await OpsAuthService.logEvent(session.user?.id, "OPS_USER_CREATED", {
            targetUser: user.email,
            role: user.role,
        });

        return NextResponse.json({
            success: true,
            data: { user, tempPassword }
        });
    } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error(String(e));
        logger.error("[OPS_CREATE_USER_ERROR]", { error: error.message });
        const errorMessage = e instanceof Error ? e.message : "Internal Server Error";
        return NextResponse.json(
            {
                success: false,
                error: { code: ApiErrorCode.VALIDATION_ERROR, message: errorMessage }
            },
            { status: 400 }
        );
    }
}

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export async function handleOpsLogin(
    req: NextRequest
): Promise<NextResponse<ApiResponse<OpsLoginResponseData>>> {
    const ip = req.headers?.get("x-forwarded-for")?.split(",")[0] || "unknown";

    if (await OpsAuthService.isRateLimited(ip)) {
        await OpsAuthService.logEvent(null, "OPS_LOGIN_BLOCKED", {
            ip,
            reason: "Rate limit exceeded",
        });
        return NextResponse.json(
            {
                success: false,
                error: { code: ApiErrorCode.RATE_LIMIT_EXCEEDED, message: "Too many attempts. Please try again in 15 minutes." }
            },
            { status: 429 },
        );
    }

    try {
        await OpsAuthService.bootstrapOwner();

        const body = await req.json();
        const { email, password } = loginSchema.parse(body);

        try {
            const user = await OpsAuthService.login(email, password);

            if (!user) {
                await OpsAuthService.logEvent(null, "OPS_LOGIN_FAILED", {
                    ip,
                    email,
                    reason: "Invalid credentials",
                });
                return NextResponse.json(
                    {
                        success: false,
                        error: { code: ApiErrorCode.UNAUTHORIZED, message: "Invalid credentials" }
                    },
                    { status: 401 },
                );
            }

            return NextResponse.json({
                success: true,
                data: { success: true, role: user.role }
            });
        } catch (authError: any) {
            const error = authError as Error;
            if (error.message === "Account disabled") {
                await OpsAuthService.logEvent(null, "OPS_LOGIN_FAILED", {
                    ip,
                    email,
                    reason: "Account disabled",
                });
                return NextResponse.json(
                    {
                        success: false,
                        error: { code: ApiErrorCode.FORBIDDEN, message: "Account disabled" }
                    },
                    { status: 403 },
                );
            }
            throw error;
        }
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error("[OPS_LOGIN_ERROR]", { error: error.message });
        return NextResponse.json(
            {
                success: false,
                error: { code: ApiErrorCode.VALIDATION_ERROR, message: "Invalid request" }
            },
            { status: 400 }
        );
    }
}
