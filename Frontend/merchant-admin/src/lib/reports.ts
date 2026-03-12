import { prisma } from "@vayva/db";
import type {
  SummaryMetrics,
  SummaryRange,
  ReconciliationParams,
  ReconciliationResult,
  CSVExportParams,
  OrderWithTransactions,
  PaymentTransaction,
} from "@/types/reports";

export class ReportsService {
  // --- SUMMARY METRICS ---
  static async getSummary(merchantId: string, range: SummaryRange): Promise<SummaryMetrics> {
        const whereDate = {
            createdAt: { gte: range.from, lte: range.to },
        };
        // 1. Gross Sales (Orders that are PAID or FULFILLED, excluding Cancelled/Draft if desired)
        // Usually Gross Sales = sum(total) of valid orders.
        const orders = await prisma.order.findMany({
            where: {
                storeId: merchantId,
                createdAt: { gte: range.from, lte: range.to },
                status: { notIn: ["DRAFT", "CANCELLED"] as const }, // Filter out noise
            },
            select: { total: true, status: true, paymentStatus: true },
        });
        const grossSales = orders.reduce((sum: number, o: { total: { toNumber(): number } | number }) => sum + Number(o.total), 0);
        const ordersPaidCount = orders.filter((o: { paymentStatus: string }) => o.paymentStatus === "SUCCESS" || o.paymentStatus === "VERIFIED").length;
        // 2. Refunds
        const refunds = await prisma.refund.findMany({
            where: {
                storeId: merchantId,
                createdAt: { gte: range.from, lte: range.to },
                status: "SUCCESS",
            },
            select: { amount: true },
        });
        const refundsAmount = refunds.reduce((sum: number, r: { amount: { toNumber(): number } | number }) => sum + Number(r.amount), 0);
        const refundsCount = refunds.length;
        const netSales = grossSales - refundsAmount;
        // 3. Payments (Actual Cash Flow)
        const payments = await prisma.paymentTransaction.findMany({
            where: {
                storeId: merchantId,
                createdAt: { gte: range.from, lte: range.to },
                status: "SUCCESS",
                type: "CHARGE",
            },
            select: { amount: true },
        });
        const paymentsReceived = payments.reduce((sum: number, p: { amount: { toNumber(): number } | number }) => sum + Number(p.amount), 0);
        // 4. Delivery
        // Using `Shipment` status if available, or Order fulfillmentStatus as proxy if Shipment missing
        // Checking Shipment model usage.
        const shipments = await prisma.shipment.findMany({
            where: {
                storeId: merchantId,
                createdAt: { gte: range.from, lte: range.to }, // Or deliveredAt? Using creation for consistency with period.
            },
            select: { status: true },
        });
        const deliveredCount = shipments.filter((s: { status: string }) => s.status === "DELIVERED").length;
        const failedCount = shipments.filter((s: { status: string }) => s.status === "FAILED" || s.status === "RETURNED").length;
        const totalShipments = shipments.length;
        const successRate = totalShipments > 0 ? (deliveredCount / totalShipments) * 100 : 0;
        return {
            grossSales,
            netSales,
            paymentsReceived,
            refundsAmount,
            ordersPaidCount,
            refundsCount,
            delivery: {
                deliveredCount,
                failedCount,
                successRate: Math.round(successRate * 100) / 100,
            },
        };
    }
    // --- RECONCILIATION TABLE ---
    static async getReconciliation(merchantId: string, limit: number, cursor?: string): Promise<ReconciliationResult> {
        const take = limit + 1;
        const where = {
            storeId: merchantId,
            status: { not: "DRAFT" as const },
        };
        const itemsRaw = await prisma.order.findMany({
            where,
            take,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: "desc" },
            include: {
                paymentTransactions: true,
                shipments: true,
                customer: { select: { firstName: true, lastName: true, phone: true } }, // Basic details
            },
        });
        let nextCursor = undefined;
        if (itemsRaw.length > limit) {
            const nextItem = itemsRaw.pop();
            nextCursor = nextItem?.id;
        }
        const items = itemsRaw.map((o) => {
            const total = Number(o.total);
            const paidTransactions = o.paymentTransactions?.filter((t) => t.status === "SUCCESS" && t.type === "CHARGE") ?? [];
            const paidAmount = paidTransactions.reduce((acc, t) => acc + Number(t.amount), 0);
            const refundTransactions = o.paymentTransactions?.filter((t) => t.status === "SUCCESS" && t.type === "REFUND") ?? [];
            const refundedAmount = refundTransactions.reduce((acc, t) => acc + Number(t.amount), 0);
            const discrepancies = [];
            // Flag 1: Paid but Order Cancelled
            if (o.status === "CANCELLED" && paidAmount > 0)
                discrepancies.push("Money held on Cancelled Order");
            // Flag 2: Delivered but not Paid (COD exception needed logic, defaulting strict for now)
            if (o.fulfillmentStatus === "DELIVERED" &&
                paidAmount < total &&
                o.paymentMethod !== "COD") {
                discrepancies.push("Delivered but Unpaid");
            }
            // Flag 3: Refunded > Paid
            if (refundedAmount > paidAmount)
                discrepancies.push("Over-refunded");
            // Flag 4: Payment Mismatch (Paid != Total) - Margin of error for floating point often handled, keeping strict
            if (o.status === "DELIVERED" &&
                Math.abs(total - paidAmount) > 1 &&
                o.paymentMethod !== "COD") {
                if (paidAmount < total)
                    discrepancies.push("Underpaid");
                if (paidAmount > total)
                    discrepancies.push("Overpaid");
            }
            return {
                orderId: o.id,
                refCode: o.refCode,
                date: o.createdAt,
                customerName: o.customer
                    ? `${o.customer.firstName || ""} ${o.customer.lastName || ""}`.trim() ||
                    o.customer.phone ||
                    "Unknown"
                    : "Guest",
                status: o.status,
                total,
                paidAmount,
                refundedAmount,
                paymentStatus: o.paymentStatus,
                deliveryStatus: o.fulfillmentStatus, // Using Order status as primary view
                discrepancies,
            };
        });
        return { items, nextCursor };
    }
    // --- CSV EXPORT GENERATOR ---
    static async generateCSV(merchantId: string, type: string, range: SummaryRange): Promise<string> {
        // Simplified V1: Generate string in memory. Large scale would stream.
        if (type === "reconciliation") {
            // Fetch ALL (warn: memory)
            // For V1 limit to 1000 items or similar safety cap
            const { items } = await ReportsService.getReconciliation(merchantId, 1000);
            const headers = [
                "Date",
                "Ref",
                "Customer",
                "Status",
                "Total",
                "Paid",
                "Refunded",
                "Discrepancies",
            ];
            const rows = items.map((i) => [
                i.date.toISOString(),
                i.refCode,
                i.customerName,
                i.status,
                i.total.toFixed(2),
                i.paidAmount.toFixed(2),
                i.refundedAmount.toFixed(2),
                i.discrepancies.join(" | "),
            ]);
            return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        }
        // Add other types if needed
        return "Not Implemented";
    }
}
