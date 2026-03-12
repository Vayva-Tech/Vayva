import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export const GET = withVayvaAPI(
  PERMISSIONS.PAYMENTS_VIEW,
  async (req, { db, storeId }) => {
    try {
      const wallet = await db.wallet.findUnique({
        where: { storeId },
      });

      if (!wallet) {
        // Return zero/empty wallet state if explicitly missing, or handle creation logic if desired.
        // For now, returning a coherent empty state.
        return NextResponse.json({
          availableBalance: 0,
          pendingBalance: 0,
          currency: "NGN",
          status: "ACTIVE",
          kycStatus: "NOT_STARTED",
          verificationLevel: "NONE",
          virtualAccount: null,
        });
      }

      return NextResponse.json({
        availableBalance: Number(wallet.availableKobo) / 100, // Convert Kobo to Naira
        pendingBalance: Number(wallet.pendingKobo) / 100,
        currency: "NGN",
        status: wallet.isLocked ? "LOCKED" : "ACTIVE",
        kycStatus: wallet.kycStatus,
        verificationLevel: "Tier 1", // functionality to be expanded
        virtualAccount: wallet.vaAccountNumber
          ? {
              bankName: wallet.vaBankName,
              accountNumber: wallet.vaAccountNumber,
              accountName: wallet.vaAccountName,
            }
          : null,
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch wallet summary" },
        { status: 500 },
      );
    }
  },
);
