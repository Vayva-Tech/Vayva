import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { UploadPurpose, prisma } from "@vayva/db";
import { UPLOAD_CONFIGS } from "@vayva/shared/api/upload-config";
import { v4 as uuidv4 } from "uuid";
import {
  logger,
  standardHeaders,
  BadRequestError,
  ForbiddenError,
} from "@vayva/shared";
import { rateLimit } from "@vayva/shared/rateLimit";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Config() {
  const endpoint = process.env.MINIO_ENDPOINT;
  const accessKeyId = process.env.MINIO_ACCESS_KEY;
  const secretAccessKey = process.env.MINIO_SECRET_KEY;
  const bucket = process.env.MINIO_BUCKET;
  const region = process.env.MINIO_REGION || "us-east-1";
  const publicBaseUrl = process.env.MINIO_PUBLIC_BASE_URL;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new BadRequestError("Storage is not configured");
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
    const requestId = ctx.correlationId;
    const storeId = ctx.storeId;
    const userId = ctx.user.id;

    try {
      // Rule 44.3: Upload intent rate limits
      const ip =
        req.headers.get("x-real-ip") ||
        req.headers.get("x-forwarded-for")?.split(",")[0] ||
        "unknown";

      const rlIp = await rateLimit(`upload_intent:ip:${ip}`, 30, 60);
      if (!rlIp.ok) {
        return NextResponse.json(
          { error: "Too many requests", requestId },
          {
            status: 429,
            headers: {
              ...standardHeaders(requestId),
              "Retry-After": String(rlIp.retryAfterSec),
            },
          },
        );
      }

      const rlUser = await rateLimit(`upload_intent:user:${userId}`, 30, 60);
      if (!rlUser.ok) {
        return NextResponse.json(
          { error: "Too many requests", requestId },
          {
            status: 429,
            headers: {
              ...standardHeaders(requestId),
              "Retry-After": String(rlUser.retryAfterSec),
            },
          },
        );
      }

      const rlStore = await rateLimit(`upload_intent:store:${storeId}`, 60, 60);
      if (!rlStore.ok) {
        return NextResponse.json(
          { error: "Too many requests", requestId },
          {
            status: 429,
            headers: {
              ...standardHeaders(requestId),
              "Retry-After": String(rlStore.retryAfterSec),
            },
          },
        );
      }

      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const purpose = getString(body.purpose);
      const filename = getString(body.filename);
      const size = typeof body.size === "number" ? body.size : undefined;

      if (!purpose || !filename || typeof size !== "number") {
        throw new BadRequestError(
          "Missing required fields: purpose, filename, size",
        );
      }

      const config = UPLOAD_CONFIGS[purpose as UploadPurpose];
      if (!config) {
        throw new BadRequestError(`Invalid upload purpose: ${purpose}`);
      }

      // Check size limit
      if (size > config.maxSize) {
        throw new BadRequestError(
          `File too large. Maximum size for ${purpose} is ${config.maxSize / (1024 * 1024)}MB`,
        );
      }

      // Check permissions based on purpose
      const { can: checkPermission } = await import("@/lib/team/permissions");
      if (
        purpose === "BRANDING_LOGO" &&
        !checkPermission(ctx.user.role, PERMISSIONS.ACCOUNT_MANAGE) &&
        ctx.user.role !== "owner"
      ) {
        throw new ForbiddenError(
          "Insufficient permissions for branding upload",
        );
      }
      if (
        purpose === "DISPUTE_EVIDENCE" &&
        !checkPermission(ctx.user.role, PERMISSIONS.SUPPORT_MANAGE) &&
        ctx.user.role !== "owner"
      ) {
        throw new ForbiddenError(
          "Insufficient permissions for dispute evidence upload",
        );
      }
      if (
        purpose === "PRODUCT_IMAGE" &&
        !checkPermission(ctx.user.role, PERMISSIONS.PRODUCTS_MANAGE) &&
        ctx.user.role !== "owner"
      ) {
        throw new ForbiddenError(
          "Insufficient permissions for product image upload",
        );
      }

      const extension = filename.split(".").pop() || "bin";
      const uuid = uuidv4();

      // Rule 43.5: Strict storage key conventions
      // Branding: stores/<storeId>/branding/<uuid>.png
      // Product images: stores/<storeId>/products/<uuid>.<ext> (uuid used instead of productId here for simplicity in create phase)
      // Evidence: stores/<storeId>/disputes/<uuid>.<ext>

      const key = `stores/${storeId}/${config.pathPrefix}/${uuid}.${extension}`;

      const {
        endpoint,
        accessKeyId,
        secretAccessKey,
        bucket,
        region,
        publicBaseUrl,
      } = getS3Config();
      const s3 = new S3Client({
        region,
        endpoint,
        forcePathStyle: true,
        credentials: { accessKeyId, secretAccessKey },
      });

      const expiresIn = 300;
      const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          ContentType: config.allowedMimeTypes[0],
        }),
        { expiresIn },
      );

      // Create PENDING upload record
      const upload = await prisma.upload.create({
        data: {
          storeId,
          createdByUserId: ctx.user.id,
          purpose: purpose as UploadPurpose,
          status: "PENDING",
          key,
          originalName: filename,
          size,
        },
      });

      return NextResponse.json(
        {
          id: upload.id,
          key,
          uploadUrl,
          publicUrl: buildPublicUrl({ publicBaseUrl, endpoint, bucket, key }),
          headers: {
            "Content-Type": config.allowedMimeTypes[0], // Hint
          },
          expiresIn,
          requestId,
        },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const errStack = error instanceof Error ? error.stack : undefined;
      if (error instanceof BadRequestError || error instanceof ForbiddenError)
        throw error;
      logger.error("Upload creation failed", {
        error: errMsg,
        stack: errStack,
        requestId,
        storeId,
      });
      return NextResponse.json(
        { error: "Internal Server Error", requestId },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
  { requiredPermission: null },
);
