import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { PaystackService } from "@/lib/payment/paystack";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

type PackId = "AI_MESSAGES_250" | "AI_MESSAGES_1000" | "AI_MESSAGES_3000";

const PACKS: Record<
  PackId,
  { messagesAdded: number; priceNgn: number; label: string }
> = {
  AI_MESSAGES_250: { messagesAdded: 250, priceNgn: 2000, label: "+250 AI messages" },
  AI_MESSAGES_1000: { messagesAdded: 1000, priceNgn: 5000, label: "+1,000 AI messages" },
  AI_MESSAGES_3000: { messagesAdded: 3000, priceNgn: 12000, label: "+3,000 AI messages" },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

async function handler(req: NextRequest, ctx: { storeId?: string }) {
  const storeId = ctx.storeId;
  if (!storeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bodyUnknown: unknown = await req.json().catch(() => ({}));
    const body = isRecord(bodyUnknown) ? bodyUnknown : {};
    const packId = (getString(body.packId) || "") as PackId;
    const pack = PACKS[packId];
    if (!pack) {
      return NextResponse.json({ error: "Invalid packId" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { ownerEmail: true },
    });
    const email = String(store?.ownerEmail || "").toLowerCase().trim();
    if (!email) {
      return NextResponse.json(
        { error: "Store owner email is required for payment" },
        { status: 400 },
      );
    }

    const reference = `ai_${storeId}_${Date.now()}`;
    const amountKobo = pack.priceNgn * 100;

    const init = await PaystackService.initializeTransaction({
      email,
      amount: amountKobo,
      reference,
      metadata: {
        type: "ai_messages_topup",
        storeId,
        packId,
        messagesAdded: pack.messagesAdded,
        priceNgn: pack.priceNgn,
        label: pack.label,
      },
      callback_url: `${process.env.MERCHANT_BASE_URL || "https://merchant.vayva.ng"}/dashboard/ai-usage?ref=${encodeURIComponent(reference)}`,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          authorization_url: init.data.authorization_url,
          reference: init.data.reference,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e: unknown) {
    logger.error("[AI_TOPUP_INIT]", e, { storeId });
    return NextResponse.json(
      { success: false, error: "Failed to initialize AI top-up" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export const POST = withVayvaAPI(PERMISSIONS.BILLING_MANAGE, handler);

