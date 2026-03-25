import { logger } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { Client } from "minio";

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
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const actorUserId =
      "id" in auth.user && typeof (auth.user as { id?: unknown }).id === "string"
        ? (auth.user as { id: string }).id
        : null;

    const body: unknown = await request.json();
    if (body === null || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid body" },
        { status: 400 },
      );
    }
    const key =
      typeof (body as DeleteUploadBody).key === "string"
        ? (body as DeleteUploadBody).key
        : "";

    if (!key) {
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

    const { endpoint, accessKeyId, secretAccessKey, bucket, region } =
      getS3Config();

    const minioClient = new Client({
      endPoint: endpoint.replace(/^https?:\/\//, "").split("/")[0],
      port: parseInt(endpoint.split(":").pop() || "443"),
      useSSL: endpoint.startsWith("https"),
      accessKey: accessKeyId,
      secretKey: secretAccessKey,
      region,
    });

    await minioClient.removeObject(bucket, key);

    logger.info("[UPLOAD_DELETED]", {
      storeId,
      userId: actorUserId,
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
      { status: 500 },
    );
  }
}
