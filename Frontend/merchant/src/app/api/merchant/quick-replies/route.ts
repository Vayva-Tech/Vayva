import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";

interface StoreSettings {
  quickReplies?: unknown[];
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { settings: true },
        });

        const settings = (store?.settings as StoreSettings | null) ?? {};
        const quickReplies = Array.isArray(settings.quickReplies) ? settings.quickReplies : [];

        return NextResponse.json({ quickReplies }, {
            headers: { "Cache-Control": "no-store" },
        });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/merchant/quick-replies", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
