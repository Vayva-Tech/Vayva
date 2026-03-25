import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { handleApiError } from "@/lib/api-error-handler";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logger } from "@vayva/shared";

function getS3Config() {
  const endpoint = process.env?.MINIO_ENDPOINT;
  const accessKeyId = process.env?.MINIO_ACCESS_KEY;
  const secretAccessKey = process.env?.MINIO_SECRET_KEY;
  const bucket = process.env?.MINIO_BUCKET;
  const region = process.env?.MINIO_REGION || "us-east-1";
  const publicBaseUrl = process.env?.MINIO_PUBLIC_BASE_URL;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "Missing MinIO configuration (MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET)",
    );
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

interface CreateUploadBody {
  purpose: "PRODUCT_IMAGE" | "BRANDING_LOGO" | "DISPUTE_EVIDENCE" | "BLOG_COVER" | "USER_AVATAR" | "SOCIAL_IMAGE" | "THEME_HERO" | "THEME_BACKGROUND" | "AGENT_AVATAR";
  filename: string;
  size: number;
  mimeType?: string;
}

const MAX_FILE_SIZES = {
  PRODUCT_IMAGE: 10 * 1024 * 1024, // 10MB
  BRANDING_LOGO: 5 * 1024 * 1024,  // 5MB
  DISPUTE_EVIDENCE: 20 * 1024 * 1024, // 20MB
  BLOG_COVER: 5 * 1024 * 1024, // 5MB
  USER_AVATAR: 2 * 1024 * 1024, // 2MB
  SOCIAL_IMAGE: 2 * 1024 * 1024, // 2MB
  THEME_HERO: 10 * 1024 * 1024, // 10MB
  THEME_BACKGROUND: 5 * 1024 * 1024, // 5MB
  AGENT_AVATAR: 2 * 1024 * 1024, // 2MB
};

const ALLOWED_MIME_TYPES = {
  PRODUCT_IMAGE: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  BRANDING_LOGO: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  DISPUTE_EVIDENCE: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  BLOG_COVER: ["image/jpeg", "image/png", "image/webp"],
  USER_AVATAR: ["image/jpeg", "image/png", "image/webp"],
  SOCIAL_IMAGE: ["image/jpeg", "image/png", "image/webp"],
  THEME_HERO: ["image/jpeg", "image/png", "image/webp"],
  THEME_BACKGROUND: ["image/jpeg", "image/png", "image/webp"],
  AGENT_AVATAR: ["image/jpeg", "image/png", "image/webp"],
};

export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = (await req.json()) as CreateUploadBody;
      const { purpose, filename, size, mimeType } = body;

      // Validate purpose
      if (!purpose || !MAX_FILE_SIZES[purpose]) {
        return NextResponse.json(
          { success: false, error: "Invalid or missing upload purpose" },
          { status: 400 },
        );
      }

      // Validate filename
      if (!filename || typeof filename !== "string") {
        return NextResponse.json(
          { success: false, error: "Filename is required" },
          { status: 400 },
        );
      }

      // Validate filename length and content
      if (filename.length > 255) {
        return NextResponse.json(
          { success: false, error: "Filename too long (max 255 characters)" },
          { status: 400 },
        );
      }

      // Check for path traversal attempts in filename
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return NextResponse.json(
          { success: false, error: "Invalid filename" },
          { status: 400 },
        );
      }

      // Validate file size
      if (!size || size <= 0) {
        return NextResponse.json(
          { success: false, error: "Invalid file size" },
          { status: 400 },
        );
      }
      const maxSize = MAX_FILE_SIZES[purpose];
      if (size > maxSize) {
        return NextResponse.json(
          { success: false, error: `File too large. Max size: ${maxSize / (1024 * 1024)}MB` },
          { status: 400 },
        );
      }

      // Validate mime type for images
      if (mimeType && ALLOWED_MIME_TYPES[purpose]) {
        const allowed = ALLOWED_MIME_TYPES[purpose];
        if (!allowed.includes(mimeType)) {
          return NextResponse.json(
            { success: false, error: `Invalid file type. Allowed: ${allowed.join(", ")}` },
            { status: 400 },
          );
        }
      }

      // Generate safe key - sanitize filename
      const safeName = filename
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .substring(0, 100); // Limit filename length in key
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const key = `stores/${storeId}/${purpose.toLowerCase()}/${timestamp}-${randomSuffix}-${safeName}`;

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

      // Generate presigned URL for PUT
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: mimeType || "application/octet-stream",
      });

      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes
      const publicUrl = buildPublicUrl({ publicBaseUrl, endpoint, bucket, key });

      return NextResponse.json({
        success: true,
        data: {
          uploadUrl,
          key,
          publicUrl,
          headers: {
            "Content-Type": mimeType || "application/octet-stream",
          },
          expiresIn: 300,
        },
      });
    } catch (error: unknown) {
      handleApiError(
        error,
        {
          endpoint: "/api/unknown",
          operation: "POST_UPLOADS",
          storeId,
        }
      );
      throw error;
    }
  },
);
