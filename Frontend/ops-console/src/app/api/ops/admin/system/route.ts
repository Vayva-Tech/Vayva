import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { OpsAuthService } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

export async function GET(_request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (user.role !== "OPS_OWNER") {
    return NextResponse.json(
      { error: "Unauthorized: Owners Only" },
      { status: 403 },
    );
  }

  // Expose only safe variables
  const safeEnv = Object.keys(process.env)
    .filter(
      (key) =>
        key.startsWith("NEXT_PUBLIC_") ||
        key.startsWith("OPS_") ||
        key === "NODE_ENV",
    )
    .reduce((obj, key) => {
      if (
        key.includes("KEY") ||
        key.includes("SECRET") ||
        key.includes("PASSWORD") ||
        key.includes("TOKEN")
      ) {
        obj[key] = "[REDACTED]";
      } else {
        obj[key] = process.env[key];
      }
      return obj;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as Record<string, string | undefined>);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, unknown> = {
    env: process.env.NODE_ENV,
    region: process.env.VERCEL_REGION || "local",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    bootstrapEnabled: process.env.OPS_BOOTSTRAP_ENABLE === "true",
    cookiesSecure: process.env.NODE_ENV === "production",
    safeEnv,
  };

  return NextResponse.json({ data });
}
