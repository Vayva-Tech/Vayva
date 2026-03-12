import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";

export async function GET() {
  await OpsAuthService.logout();

  // Redirect to Ops Login
  const loginUrl = new URL(
    "/ops/login",
    process.env.NEXT_PUBLIC_OPS_URL || "http://localhost:3002",
  );
  return NextResponse.redirect(loginUrl);
}
