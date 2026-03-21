// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/kyc/upload-url
 * Get signed URL for KYC document upload
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentType, fileName, fileType, fileSize } = body;

    const result = await apiJson<{
      uploadUrl: string;
      fileUrl: string;
    }>(`${process.env.BACKEND_API_URL}/api/kyc/upload-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentType,
        fileName,
        fileType,
        fileSize,
      }),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to get upload URL');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/kyc/upload-url',
        operation: 'GET_KYC_UPLOAD_URL',
      }
    );
    return NextResponse.json(
      { error: 'Failed to get upload URL' },
      { status: 500 }
    );
  }
}
