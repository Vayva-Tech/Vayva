import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      buildSha: process.env.NEXT_PUBLIC_BUILD_STAMP || "dev",
      environment: process.env.NODE_ENV,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
