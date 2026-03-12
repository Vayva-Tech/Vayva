import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, type Prisma } from "@vayva/db";

export const runtime = "nodejs";

function normalizeDomain(input: string) {
  let d = String(input || "").trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "");
  d = d.split("/")[0];
  d = d.replace(/\.$/, "");
  if (!/^[a-z0-9.-]+$/.test(d)) throw new Error("Invalid domain");
  if (d.includes("..")) throw new Error("Invalid domain");
  if (d.startsWith("*")) throw new Error("Wildcard not allowed");
  // reject unsafe targets
  if (d === "localhost" || d.endsWith(".localhost")) throw new Error("Invalid domain");
  if (d.startsWith("127.") || d.startsWith("10.") || d.startsWith("192.168.")) throw new Error("Invalid domain");
  if (d.startsWith("172.")) {
    const parts = d.split(".");
    const second = Number(parts[1] || 0);
    if (second >= 16 && second <= 31) throw new Error("Invalid domain");
  }
  return d;
}

function buildVerificationToken() {
  return `vayva_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

export const GET = withVayvaAPI(PERMISSIONS.DOMAINS_VIEW, async (_req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const rows = await prisma.domainMapping?.findMany({ where: { storeId }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ domains: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to list domains" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
});

export const POST = withVayvaAPI(PERMISSIONS.DOMAINS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
  const correlationId = crypto.randomUUID();
  try {
    const body = await req.json().catch(() => ({}));
    const inputDomain = String(body?.domain || "");
    if (!inputDomain) {
      return NextResponse.json({ error: "domain required", correlationId }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    const domain = normalizeDomain(inputDomain);

    const existing = await prisma.domainMapping?.findFirst({ where: { domain } });
    if (existing && existing.storeId !== storeId) {
      return NextResponse.json({ error: "Domain already in use" }, { status: 409, headers: { "Cache-Control": "no-store" } });
    }

    if (existing && existing.storeId === storeId) {
      return NextResponse.json({ domain: existing, correlationId }, { headers: { "Cache-Control": "no-store" } });
    }

    const token = buildVerificationToken();
    const createData: Prisma.DomainMappingCreateInput = {
      store: { connect: { id: storeId } },
      domain,
      status: "pending",
      verificationToken: token,
      provider: { expectedTxt: `vayva-verification=${token}` },
    };
    
    const created = await prisma.domainMapping?.create({ data: createData });

    const instructions = {
      method: "TXT",
      record: {
        type: "TXT",
        host: domain,
        value: `vayva-verification=${token}`,
      },
      note: "Add a TXT record exactly matching the value. Once propagated, click Verify.",
    };

    return NextResponse.json({ domain: created, instructions, correlationId }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to create domain mapping" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
});
