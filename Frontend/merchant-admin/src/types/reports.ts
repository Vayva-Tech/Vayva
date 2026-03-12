import type { Prisma } from "@vayva/db";

/**
 * Type definitions for Reports Service
 * Addresses type safety for financial reporting and reconciliation
 */

// ============================================================================
// Summary Report Types
// ============================================================================

export interface SummaryMetrics {
  grossSales: number;
  netSales: number;
  paymentsReceived: number;
  refundsAmount: number;
  ordersPaidCount: number;
  refundsCount: number;
  delivery: {
    deliveredCount: number;
    failedCount: number;
    successRate: number;
  };
}

export interface SummaryRange {
  from: Date;
  to: Date;
}

// ============================================================================
// Reconciliation Types
// ============================================================================

export interface ReconciliationItem {
  orderId: string;
  refCode: string | null;
  date: Date;
  customerName: string;
  status: string;
  total: number;
  paidAmount: number;
  refundedAmount: number;
  paymentStatus: string;
  deliveryStatus: string | null;
  discrepancies: string[];
}

export interface ReconciliationResult {
  items: ReconciliationItem[];
  nextCursor?: string;
}

export interface ReconciliationParams {
  merchantId: string;
  limit: number;
  cursor?: string;
}

// ============================================================================
// CSV Export Types
// ============================================================================

export type CSVReportType = "reconciliation" | "sales" | "payments" | "refunds";

export interface CSVExportParams {
  merchantId: string;
  type: CSVReportType;
  range: SummaryRange;
}

// ============================================================================
// Prisma Return Types
// ============================================================================

export type OrderWithTransactions = Prisma.OrderGetPayload<{
  include: {
    paymentTransactions: true;
    shipments: true;
    customer: { select: { firstName: true; lastName: true; phone: true } };
  };
}>;

export interface PaymentTransaction {
  id: string;
  status: string;
  type: string;
  amount: { toNumber(): number } | number;
}

export interface Shipment {
  id: string;
  status: string;
}

export interface RefundRecord {
  id: string;
  amount: { toNumber(): number } | number;
  status: string;
  createdAt: Date;
}

// ============================================================================
// Database Aggregation Types
// ============================================================================

export interface OrderSelectResult {
  total: { toNumber(): number } | number;
  status: string;
  paymentStatus: string;
}

export interface RefundSelectResult {
  amount: { toNumber(): number } | number;
}

export interface PaymentSelectResult {
  amount: { toNumber(): number } | number;
}

export interface ShipmentSelectResult {
  status: string;
}

// ============================================================================
// Helper Types for Reducers
// ============================================================================

export type NumberReducer = (sum: number, item: { toNumber(): number } | number) => number;

export interface FilterableTransaction {
  status: string;
  type?: string;
}

export interface FilterableOrder {
  paymentStatus: string;
}

export interface FilterableShipment {
  status: string;
}
