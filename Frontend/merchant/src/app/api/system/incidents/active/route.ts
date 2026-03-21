import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(null, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
