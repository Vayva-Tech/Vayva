import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { Quote, QuoteStatus, QuoteItem, CreateQuoteInput, UpdateQuoteInput, CreditAccount, CreateCreditAccountInput, Requisition, RequisitionStatus, RequisitionUrgency, CreateRequisitionInput, RequisitionItem } from '@/types/phase4-industry';
import type { Quote as PrismaQuote, QuoteItem as PrismaQuoteItem, CreditAccount as PrismaCreditAccount, Requisition as PrismaRequisition, RequisitionItem as PrismaRequisitionItem } from '@vayva/db';

export class B2BService {
  // ===== QUOTES =====

  private generateQuoteNumber(): string {
    return `QT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }

  async getQuotes(
    storeId: string,
    filters?: { customerId?: string; status?: QuoteStatus }
  ): Promise<Quote[]> {
    const quotes = await prisma.quote?.findMany({
      where: {
        storeId,
        ...(filters?.customerId && { customerId: filters.customerId }),
        ...(filters?.status && { status: filters.status }),
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return quotes.map((q: PrismaQuote & { items: PrismaQuoteItem[] }) => ({
      id: q.id,
      storeId: q.storeId,
      customerId: q.customerId,
      quoteNumber: q.quoteNumber,
      items: q.items.map((i: PrismaQuoteItem) => ({
        id: i.id,
        quoteId: i.quoteId,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        discount: Number(i.discount),
        total: Number(i.total),
      })),
      subtotal: Number(q.subtotal),
      discount: Number(q.discount),
      tax: Number(q.tax),
      total: Number(q.total),
      status: q.status as QuoteStatus,
      expiryDate: q.expiryDate,
      notes: q.notes ?? undefined,
      terms: q.terms ?? undefined,
      convertedToOrderId: q.convertedToOrderId ?? undefined,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    }));
  }

  async getQuoteById(id: string): Promise<Quote | null> {
    const q = await prisma.quote?.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!q) return null;

    return {
      id: q.id,
      storeId: q.storeId,
      customerId: q.customerId,
      quoteNumber: q.quoteNumber,
      items: q.items.map((i: PrismaQuoteItem) => ({
        id: i.id,
        quoteId: i.quoteId,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        discount: Number(i.discount),
        total: Number(i.total),
      })),
      subtotal: Number(q.subtotal),
      discount: Number(q.discount),
      tax: Number(q.tax),
      total: Number(q.total),
      status: q.status as QuoteStatus,
      expiryDate: q.expiryDate,
      notes: q.notes ?? undefined,
      terms: q.terms ?? undefined,
      convertedToOrderId: q.convertedToOrderId ?? undefined,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    };
  }

  async createQuote(data: CreateQuoteInput): Promise<Quote> {
    const quoteNumber = this.generateQuoteNumber();

    const items = data.items?.map((item: { productId: string; quantity: number; unitPrice: number; discount?: number }) => ({
      ...item,
      total: item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100),
    })) || [];

    const subtotal = items.reduce((sum: number, i: { productId: string; quantity: number; unitPrice: number; discount?: number; total?: number }) => sum + i.quantity * i.unitPrice, 0);
    const discount = items.reduce((sum: number, i: { productId: string; quantity: number; unitPrice: number; discount?: number; total?: number }) => sum + (i.quantity * i.unitPrice * (i.discount || 0) / 100), 0);
    const total = subtotal - discount + (data.tax || 0);

    const q = await prisma.quote.create({
      data: {
        storeId: data.storeId,
        customerId: data.customerId,
        quoteNumber,
        subtotal,
        discount,
        tax: data.tax || 0,
        total,
        status: 'draft',
        expiryDate: data.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: data.notes,
        terms: data.terms,
        items: {
          create: items.map((item: { productId: string; quantity: number; unitPrice: number; discount?: number; total?: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });

    return {
      id: q.id,
      storeId: q.storeId,
      customerId: q.customerId,
      quoteNumber: q.quoteNumber,
      items: q.items.map((i: PrismaQuoteItem) => ({
        id: i.id,
        quoteId: i.quoteId,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        discount: Number(i.discount),
        total: Number(i.total),
      })),
      subtotal: Number(q.subtotal),
      discount: Number(q.discount),
      tax: Number(q.tax),
      total: Number(q.total),
      status: q.status as QuoteStatus,
      expiryDate: q.expiryDate,
      notes: q.notes ?? undefined,
      terms: q.terms ?? undefined,
      convertedToOrderId: q.convertedToOrderId ?? undefined,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    };
  }

  async updateQuote(id: string, data: UpdateQuoteInput): Promise<Quote> {
    const q = await prisma.quote.update({
      where: { id },
      data: {
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.terms !== undefined && { terms: data.terms }),
        ...(data.expiryDate && { expiryDate: data.expiryDate }),
        ...(data.status && { status: data.status }),
      },
      include: { items: true },
    });

    return {
      id: q.id,
      storeId: q.storeId,
      customerId: q.customerId,
      quoteNumber: q.quoteNumber,
      items: q.items.map((i: PrismaQuoteItem) => ({
        id: i.id,
        quoteId: i.quoteId,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        discount: Number(i.discount),
        total: Number(i.total),
      })),
      subtotal: Number(q.subtotal),
      discount: Number(q.discount),
      tax: Number(q.tax),
      total: Number(q.total),
      status: q.status as QuoteStatus,
      expiryDate: q.expiryDate,
      notes: q.notes ?? undefined,
      terms: q.terms ?? undefined,
      convertedToOrderId: q.convertedToOrderId ?? undefined,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    };
  }

  async sendQuote(id: string): Promise<Quote> {
    return this.updateQuote(id, { status: 'sent' });
  }

  async acceptQuote(id: string, orderId: string): Promise<Quote> {
    const q = await prisma.quote.update({
      where: { id },
      data: {
        status: 'accepted',
        convertedToOrderId: orderId,
      },
      include: { items: true },
    });

    return {
      id: q.id,
      storeId: q.storeId,
      customerId: q.customerId,
      quoteNumber: q.quoteNumber,
      items: q.items.map((i: PrismaQuoteItem) => ({
        id: i.id,
        quoteId: i.quoteId,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        discount: Number(i.discount),
        total: Number(i.total),
      })),
      subtotal: Number(q.subtotal),
      discount: Number(q.discount),
      tax: Number(q.tax),
      total: Number(q.total),
      status: q.status as QuoteStatus,
      expiryDate: q.expiryDate,
      notes: q.notes ?? undefined,
      terms: q.terms ?? undefined,
      convertedToOrderId: q.convertedToOrderId ?? undefined,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    };
  }

  // ===== CREDIT ACCOUNTS =====

  async getCreditAccounts(
    storeId: string,
    isActive?: boolean
  ): Promise<CreditAccount[]> {
    const accounts = await prisma.creditAccount.findMany({
      where: {
        storeId,
        ...(isActive !== undefined && { isActive }),
      },
      orderBy: { approvedAt: 'desc' },
    });

    return accounts.map((a: PrismaCreditAccount) => ({
      id: a.id,
      storeId: a.storeId,
      customerId: a.customerId,
      creditLimit: Number(a.creditLimit),
      currentBalance: Number(a.currentBalance),
      availableCredit: Number(a.availableCredit),
      paymentTerms: a.paymentTerms,
      interestRate: Number(a.interestRate),
      isActive: a.isActive,
      approvedBy: a.approvedBy,
      approvedAt: a.approvedAt,
    }));
  }

  async getCreditAccountByCustomer(customerId: string): Promise<CreditAccount | null> {
    const a = await prisma.creditAccount?.findFirst({
      where: { customerId },
    });
    if (!a) return null;

    return {
      id: a.id,
      storeId: a.storeId,
      customerId: a.customerId,
      creditLimit: Number(a.creditLimit),
      currentBalance: Number(a.currentBalance),
      availableCredit: Number(a.availableCredit),
      paymentTerms: a.paymentTerms,
      interestRate: Number(a.interestRate),
      isActive: a.isActive,
      approvedBy: a.approvedBy,
      approvedAt: a.approvedAt,
    };
  }

  async createCreditAccount(data: CreateCreditAccountInput): Promise<CreditAccount> {
    const a = await prisma.creditAccount?.create({
      data: {
        storeId: data.storeId,
        customerId: data.customerId,
        creditLimit: data.creditLimit,
        currentBalance: 0,
        availableCredit: data.creditLimit,
        paymentTerms: data.paymentTerms ?? 'net_30',
        interestRate: data.interestRate ?? 0,
        isActive: true,
        approvedBy: data.approvedBy,
      },
    });

    return {
      id: a.id,
      storeId: a.storeId,
      customerId: a.customerId,
      creditLimit: Number(a.creditLimit),
      currentBalance: Number(a.currentBalance),
      availableCredit: Number(a.availableCredit),
      paymentTerms: a.paymentTerms,
      interestRate: Number(a.interestRate),
      isActive: a.isActive,
      approvedBy: a.approvedBy,
      approvedAt: a.approvedAt,
    };
  }

  async approveCreditAccount(id: string, approverId: string): Promise<CreditAccount> {
    const a = await prisma.creditAccount?.update({
      where: { id },
      data: {
        isActive: true,
        approvedBy: approverId,
      },
    });

    return {
      id: a.id,
      storeId: a.storeId,
      customerId: a.customerId,
      creditLimit: Number(a.creditLimit),
      currentBalance: Number(a.currentBalance),
      availableCredit: Number(a.availableCredit),
      paymentTerms: a.paymentTerms,
      interestRate: Number(a.interestRate),
      isActive: a.isActive,
      approvedBy: a.approvedBy,
      approvedAt: a.approvedAt,
    };
  }

  async updateCreditBalance(id: string, chargeAmount: number): Promise<CreditAccount> {
    const account = await prisma.creditAccount?.findUnique({ where: { id } });
    if (!account) throw new Error('Credit account not found');

    const newBalance = Number(account.currentBalance) + chargeAmount;
    const newAvailable = Number(account.creditLimit) - newBalance;

    const a = await prisma.creditAccount?.update({
      where: { id },
      data: {
        currentBalance: newBalance,
        availableCredit: newAvailable,
      },
    });

    return {
      id: a.id,
      storeId: a.storeId,
      customerId: a.customerId,
      creditLimit: Number(a.creditLimit),
      currentBalance: Number(a.currentBalance),
      availableCredit: Number(a.availableCredit),
      paymentTerms: a.paymentTerms,
      interestRate: Number(a.interestRate),
      isActive: a.isActive,
      approvedBy: a.approvedBy,
      approvedAt: a.approvedAt,
    };
  }

  // ===== REQUISITIONS =====

  private generateReqNumber(): string {
    return `REQ-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }

  async getRequisitions(
    storeId: string,
    filters?: { customerId?: string; status?: RequisitionStatus; urgency?: RequisitionUrgency }
  ): Promise<Requisition[]> {
    const reqs = await prisma.requisition?.findMany({
      where: {
        storeId,
        ...(filters?.customerId && { customerId: filters.customerId }),
        ...(filters?.status && { status: filters.status as unknown as import("@vayva/db").RequisitionStatus }),
        ...(filters?.urgency && { urgency: filters.urgency }),
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    }) as unknown as Array<PrismaRequisition & { items: PrismaRequisitionItem[] }>;

    return reqs.map((r: PrismaRequisition & { items: PrismaRequisitionItem[] }) => ({
      id: r.id,
      storeId: r.storeId,
      customerId: r.customerId,
      requesterName: r.requesterName,
      requesterEmail: r.requesterEmail,
      approverId: r.approverId ?? undefined,
      status: r.status as RequisitionStatus,
      urgency: r.urgency as RequisitionUrgency,
      neededBy: r.neededBy ?? undefined,
      notes: r.notes ?? undefined,
      items: r.items.map((i: PrismaRequisitionItem) => ({
        id: i.id,
        requisitionId: i.requisitionId,
        productId: i.productId,
        quantity: i.quantity,
        maxPrice: i.maxPrice ? Number(i.maxPrice) : undefined,
        notes: i.notes ?? undefined,
      })),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async createRequisition(data: CreateRequisitionInput): Promise<Requisition> {
    const r = await prisma.requisition?.create({
      data: {
        storeId: data.storeId,
        customerId: data.customerId,
        requesterName: data.requesterName,
        requesterEmail: data.requesterEmail || "",
        status: 'pending',
        urgency: data.urgency ?? 'normal',
        neededBy: data.neededBy,
        notes: data.notes,
        items: {
          create: data.items.map((item: { productId: string; quantity: number; maxPrice?: number; notes?: string }) => ({
            productId: item.productId,
            quantity: item.quantity,
            maxPrice: item.maxPrice,
            notes: item.notes,
          })),
        },
      },
      include: { items: true },
    });

    return {
      id: r.id,
      storeId: r.storeId,
      customerId: r.customerId,
      requesterName: r.requesterName,
      requesterEmail: r.requesterEmail,
      approverId: r.approverId ?? undefined,
      status: r.status as RequisitionStatus,
      urgency: r.urgency as RequisitionUrgency,
      neededBy: r.neededBy ?? undefined,
      notes: r.notes ?? undefined,
      items: (r as unknown as { items: PrismaRequisitionItem[] }).items?.map((i: PrismaRequisitionItem) => ({
        id: i.id,
        requisitionId: i.requisitionId,
        productId: i.productId,
        quantity: i.quantity,
        maxPrice: i.maxPrice ? Number(i.maxPrice) : undefined,
        notes: i.notes ?? undefined,
      })) ?? [],
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async approveRequisition(id: string, approverId: string): Promise<Requisition> {
    const r = await prisma.requisition?.update({
      where: { id },
      data: {
        status: 'approved',
        approverId,
      },
      include: { items: true },
    });

    return {
      id: r.id,
      storeId: r.storeId,
      customerId: r.customerId,
      requesterName: r.requesterName,
      requesterEmail: r.requesterEmail,
      approverId: r.approverId ?? undefined,
      status: r.status as RequisitionStatus,
      urgency: r.urgency as RequisitionUrgency,
      neededBy: r.neededBy ?? undefined,
      notes: r.notes ?? undefined,
      items: r.items.map((i: PrismaRequisitionItem) => ({
        id: i.id,
        requisitionId: i.requisitionId,
        productId: i.productId,
        quantity: i.quantity,
        maxPrice: i.maxPrice ? Number(i.maxPrice) : undefined,
        notes: i.notes ?? undefined,
      })),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async rejectRequisition(id: string, _reason: string, approverId: string): Promise<Requisition> {
    const r = await prisma.requisition?.update({
      where: { id },
      data: {
        status: 'rejected',
        approverId,
      },
      include: { items: true },
    });

    return {
      id: r.id,
      storeId: r.storeId,
      customerId: r.customerId,
      requesterName: r.requesterName,
      requesterEmail: r.requesterEmail,
      approverId: r.approverId ?? undefined,
      status: r.status as RequisitionStatus,
      urgency: r.urgency as RequisitionUrgency,
      neededBy: r.neededBy ?? undefined,
      notes: r.notes ?? undefined,
      items: r.items.map((i: PrismaRequisitionItem) => ({
        id: i.id,
        requisitionId: i.requisitionId,
        productId: i.productId,
        quantity: i.quantity,
        maxPrice: i.maxPrice ? Number(i.maxPrice) : undefined,
        notes: i.notes ?? undefined,
      })),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async markRequisitionOrdered(id: string): Promise<Requisition> {
    const r = await prisma.requisition?.update({
      where: { id },
      data: { status: 'ordered' },
      include: { items: true },
    });

    return {
      id: r.id,
      storeId: r.storeId,
      customerId: r.customerId,
      requesterName: r.requesterName,
      requesterEmail: r.requesterEmail,
      approverId: r.approverId ?? undefined,
      status: r.status as RequisitionStatus,
      urgency: r.urgency as RequisitionUrgency,
      neededBy: r.neededBy ?? undefined,
      notes: r.notes ?? undefined,
      items: r.items.map((i: PrismaRequisitionItem) => ({
        id: i.id,
        requisitionId: i.requisitionId,
        productId: i.productId,
        quantity: i.quantity,
        maxPrice: i.maxPrice ? Number(i.maxPrice) : undefined,
        notes: i.notes ?? undefined,
      })),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}

export const b2bService = new B2BService();
