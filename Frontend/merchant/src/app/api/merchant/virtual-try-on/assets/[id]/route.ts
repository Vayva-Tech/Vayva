// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
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
export async function GET(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";

    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/merchant/virtual-try-on/assets/${id}`, {
      headers: {
        "x-store-id": storeId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/merchant/virtual-try-on/assets/[id]",
      operation: "GET_VTO_ASSET",
    });
    return NextResponse.json(
      { error: "Failed to fetch virtual try-on asset" },
      { status: 500 }
    );
  }
}

// PATCH /api/merchant/virtual-try-on/assets/[id] - Update asset
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json();
    const validation = updateAssetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/merchant/virtual-try-on/assets/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-store-id": storeId,
      },
      body: JSON.stringify(validation.data),
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/merchant/virtual-try-on/assets/[id]",
      operation: "UPDATE_VTO_ASSET",
    });
    return NextResponse.json(
      { error: "Failed to update virtual try-on asset" },
      { status: 500 }
    );
  }
}

// DELETE /api/merchant/virtual-try-on/assets/[id] - Delete asset
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";

    const result = await apiJson<{
      success: boolean;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/merchant/virtual-try-on/assets/${id}`, {
      method: "DELETE",
      headers: {
        "x-store-id": storeId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/merchant/virtual-try-on/assets/[id]",
      operation: "DELETE_VTO_ASSET",
    });
    return NextResponse.json(
      { error: "Failed to delete virtual try-on asset" },
      { status: 500 }
    );
  }
}
