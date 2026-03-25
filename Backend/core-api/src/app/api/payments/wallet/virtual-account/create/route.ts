import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(
  PERMISSIONS.PAYMENTS_MANAGE,
  async (req, { db, storeId }) => {
    try {
      const [store, defaultPayout, wallet] = await Promise.all([
        prisma.store.findUnique({
          where: { id: storeId },
          select: { id: true, name: true, kycStatus: true, kycRecord: { select: { status: true } } },
        }),
        prisma.bankBeneficiary.findFirst({
          where: { storeId, isDefault: true },
          select: { id: true },
        }),
        db.wallet.findUnique({ where: { storeId } }),
      ]);

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      // Idempotency: if VA already exists, return it.
      if (wallet?.vaAccountNumber && wallet.vaBankName && wallet.vaAccountName) {
        return NextResponse.json({
          success: true,
          message: "Virtual account already exists",
          account: {
            bankName: wallet.vaBankName,
            accountNumber: wallet.vaAccountNumber,
            accountName: wallet.vaAccountName,
          },
        });
      }

      // Gate: must have default payout account
      if (!defaultPayout) {
        return NextResponse.json(
          {
            error: "Add a default payout account before creating a virtual account",
          },
          { status: 400 },
        );
      }

      // Gate: KYC must be VERIFIED
      // NOTE: Some flows update `kycRecord.status` without syncing `store.kycStatus`.
      // Accept either as the source of truth.
      const kycStatus = String(store.kycStatus || store.kycRecord?.status || "NOT_STARTED").toUpperCase();
      if (kycStatus !== "VERIFIED") {
        return NextResponse.json(
          {
            error:
              "KYC must be verified before creating a Paystack dedicated virtual account",
            kycStatus: kycStatus.toLowerCase(),
          },
          { status: 403 },
        );
      }

      const { Paystack } = await import("@vayva/payments");

      // Create/ensure Paystack customer using store name. Keep it deterministic and short.
      const storeName = (store.name || "Vayva Merchant").trim();
      const safeName = storeName.replace(/\s+/g, " ").slice(0, 80);
      const [firstName, ...rest] = safeName.split(" ");
      const lastName = rest.join(" ") || "Store";

      const customer = await Paystack.createCustomer({
        email: `store-${storeId}@vayva.co`,
        firstName,
        lastName,
        metadata: {
          storeId,
          storeName,
          source: "vayva_core_api",
        },
      });

      const dedicated = await Paystack.createDedicatedVirtualAccount({
        customerCode: customer.customerCode,
      });

      const updated = await db.wallet.upsert({
        where: { storeId },
        create: {
          storeId,
          vaStatus: "CREATED",
          vaBankName: dedicated.bankName,
          vaAccountNumber: dedicated.accountNumber,
          vaAccountName: dedicated.accountName,
          vaProviderRef: dedicated.providerRef,
        },
        update: {
          vaStatus: "CREATED",
          vaBankName: dedicated.bankName,
          vaAccountNumber: dedicated.accountNumber,
          vaAccountName: dedicated.accountName,
          vaProviderRef: dedicated.providerRef,
        },
      });

      logger.info("[VIRTUAL_ACCOUNT_CREATE] Dedicated virtual account created", {
        storeId,
        bankName: updated.vaBankName,
        accountNumberLast4: String(updated.vaAccountNumber || "").slice(-4),
      });

      return NextResponse.json({
        success: true,
        message: "Virtual account created",
        account: {
          bankName: updated.vaBankName,
          accountNumber: updated.vaAccountNumber,
          accountName: updated.vaAccountName,
        },
      });
    } catch (error: unknown) {
      logger.error("[VIRTUAL_ACCOUNT_CREATE] Failed", error, { storeId });
      const message = error instanceof Error ? error.message : "Failed to create virtual account";
      return NextResponse.json(
        { error: message },
        { status: message.toLowerCase().includes("paystack") ? 502 : 500 },
      );
    }
  },
);
