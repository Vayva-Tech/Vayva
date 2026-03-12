import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import {
  sendMerchantInvite,
  sendPasswordReset,
  sendOrderConfirmed,
  sendPaymentReceived,
} from "@vayva/emails/send";

export const runtime = "nodejs";

function backoffMinutes(attempt: number) {
  if (attempt <= 1) return 1;
  if (attempt === 2) return 5;
  if (attempt === 3) return 15;
  if (attempt === 4) return 60;
  if (attempt === 5) return 360;
  return 0;
}

async function drainEmailOutbox(batchSize = 25) {
  const now = new Date();

  const candidates = await prisma.emailOutbox.findMany({
    where: {
      status: { in: ["PENDING", "FAILED"] },
      OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
    },
    orderBy: { createdAt: "asc" },
    take: batchSize,
  });

  let sent = 0;
  let failed = 0;
  let dead = 0;

  for (const email of candidates) {
    const claimed = await prisma.emailOutbox.updateMany({
      where: { id: email.id, status: { in: ["PENDING", "FAILED"] } },
      data: { status: "SENDING", attempts: { increment: 1 }, lastError: null },
    });
    if (claimed.count === 0) continue;

    const fresh = await prisma.emailOutbox.findUnique({
      where: { id: email.id },
    });
    if (!fresh) continue;

    try {
      const payload = fresh.payload as Record<string, unknown>;
      let providerMessageId: string | undefined;

      const extractId = (res: { data?: { id?: string } | null } | null): string | undefined => res?.data?.id;

      if (fresh.type === "INVITE") {
        const res = await sendMerchantInvite(fresh.toEmail, payload as { storeName: string; inviterName: string; acceptUrl: string });
        providerMessageId = extractId(res);
      } else if (fresh.type === "PASSWORD_RESET") {
        const res = await sendPasswordReset(fresh.toEmail, payload as { resetUrl: string; minutes: number });
        providerMessageId = extractId(res);
      } else if (fresh.type === "ORDER_CONFIRMED") {
        const res = await sendOrderConfirmed(fresh.toEmail, payload as { refCode: string; orderUrl: string });
        providerMessageId = extractId(res);
      } else if (fresh.type === "PAYMENT_RECEIVED") {
        const res = await sendPaymentReceived(fresh.toEmail, payload as { refCode: string; paymentReference: string; receiptUrl: string });
        providerMessageId = extractId(res);
      } else {
        throw new Error(`Unknown email type: ${fresh.type}`);
      }

      await prisma.emailOutbox.update({
        where: { id: fresh.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          nextRetryAt: null,
          providerMessageId,
        },
      });
      sent++;
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Send failed";
      const attempt = fresh.attempts;
      const mins = backoffMinutes(attempt);

      if (mins === 0) {
        await prisma.emailOutbox.update({
          where: { id: fresh.id },
          data: { status: "DEAD", lastError: msg, nextRetryAt: null },
        });
        dead++;
      } else {
        const next = new Date(Date.now() + mins * 60 * 1000);
        await prisma.emailOutbox.update({
          where: { id: fresh.id },
          data: { status: "FAILED", lastError: msg, nextRetryAt: next },
        });
        failed++;
      }
    }
  }

  return { scanned: candidates.length, sent, failed, dead };
}

function isInternalJob(req: Request) {
  const expected = process.env.JOBS_DRAIN_TOKEN;
  if (!expected) return false;
  const got = req.headers.get("x-job-token") || "";
  return got === expected;
}

export async function POST(req: Request) {
  try {
    // Auth bypass for cron if job token is valid
    if (!isInternalJob(req)) {
      await OpsAuthService.requireSession();
    }

    const body = await req.json().catch(() => ({}));
    const batchSize = Math.min(Math.max(Number(body?.batchSize || 25), 1), 100);

    const result = await drainEmailOutbox(batchSize);

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    const msg = err instanceof Error ? err.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
