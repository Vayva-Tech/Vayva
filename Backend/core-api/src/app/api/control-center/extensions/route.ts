import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { extensionRegistry } from "@/lib/extensions/registry";
import { logger } from "@/lib/logger";

async function handler(req: NextRequest) {
  const storeId = req.headers.get("x-store-id");

  if (!storeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all available extensions
    const allExtensions = extensionRegistry.getAll();

    // Return extensions list
    return NextResponse.json(
      {
        extensions: allExtensions.map((ext) => ({
          id: ext.id,
          name: ext.name,
          description: ext.description,
          category: ext.category,
          enabled: false, // Would check against store settings
        })),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error: unknown) {
    logger.error("[EXTENSIONS_GET]", error, { storeId });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export const GET = withVayvaAPI(PERMISSIONS.INTEGRATIONS_MANAGE, handler);
