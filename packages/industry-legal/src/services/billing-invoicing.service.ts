/**
 * Billing & Invoicing Service (in-process stub until legal billing models exist in Prisma)
 */

export interface TimeEntryData {
  caseId: string;
  attorneyId: string;
  duration: number;
  description: string;
  category: 'billable' | 'non_billable' | 'contingent';
  rate?: number;
}

export interface InvoiceData {
  caseId: string;
  clientId: string;
  amount: number;
  dueDate: Date;
  lineItems: unknown[];
}

export class BillingInvoicingService {
  async createTimeEntry(data: TimeEntryData): Promise<TimeEntryData & { id: string; date: Date; status: string; amount: number }> {
    return {
      ...data,
      id: `te_${Date.now()}`,
      date: new Date(),
      status: 'draft',
      amount: data.rate ? data.duration * data.rate : 0,
    };
  }

  async getMonthlyBillingSummary(
    _storeId: string,
    _year: number,
    _month: number,
  ): Promise<{
    billed: number;
    wip: number;
    writeOffs: number;
    totalHours: number;
    entryCount: number;
  }> {
    return { billed: 0, wip: 0, writeOffs: 0, totalHours: 0, entryCount: 0 };
  }

  async getWIP(_storeId: string): Promise<{ total: number; hours: number; entries: unknown[] }> {
    return { total: 0, hours: 0, entries: [] };
  }

  async approveWriteOff(_id: string, _approvedBy: string): Promise<void> {}

  async rejectWriteOff(_id: string, _reason: string): Promise<void> {}

  async calculateRealizationRate(
    _storeId: string,
    _periodMonths: number = 12,
  ): Promise<{ realizationRate: number; totalWorked: number; totalBilled: number }> {
    return { realizationRate: 0, totalWorked: 0, totalBilled: 0 };
  }

  async calculateCollectionRate(
    _storeId: string,
    _periodMonths: number = 12,
  ): Promise<{ collectionRate: number; totalBilled: number; totalCollected: number }> {
    return { collectionRate: 0, totalBilled: 0, totalCollected: 0 };
  }

  async generateInvoice(data: InvoiceData): Promise<InvoiceData & { id: string }> {
    return { ...data, id: `inv_${Date.now()}` };
  }

  async sendInvoice(_invoiceId: string): Promise<void> {}

  async recordPayment(
    _invoiceId: string,
    _amount: number,
    _method: string,
  ): Promise<void> {}

  async getAccountsReceivableAging(_storeId: string): Promise<{
    current: number;
    days30: number;
    days60: number;
    days90: number;
    over90: number;
  }> {
    return { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 };
  }

  async initialize(): Promise<void> {
    console.log('[BillingInvoicingService] Initialized');
  }

  async dispose(): Promise<void> {}
}
