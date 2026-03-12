import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Moved: Use /api/payments/initialize with { reference }" },
    { status: 410 },
  );
}
