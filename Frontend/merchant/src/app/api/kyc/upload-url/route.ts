import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/kyc/upload-url
 * Get signed URL for KYC document upload
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    if (body === null || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;

    const result = await apiJson<{
      success: boolean;
      uploadUrl?: string;
      fileUrl?: string;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/kyc/upload-url`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify({
        documentType: b.documentType,
        fileName: b.fileName,
        fileType: b.fileType,
        fileSize: b.fileSize,
      }),
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to get upload URL");
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/kyc/upload-url",
      operation: "POST_KYC_UPLOAD_URL",
    });
    return NextResponse.json(
      { error: "Failed to get upload URL" },
      { status: 500 },
    );
  }
}
