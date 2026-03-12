import { NextResponse } from "next/server";
import { PaystackService } from "@/lib/payment/paystack";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }
  try {
    const banks = await PaystackService.getBanks();
    // Filter for active banks only and sort alphabetically
    const bankList = Array.isArray(banks) ? (banks as unknown[]) : [];
    const activeBanks = bankList
      .filter((b): b is Record<string, unknown> => isRecord(b) && !!b.active)
      .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")))
      .map((b) => ({ name: String(b.name ?? ""), code: String(b.code ?? "") }));

    return NextResponse.json(activeBanks, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    logger.error("[BANKS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch banks" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
