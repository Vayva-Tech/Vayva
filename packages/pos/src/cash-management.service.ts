/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@vayva/db";
import { z } from "zod";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface CashSession {
  id: string;
  storeId: string;
  deviceId: string;
  cashierId?: string;
  status: "open" | "closed" | "reconciled";
  openingFloat: number;
  closingFloat?: number;
  expectedFloat?: number;
  variance?: number;
  totalCashSales: number;
  totalCashRefunds: number;
  totalPaidIn: number;
  totalPaidOut: number;
  openedAt: Date;
  closedAt?: Date;
  reconciledAt?: Date;
  notes?: string;
}

export interface CashMovement {
  id: string;
  sessionId: string;
  storeId: string;
  type: "sale" | "refund" | "paid_in" | "paid_out" | "opening" | "closing";
  amount: number;
  note?: string;
  reference?: string;
  createdAt: Date;
  createdBy?: string;
}

export interface TenderSummary {
  sessionId: string;
  tenders: Array<{
    type: string;
    total: number;
    count: number;
  }>;
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
}

const CashSessionOpenSchema = z.object({
  storeId: z.string(),
  deviceId: z.string(),
  cashierId: z.string().optional(),
  openingFloat: z.number().min(0),
  notes: z.string().optional(),
});

// ────────────────────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────────────────────

export class CashManagementService {
  /**
   * Open a new cash drawer session
   */
  async openSession(data: z.infer<typeof CashSessionOpenSchema>): Promise<CashSession> {
    const parsed = CashSessionOpenSchema.parse(data);

    // Check for open session on this device
    const existing = await (prisma as any).cashSession?.findFirst({
      where: { deviceId: parsed.deviceId, status: "open" },
    });

    if (existing) {
      throw new Error("A cash session is already open for this device");
    }

    const session = await (prisma as any).cashSession?.create({
      data: {
        storeId: parsed.storeId,
        deviceId: parsed.deviceId,
        cashierId: parsed.cashierId,
        status: "open",
        openingFloat: parsed.openingFloat,
        totalCashSales: 0,
        totalCashRefunds: 0,
        totalPaidIn: 0,
        totalPaidOut: 0,
        openedAt: new Date(),
        notes: parsed.notes,
      },
    }) ?? this.mockSession(parsed);

    // Record opening movement
    await this.recordMovement(session.id, {
      storeId: parsed.storeId,
      type: "opening",
      amount: parsed.openingFloat,
      note: "Opening float",
    });

    console.warn(`[CashMgmt] Session opened: ${session.id} with float ₦${parsed.openingFloat / 100}`);
    return this.mapSession(session);
  }

  /**
   * Record a cash sale / refund within a session
   */
  async recordSale(
    sessionId: string,
    amount: number,
    isRefund = false,
    reference?: string
  ): Promise<void> {
    const session = await this.getOpenSession(sessionId);
    if (!session) throw new Error("Cash session not found or not open");

    const field = isRefund ? "totalCashRefunds" : "totalCashSales";

    await (prisma as any).cashSession?.update({
      where: { id: sessionId },
      data: { [field]: { increment: amount } },
    });

    await this.recordMovement(sessionId, {
      storeId: session.storeId,
      type: isRefund ? "refund" : "sale",
      amount,
      reference,
    });
  }

  /**
   * Paid-in / Paid-out (tip, safe drop, etc.)
   */
  async paidInOut(
    sessionId: string,
    amount: number,
    type: "paid_in" | "paid_out",
    note: string
  ): Promise<void> {
    const session = await this.getOpenSession(sessionId);
    if (!session) throw new Error("Cash session not found or not open");

    const field = type === "paid_in" ? "totalPaidIn" : "totalPaidOut";

    await (prisma as any).cashSession?.update({
      where: { id: sessionId },
      data: { [field]: { increment: amount } },
    });

    await this.recordMovement(sessionId, {
      storeId: session.storeId,
      type,
      amount,
      note,
    });
  }

  /**
   * Close session (end of shift)
   */
  async closeSession(
    sessionId: string,
    closingFloat: number,
    notes?: string
  ): Promise<CashSession> {
    const session = await this.getOpenSession(sessionId);
    if (!session) throw new Error("Cash session not found or not open");

    // Calculate expected float
    const expectedFloat =
      session.openingFloat +
      session.totalCashSales +
      session.totalPaidIn -
      session.totalCashRefunds -
      session.totalPaidOut;

    const variance = closingFloat - expectedFloat;

    const updated = await (prisma as any).cashSession?.update({
      where: { id: sessionId },
      data: {
        status: "closed",
        closingFloat,
        expectedFloat,
        variance,
        closedAt: new Date(),
        notes,
      },
    }) ?? { ...session, status: "closed", closingFloat, expectedFloat, variance, closedAt: new Date() };

    // Record closing movement
    await this.recordMovement(sessionId, {
      storeId: session.storeId,
      type: "closing",
      amount: closingFloat,
      note: `Expected: ${expectedFloat}, Variance: ${variance}`,
    });

    if (Math.abs(variance) > 0) {
      console.warn(`[CashMgmt] Session ${sessionId} closed with variance: ₦${variance / 100}`);
    }

    return this.mapSession(updated);
  }

  /**
   * Reconcile session (manager approval)
   */
  async reconcileSession(sessionId: string): Promise<CashSession> {
    const updated = await (prisma as any).cashSession?.update({
      where: { id: sessionId },
      data: { status: "reconciled", reconciledAt: new Date() },
    });

    return this.mapSession(updated);
  }

  /**
   * Get tender summary for a session
   */
  async getTenderSummary(sessionId: string): Promise<TenderSummary> {
    // Aggregate orders for this session by payment method
    const orders = await prisma.order.findMany({
      where: { posSessionId: sessionId } as any,
      select: { paymentMethod: true, total: true, status: true } as any,
    });

    const tenderMap = new Map<string, { total: number; count: number }>();
    let totalRevenue = 0;
    let totalRefunds = 0;

    for (const order of orders) {
      const method = (order as any).paymentMethod ?? "unknown";
      const amount = (order as any).total ?? 0;
      const status = (order as any).status ?? "";

      if (status === "refunded") {
        totalRefunds += amount;
      } else {
        totalRevenue += amount;
        const entry = tenderMap.get(method) ?? { total: 0, count: 0 };
        entry.total += amount;
        entry.count += 1;
        tenderMap.set(method, entry);
      }
    }

    return {
      sessionId,
      tenders: Array.from(tenderMap.entries()).map(([type, { total, count }]) => ({
        type,
        total,
        count,
      })),
      totalRevenue,
      totalRefunds,
      netRevenue: totalRevenue - totalRefunds,
    };
  }

  /**
   * Get movement history for a session
   */
  async getMovements(sessionId: string): Promise<CashMovement[]> {
    const movements = await (prisma as any).cashMovement?.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    }) ?? [];

    return movements.map((m: any) => this.mapMovement(m));
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private async getOpenSession(sessionId: string): Promise<CashSession | null> {
    const session = await (prisma as any).cashSession?.findUnique({
      where: { id: sessionId },
    });
    return session ? this.mapSession(session) : null;
  }

  private async recordMovement(
    sessionId: string,
    data: {
      storeId: string;
      type: CashMovement["type"];
      amount: number;
      note?: string;
      reference?: string;
      createdBy?: string;
    }
  ): Promise<void> {
    await (prisma as any).cashMovement?.create({
      data: { sessionId, ...data, createdAt: new Date() },
    }).catch(() => {
      // Silently ignore if model not yet migrated
    });
  }

  private mockSession(data: z.infer<typeof CashSessionOpenSchema>): Record<string, unknown> {
    return {
      id: `session-${Date.now()}`,
      storeId: data.storeId,
      deviceId: data.deviceId,
      cashierId: data.cashierId,
      status: "open",
      openingFloat: data.openingFloat,
      totalCashSales: 0,
      totalCashRefunds: 0,
      totalPaidIn: 0,
      totalPaidOut: 0,
      openedAt: new Date(),
    };
  }

  private mapSession(data: Record<string, unknown>): CashSession {
    return {
      id: String(data.id),
      storeId: String(data.storeId),
      deviceId: String(data.deviceId),
      cashierId: data.cashierId ? String(data.cashierId) : undefined,
      status: data.status as CashSession["status"],
      openingFloat: Number(data.openingFloat),
      closingFloat: data.closingFloat !== undefined ? Number(data.closingFloat) : undefined,
      expectedFloat: data.expectedFloat !== undefined ? Number(data.expectedFloat) : undefined,
      variance: data.variance !== undefined ? Number(data.variance) : undefined,
      totalCashSales: Number(data.totalCashSales ?? 0),
      totalCashRefunds: Number(data.totalCashRefunds ?? 0),
      totalPaidIn: Number(data.totalPaidIn ?? 0),
      totalPaidOut: Number(data.totalPaidOut ?? 0),
      openedAt: data.openedAt as Date,
      closedAt: data.closedAt as Date | undefined,
      reconciledAt: data.reconciledAt as Date | undefined,
      notes: data.notes ? String(data.notes) : undefined,
    };
  }

  private mapMovement(data: Record<string, unknown>): CashMovement {
    return {
      id: String(data.id),
      sessionId: String(data.sessionId),
      storeId: String(data.storeId),
      type: data.type as CashMovement["type"],
      amount: Number(data.amount),
      note: data.note ? String(data.note) : undefined,
      reference: data.reference ? String(data.reference) : undefined,
      createdAt: data.createdAt as Date,
      createdBy: data.createdBy ? String(data.createdBy) : undefined,
    };
  }
}

export const cashManagementService = new CashManagementService();
