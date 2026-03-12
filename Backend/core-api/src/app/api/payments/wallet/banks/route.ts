import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export const GET = withVayvaAPI(
  PERMISSIONS.PAYMENTS_VIEW,
  async (req, { db, storeId }) => {
    try {
      const banks = await db.bankBeneficiary.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(banks);
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch banks" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.PAYMENTS_MANAGE,
  async (req, { db, storeId }) => {
    try {
      const body = await req.json();
      const { bankCode, bankName, accountNumber, accountName, isDefault } =
        body;

      const newBank = await db.bankBeneficiary.create({
        data: {
          storeId,
          bankCode,
          bankName,
          accountNumber,
          accountName,
          isDefault: !!isDefault,
        },
      });

      if (isDefault) {
        // Unset other defaults if this one is set to default
        await db.bankBeneficiary.updateMany({
          where: {
            storeId,
            id: { not: newBank.id },
            isDefault: true,
          },
          data: { isDefault: false },
        });
      }

      return NextResponse.json(newBank);
    } catch {
      return NextResponse.json(
        { error: "Failed to add bank" },
        { status: 500 },
      );
    }
  },
);
