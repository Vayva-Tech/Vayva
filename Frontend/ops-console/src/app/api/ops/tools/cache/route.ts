import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    // Only Admin/Owner
    if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { target, type } = body; // type: 'path' or 'tag'

    if (!target) {
      return NextResponse.json({ error: "Target required" }, { status: 400 });
    }

    if (type === "tag") {
      // @ts-expect-error - Next.js type definitions might vary by version
      revalidateTag(String(target));
    } else {
      revalidatePath(target);
    }

    // Audit
    await OpsAuthService.logEvent(user.id, "OPS_CACHE_CLEARED", {
      target,
      type,
    });

    return NextResponse.json({
      success: true,
      message: `Cleared ${type}: ${target}`,
    });
  } catch {
    return NextResponse.json({ error: "Cache clear failed" }, { status: 500 });
  }
}
