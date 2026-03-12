import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { Prisma } from "@vayva/db";

export const GET = withVayvaAPI(
  PERMISSIONS.PAYMENTS_VIEW,
  async (req, { db, storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
      const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));

      const where: Prisma.LedgerEntryWhereInput = {
        storeId,
      };

      const [entries, total] = await Promise.all([
        db.ledgerEntry.findMany({
          where,
          orderBy: { occurredAt: "desc" },
          take: limit,
          skip: (page - 1) * limit,
        }),
        db.ledgerEntry.count({ where }),
      ]);

      return NextResponse.json({
        data: entries,
        meta: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch ledger" },
        { status: 500 },
      );
    }
  },
);
