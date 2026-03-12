import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/with-vayva-api";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/legal/reports/financial
 * Generate comprehensive financial report
 */
export const GET = withVayvaAPI(
  PERMISSIONS.LEGAL_REPORTS_VIEW,
  async (request: NextRequest) => {
    try {
      const storeId = request.headers.get("x-store-id") || "default";
      const searchParams = request.nextUrl.searchParams;
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");
      const practiceAreaId = searchParams.get("practiceAreaId");

      // Date range validation
      if (!startDate || !endDate) {
        return NextResponse.json(
          { success: false, error: "Start and end dates required" },
          { status: 400 }
        );
      }

      // Build where clauses
      const caseWhere: any = { storeId };
      if (practiceAreaId) {
        caseWhere.practiceAreaId = practiceAreaId;
      }

      const dateRange = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };

      // Fetch data in parallel
      const [cases, timeEntries, writeOffs, trustTransactions] = await Promise.all([
        prisma.case.findMany({
          where: caseWhere,
          select: {
            amountBilled: true,
            amountCollected: true,
            retainerBalance: true,
            feeArrangement: true,
          },
        }),
        prisma.timeEntry.findMany({
          where: {
            case: { storeId },
            createdAt: dateRange,
          },
          select: {
            hours: true,
            rate: true,
            amount: true,
            isBillable: true,
            billedAt: true,
          },
        }),
        prisma.writeOff.findMany({
          where: {
            case: { storeId },
            createdAt: dateRange,
          },
          select: {
            amount: true,
            reasonCode: true,
          },
        }),
        prisma.trustTransaction.findMany({
          where: {
            trustAccount: { storeId },
            transactionDate: dateRange,
          },
          select: {
            amount: true,
            type: true,
          },
        }),
      ]);

      // Calculate metrics
      const totalBilled = cases.reduce((sum, c) => sum + c.amountBilled, 0);
      const totalCollected = cases.reduce((sum, c) => sum + c.amountCollected, 0);
      const totalRetainer = cases.reduce((sum, c) => sum + (c.retainerBalance || 0), 0);

      const billableHours = timeEntries
        .filter((t) => t.isBillable)
        .reduce((sum, t) => sum + t.hours, 0);
      const nonBillableHours = timeEntries
        .filter((t) => !t.isBillable)
        .reduce((sum, t) => sum + t.hours, 0);

      const totalWriteOffs = writeOffs.reduce((sum, w) => sum + w.amount, 0);

      const trustDeposits = trustTransactions
        .filter((t) => t.type === "deposit")
        .reduce((sum, t) => sum + t.amount, 0);
      const trustDisbursements = trustTransactions
        .filter((t) => t.type === "disbursement")
        .reduce((sum, t) => sum + t.amount, 0);

      // Collection rate
      const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

      // Realization rate
      const totalWorked = timeEntries.reduce((sum, t) => sum + t.hours, 0);
      const realizationRate = totalWorked > 0 ? (billableHours / totalWorked) * 100 : 0;

      return NextResponse.json({
        success: true,
        data: {
          period: { startDate, endDate },
          revenue: {
            totalBilled,
            totalCollected,
            collectionRate: parseFloat(collectionRate.toFixed(2)),
            outstandingReceivables: totalBilled - totalCollected,
          },
          retainers: {
            totalBalance: totalRetainer,
          },
          timeAndBilling: {
            totalHours: totalWorked,
            billableHours: parseFloat(billableHours.toFixed(2)),
            nonBillableHours: parseFloat(nonBillableHours.toFixed(2)),
            realizationRate: parseFloat(realizationRate.toFixed(2)),
            averageRate: timeEntries.length > 0 
              ? timeEntries.reduce((sum, t) => sum + t.rate, 0) / timeEntries.length 
              : 0,
          },
          writeOffs: {
            totalAmount: totalWriteOffs,
            count: writeOffs.length,
            byReason: writeOffs.reduce((acc: any, w) => {
              acc[w.reasonCode] = (acc[w.reasonCode] || 0) + w.amount;
              return acc;
            }, {}),
          },
          trust: {
            deposits: trustDeposits,
            disbursements: trustDisbursements,
            netChange: trustDeposits - trustDisbursements,
          },
        },
      });
    } catch (error) {
      console.error("Error generating financial report:", error);
      return NextResponse.json(
        { success: false, error: "Failed to generate financial report" },
        { status: 500 }
      );
    }
  }
);
