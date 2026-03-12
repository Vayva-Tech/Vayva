import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Paystack } from "@vayva/payments";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

interface PaystackVerificationResponse {
  raw?: {
    status?: boolean;
    data?: {
      status?: string;
      amount?: number;
    };
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");
    
    if (!reference) {
      return NextResponse.json({ error: "Reference required" }, { status: 400 });
    }
    
    // Verify payment with Paystack (canonical)
    const verified = await Paystack.verifyTransaction(reference);
    const raw = (verified as PaystackVerificationResponse).raw ?? {};
    if (!raw.status || String(raw.data?.status).toLowerCase() !== "success") {
      return NextResponse.json({
        success: false,
        message: "Payment verification failed"
      }, { headers: { "Cache-Control": "no-store" } });
    }
    
    // Find template switch record
    const templateSwitch = await prisma.templateSwitch.findFirst({
      where: {
        paymentReference: reference,
        paymentStatus: "pending"
      }
    });
    
    if (!templateSwitch) {
      return NextResponse.json({
        success: false,
        message: "Template switch record not found"
      }, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }
    
    // Verify amount matches
    if (raw.data?.amount !== templateSwitch.chargedAmount) {
      return NextResponse.json({
        success: false,
        message: "Payment amount mismatch"
      }, { headers: { "Cache-Control": "no-store" } });
    }
    
    // Update template switch status
    await prisma.templateSwitch.update({
      where: { id: templateSwitch.id },
      data: {
        paymentStatus: "completed",
        completedAt: new Date()
      }
    });
    
    // Apply template to store
    await applyTemplateToStore(
      templateSwitch.storeId,
      templateSwitch.toTemplateId
    );
    
    return NextResponse.json({
      success: true,
      message: "Template switched successfully"
    }, { headers: { "Cache-Control": "no-store" } });
    
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("[BILLING_TEMPLATE_VERIFY] Payment verification failed", { message: err.message });
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

async function applyTemplateToStore(storeId: string, templateId: string) {
  const now = new Date();
  
  // Get current store to check if firstTemplateSelectedAt is set
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { firstTemplateSelectedAt: true }
  });
  
  await prisma.store.update({
    where: { id: storeId },
    data: {
      currentTemplateId: templateId,
      firstTemplateSelectedAt: store?.firstTemplateSelectedAt ?? now
    }
  });
  
  await prisma.storefrontDraft.upsert({
    where: { storeId },
    create: {
      storeId,
      activeTemplateId: templateId,
      themeConfig: {},
      sectionConfig: {},
      sectionOrder: [],
      assets: {}
    },
    update: {
      activeTemplateId: templateId
    }
  });
}
