import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

type CoreBooking = {
  id: string;
  startsAt: string;
  endsAt?: string | null;
  status: string;
  service?: { title?: string | null; price?: unknown } | null;
  customer?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

function mapUiStatus(s: string): "Confirmed" | "Pending" | "Cancelled" | "Completed" {
  switch (s) {
    case "CONFIRMED":
      return "Confirmed";
    case "PENDING":
      return "Pending";
    case "CANCELLED":
    case "NO_SHOW":
      return "Cancelled";
    case "COMPLETED":
      return "Completed";
    default:
      return "Pending";
  }
}

function formatDuration(startsAt: string, endsAt?: string | null): string {
  const a = new Date(startsAt).getTime();
  const b = endsAt ? new Date(endsAt).getTime() : a + 60 * 60 * 1000;
  const mins = Math.max(0, Math.round((b - a) / 60000));
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  return `${mins}m`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// GET /api/bookings — core-api returns a raw array; we normalize for dashboard UIs
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const incoming = new URL(request.url).searchParams;
    const qp = new URLSearchParams();
    const start = incoming.get("start") ?? incoming.get("dateFrom");
    const end = incoming.get("end") ?? incoming.get("dateTo");
    if (start) qp.set("start", start);
    if (end) qp.set("end", end);

    const suffix = qp.toString() ? `?${qp.toString()}` : "";
    const raw = await apiJson<CoreBooking[] | { error?: string }>(
      `${backendBase()}/api/bookings${suffix}`,
      { headers: auth.headers },
    );

    const rows = Array.isArray(raw) ? raw : [];
    const data = rows.map((b) => {
      const name = [b.customer?.firstName, b.customer?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      return {
        id: b.id,
        customerName: name || "Customer",
        service: b.service?.title ?? "Service",
        date: b.startsAt.slice(0, 10),
        time: formatTime(b.startsAt),
        duration: formatDuration(b.startsAt, b.endsAt),
        amount: Number(b.service?.price) || 0,
        status: mapUiStatus(b.status),
        startsAt: b.startsAt,
      };
    });

    return NextResponse.json({
      success: true,
      data,
      meta: { total: data.length, limit: data.length, offset: 0 },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/bookings",
      operation: "GET_BOOKINGS",
    });
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}
