// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { StorageService } from "@/lib/storage/storageService";
import { FEATURES } from "@/lib/env-validation";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.ACCOUNT_VIEW, async () => {
    return NextResponse.json({
        enabled: FEATURES.STORAGE_ENABLED,
        provider: "vercel-blob",
    }, {
        headers: {
            "Cache-Control": "no-store",
        },
    });
});

export const POST = withVayvaAPI(PERMISSIONS.ACCOUNT_MANAGE, async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string; role?: string | null } }) => {
    try {
        if (!FEATURES.STORAGE_ENABLED) {
            return NextResponse.json({
                code: "feature_not_configured",
                feature: "STORAGE_ENABLED",
                message: "File storage is not configured. Contact support to enable this feature.",
            }, { status: 503 });
        }
        const formData = await req.formData();
        const file = formData.get("file");
        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }
        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
        }
        // Validate file type
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "application/pdf",
        ];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
        }
        const ctx = {
            userId: user.id,
            merchantId: user.id, // Using user ID as merchant ID context for now
            storeId: storeId,
            roles: [user.role || "owner"],
        };
        const url = await StorageService.upload(ctx, file.name, file);
        return NextResponse.json({
            success: true,
            url,
            filename: file.name,
            size: file.size,
            type: file.type,
        });
    }
    catch (error: unknown) {
      handleApiError(
        error,
        {
          endpoint: "/api/unknown",
          operation: "GET_STORAGE",
          storeId,
        }
      );
      throw error;
    }
});
