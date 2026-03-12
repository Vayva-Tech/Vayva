import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// PUT /api/education/modules/[id] - Update a module
export const PUT = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, context: APIContext) => {
    const { storeId, user } = context;
    const params = await context.params;
    const id = params.id;
    try {
      const body = await req.json();
      const { title, description, order, isPublished } = body;

      const module = await (prisma as any).educationModule.findFirst({
        where: {
          id,
          course: { storeId },
        },
      });

      if (!module) {
        return NextResponse.json(
          { success: false, error: "Module not found" },
          { status: 404 }
        );
      }

      const updatedModule = await (prisma as any).educationModule.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(order !== undefined && { order }),
          ...(isPublished !== undefined && { isPublished }),
        },
      });

      logger.info("[MODULE_UPDATED]", { moduleId: id, storeId, userId: user.id });

      return NextResponse.json({
        success: true,
        data: updatedModule,
      });
    } catch (error: unknown) {
      logger.error("[MODULE_UPDATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        moduleId: id,
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to update module" },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/education/modules/[id] - Delete a module
export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, context: APIContext) => {
    const { storeId, user } = context;
    const params = await context.params;
    const id = params.id;
    try {
      const module = await (prisma as any).educationModule.findFirst({
        where: {
          id,
          course: { storeId },
        },
      });

      if (!module) {
        return NextResponse.json(
          { success: false, error: "Module not found" },
          { status: 404 }
        );
      }

      await (prisma as any).educationModule.delete({
        where: { id },
      });

      logger.info("[MODULE_DELETED]", { moduleId: id, storeId, userId: user.id });

      return NextResponse.json({
        success: true,
        message: "Module deleted successfully",
      });
    } catch (error: unknown) {
      logger.error("[MODULE_DELETE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        moduleId: id,
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to delete module" },
        { status: 500 }
      );
    }
  }
);
