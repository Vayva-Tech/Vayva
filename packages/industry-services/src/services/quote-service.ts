// @ts-nocheck
/**
 * Quote Service
 * Specialized service for quote management
 */

import { prisma } from '@vayva/db';
import { Quote, QuoteStatus } from '../types';

export class QuoteService {
  private storeId: string;

  constructor(storeId: string) {
    this.storeId = storeId;
  }

  async createQuote(data: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'subtotal' | 'taxAmount' | 'total'>) {
    // Calculate financials
    const subtotal = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * 0.075; // 7.5% tax rate
    const total = subtotal + taxAmount;

    const quote = await prisma.serviceQuote.create({
      data: {
        ...data,
        storeId: this.storeId,
        status: 'draft',
        subtotal,
        taxAmount,
        total,
      },
      include: {
        serviceProvider: true,
        customer: true,
        items: true,
      },
    });

    return quote;
  }

  async sendQuote(quoteId: string) {
    const quote = await prisma.serviceQuote.update({
      where: { id: quoteId },
      data: {
        status: 'sent',
        sentAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      include: {
        serviceProvider: true,
        customer: true,
        items: true,
      },
    });

    // Send email notification
    // await this.sendQuoteEmail(quote);

    return quote;
  }

  async acceptQuote(quoteId: string) {
    const quote = await prisma.serviceQuote.update({
      where: { id: quoteId },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
      },
      include: {
        serviceProvider: true,
        customer: true,
        items: true,
      },
    });

    // Convert quote to booking or order
    // await this.convertToBooking(quote);

    return quote;
  }

  async rejectQuote(quoteId: string, reason?: string) {
    return await prisma.serviceQuote.update({
      where: { id: quoteId },
      data: {
        status: 'rejected',
        rejectedAt: new Date(),
        notes: reason || undefined,
      },
    });
  }

  async getQuotes(filters?: { 
    status?: QuoteStatus; 
    customerId?: string; 
    serviceProviderId?: string 
  }) {
    const where: any = { storeId: this.storeId };

    if (filters?.status) where.status = filters.status;
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.serviceProviderId) where.serviceProviderId = filters.serviceProviderId;

    return await prisma.serviceQuote.findMany({
      where,
      include: {
        serviceProvider: true,
        customer: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQuoteById(quoteId: string) {
    return await prisma.serviceQuote.findUnique({
      where: { id: quoteId },
      include: {
        serviceProvider: true,
        customer: true,
        items: true,
      },
    });
  }

  async updateQuote(quoteId: string, data: Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>>) {
    // Recalculate totals if items changed
    const updateData: any = { ...data };

    if (data.items) {
      const subtotal = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxAmount = subtotal * 0.075;
      const total = subtotal + taxAmount;
      
      updateData.subtotal = subtotal;
      updateData.taxAmount = taxAmount;
      updateData.total = total;
    }

    return await prisma.serviceQuote.update({
      where: { id: quoteId },
      data: updateData,
      include: {
        serviceProvider: true,
        customer: true,
        items: true,
      },
    });
  }

  async expireQuotes() {
    const expiredQuotes = await prisma.serviceQuote.findMany({
      where: {
        storeId: this.storeId,
        status: 'sent',
        expiresAt: { lte: new Date() },
      },
    });

    if (expiredQuotes.length > 0) {
      await prisma.serviceQuote.updateMany({
        where: {
          id: { in: expiredQuotes.map((q: any) => q.id) },
        },
        data: {
          status: 'expired',
        },
      });
    }

    return expiredQuotes;
  }

  async getQuoteStats() {
    const stats = await prisma.serviceQuote.groupBy({
      by: ['status'],
      where: { storeId: this.storeId },
      _count: true,
    });

    const totalValue = await prisma.serviceQuote.aggregate({
      where: { storeId: this.storeId },
      _sum: { total: true },
    });

    return {
      byStatus: stats.reduce((acc: Record<string, number>, stat: any) => {
        acc[stat.status.toLowerCase()] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      totalValue: totalValue._sum.total || 0,
    };
  }
}