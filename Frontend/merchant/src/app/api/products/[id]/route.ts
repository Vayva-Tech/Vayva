// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { logger } from "@/lib/logger";

// GET /api/products/[id] - Get single product details
export async function GET(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    
    // Call backend API
    const result = await apiJson<{
      success: boolean;
      data?: { id: string; name: string; description: string; price: number; status: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/products/${id}`, {
      headers: {
        "x-store-id": storeId,
      },
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/products/[id]',
      operation: 'GET_PRODUCT',
    });
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id] - Update product
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-store-id': storeId,
      },
      body: JSON.stringify(body),
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/products/[id]',
      operation: 'UPDATE_PRODUCT',
    });
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    
    const result = await apiJson<{
      success: boolean;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'x-store-id': storeId,
      },
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/products/[id]',
      operation: 'DELETE_PRODUCT',
    });
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
