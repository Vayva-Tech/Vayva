import { NextRequest, NextResponse } from "next/server";
import { buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  let slug = "unknown";
  try {
    const resolved = await params;
    slug = resolved.slug;
    const body = (await req.json()) as Record<string, unknown>;
    const serviceId = typeof body.serviceId === "string" ? body.serviceId : "";
    const date = typeof body.date === "string" ? body.date : "";
    const time = typeof body.time === "string" ? body.time : "";
    const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail : "";
    const customerName = typeof body.customerName === "string" ? body.customerName : undefined;
    const notes = typeof body.notes === "string" ? body.notes : undefined;

    if (!serviceId || !date || !time || !customerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await apiJson<{
      success: boolean;
      booking?: {
        id: string;
        storeId: string;
        serviceId: string;
        customerId: string;
        startsAt: Date;
        endsAt: Date;
        status: string;
      };
      error?: string;
    }>(buildBackendUrl(`/api/storefront/${slug}/bookings`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ serviceId, date, time, customerEmail, customerName, notes }),
    });

    if (result.error) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: `/api/storefront/${slug}/bookings`,
      operation: "CREATE_BOOKING",
      storeId: undefined,
    });
    throw error;
  }
}
