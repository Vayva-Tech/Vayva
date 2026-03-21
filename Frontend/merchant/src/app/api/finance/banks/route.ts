import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const banks = await prisma.bankBeneficiary?.findMany({
      where: { storeId },
      select: {
        id: true,
        bankName: true,
        accountNumber: true,
        accountName: true,
        isDefault: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(banks, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/finance/banks',
      operation: 'GET_BANKS',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
