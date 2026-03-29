import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { apiJson } from "@/lib/api-client-shared";

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

    const queryParams = new URLSearchParams({
      status: statusFilter,
    });

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/bnpl/dashboard?${queryParams}`,
      {
        headers: auth.headers,
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    handleApiError(error, { endpoint: "/bnpl/dashboard", operation: "GET" });
    return NextResponse.json({ success: false, error: "Failed to load BNPL dashboard" }, { status: 500 });
  }
}

