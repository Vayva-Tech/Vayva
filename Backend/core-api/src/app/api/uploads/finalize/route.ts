import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { UploadPurpose, prisma } from "@vayva/db";
import { UPLOAD_CONFIGS } from "@vayva/shared/api/upload-config";
import { verifyFileMime } from "@vayva/shared/utils/file-sniffing";
import {
  standardHeaders,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  InternalError,
  logger
} from "@vayva/shared";
import { Client } from "minio";

function getS3Config() {
  const endpoint = process.env.MINIO_ENDPOINT;
  const accessKeyId = process.env.MINIO_ACCESS_KEY;
  const secretAccessKey = process.env.MINIO_SECRET_KEY;
  const bucket = process.env.MINIO_BUCKET;
  const region = process.env.MINIO_REGION || "us-east-1";
  const publicBaseUrl = process.env.MINIO_PUBLIC_BASE_URL;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new InternalError("Storage is not configured");
  }

  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucket,
    region,
    publicBaseUrl,
  };
}

function buildPublicUrl(params: {
  publicBaseUrl?: string;
  endpoint: string;
  bucket: string;
  key: string;
}) {
  const { publicBaseUrl, endpoint, bucket, key } = params;
  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
  }
  const base = endpoint.replace(/\/$/, "");
  return `${base}/${bucket}/${key}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  null,
  async (req: NextRequest, ctx: APIContext) => {
    const parsedBody: unknown = await req.json().catch(() => ({}));
    const body = isRecord(parsedBody) ? parsedBody : {};
    const key = getString(body.key);
    const purpose = getString(body.purpose);
    const entityId = getString(body.entityId);

    if (!key || !purpose) {
      throw new BadRequestError("Missing required fields: key, purpose");
    }

    const upload = await prisma.upload.findUnique({
      where: { key },
    });

    if (!upload) {
      throw new NotFoundError("Upload record not found");
    }

    if (upload.status !== "PENDING") {
      throw new BadRequestError(`Upload is already ${upload.status}`);
    }

    if (upload.storeId !== ctx.storeId) {
      throw new ForbiddenError("Unauthorized access to this upload");
    }

    if (upload.purpose !== purpose) {
      throw new BadRequestError("Purpose mismatch");
    }

    const config = UPLOAD_CONFIGS[purpose as UploadPurpose];

    // Rule 43.5: Verify key prefix
    const expectedPrefix = `stores/${ctx.storeId}/${config.pathPrefix}/`;
    if (!key.startsWith(expectedPrefix)) {
      // Attempt cleanup if hijacked
      try {
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
      } catch {
        // ignore
      }
      await prisma.upload.updateMany({
        where: { id: upload.id, storeId: ctx.storeId },
        data: { status: "REJECTED" },
      });
      throw new ForbiddenError("Invalid storage key path");
    }

    const {
      endpoint,
      accessKeyId,
      secretAccessKey,
      bucket,
      region,
      publicBaseUrl,
    } = getS3Config();
    const minioClient = new Client({
      endPoint: endpoint.replace(/^https?:\/\//, "").split("/")[0],
      port: parseInt(endpoint.split(":").pop() || "443"),
      useSSL: endpoint.startsWith("https"),
      accessKey: accessKeyId,
      secretKey: secretAccessKey,
      region,
    });

    const blobUrl = buildPublicUrl({ publicBaseUrl, endpoint, bucket, key });
    let size: number | undefined;
    try {
      const meta = await minioClient.statObject(bucket, key);
      size = meta.size;
    } catch {
      throw new NotFoundError("File not found in storage");
    }

    // 43.4 MIME Sniffing (by bytes)
    try {
      const { ok: mimeOk, detected: detectedMime } = await verifyFileMime(
        blobUrl,
        config.allowedMimeTypes,
      );

      // Rule 43.1 B: Allowlist check
      if (!mimeOk) {
        await minioClient.removeObject(bucket, key).catch(() => {});
        await prisma.upload.updateMany({
          where: { id: upload.id, storeId: ctx.storeId },
          data: { status: "REJECTED", detectedMime: detectedMime || "unknown" },
        });
        throw new BadRequestError(
          `Invalid file type: ${detectedMime || "unknown"}. Allowed: ${config.allowedMimeTypes.join(", ")}`,
        );
      }

      // Finalize record
      await prisma.upload.updateMany({
        where: { id: upload.id, storeId: ctx.storeId },
        data: {
          status: "FINALIZED",
          detectedMime,
          size: size ?? upload.size,
        },
      });
      const updatedUpload = upload;

      // Attach to entity
      if (purpose === "BRANDING_LOGO") {
        await prisma.store.update({
          where: { id: ctx.storeId },
          data: {
            logoUrl: blobUrl,
            logoUploadId: updatedUpload.id,
          },
        });
      } else if (purpose === "DISPUTE_EVIDENCE") {
        if (!entityId)
          throw new BadRequestError(
            "entityId (disputeId) required for DISPUTE_EVIDENCE",
          );
        const dispute = await prisma.dispute.findFirst({
          where: { id: entityId, storeId: ctx.storeId },
        });
        if (!dispute)
          throw new ForbiddenError("Dispute not found or access denied");
        await prisma.disputeEvidence.create({
          data: {
            disputeId: entityId,
            type: "OTHER",
            uploadId: updatedUpload.id,
            url: blobUrl,
            s3Key: key,
          },
        });
      } else if (purpose === "PRODUCT_IMAGE") {
        if (!entityId)
          throw new BadRequestError(
            "entityId (productId) required for PRODUCT_IMAGE",
          );
        const product = await prisma.product.findFirst({
          where: { id: entityId, storeId: ctx.storeId },
        });
        if (!product)
          throw new ForbiddenError("Product not found or access denied");
        await prisma.productImage.create({
          data: {
            productId: entityId,
            url: blobUrl,
          },
        });
      }

      return NextResponse.json(
        {
          success: true,
          url: blobUrl,
          mime: detectedMime,
          size: size ?? upload.size,
        },
        { headers: standardHeaders(ctx.correlationId) },
      );
    } catch (error: unknown) {
      if (
        error instanceof BadRequestError ||
        error instanceof ForbiddenError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[UPLOAD_FINALIZE_ERROR]", {
        requestId: ctx.correlationId,
        error: errMsg,
        app: "merchant",
      });
      throw new InternalError("Failed to finalize upload");
    }
  },
  { requiredPermission: null },
);
