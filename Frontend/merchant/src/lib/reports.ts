import { api } from '@/lib/api-client';
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
    const response = await api.get('/reports/summary', {
      merchantId,
      from: range.from.toISOString(),
      to: range.to.toISOString(),
    });
    return response.data;
  }

  // --- RECONCILIATION TABLE ---
  static async getReconciliation(merchantId: string, limit: number, cursor?: string): Promise<ReconciliationResult> {
    const response = await api.get('/reports/reconciliation', {
      merchantId,
      limit,
      cursor,
    });
    return response.data;
  }

  // --- CSV EXPORT GENERATOR ---
  static async generateCSV(merchantId: string, type: string, range: SummaryRange): Promise<string> {
    if (type === "reconciliation") {
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
    return "Not Implemented";
  }
}
