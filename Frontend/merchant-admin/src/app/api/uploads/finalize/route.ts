import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

interface FinalizeUploadBody {
  key: string;
  purpose: "PRODUCT_IMAGE" | "BRANDING_LOGO" | "DISPUTE_EVIDENCE" | "BLOG_COVER" | "USER_AVATAR" | "SOCIAL_IMAGE" | "THEME_HERO" | "THEME_BACKGROUND" | "AGENT_AVATAR";
  entityId?: string;
}

export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = (await req.json()) as FinalizeUploadBody;
      const { key, purpose, entityId } = body;

      // Validate key
      if (!key || typeof key !== "string") {
        return NextResponse.json(
          { success: false, error: "Upload key is required" },
          { status: 400 },
        );
      }

      // Validate purpose
      const validPurposes = ["PRODUCT_IMAGE", "BRANDING_LOGO", "DISPUTE_EVIDENCE", "BLOG_COVER", "USER_AVATAR", "SOCIAL_IMAGE", "THEME_HERO", "THEME_BACKGROUND", "AGENT_AVATAR"];
      if (!purpose || !validPurposes.includes(purpose)) {
        return NextResponse.json(
          { success: false, error: "Invalid or missing upload purpose" },
          { status: 400 },
        );
      }

      // Ensure key belongs to this store
      if (!key.startsWith(`stores/${storeId}/`)) {
        return NextResponse.json(
          { success: false, error: "Invalid upload key" },
          { status: 403 },
        );
      }

      // Validate key format - no path traversal
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

      // Build the public URL
      let url: string;
      if (publicBaseUrl) {
        url = `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
      } else {
        const base = endpoint.replace(/\/$/, "");
        url = `${base}/${bucket}/${key}`;
      }

      // Note: Product images are stored in form state and submitted with product data
      // The URL is returned to the frontend which handles attachment to entities

      // Log the upload for audit
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[UPLOAD_FINALIZE_ERROR] Failed to finalize upload", { error: errorMessage, storeId });
      return NextResponse.json(
        { success: false, error: "Failed to finalize upload" },
        { status: 500 },
      );
    }
  },
);
