// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
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

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = (await request.json()) as DeleteUploadBody;
    const { key } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { success: false, error: "Upload key is required" },
        { status: 400 },
      );
    }

    if (!key.startsWith(`stores/${storeId}/`)) {
      return NextResponse.json(
        { success: false, error: "Invalid upload key" },
        { status: 403 },
      );
    }

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

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3.send(command);

    logger.info("[UPLOAD_DELETED]", {
      storeId,
      userId: user.id,
      key,
    });

    return NextResponse.json({
      success: true,
      data: { deleted: true, key },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/uploads/delete",
      operation: "DELETE_UPLOAD",
    });
    return NextResponse.json(
      { error: "Failed to delete upload" },
      { status: 500 }
    );
  }
}
