import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { MenuService } from "@/services/MenuService";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Bad Request";
}

export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (request, { storeId }) => {
    try {
      const parsedBody: unknown = await request.json().catch(() => ({}));
      const data = isRecord(parsedBody) ? parsedBody : {};
      const product = await MenuService.createMenuItem(storeId, data);
      return NextResponse.json(product);
    } catch (error: unknown) {
      logger.error("[MENU_ITEMS_POST]", error, { storeId });
      return NextResponse.json(
        { error: getErrorMessage(error) },
        { status: 400 },
      );
    }
  },
);
