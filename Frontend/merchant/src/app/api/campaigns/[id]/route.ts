import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;
    const { action } = await request.json() as { action: "pause" | "resume" };
    const accountId = request.headers.get("x-ad-account-id");

    if (!accountId) {
      return NextResponse.json(
        { error: "No ad account connected" },
        { status: 401 },
      );
    }

    // Update campaign via backend API
    const result = await apiJson<{
      success: boolean;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/campaigns/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ad-account-id': accountId || '',
      },
      body: JSON.stringify({ action }),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to update campaign');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/campaigns/[id]',
        operation: 'UPDATE_CAMPAIGN',
      }
    );
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { platform } = body as { platform: string };
    const accountId = request.headers.get("x-ad-account-id");

    if (!accountId) {
      return NextResponse.json(
        { error: "No ad account connected" },
        { status: 401 },
      );
    }

    // Delete campaign via backend API
    const result = await apiJson<{
      success: boolean;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/campaigns/${id}`, {
      method: 'DELETE',
      headers: {
        'x-ad-account-id': accountId || '',
      },
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete campaign');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/campaigns/[id]',
        operation: 'DELETE_CAMPAIGN',
      }
    );
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 },
    );
  }
}
