import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { ProductCoreService } from "@/services/product-core.service";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "";
}

const ALLOWED_TYPES = [
  "service",
  "campaign",
  "listing",
  "course",
  "post",
  "stay",
  "event",
  "digital_asset",
  "menu_item",
  "project",
  "vehicle",
  "lead",
];
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const primaryObject = getString(body.primaryObject);
      const data = isRecord(body.data) ? body.data : {};
      if (!primaryObject || !ALLOWED_TYPES.includes(primaryObject)) {
        return NextResponse.json(
          { error: "Invalid resource type" },
          { status: 400 },
        );
      }
      // Map Generic Resource Payload to Product Service Payload
      // We pass 'primaryObject' as 'productType'
      const payload: Record<string, unknown> = {
        ...data,
        productType: primaryObject,
        // Defaulting title/name mapping if needed, but Service checks for title/name
      };
      const product = await ProductCoreService.createProduct(storeId, payload);
      return NextResponse.json({ success: true, id: product.id });
    } catch (error: unknown) {
      logger.error("[RESOURCE_CREATE]", error, { storeId });
      const isLimitError = getErrorMessage(error).includes("limit");
      return NextResponse.json(
        {
          error: isLimitError
            ? "Resource limit reached"
            : "Failed to create resource",
        },
        { status: isLimitError ? 403 : 400 },
      );
    }
  },
);
