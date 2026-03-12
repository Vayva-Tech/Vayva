import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma } from "@vayva/db";
import { resolveTxt, resolveCname } from "node:dns/promises";

export const runtime = "nodejs";

function timeout<T>(ms: number): Promise<T> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("DNS timeout")), ms));
}

function nextRetryAfter(attempt: number): Date {
  const now = new Date();
  const minutes = attempt <= 1 ? 2 : attempt === 2 ? 5 : attempt === 3 ? 15 : 60;
  return new Date(now.getTime() + minutes * 60 * 1000);
}

async function verifyTxt(domain: string, expected: string): Promise<boolean> {
  try {
    const records = await resolveTxt(domain);
    for (const entry of records) {
      const val = entry.join("");
      if (val.trim() === expected) return true;
    }
  } catch { /* DNS lookup failure — treat as unverified */ }
  return false;
}

async function verifyCname(domain: string, expected: string): Promise<boolean> {
  try {
    const records = await resolveCname(domain);
    const normalized = expected.replace(/\.$/, "").toLowerCase();
    return records.some((r) => r.replace(/\.$/, "").toLowerCase() === normalized);
  } catch { /* DNS lookup failure — treat as unverified */ }
  return false;
}

export const POST = withVayvaAPI(PERMISSIONS.DOMAINS_MANAGE, async (_req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
  const correlationId = crypto.randomUUID();
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing id", correlationId }, { status: 400, headers: { "Cache-Control": "no-store" } });

    const mapping = await prisma.domainMapping?.findFirst({ where: { id, storeId } });
    if (!mapping) return NextResponse.json({ error: "Not found", correlationId }, { status: 404, headers: { "Cache-Control": "no-store" } });

    const mappingStatus = mapping.status;
    if (mappingStatus?.toLowerCase() === "active") {
      return NextResponse.json({ domain: mapping, correlationId }, { headers: { "Cache-Control": "no-store" } });
    }

    const provider = (mapping.provider as Record<string, unknown>) || {};
    const attempt = Number(provider.attemptCount || 0) + 1;
    const expectedTxt = String(provider.expectedTxt || `vayva-verification=${mapping.verificationToken}`);
    const expectedCname = provider.expectedCname ? String(provider.expectedCname) : null;

    // Mark verifying + bump attempt
    await prisma.domainMapping?.update({
      where: { id: mapping.id },
      data: {
        status: "pending",
        provider: {
          ...(provider || {}),
          attemptCount: attempt,
          lastCheckedAt: new Date().toISOString(),
        } as unknown as Prisma.InputJsonValue,
      },
    });

    let ok = false;
    try {
      ok = await Promise.race([
        verifyTxt(mapping.domain, expectedTxt),
        (expectedCname ? verifyCname(mapping.domain, expectedCname) : Promise.resolve(false)),
        timeout<boolean>(2500),
      ]);
    } catch { /* verification timeout or error — treat as failed */ }

    if (ok) {
      const updated = await prisma.domainMapping?.update({
        where: { id: mapping.id },
        data: {
          status: "active",
          provider: {
            ...(provider || {}),
            attemptCount: attempt,
            verifiedAt: new Date().toISOString(),
          } as unknown as Prisma.InputJsonValue,
        },
      });
      return NextResponse.json({ domain: updated, correlationId }, { headers: { "Cache-Control": "no-store" } });
    }

    const failureReason = expectedCname ? "DNS record not found (TXT/CNAME)" : "TXT record not found";
    const nextAt = nextRetryAfter(attempt);
    const updated = await prisma.domainMapping?.update({
      where: { id: mapping.id },
      data: {
        status: "error",
        provider: {
          ...(provider || {}),
          attemptCount: attempt,
          failureReason,
          nextRetryAt: nextAt.toISOString(),
          lastCheckedAt: new Date().toISOString(),
        } as unknown as Prisma.InputJsonValue,
      },
    });
    return NextResponse.json({ domain: updated, correlationId }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Verification error" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
});
