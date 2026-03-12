import { db } from "@/lib/db";
import { Prisma } from "@vayva/db";

// Types for B2B Wholesale models
export interface Quote {
  id: string;
  storeId: string;
  customerId: string;
  quoteNumber: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";
  expiryDate: Date;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  terms?: string;
  notes?: string;
  convertedToOrderId?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: QuoteItem[];
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  quote?: Quote;
}

export interface CreditAccount {
  id: string;
  storeId: string;
  customerId: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  paymentTerms: "net_30" | "net_60" | "net_90" | string;
  interestRate: number;
  isActive: boolean;
  approvedBy: string;
  approvedAt: Date;
  transactions?: CreditTransaction[];
}

export interface CreditTransaction {
  id: string;
  accountId: string;
  type: "charge" | "payment" | "adjustment" | "interest";
  amount: number;
  balanceAfter: number;
  referenceId?: string;
  description: string;
  createdAt: Date;
  createdBy: string;
  account?: CreditAccount;
}

export interface Requisition {
  id: string;
  storeId: string;
  customerId: string;
  requesterName: string;
  requesterEmail: string;
  approverId?: string;
  status: "pending" | "approved" | "rejected" | "ordered";
  urgency: "low" | "normal" | "high" | "urgent";
  neededBy?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: RequisitionItem[];
}

export interface RequisitionItem {
  id: string;
  requisitionId: string;
  productId: string;
  quantity: number;
  maxPrice?: number;
  notes?: string;
  requisition?: Requisition;
}

export interface CustomerHierarchy {
  id: string;
  parentId: string;
  childId: string;
  relationship: "subsidiary" | "franchise" | "branch" | string;
  createdAt: Date;
}

// Input types
export interface CreateQuoteInput {
  customerId: string;
  expiryDate: Date;
  terms?: string;
  notes?: string;
  items: CreateQuoteItemInput[];
}

export interface CreateQuoteItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface UpdateQuoteInput {
  expiryDate?: Date;
  terms?: string;
  notes?: string;
  items?: CreateQuoteItemInput[];
}

export interface CreateCreditAccountInput {
  customerId: string;
  creditLimit: number;
  paymentTerms?: string;
  interestRate?: number;
  approvedBy: string;
}

export interface CreateCreditTransactionInput {
  accountId: string;
  type: CreditTransaction["type"];
  amount: number;
  description: string;
  referenceId?: string;
  createdBy: string;
}

export interface CreateRequisitionInput {
  customerId: string;
  requesterName: string;
  requesterEmail: string;
  urgency?: Requisition["urgency"];
  neededBy?: Date;
  notes?: string;
  items: CreateRequisitionItemInput[];
}

export interface CreateRequisitionItemInput {
  productId: string;
  quantity: number;
  maxPrice?: number;
  notes?: string;
}

export const B2BService = {
  // ============================================================================
  // QUOTES
  // ============================================================================

  async createQuote(storeId: string, data: CreateQuoteInput): Promise<Quote> {
    // Generate quote number
    const quoteNumber = generateQuoteNumber();

    // Calculate totals
    let subtotal = 0;
    let totalDiscount = 0;

    for (const item of data.items) {
      const itemTotal = item.quantity * item.unitPrice;
      const itemDiscount = itemTotal * ((item.discount ?? 0) / 100);
      subtotal += itemTotal - itemDiscount;
      totalDiscount += itemDiscount;
    }

    const tax = 0; // B2B quotes typically don't include tax initially
    const total = subtotal;

    const quote = await db.quote?.create({
      data: {
        storeId,
        customerId: data.customerId,
        quoteNumber,
        status: "draft",
        expiryDate: data.expiryDate,
        terms: data.terms,
        notes: data.notes,
        subtotal: new Prisma.Decimal(subtotal),
        discount: new Prisma.Decimal(totalDiscount),
        tax: new Prisma.Decimal(tax),
        total: new Prisma.Decimal(total),
        items: {
          create: data.items?.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            discount: new Prisma.Decimal(item.discount ?? 0),
            total: new Prisma.Decimal(item.quantity * item.unitPrice * (1 - (item.discount ?? 0) / 100)),
          })),
        },
      },
      include: { items: true },
    });

    return mapQuote(quote);
  },

  async getQuotes(
    storeId: string,
    options?: {
      customerId?: string;
      status?: Quote["status"];
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Quote[]> {
    const quotes = await db.quote?.findMany({
      where: {
        storeId,
        customerId: options?.customerId,
        status: options?.status,
        createdAt: {
          gte: options?.startDate,
          lte: options?.endDate,
        },
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return quotes.map(mapQuote) as any;
  },

  async getQuoteById(quoteId: string): Promise<Quote | null> {
    const quote = await db.quote?.findUnique({
      where: { id: quoteId },
      include: { items: true },
    });

    if (!quote) return null;
    return mapQuote(quote);
  },

  async getQuoteByNumber(quoteNumber: string): Promise<Quote | null> {
    const quote = await db.quote?.findUnique({
      where: { quoteNumber },
      include: { items: true },
    });

    if (!quote) return null;
    return mapQuote(quote);
  },

  async updateQuote(quoteId: string, data: UpdateQuoteInput): Promise<Quote> {
    const updateData: Prisma.QuoteUpdateInput = {};

    if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate;
    if (data.terms !== undefined) updateData.terms = data.terms;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // If items are being updated, recalculate totals
    if (data.items && data.items?.length > 0) {
      let subtotal = 0;
      let totalDiscount = 0;

      for (const item of data.items) {
        const itemTotal = item.quantity * item.unitPrice;
        const itemDiscount = itemTotal * ((item.discount ?? 0) / 100);
        subtotal += itemTotal - itemDiscount;
        totalDiscount += itemDiscount;
      }

      updateData.subtotal = new Prisma.Decimal(subtotal);
      updateData.discount = new Prisma.Decimal(totalDiscount);
      updateData.tax = new Prisma.Decimal(0);
      updateData.total = new Prisma.Decimal(subtotal);

      // Delete old items and create new ones
      await db.quoteItem?.deleteMany({ where: { quoteId } });

      updateData.items = {
        create: data.items?.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: new Prisma.Decimal(item.unitPrice),
          discount: new Prisma.Decimal(item.discount ?? 0),
          total: new Prisma.Decimal(item.quantity * item.unitPrice * (1 - (item.discount ?? 0) / 100)),
        })),
      };
    }

    const quote = await db.quote?.update({
      where: { id: quoteId },
      data: updateData,
      include: { items: true },
    });

    return mapQuote(quote);
  },

  async sendQuote(quoteId: string): Promise<Quote> {
    const quote = await db.quote?.update({
      where: { id: quoteId },
      data: { status: "sent" },
      include: { items: true },
    });

    return mapQuote(quote);
  },

  async acceptQuote(quoteId: string): Promise<Quote> {
    const quote = await db.quote?.update({
      where: { id: quoteId },
      data: { status: "accepted" },
      include: { items: true },
    });

    return mapQuote(quote);
  },

  async rejectQuote(quoteId: string): Promise<Quote> {
    const quote = await db.quote?.update({
      where: { id: quoteId },
      data: { status: "rejected" },
      include: { items: true },
    });

    return mapQuote(quote);
  },

  async convertQuoteToOrder(quoteId: string, orderId: string): Promise<Quote> {
    const quote = await db.quote?.update({
      where: { id: quoteId },
      data: {
        status: "converted",
        convertedToOrderId: orderId,
      },
      include: { items: true },
    });

    return mapQuote(quote);
  },

  async deleteQuote(quoteId: string): Promise<void> {
    await db.quote?.delete({
      where: { id: quoteId },
    });
  },

  async expireOldQuotes(storeId: string): Promise<number> {
    const result = await db.quote?.updateMany({
      where: {
        storeId,
        status: { in: ["draft", "sent"] },
        expiryDate: { lt: new Date() },
      },
      data: { status: "expired" },
    });

    return result.count;
  },

  // ============================================================================
  // CREDIT ACCOUNTS
  // ============================================================================

  async createCreditAccount(storeId: string, data: CreateCreditAccountInput): Promise<CreditAccount> {
    const account = await db.creditAccount?.create({
      data: {
        storeId,
        customerId: data.customerId,
        creditLimit: new Prisma.Decimal(data.creditLimit),
        currentBalance: new Prisma.Decimal(0),
        availableCredit: new Prisma.Decimal(data.creditLimit),
        paymentTerms: data.paymentTerms ?? "net_30",
        interestRate: new Prisma.Decimal(data.interestRate ?? 0),
        isActive: true,
        approvedBy: data.approvedBy,
      },
      include: { transactions: true },
    });

    return mapCreditAccount(account);
  },

  async getCreditAccounts(
    storeId: string,
    options?: {
      customerId?: string;
      isActive?: boolean;
    }
  ): Promise<CreditAccount[]> {
    const accounts = await db.creditAccount?.findMany({
      where: {
        storeId,
        customerId: options?.customerId,
        isActive: options?.isActive,
      },
      include: { transactions: { orderBy: { createdAt: "desc" } } },
      orderBy: { updatedAt: "desc" } as any,
    });

    return accounts.map(mapCreditAccount) as any;
  },

  async getCreditAccountById(accountId: string): Promise<CreditAccount | null> {
    const account = await db.creditAccount?.findUnique({
      where: { id: accountId },
      include: { transactions: { orderBy: { createdAt: "desc" } } },
    });

    if (!account) return null;
    return mapCreditAccount(account);
  },

  async getCreditAccountByCustomer(storeId: string, customerId: string): Promise<CreditAccount | null> {
    const account = await db.creditAccount?.findFirst({
      where: {
        storeId,
        customerId,
      },
      include: { transactions: { orderBy: { createdAt: "desc" } } },
    });

    if (!account) return null;
    return mapCreditAccount(account);
  },

  async updateCreditLimit(accountId: string, newLimit: number, approvedBy: string): Promise<CreditAccount> {
    const account = await db.creditAccount?.findUnique({
      where: { id: accountId },
      include: { transactions: true },
    });

    if (!account) {
      throw new Error("Credit account not found");
    }

    const currentBalance = account.currentBalance?.toNumber();
    const newAvailableCredit = newLimit - currentBalance;

    const updatedAccount = await db.creditAccount?.update({
      where: { id: accountId },
      data: {
        creditLimit: new Prisma.Decimal(newLimit),
        availableCredit: new Prisma.Decimal(newAvailableCredit),
        approvedBy,
      },
      include: { transactions: true },
    });

    return mapCreditAccount(updatedAccount);
  },

  async suspendCreditAccount(accountId: string): Promise<CreditAccount> {
    const account = await db.creditAccount?.update({
      where: { id: accountId },
      data: { isActive: false },
      include: { transactions: true },
    });

    return mapCreditAccount(account);
  },

  async reactivateCreditAccount(accountId: string): Promise<CreditAccount> {
    const account = await db.creditAccount?.update({
      where: { id: accountId },
      data: { isActive: true },
      include: { transactions: true },
    });

    return mapCreditAccount(account);
  },

  // ============================================================================
  // CREDIT TRANSACTIONS
  // ============================================================================

  async addCreditTransaction(data: CreateCreditTransactionInput): Promise<CreditTransaction> {
    // Get current account state
    const account = await db.creditAccount?.findUnique({
      where: { id: data.accountId },
    });

    if (!account) {
      throw new Error("Credit account not found");
    }

    if (!account.isActive) {
      throw new Error("Credit account is suspended");
    }

    const currentBalance = account.currentBalance?.toNumber();
    const currentAvailableCredit = account.availableCredit?.toNumber();

    let newBalance: number;
    let newAvailableCredit: number;

    // Calculate new balance and available credit based on transaction type
    switch (data.type) {
      case "charge":
        newBalance = currentBalance + data.amount;
        newAvailableCredit = currentAvailableCredit - data.amount;
        if (newAvailableCredit < 0) {
          throw new Error("Insufficient credit available");
        }
        break;
      case "payment":
        newBalance = Math.max(0, currentBalance - data.amount);
        newAvailableCredit = Math.min(account.creditLimit?.toNumber(), currentAvailableCredit + data.amount);
        break;
      case "adjustment":
        newBalance = data.amount;
        newAvailableCredit = account.creditLimit?.toNumber() - newBalance;
        break;
      case "interest":
        newBalance = currentBalance + data.amount;
        newAvailableCredit = Math.max(0, currentAvailableCredit - data.amount);
        break;
      default:
        throw new Error("Invalid transaction type");
    }

    // Create transaction
    const transaction = await db.creditTransaction?.create({
      data: {
        accountId: data.accountId,
        type: data.type,
        amount: new Prisma.Decimal(data.amount),
        balanceAfter: new Prisma.Decimal(newBalance),
        referenceId: data.referenceId,
        description: data.description,
        createdBy: data.createdBy,
      },
    });

    // Update account balance
    await db.creditAccount?.update({
      where: { id: data.accountId },
      data: {
        currentBalance: new Prisma.Decimal(newBalance),
        availableCredit: new Prisma.Decimal(newAvailableCredit),
      },
    });

    return mapCreditTransaction(transaction);
  },

  async getCreditTransactions(accountId: string): Promise<CreditTransaction[]> {
    const transactions = await db.creditTransaction?.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
    });

    return transactions.map(mapCreditTransaction) as any;
  },

  async chargeCustomerAccount(customerId: string, amount: number, description: string, orderId: string, createdBy: string): Promise<CreditTransaction> {
    // Find customer's credit account
    const account = await db.creditAccount?.findFirst({
      where: { customerId, isActive: true },
    });

    if (!account) {
      throw new Error("Active credit account not found for customer");
    }

    return this.addCreditTransaction({
      accountId: account.id,
      type: "charge",
      amount,
      description,
      referenceId: orderId,
      createdBy,
    });
  },

  async processPayment(customerId: string, amount: number, description: string, paymentId: string, createdBy: string): Promise<CreditTransaction> {
    const account = await db.creditAccount?.findFirst({
      where: { customerId, isActive: true },
    });

    if (!account) {
      throw new Error("Active credit account not found for customer");
    }

    return this.addCreditTransaction({
      accountId: account.id,
      type: "payment",
      amount,
      description,
      referenceId: paymentId,
      createdBy,
    });
  },

  // ============================================================================
  // REQUISITIONS
  // ============================================================================

  async createRequisition(storeId: string, data: CreateRequisitionInput): Promise<Requisition> {
    const requisition = await db.requisition?.create({
      data: {
        storeId,
        customerId: data.customerId,
        requesterName: data.requesterName,
        requesterEmail: data.requesterEmail,
        status: "pending",
        urgency: data.urgency ?? "normal",
        neededBy: data.neededBy,
        notes: data.notes,
        items: {
          create: data.items?.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            maxPrice: item.maxPrice !== undefined ? new Prisma.Decimal(item.maxPrice) : null,
            notes: item.notes,
          })),
        },
      },
      include: { items: true },
    });

    return mapRequisition(requisition);
  },

  async getRequisitions(
    storeId: string,
    options?: {
      customerId?: string;
      status?: Requisition["status"];
      urgency?: Requisition["urgency"];
    }
  ): Promise<Requisition[]> {
    const requisitions = await db.requisition?.findMany({
      where: {
        storeId,
        customerId: options?.customerId,
        status: options?.status,
        urgency: options?.urgency,
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return requisitions.map(mapRequisition) as any;
  },

  async getRequisitionById(requisitionId: string): Promise<Requisition | null> {
    const requisition = await db.requisition?.findUnique({
      where: { id: requisitionId },
      include: { items: true },
    });

    if (!requisition) return null;
    return mapRequisition(requisition);
  },

  async approveRequisition(requisitionId: string, approverId: string): Promise<Requisition> {
    const requisition = await db.requisition?.update({
      where: { id: requisitionId },
      data: {
        status: "approved",
        approverId,
      },
      include: { items: true },
    });

    return mapRequisition(requisition);
  },

  async rejectRequisition(requisitionId: string, approverId: string, notes?: string): Promise<Requisition> {
    const existing = await db.requisition?.findUnique({ where: { id: requisitionId } });
    const requisition = await db.requisition?.update({
      where: { id: requisitionId },
      data: {
        status: "rejected",
        approverId,
        notes: notes ? `${existing?.notes ?? ""}\n\nRejection reason: ${notes}` : undefined,
      },
      include: { items: true },
    });

    return mapRequisition(requisition);
  },

  async markRequisitionOrdered(requisitionId: string): Promise<Requisition> {
    const requisition = await db.requisition?.update({
      where: { id: requisitionId },
      data: { status: "ordered" },
      include: { items: true },
    });

    return mapRequisition(requisition);
  },

  async deleteRequisition(requisitionId: string): Promise<void> {
    await db.requisition?.delete({
      where: { id: requisitionId },
    });
  },

  // ============================================================================
  // CUSTOMER HIERARCHY
  // ============================================================================

  async addCustomerToHierarchy(parentId: string, childId: string, relationship: string): Promise<CustomerHierarchy> {
    const hierarchy = await db.customerHierarchy?.create({
      data: {
        parentId,
        childId,
        relationship,
      },
    });

    return mapHierarchy(hierarchy);
  },

  async getCustomerChildren(parentId: string): Promise<CustomerHierarchy[]> {
    const hierarchies = await db.customerHierarchy?.findMany({
      where: { parentId },
    });

    return hierarchies.map(mapHierarchy) as any;
  },

  async getCustomerParents(childId: string): Promise<CustomerHierarchy[]> {
    const hierarchies = await db.customerHierarchy?.findMany({
      where: { childId },
    });

    return hierarchies.map(mapHierarchy) as any;
  },

  async removeFromHierarchy(parentId: string, childId: string): Promise<void> {
    await db.customerHierarchy?.deleteMany({
      where: {
        parentId,
        childId,
      },
    });
  },

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  async getB2BAnalytics(storeId: string): Promise<{
    totalQuotes: number;
    pendingQuotes: number;
    convertedQuotes: number;
    conversionRate: number;
    totalQuoteValue: number;
    activeCreditAccounts: number;
    totalCreditExtended: number;
    totalCreditUsed: number;
    averageCreditUtilization: number;
    pendingRequisitions: number;
    urgentRequisitions: number;
  }> {
    const [
      totalQuotes,
      pendingQuotes,
      convertedQuotes,
      totalQuoteValue,
      activeCreditAccounts,
      totalCreditExtended,
      totalCreditUsed,
      pendingRequisitions,
      urgentRequisitions,
    ] = await Promise.all([
      db.quote?.count({ where: { storeId } }),
      db.quote?.count({ where: { storeId, status: { in: ["draft", "sent", "accepted"] } } }),
      db.quote?.count({ where: { storeId, status: "converted" } }),
      db.quote?.aggregate({
        where: { storeId, status: "converted" },
        _sum: { total: true },
      }),
      db.creditAccount?.count({ where: { storeId, isActive: true } }),
      db.creditAccount?.aggregate({
        where: { storeId },
        _sum: { creditLimit: true },
      }),
      db.creditAccount?.aggregate({
        where: { storeId },
        _sum: { currentBalance: true },
      }),
      db.requisition?.count({ where: { storeId, status: "pending" } }),
      db.requisition?.count({ where: { storeId, status: "pending", urgency: "urgent" } }),
    ]);

    const conversionRate = totalQuotes > 0 ? convertedQuotes / totalQuotes : 0;

    const creditExtended = totalCreditExtended._sum?.creditLimit?.toNumber() ?? 0;
    const creditUsed = totalCreditUsed._sum?.currentBalance?.toNumber() ?? 0;
    const avgUtilization = creditExtended > 0 ? creditUsed / creditExtended : 0;

    return {
      totalQuotes,
      pendingQuotes,
      convertedQuotes,
      conversionRate,
      totalQuoteValue: totalQuoteValue._sum?.total?.toNumber() ?? 0,
      activeCreditAccounts,
      totalCreditExtended: creditExtended,
      totalCreditUsed: creditUsed,
      averageCreditUtilization: avgUtilization,
      pendingRequisitions,
      urgentRequisitions,
    };
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateQuoteNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `QT-${timestamp}-${random}`;
}

function mapQuote(quote: any): Quote {
  return {
    id: quote.id,
    storeId: quote.storeId,
    customerId: quote.customerId,
    quoteNumber: quote.quoteNumber,
    status: (quote as any).status,
    expiryDate: quote.expiryDate,
    subtotal: quote.subtotal?.toNumber(),
    discount: quote.discount?.toNumber(),
    tax: quote.tax?.toNumber(),
    total: quote.total?.toNumber(),
    terms: quote.terms ?? undefined,
    notes: quote.notes ?? undefined,
    convertedToOrderId: quote.convertedToOrderId ?? undefined,
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
    items: quote.items?.map(mapQuoteItem),
  };
}

function mapQuoteItem(item: any): QuoteItem {
  return {
    id: item.id,
    quoteId: item.quoteId,
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice?.toNumber(),
    discount: item.discount?.toNumber(),
    total: item.total?.toNumber(),
  };
}

function mapCreditAccount(account: any): CreditAccount {
  return {
    id: account.id,
    storeId: account.storeId,
    customerId: account.customerId,
    creditLimit: account.creditLimit?.toNumber(),
    currentBalance: account.currentBalance?.toNumber(),
    availableCredit: account.availableCredit?.toNumber(),
    paymentTerms: account.paymentTerms,
    interestRate: account.interestRate?.toNumber(),
    isActive: account.isActive,
    approvedBy: account.approvedBy,
    approvedAt: account.approvedAt,
    transactions: account.transactions?.map(mapCreditTransaction),
  };
}

function mapCreditTransaction(transaction: any): CreditTransaction {
  return {
    id: transaction.id,
    accountId: transaction.accountId,
    type: transaction.type,
    amount: transaction.amount?.toNumber(),
    balanceAfter: transaction.balanceAfter?.toNumber(),
    referenceId: transaction.referenceId ?? undefined,
    description: transaction.description,
    createdAt: transaction.createdAt,
    createdBy: transaction.createdBy,
    account: transaction.account ? mapCreditAccount(transaction.account) : undefined,
  };
}

function mapRequisition(requisition: any): Requisition {
  return {
    id: requisition.id,
    storeId: requisition.storeId,
    customerId: requisition.customerId,
    requesterName: requisition.requesterName,
    requesterEmail: requisition.requesterEmail,
    approverId: requisition.approverId ?? undefined,
    status: (requisition as any).status,
    urgency: requisition.urgency,
    neededBy: requisition.neededBy ?? undefined,
    notes: requisition.notes ?? undefined,
    createdAt: requisition.createdAt,
    updatedAt: requisition.updatedAt,
    items: requisition.items?.map(mapRequisitionItem),
  };
}

function mapRequisitionItem(item: any): RequisitionItem {
  return {
    id: item.id,
    requisitionId: item.requisitionId,
    productId: item.productId,
    quantity: item.quantity,
    maxPrice: item.maxPrice?.toNumber() ?? undefined,
    notes: item.notes ?? undefined,
  };
}

function mapHierarchy(hierarchy: any): CustomerHierarchy {
  return {
    id: hierarchy.id,
    parentId: hierarchy.parentId,
    childId: hierarchy.childId,
    relationship: hierarchy.relationship,
    createdAt: hierarchy.createdAt,
  };
}
