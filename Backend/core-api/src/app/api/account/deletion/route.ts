import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { DeletionService } from "@/services/DeletionService";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const GET = withVayvaAPI(
  PERMISSIONS.ACCOUNT_VIEW,
  async (req, { storeId }) => {
    try {
      const status = await DeletionService.getStatus(storeId);
      return NextResponse.json(
        { status },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[DELETION_STATUS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to get deletion status" },
        { status: 500 },
      );
    }
  },
);

export const PUT = withVayvaAPI(
  PERMISSIONS.ACCOUNT_MANAGE,
  async (req, { storeId, user }) => {
    if (user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Forbidden - Only Owner can confirm deletion" },
        { status: 403 },
      );
    }

    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const token = typeof body.token === "string" ? body.token : "";

      if (!token.trim()) {
        return NextResponse.json(
          { error: "Confirmation token is required" },
          { status: 400 },
        );
      }

      const result = await DeletionService.confirmDeletion(token);

      if (!result.success) {
        const isTokenError =
          result.error === "Invalid confirmation token." ||
          result.error === "Confirmation token has expired.";

        return NextResponse.json(
          { error: result.error },
          { status: isTokenError ? 400 : 422 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          alreadyConfirmed: result.alreadyConfirmed ?? false,
          scheduledFor: result.scheduledFor,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[DELETION_CONFIRM_PUT]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Failed to confirm deletion" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.ACCOUNT_MANAGE,
  async (req, { storeId, user }) => {
    // Extra guard: Verify Owner Role
    if (user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Forbidden - Only Owner can request deletion" },
        {
          status: 403,
        },
      );
    }
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const reason = typeof body.reason === "string" ? body.reason : "";
      const result = await DeletionService.requestDeletion(
        storeId,
        user.id,
        reason,
      );
      if (!result.success) {
        return NextResponse.json(
          { error: result.error, blockers: result.blockers },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        scheduledFor: result.scheduledFor,
        confirmationToken:
          typeof result.confirmationToken === "string"
            ? result.confirmationToken
            : undefined,
      });
    } catch (error: unknown) {
      logger.error("[DELETION_REQUEST_POST]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Deletion initiation failed" },
        { status: 500 },
      );
    }
  },
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.ACCOUNT_MANAGE,
  async (req, { storeId, user }) => {
    // Extra guard: Verify Owner Role
    if (user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Forbidden - Only Owner can cancel deletion" },
        {
          status: 403,
        },
      );
    }
    try {
      const result = await DeletionService.cancelDeletion(storeId, user.id);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[DELETION_CANCEL_DELETE]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Failed to cancel deletion" },
        { status: 500 },
      );
    }
  },
);
