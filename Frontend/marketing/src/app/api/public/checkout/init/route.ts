import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const merchantOrigin = process.env.MERCHANT_ORIGIN || "https://merchant.vayva.ng";

    const res = await fetch(`${merchantOrigin}/api/public/checkout/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const json = await res.json().catch(() => null);
    return NextResponse.json(json ?? { success: false, error: "Invalid response" }, {
      status: res.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to initialize checkout" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
