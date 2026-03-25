import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@vayva/db";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";

const bodySchema = z.object({
  email: z.string().email(),
  interest: z.enum(["desktop", "mobile", "both"]),
});

function sourceForInterest(interest: z.infer<typeof bodySchema>["interest"]): string {
  switch (interest) {
    case "desktop":
      return "native_apps_waitlist_desktop";
    case "mobile":
      return "native_apps_waitlist_mobile";
    default:
      return "native_apps_waitlist_both";
  }
}

/** POST /api/beta/desktop-app-waitlist — merchant waitlist for native desktop/mobile apps */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json: unknown = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { email, interest } = parsed.data;
    const source = sourceForInterest(interest);

    await prisma.mobileAppWaitlist.upsert({
      where: { email: email.toLowerCase().trim() },
      create: {
        email: email.toLowerCase().trim(),
        source,
      },
      update: {
        source,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/beta/desktop-app-waitlist",
      operation: "POST",
    });
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }
}
