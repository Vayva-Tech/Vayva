import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Paystack } from "@vayva/payments";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Reference required" },
        { status: 400 },
      );
    }

    // Verify payment with Paystack (canonical)
    const verified = await Paystack.verifyTransaction(reference);
    const raw: Record<string, unknown> = (() => {
      if (!isRecord(verified)) return {};
      const maybeRaw = verified.raw;
      return isRecord(maybeRaw) ? maybeRaw : {};
    })();

    const rawStatus = getOptionalString(raw.status);
    const rawData = isRecord(raw.data) ? raw.data : {};
    const transactionStatus = getOptionalString(rawData.status);

    if (
      !rawStatus ||
      String(transactionStatus || "").toLowerCase() !== "success"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed",
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    // Find template switch record
    const templateSwitch = await prisma.templateSwitch.findFirst({
      where: {
        paymentReference: reference,
        paymentStatus: "pending",
      },
    });

    if (!templateSwitch) {
      return NextResponse.json(
        {
          success: false,
          message: "Template switch record not found",
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    // Verify amount matches
    const verifiedAmount = getOptionalNumber(rawData.amount);
    const chargedAmount = Number(templateSwitch.chargedAmount);
    if (verifiedAmount === undefined || verifiedAmount !== chargedAmount) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment amount mismatch",
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    // Update template switch status
    await prisma.templateSwitch.update({
      where: { id: templateSwitch.id },
      data: {
        paymentStatus: "completed",
        completedAt: new Date(),
      },
    });

    // Apply template to store
    await applyTemplateToStore(
      templateSwitch.storeId,
      templateSwitch.toTemplateId,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Template switched successfully",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: unknown) {
    logger.error("[TEMPLATE_SWITCH_VERIFY]", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

async function applyTemplateToStore(storeId: string, templateId: string) {
  const now = new Date();

  // Get current store to check if firstTemplateSelectedAt is set
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { firstTemplateSelectedAt: true },
  });

  await prisma.store.update({
    where: { id: storeId },
    data: {
      currentTemplateId: templateId,
      firstTemplateSelectedAt: store?.firstTemplateSelectedAt ?? now,
    },
  });

  await prisma.storefrontDraft.upsert({
    where: { storeId },
    create: {
      storeId,
      activeTemplateId: templateId,
      themeConfig: {},
      sectionConfig: {},
      sectionOrder: [],
      assets: {},
    },
    update: {
      activeTemplateId: templateId,
    },
  });
}
