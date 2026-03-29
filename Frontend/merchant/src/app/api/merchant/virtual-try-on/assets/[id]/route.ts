import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { z } from "zod";

const updateAssetSchema = z.object({
  assetUrl: z.string().min(1).optional(),
  thumbnailUrl: z.string().min(1).optional(),
  position: z
    .object({
      x: z.number(),
      y: z.number(),
      scale: z.number(),
      rotation: z.number(),
    })
    .optional(),
  colorVariants: z
    .array(
      z.object({
        color: z.string().min(1),
        assetUrl: z.string().min(1),
      })
    )
    .optional(),
  isActive: z.boolean().optional(),
});

// GET /api/merchant/virtual-try-on/assets/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storeId: string | undefined;
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;
    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(buildBackendUrl(`/api/merchant/virtual-try-on/assets/${id}`), {
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/merchant/virtual-try-on/assets/[id]",
      operation: "GET_VTO_ASSET",
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to fetch virtual try-on asset" },
      { status: 500 }
    );
  }
}

// PATCH /api/merchant/virtual-try-on/assets/[id] - Update asset
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storeId: string | undefined;
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;
    const body: unknown = await request.json();
    const validation = updateAssetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(buildBackendUrl(`/api/merchant/virtual-try-on/assets/${id}`), {
      method: "PATCH",
      headers: auth.headers,
      body: JSON.stringify(validation.data),
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/merchant/virtual-try-on/assets/[id]",
      operation: "UPDATE_VTO_ASSET",
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to update virtual try-on asset" },
      { status: 500 }
    );
  }
}

// DELETE /api/merchant/virtual-try-on/assets/[id] - Delete asset
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storeId: string | undefined;
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    const auth = await buildBackendAuthHeaders(_request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;
    const result = await apiJson<{
      success: boolean;
      error?: string;
    }>(buildBackendUrl(`/api/merchant/virtual-try-on/assets/${id}`), {
      method: "DELETE",
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/merchant/virtual-try-on/assets/[id]",
      operation: "DELETE_VTO_ASSET",
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to delete virtual try-on asset" },
      { status: 500 }
    );
  }
}
