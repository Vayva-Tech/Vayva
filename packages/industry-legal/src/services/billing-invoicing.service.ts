// @ts-nocheck
/**
 * Billing & Invoicing Service
 * 
 * Manages time tracking, billing, and invoice generation
 * for legal practices.
 */

import { PrismaClient } from '@vayva/prisma';

const prisma = new PrismaClient();

export interface TimeEntryData {
  caseId: string;
  attorneyId: string;
  duration: number; // in hours
  description: string;
  category: 'billable' | 'non_billable' | 'contingent';
  rate?: number;
}

export interface InvoiceData {
  caseId: string;
  clientId: string;
  amount: number;
  dueDate: Date;
  lineItems: any[];
}

export class BillingInvoicingService {
  /**
   * Create time entry
   */
  async createTimeEntry(data: TimeEntryData): Promise<any> {
    return prisma.timeEntry.create({
      data: {
        ...data,
        date: new Date(),
        status: 'draft',
        amount: data.rate ? data.duration * data.rate : 0,
      },
    });
  }

  /**
   * Get monthly billing summary
   */
  async getMonthlyBillingSummary(
    storeId: string,
    year: number,
    month: number
  ): Promise<{
    billed: number;
    wip: number;
    writeOffs: number;
    totalHours: number;
    entryCount: number;
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        case: { storeId },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        case: true,
      },
    });

    const billed = timeEntries
      .filter((t) => t.status === 'invoiced')
      .reduce((sum, t) => sum + t.amount, 0);

    const wip = timeEntries
      .filter((t) => t.status === 'approved' || t.status === 'submitted')
      .reduce((sum, t) => sum + t.amount, 0);

    const writeOffs = await prisma.writeOff.aggregate({
      where: {
        case: { storeId },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { amount: true },
    });

    return {
      billed,
      wip,
      writeOffs: writeOffs._sum.amount || 0,
      totalHours: timeEntries.reduce((sum, t) => sum + t.duration, 0),
      entryCount: timeEntries.length,
    };
  }

  /**
   * Get Work In Progress (WIP)
   */
  async getWIP(storeId: string): Promise<{
    total: number;
    hours: number;
    entries: any[];
  }> {
    const entries = await prisma.timeEntry.findMany({
      where: {
        case: { storeId },
        status: { in: ['submitted', 'approved'] },
      },
      include: {
        case: {
          select: {
            caseNumber: true,
            clientNames: true,
          },
        },
      },
    });

    return {
      total: entries.reduce((sum, t) => sum + t.amount, 0),
      hours: entries.reduce((sum, t) => sum + t.duration, 0),
      entries,
    };
  }

  /**
   * Approve write-off
   */
  async approveWriteOff(id: string, approvedBy: string): Promise<void> {
    const writeOff = await prisma.writeOff.update({
      where: { id },
      data: {
        status: 'approved',
        approvedBy,
        approvedDate: new Date(),
      },
    });

    // Update time entry status
    if (writeOff.timeEntryId) {
      await prisma.timeEntry.update({
        where: { id: writeOff.timeEntryId },
        data: { status: 'written_off' },
      });
    }
  }

  /**
   * Reject write-off
   */
  async rejectWriteOff(id: string, reason: string): Promise<void> {
    await prisma.writeOff.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: reason,
      },
    });
  }

  /**
   * Calculate realization rate
   */
  async calculateRealizationRate(
    storeId: string,
    periodMonths: number = 12
  ): Promise<{
    realizationRate: number;
    totalWorked: number;
    totalBilled: number;
  }> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - periodMonths);

    const entries = await prisma.timeEntry.findMany({
      where: {
        case: { storeId },
        date: { gte: startDate },
        category: 'billable',
      },
    });

    const totalWorked = entries.reduce((sum, t) => sum + t.amount, 0);
    const totalBilled = entries
      .filter((t) => t.status === 'invoiced')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      realizationRate: totalWorked > 0 ? (totalBilled / totalWorked) * 100 : 0,
      totalWorked,
      totalBilled,
    };
  }

  /**
   * Calculate collection rate
   */
  async calculateCollectionRate(
    storeId: string,
    periodMonths: number = 12
  ): Promise<{
    collectionRate: number;
    totalBilled: number;
    totalCollected: number;
  }> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - periodMonths);

    const cases = await prisma.case.findMany({
      where: { storeId },
      select: { amountBilled: true, amountCollected: true },
    });

    const totalBilled = cases.reduce((sum, c) => sum + c.amountBilled, 0);
    const totalCollected = cases.reduce((sum, c) => sum + c.amountCollected, 0);

    return {
      collectionRate: totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0,
      totalBilled,
      totalCollected,
    };
  }

  /**
   * Generate invoice
   */
  async generateInvoice(data: InvoiceData): Promise<any> {
    return prisma.invoice.create({
      data: {
        ...data,
        caseId: data.caseId,
        status: 'draft',
        issuedDate: new Date(),
      },
    });
  }

  /**
   * Send invoice
   */
  async sendInvoice(invoiceId: string): Promise<void> {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'sent',
        sentDate: new Date(),
      },
    });
  }

  /**
   * Record payment
   */
  async recordPayment(
    invoiceId: string,
    amount: number,
    paymentMethod: string
  ): Promise<void> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        paymentMethod,
        paymentDate: new Date(),
        status: 'completed',
      },
    });

    // Update invoice
    const newBalance = invoice.amountDue - amount;
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: { increment: amount },
        amountDue: newBalance,
        status: newBalance <= 0 ? 'paid' : 'partial',
      },
    });

    // Update case collections
    await prisma.case.update({
      where: { id: invoice.caseId },
      data: {
        amountCollected: { increment: amount },
      },
    });
  }

  /**
   * Get accounts receivable aging
   */
  async getAccountsReceivableAging(storeId: string): Promise<{
    current: number;
    days30_60: number;
    days60_90: number;
    over90: number;
    total: number;
  }> {
    const invoices = await prisma.invoice.findMany({
      where: {
        case: { storeId },
        status: { in: ['sent', 'partial'] },
      },
    });

    const today = new Date();
    const aging = {
      current: 0,
      days30_60: 0,
      days60_90: 0,
      over90: 0,
      total: 0,
    };

    invoices.forEach((invoice) => {
      const daysOverdue = Math.floor(
        (today.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const amount = invoice.amountDue;

      aging.total += amount;

      if (daysOverdue < 0) {
        aging.current += amount;
      } else if (daysOverdue <= 30) {
        aging.days30_60 += amount;
      } else if (daysOverdue <= 60) {
        aging.days60_90 += amount;
      } else {
        aging.over90 += amount;
      }
    });

    return aging;
  }

  async initialize(): Promise<void> {
    console.log('[BillingInvoicingService] Initialized');
  }

  async dispose(): Promise<void> {
    // Cleanup if needed
  }
}
