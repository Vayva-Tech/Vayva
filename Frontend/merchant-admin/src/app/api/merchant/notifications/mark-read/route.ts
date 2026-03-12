import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.json({ error: "Gone", message: "Moved to /api/notifications/mark-read" }, { status: 410 });
}
