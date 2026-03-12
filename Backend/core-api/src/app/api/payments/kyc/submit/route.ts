import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export const POST = withVayvaAPI(
  PERMISSIONS.PAYMENTS_MANAGE,
  async (req, { db, storeId }) => {
    try {
      const body = await req.json();
      const { nin, bvn } = body;

      if (!nin && !bvn) {
        return NextResponse.json(
          { error: "Either NIN or BVN is required" },
          { status: 400 },
        );
      }

      // Simulating KYC submission/verification update
      // In a real scenario, this would call a KYC provider
      await db.store.update({
        where: { id: storeId },
        data: {
          kycStatus: "PENDING", // Set to pending verification
        },
      });

      // Also update wallet if exists
      await db.wallet.updateMany({
        where: { storeId },
        data: { kycStatus: "PENDING" },
      });

      return NextResponse.json({
        success: true,
        message: "KYC details submitted for verification",
        status: "PENDING",
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to submit KYC" },
        { status: 500 },
      );
    }
  },
);
