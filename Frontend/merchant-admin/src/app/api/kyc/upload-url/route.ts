import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@/lib/logger";

/**
 * POST /api/kyc/upload-url
 * Get signed URL for KYC document upload
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      const body = await request.json();
      const { documentType, fileName, fileType, fileSize } = body;

      try {
        const result = await apiJson<{
          uploadUrl: string;
          fileUrl: string;
        }>(
          `${process.env.BACKEND_API_URL}/api/kyc/upload-url`,
          {
            method: "POST",
            body: JSON.stringify({
              merchantId: session.merchantId,
              userId: session.userId,
              documentType,
              fileName,
              fileType,
              fileSize,
            }),
          }
        );

        return {
          status: 200,
          body: result,
        };
      } catch (error) {
        // Return error instead of mock response
        logger.error("[KYC_UPLOAD_URL] Failed to generate upload URL", error);
        return {
          status: 500,
          body: { error: "Failed to generate upload URL" },
        };
      }
    },
    { requireAuth: true }
  );
}
