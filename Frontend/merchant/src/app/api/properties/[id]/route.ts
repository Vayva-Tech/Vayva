// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export const dynamic = "force-dynamic";

// GET /api/properties/[id] - Get property by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Call backend API
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/properties/${id}`,
      {
        headers: {
          "x-store-id": storeId,
        },
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/properties/[id]',
      operation: 'GET_PROPERTY',
    });
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

// PATCH /api/properties/[id] - Update property
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/properties/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          "x-store-id": storeId,
        },
        body: JSON.stringify(body),
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/properties/[id]',
      operation: 'UPDATE_PROPERTY',
    });
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id] - Delete property
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/properties/${id}`,
      {
        method: 'DELETE',
        headers: {
          "x-store-id": storeId,
        },
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/properties/[id]',
      operation: 'DELETE_PROPERTY',
    });
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}
