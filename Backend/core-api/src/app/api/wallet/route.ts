import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET /api/wallet - Get merchant wallet balance and details
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      // Get or create wallet for the store
      let wallet = await prisma.wallet.findUnique({
        where: { storeId },
      });

      // Create wallet if it doesn't exist
      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            storeId,
            availableKobo: BigInt(0),
            pendingKobo: BigInt(0),
          },
        });
      }

      // Get recent ledger entries for this store
      const recentEntries = await prisma.ledgerEntry.findMany({
        where: { storeId },
        orderBy: { occurredAt: "desc" },
        take: 10,
        select: {
          id: true,
          direction: true,
          amount: true,
          description: true,
          occurredAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          wallet: {
            id: wallet.id,
            storeId: wallet.storeId,
            available: Number(wallet.availableKobo) / 100,
            pending: Number(wallet.pendingKobo) / 100,
            currency: "NGN",
            createdAt: wallet.createdAt.toISOString(),
            updatedAt: wallet.updatedAt.toISOString(),
          },
          recentActivity: recentEntries.map((entry) => ({
            id: entry.id,
            direction: entry.direction,
            amount: Number(entry.amount),
            description: entry.description,
            occurredAt: entry.occurredAt.toISOString(),
          })),
        },
      });
    } catch (error: unknown) {
      logger.error("[WALLET_GET]", error, { storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch wallet" },
        { status: 500 }
      );
    }
  }
);

// POST /api/wallet/fund - Add funds to wallet (manual/admin)
export const POST = withVayvaAPI(
  PERMISSIONS.PAYMENTS_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const body = await req.json();
      const { amount, method, reference, metadata } = body;

      if (!amount || amount <= 0) {
        return NextResponse.json(
          { success: false, error: "Valid amount is required" },
          { status: 400 }
        );
      }

      // Get or create wallet
      let wallet = await prisma.wallet.findUnique({
        where: { storeId },
      });

      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            storeId,
            availableKobo: BigInt(0),
            pendingKobo: BigInt(0),
          },
        });
      }

      const amountKobo = BigInt(Math.round(amount * 100));

      // Create ledger entry and update wallet in transaction
      const [ledgerEntry, updatedWallet] = await prisma.$transaction([
        prisma.ledgerEntry.create({
          data: {
            storeId,
            referenceType: "FUNDING",
            referenceId: reference || `fund-${Date.now()}`,
            direction: "CREDIT",
            account: "MERCHANT_AVAILABLE",
            amount: amount,
            currency: "NGN",
            description: `Manual funding via ${method || "admin"}`,
            metadata: metadata || {},
          },
        }),
        prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            availableKobo: { increment: amountKobo },
          },
        }),
      ]);

      return NextResponse.json(
        {
          success: true,
          data: {
            ledgerEntryId: ledgerEntry.id,
            amount: amount,
            newBalance: Number(updatedWallet.availableKobo) / 100,
          },
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      logger.error("[WALLET_FUND]", error, { storeId, userId: user.id });
      return NextResponse.json(
        { success: false, error: "Failed to fund wallet" },
        { status: 500 }
      );
    }
  }
);
