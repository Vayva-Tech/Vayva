// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/collections/[id] - Get collection details
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id: collectionId } = await params;
    
    // Call backend API to fetch collection
    const result = await apiJson<{
      success: boolean;
      data?: {
        id: string;
        title: string;
        description: string;
        handle: string;
        imageUrl: string | null;
        productCount: number;
        isAutomated: boolean;
        conditions: any;
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/collections/${collectionId}`, {
      headers: {
        "x-store-id": storeId,
      },
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch collection');
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/collections/[id]',
      operation: 'GET_COLLECTION',
    });
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/collections/[id] - Update collection
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id: collectionId } = await params;
    const body = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/collections/${collectionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-store-id': storeId,
      },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to update collection');
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/collections/[id]',
      operation: 'UPDATE_COLLECTION',
    });
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/collections/[id] - Delete collection
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id: collectionId } = await params;
    
    const result = await apiJson<{
      success: boolean;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/collections/${collectionId}`, {
      method: 'DELETE',
      headers: {
        'x-store-id': storeId,
      },
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete collection');
    }

    return NextResponse.json({
      success: true,
      message: 'Collection deleted successfully',
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/collections/[id]',
      operation: 'DELETE_COLLECTION',
    });
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
