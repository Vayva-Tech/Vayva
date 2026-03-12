import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export const dynamic = "force-dynamic";

export const DELETE = withVayvaAPI(
  PERMISSIONS.PAYMENTS_MANAGE,
  async (req, { db, storeId, params }) => {
    try {
      const { id } = params as { id: string }; // Validated by file path but good to check

      const bank = await db.bankBeneficiary.findFirst({
        where: { id, storeId },
      });

      if (!bank) {
        return NextResponse.json(
          { error: "Bank account not found" },
          { status: 404 },
        );
      }

      await db.bankBeneficiary.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: "Bank account removed",
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to delete bank" },
        { status: 500 },
      );
    }
  },
);
