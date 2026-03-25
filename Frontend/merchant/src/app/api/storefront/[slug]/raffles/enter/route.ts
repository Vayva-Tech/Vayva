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
    const raffleId = typeof body.raffleId === "string" ? body.raffleId : "";
    const email = typeof body.email === "string" ? body.email : "";
    const userId = typeof body.userId === "string" ? body.userId : undefined;

    if (!raffleId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await apiJson<{
      success: boolean;
      entry?: {
        id: string;
        raffleId: string;
        customerEmail: string;
        storeId: string;
      };
      error?: string;
    }>(buildBackendUrl(`/api/storefront/${slug}/raffles/enter`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raffleId, email, userId }),
    });

    if (result.error) {
      const status = result.error.includes("Already entered") ? 409 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: `/api/storefront/${slug}/raffles/enter`,
      operation: "ENTER_RAFFLE",
      storeId: undefined,
    });
    throw error;
  }
}
