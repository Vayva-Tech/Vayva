// idor-safe: staffInvite.update uses invite.id from token-validated findFirst
import { logger } from "@vayva/shared";
import { NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "token required" }, { status: 400 });
    }

    const result = await apiJson<{
      success: boolean;
      data?: {
        email?: string;
        role?: string;
        storeName?: string;
        userExists?: boolean;
      };
      error?: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/team/invites/accept?token=${encodeURIComponent(token)}`,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Invalid or expired invite" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      email: result.data?.email,
      role: result.data?.role,
      storeName: result.data?.storeName,
      userExists: result.data?.userExists || false,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/team/invites/accept",
      operation: "FETCH_INVITE_DETAILS",
    });
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json().catch(() => ({}));
    const rec =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>)
        : {};
    const token = typeof rec.token === "string" ? rec.token : "";
    const firstName = typeof rec.firstName === "string" ? rec.firstName : "";
    const lastName = typeof rec.lastName === "string" ? rec.lastName : "";
    const password = typeof rec.password === "string" ? rec.password : "";

    if (!token) {
      return NextResponse.json(
        { error: "token required" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    // Delegate entire accept flow to backend
    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/team/invites/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, firstName, lastName, password }),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Invalid or expired invite" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    logger.error("[INVITE_ACCEPT_ERROR] Failed to accept invite", { message });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
