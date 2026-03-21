// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/bookings/[id] - Get single booking details
export async function GET(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    
    // Call backend API
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/bookings/${id}`,
      {
        headers: {
          "x-store-id": storeId,
        },
      }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/bookings/[id]',
      operation: 'GET_BOOKING',
    });
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings/[id] - Update booking
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/bookings/${id}`,
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
      endpoint: '/api/bookings/[id]',
      operation: 'UPDATE_BOOKING',
    });
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - Cancel booking
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/bookings/${id}`,
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
      endpoint: '/api/bookings/[id]',
      operation: 'DELETE_BOOKING',
    });
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
