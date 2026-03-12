import { OpsAuthService } from "@/lib/ops-auth";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Bootstrap owner if no users exist
    await OpsAuthService.bootstrapOwner();

    const { email, password, mfaCode } = await req.json();

    const ip = req.headers?.get("x-forwarded-for") || "unknown";

    if (await OpsAuthService.isRateLimited(ip)) {
      await OpsAuthService.logEvent(null, "OPS_LOGIN_BLOCKED_RATE_LIMIT", {
        ip,
        email,
      });
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 },
      );
    }

    const start = Date.now();
    const user = await OpsAuthService.login(email, password, mfaCode);
    const duration = Date.now() - start;

    if (!user) {
      await OpsAuthService.logEvent(null, "OPS_LOGIN_FAILED", {
        ip,
        email,
        duration,
      });
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // MFA required but not provided
    if (user.requiresMfa) {
      return NextResponse.json({
        requiresMfa: true,
        tempToken: user.tempToken,
        message: "MFA code required",
      }, { status: 202 });
    }

    // Success event is logged inside OpsAuthService.login

    return NextResponse.json({
      success: true,
      user: { email: user.email, name: user.name, role: user.role },
    });
  } catch (error: unknown) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
