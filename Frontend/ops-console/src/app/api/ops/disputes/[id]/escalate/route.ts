import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

// Paystack escalation types
type EscalationType = "INTERNAL" | "PAYSTACK";

interface PaystackDisputeData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reason?: string;
  transactionReference?: string;
}

/**
 * Escalate dispute to Paystack if needed
 */
async function escalateToPaystack(
  dispute: PaystackDisputeData,
  note: string,
  adminEmail: string
): Promise<{ success: boolean; paystackRef?: string; error?: string }> {
  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
  const PAYSTACK_API_URL = "https://api.paystack.co/dispute";

  if (!PAYSTACK_SECRET) {
    logger.error("[PAYSTACK_ESCALATION_ERROR]", { error: "PAYSTACK_SECRET_KEY not configured" });
    return { success: false, error: "Paystack not configured" };
  }

  try {
    // Call Paystack API to escalate dispute
    const response = await fetch(`${PAYSTACK_API_URL}/${dispute.id}/escalate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note: note || `Escalated by ops admin: ${adminEmail}`,
        transaction_reference: dispute.transactionReference,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error("[PAYSTACK_ESCALATION_API_ERROR]", { 
        status: response.status, 
        disputeId: dispute.id,
        error: errorData 
      });
      return { success: false, error: `Paystack API error: ${response.status}` };
    }

    const data = await response.json();
    logger.info("[PAYSTACK_ESCALATION_SUCCESS]", {
      disputeId: dispute.id,
      paystackRef: data.data?.reference,
    });

    return { success: true, paystackRef: data.data?.reference };
  } catch (error) {
    logger.error("[PAYSTACK_ESCALATION_ERROR]", { error, disputeId: dispute.id });
    return { success: false, error: "Failed to escalate to Paystack" };
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const { user } = await OpsAuthService.requireSession();

    try {
      (OpsAuthService as any).requireRole(user, "OPS_ADMIN");
    } catch (e) {
      return NextResponse.json(
        {
          error:
            e instanceof Error
              ? e instanceof Error
                ? e.message
                : String(e)
              : String(e),
        },
        { status: 403 },
      );
    }

    const disputeId = params.id;
    const body = await request.json();
    const { note, escalationType = "INTERNAL" }: { note?: string; escalationType?: EscalationType } = body;

    // Fetch dispute
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    // Update dispute status to escalated
    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: "UNDER_REVIEW",
      },
    });

    let paystackResult: { success: boolean; paystackRef?: string; error?: string } | null = null;

    // If Paystack escalation requested, escalate to Paystack
    if (escalationType === "PAYSTACK") {
      paystackResult = await escalateToPaystack(
        {
          id: disputeId,
          amount: Number(dispute.amount),
          currency: dispute.currency,
          status: dispute.status,
          reason: dispute.reasonCode || undefined,
          transactionReference: dispute.providerDisputeId || undefined,
        },
        note || "",
        user.email
      );
    }

    // Create timeline event with escalation details
    await prisma.disputeTimelineEvent.create({
      data: {
        disputeId,
        eventType: "ADMIN_ACTION",
        payload: {
          action: "ESCALATE",
          adminId: user.id,
          note,
          escalationType,
          paystackEscalation: paystackResult,
          description: `Dispute escalated by Ops Admin: ${user.email}${
            escalationType === "PAYSTACK" ? " (via Paystack)" : ""
          }`,
        },
      },
    });

    return NextResponse.json({
      success: true,
      dispute: updatedDispute,
      message: escalationType === "PAYSTACK" && paystackResult?.success
        ? "Dispute escalated to Paystack successfully"
        : "Dispute escalated for senior review",
      paystackEscalation: paystackResult,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[ESCALATE_DISPUTE_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to escalate dispute" },
      { status: 500 },
    );
  }
}
