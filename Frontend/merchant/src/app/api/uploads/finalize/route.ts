// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface FinalizeUploadBody {
  key: string;
  purpose: "PRODUCT_IMAGE" | "BRANDING_LOGO" | "DISPUTE_EVIDENCE" | "BLOG_COVER" | "USER_AVATAR" | "SOCIAL_IMAGE" | "THEME_HERO" | "THEME_BACKGROUND" | "AGENT_AVATAR";
  entityId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = (await request.json()) as FinalizeUploadBody;
    const { key, purpose, entityId } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { success: false, error: "Upload key is required" },
        { status: 400 },
      );
    }

    const validPurposes = ["PRODUCT_IMAGE", "BRANDING_LOGO", "DISPUTE_EVIDENCE", "BLOG_COVER", "USER_AVATAR", "SOCIAL_IMAGE", "THEME_HERO", "THEME_BACKGROUND", "AGENT_AVATAR"];
    if (!purpose || !validPurposes.includes(purpose)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing upload purpose" },
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
      userId: user.id,
      purpose,
      entityId,
      key,
      url,
    });

    return NextResponse.json({
      success: true,
      data: {
        url,
        key,
        purpose,
        entityId,
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/uploads/finalize",
      operation: "FINALIZE_UPLOAD",
    });
    return NextResponse.json(
      { error: "Failed to finalize upload" },
      { status: 500 }
    );
  }
}
