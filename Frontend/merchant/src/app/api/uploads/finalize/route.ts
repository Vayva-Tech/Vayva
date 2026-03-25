import { logger } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";

const VALID_PURPOSES = [
  "PRODUCT_IMAGE",
  "BRANDING_LOGO",
  "DISPUTE_EVIDENCE",
  "BLOG_COVER",
  "USER_AVATAR",
  "SOCIAL_IMAGE",
  "THEME_HERO",
  "THEME_BACKGROUND",
  "AGENT_AVATAR",
] as const;

type UploadPurpose = (typeof VALID_PURPOSES)[number];

interface FinalizeUploadBody {
  key: string;
  purpose: UploadPurpose;
  entityId?: string;
}

function isUploadPurpose(v: unknown): v is UploadPurpose {
  return typeof v === "string" && (VALID_PURPOSES as readonly string[]).includes(v);
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
    const b = body as Record<string, unknown>;
    const key = typeof b.key === "string" ? b.key : "";
    const purpose = b.purpose;
    const entityId = typeof b.entityId === "string" ? b.entityId : undefined;

    if (!key) {
      return NextResponse.json(
        { success: false, error: "Upload key is required" },
        { status: 400 },
      );
    }

    if (!isUploadPurpose(purpose)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing upload purpose" },
        { status: 400 },
      );
    }

    const payload: FinalizeUploadBody = { key, purpose, entityId };

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

    const publicBaseUrl = process.env?.MINIO_PUBLIC_BASE_URL;
    const endpoint = process.env?.MINIO_ENDPOINT;
    const bucket = process.env?.MINIO_BUCKET;

    if (!endpoint || !bucket) {
      return NextResponse.json(
        { success: false, error: "Missing MinIO configuration" },
        { status: 500 },
      );
    }

    let url: string;
    if (publicBaseUrl) {
      url = `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
    } else {
      const base = endpoint.replace(/\/$/, "");
      url = `${base}/${bucket}/${key}`;
    }

    logger.info("[UPLOAD_FINALIZED]", {
      storeId,
      userId: actorUserId,
      purpose: payload.purpose,
      entityId: payload.entityId,
      key,
      url,
    });

    return NextResponse.json({
      success: true,
      data: {
        url,
        key,
        purpose: payload.purpose,
        entityId: payload.entityId,
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/uploads/finalize",
      operation: "FINALIZE_UPLOAD",
    });
    return NextResponse.json(
      { error: "Failed to finalize upload" },
      { status: 500 },
    );
  }
}
