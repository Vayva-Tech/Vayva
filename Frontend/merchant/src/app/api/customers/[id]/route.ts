import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/customers/[id] - Get single customer details
export async function GET(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Customer id required" }, { status: 400 });
    }
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Call backend API to fetch customer
    const result = await apiJson<{
      success: boolean;
      data?: { id: string; firstName: string; lastName: string; email?: string; phone?: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/customers/${id}`, {
      headers: auth.headers,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/customers/[id]',
      operation: 'GET_CUSTOMER',
    });
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PATCH /api/customers/[id] - Update customer
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Customer id required" }, { status: 400 });
    }
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body: unknown = await request.json();

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/customers/${id}`, {
      method: 'PATCH',
      headers: auth.headers,
      body: JSON.stringify(body),
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/customers/[id]',
      operation: 'UPDATE_CUSTOMER',
    });
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Customer id required" }, { status: 400 });
    }
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await apiJson<{
      success: boolean;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/customers/${id}`, {
      method: "DELETE",
      headers: auth.headers,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/customers/[id]',
      operation: 'DELETE_CUSTOMER',
    });
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
