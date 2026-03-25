import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getNumber(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function normalizeStatus(status: string | null | undefined): string {
  return String(status || "PENDING").toUpperCase();
}

type Installment = {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  paidDate?: string;
};

function parseInstallments(installmentData: unknown, fallbackCount: number, totalAmount: number): Installment[] {
  if (installmentData && typeof installmentData === "object") {
    const rec = installmentData as Record<string, unknown>;
    const list = Array.isArray(rec.installments) ? (rec.installments as unknown[]) : null;
    if (list) {
      const out: Installment[] = [];
      for (const it of list) {
        if (!it || typeof it !== "object") continue;
        const r = it as Record<string, unknown>;
        const id = getString(r.id) || crypto.randomUUID();
        const amount = getNumber(r.amount) ?? 0;
        const status = normalizeStatus(getString(r.status));
        const dueDate = getString(r.dueDate) || new Date().toISOString();
        const paidDate = getString(r.paidDate) || undefined;
        out.push({ id, amount, status, dueDate, paidDate });
      }
      if (out.length > 0) return out;
    }
  }

  // Fallback: naive equally-split schedule with no due dates (UI still renders)
  const count = Math.max(1, fallbackCount || 1);
  const per = totalAmount / count;
  return Array.from({ length: count }).map((_, i) => ({
    id: `inst_${i + 1}`,
    amount: per,
    status: "PENDING",
    dueDate: new Date().toISOString(),
  }));
}

/**
 * GET /api/bnpl/dashboard?status=all|active|pending|defaulted|completed
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const storeId = auth.user.storeId;
    const url = new URL(request.url);
    const statusFilter = (url.searchParams.get("status") || "all").toLowerCase();

    const where: Record<string, unknown> = { storeId };
    if (statusFilter !== "all") {
      // UI uses lowercase; DB stores uppercase strings (per schema comment)
      where.status = statusFilter.toUpperCase();
    }

    const agreementsRaw = await (prisma as any).bNPLAgreement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        order: {
          select: {
            id: true,
            customerPhone: true,
            customerEmail: true,
            customer: { select: { firstName: true, lastName: true, phone: true, email: true } },
          },
        },
      },
    });

    const agreements = (agreementsRaw as any[]).map((a) => {
      const order = a.order as any;
      const cust = order?.customer as any;
      const customerName =
        [cust?.firstName, cust?.lastName].filter(Boolean).join(" ").trim() ||
        order?.customerEmail ||
        cust?.email ||
        "Customer";
      const customerPhone = order?.customerPhone || cust?.phone || "—";
      const customerEmail = order?.customerEmail || cust?.email || "—";

      const totalAmount = Number(a.totalAmount || 0);
      const currency = String(a.currency || "NGN");
      const installmentsCount = Number(a.installments || 0) || 4;
      const installments = parseInstallments(a.installmentData, installmentsCount, totalAmount);

      const upfrontAmount = getNumber((a.metadata as any)?.upfrontAmount) ?? 0;
      const installmentAmount =
        getNumber((a.metadata as any)?.installmentAmount) ??
        (installmentsCount > 0 ? totalAmount / installmentsCount : totalAmount);

      return {
        id: String(a.id),
        orderId: String(a.orderId),
        customerName,
        customerPhone,
        customerEmail,
        provider: String(a.provider || "paystack").toLowerCase(),
        totalAmount,
        upfrontAmount,
        installmentAmount,
        numberOfInstallments: installmentsCount,
        status: normalizeStatus(a.status),
        appliedAt: (a.createdAt ? new Date(a.createdAt) : new Date()).toISOString(),
        approvedAt: a.updatedAt ? new Date(a.updatedAt).toISOString() : undefined,
        installments,
        currency,
      };
    });

    const totalAgreements = agreements.length;
    const activeAgreements = agreements.filter((a) => a.status === "ACTIVE").length;
    const completedAgreements = agreements.filter((a) => a.status === "COMPLETED").length;
    const defaultedAgreements = agreements.filter((a) => a.status === "DEFAULTED").length;
    const totalValue = agreements.reduce((sum, a) => sum + (a.totalAmount || 0), 0);
    const outstandingValue = agreements
      .filter((a) => a.status === "ACTIVE" || a.status === "PENDING" || a.status === "APPROVED")
      .reduce((sum, a) => sum + (a.totalAmount || 0), 0);
    const avgOrderValue = totalAgreements > 0 ? totalValue / totalAgreements : 0;

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalAgreements,
          activeAgreements,
          completedAgreements,
          defaultedAgreements,
          totalValue,
          outstandingValue,
          avgOrderValue,
        },
        agreements,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    handleApiError(error, { endpoint: "/api/bnpl/dashboard", operation: "GET" });
    return NextResponse.json({ success: false, error: "Failed to load BNPL dashboard" }, { status: 500 });
  }
}

