import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Gone", message: "Moved to /api/notifications" },
    {
      status: 410,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
