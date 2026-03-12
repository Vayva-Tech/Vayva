import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, DisputeStatus, RefundStatus } from "@vayva/db";
import { logAudit, AuditEventType } from "@/lib/audit";
import { logger, standardHeaders } from "@vayva/shared";

export const runtime = "nodejs";

export const POST = withVayvaAPI(PERMISSIONS.ORDERS_MANAGE, async (req: NextRequest, { storeId, params, user, correlationId }: APIContext) => {
    try {
        const resolvedParams = params instanceof Promise ? await params : params;
        const orderId = resolvedParams?.id;
        if (!orderId) {
            return NextResponse.json({ error: "Order ID required", requestId: correlationId }, { status: 400, headers: standardHeaders(correlationId) });
        }

        const body = await req.json().catch(() => ({})) as Record<string, unknown>;
        const amount = Number(body?.amount);
        const reason = typeof body?.reason === "string" ? body.reason?.trim() || null : null;

        if (!Number.isFinite(amount) || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount", requestId: correlationId }, { status: 400, headers: standardHeaders(correlationId) });
        }

        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.order?.findFirst({
                where: { id: orderId, storeId },
                select: { id: true, storeId: true, currency: true, paymentStatus: true },
            });

            if (!order) {
                return { ok: false as const, status: 404 as const, body: { error: "Order not found" } };
            }

            if (String(order.paymentStatus) !== "SUCCESS") {
                return { ok: false as const, status: 409 as const, body: { error: "Order is not paid" } };
            }

            const charge = await tx.charge?.findFirst({
                where: {
                    storeId,
                    orderId,
                    provider: "PAYSTACK",
                    status: "SUCCEEDED" as any,
                },
                orderBy: { createdAt: "desc" },
                select: { id: true, amount: true, currency: true },
            });

            if (!charge) {
                return { ok: false as const, status: 409 as const, body: { error: "Paid charge not found for order" } };
            }

            const requestedAmount = amount;
            const chargeAmount = Number(charge.amount);

            if (requestedAmount > chargeAmount) {
                return { ok: false as const, status: 400 as const, body: { error: "Refund amount exceeds charge amount" } };
            }

            const existingRefunds = await tx.refund?.findMany({
                where: {
                    chargeId: charge.id,
                    status: { in: [RefundStatus.PROCESSING, RefundStatus.SUCCESS] },
                },
                select: { amount: true },
            });

            const alreadyRefunded = existingRefunds.reduce((sum: any, r: any) => sum + Number(r.amount), 0);
            const refundable = chargeAmount - alreadyRefunded;

            if (requestedAmount > refundable) {
                return { ok: false as const, status: 409 as const, body: { error: "Refund exceeds remaining refundable balance" } };
            }

            // 42.7: Block refund if there is an open dispute
            const openDispute = await tx.dispute?.findFirst({
                where: {
                    orderId,
                    status: {
                        in: [
                            DisputeStatus.OPENED,
                            DisputeStatus.EVIDENCE_REQUIRED,
                            DisputeStatus.SUBMITTED,
                            DisputeStatus.EVIDENCE_SUBMITTED,
                            DisputeStatus.UNDER_REVIEW,
                        ],
                    },
                },
            });

            if (openDispute) {
                return { 
                    ok: false as const, 
                    status: 409 as const, 
                    body: { error: "Cannot request refund while a dispute is open. Please resolve the dispute first or contact support." } 
                };
            }

            const refund = await tx.refund?.create({
                data: {
                    storeId,
                    orderId,
                    chargeId: charge.id,
                    status: RefundStatus.REQUESTED,
                    amount: requestedAmount,
                    currency: String(order.currency || charge.currency || "NGN"),
                    reason,
                    requestedByUserId: user.id,
                } as any,
            });

            // 42.8: Enqueue notification for refund requested
            await tx.emailOutbox?.create({
                data: {
                    type: "REFUND_REQUESTED",
                    toEmail: "ops@vayva.app", // Ops needs to know to approve
                    subject: `Refund Requested - Order #${orderId}`,
                    dedupeKey: `refund_requested_${orderId}_${Date.now()}`,
                    payload: {
                        orderId,
                        refundId: refund.id,
                        amount: requestedAmount,
                        storeId,
                    },
                    status: "PENDING" as any,
                }
            }).catch(() => {});

            return { ok: true as const, refund };
        });

        if (!result.ok) {
            return NextResponse.json({ ...result.body, requestId: correlationId }, { status: (result as any).status, headers: standardHeaders(correlationId) });
        }

        return NextResponse.json({ success: true, refund: result.refund, requestId: correlationId }, { headers: standardHeaders(correlationId) });
    }
    catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        const stack = error instanceof Error ? error.stack : undefined;
        logger.error("[ORDER_REFUND_POST]", { error: message, stack, requestId: correlationId, storeId });
        return NextResponse.json({ error: "Failed to request refund", requestId: correlationId }, { status: 500, headers: standardHeaders(correlationId) });
    }
});
