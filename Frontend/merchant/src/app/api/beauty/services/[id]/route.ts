// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/beauty/services/[id]
 * Get specific service details
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    
    // Call backend API to fetch service details with performance metrics
    const result = await apiJson<{
      success: boolean;
      data: {
        id: string;
        name: string;
        description: string;
        category: string;
        duration: number;
        price: number;
        status: string;
        imageUrl: string;
        metadata?: Record<string, unknown>;
        recentBookings: Array<{
          id: string;
          customerId: string;
          startTime: string;
          status: string;
        }>;
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/beauty-services/${id}`, {
      headers: {
        "x-store-id": storeId,
      },
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch service');
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/beauty/services/[id]',
      operation: 'GET_SERVICE',
    });
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/beauty/services/[id]
 * Update an existing service
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/beauty-services/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-store-id': storeId,
      },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to update service');
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/beauty/services/[id]',
      operation: 'UPDATE_SERVICE',
    });
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/beauty/services/[id]
 * Delete a service
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    
    const result = await apiJson<{
      success: boolean;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/beauty-services/${id}`, {
      method: 'DELETE',
      headers: {
        'x-store-id': storeId,
      },
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete service');
    }

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/beauty/services/[id]',
      operation: 'DELETE_SERVICE',
    });
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
