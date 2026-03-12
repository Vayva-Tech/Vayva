import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

interface DeleteUploadBody {
  key: string;
}

function getS3Config() {
  const endpoint = process.env?.MINIO_ENDPOINT;
  const accessKeyId = process.env?.MINIO_ACCESS_KEY;
  const secretAccessKey = process.env?.MINIO_SECRET_KEY;
  const bucket = process.env?.MINIO_BUCKET || "vayva-storage";
  const region = process.env?.MINIO_REGION || "us-east-1";

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing MinIO configuration");
  }

  return { endpoint, accessKeyId, secretAccessKey, bucket, region };
}

export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = (await req.json()) as DeleteUploadBody;
      const { key } = body;

      // Validate key
      if (!key || typeof key !== "string") {
        return NextResponse.json(
          { success: false, error: "Upload key is required" },
          { status: 400 },
        );
      }

      // Validate key format - must be for this store
      if (!key.startsWith(`stores/${storeId}/`)) {
        return NextResponse.json(
          { success: false, error: "Invalid upload key" },
          { status: 403 },
        );
      }

      // Validate key doesn't contain path traversal attempts
      if (key.includes("..") || key.includes("//")) {
        return NextResponse.json(
          { success: false, error: "Invalid key format" },
          { status: 400 },
        );
      }

      const { endpoint, accessKeyId, secretAccessKey, bucket, region } = getS3Config();

      const s3 = new S3Client({
        region,
        endpoint,
        forcePathStyle: true,
        credentials: { accessKeyId, secretAccessKey },
      });

      // Delete from MinIO
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await s3.send(command);

      // Log for audit
      logger.info("[UPLOAD_DELETED]", {
        storeId,
        userId: user.id,
        key,
      });

      return NextResponse.json({
        success: true,
        data: { deleted: true, key },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[UPLOAD_DELETE_ERROR] Failed to delete upload", { error: errorMessage, storeId });
      return NextResponse.json(
        { success: false, error: "Failed to delete upload" },
        { status: 500 },
      );
    }
  },
);
