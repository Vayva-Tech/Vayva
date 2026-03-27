import { prisma } from '@vayva/db';
import { BookingStatus, Prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class QuoteService {
  constructor(private readonly db = prisma) {}

  /**
   * Get all quotes for a store
   */
  async findAll(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const status = filters.status || null;

    // Quotes are stored as bookings with type: "quote_request" in metadata
    const where: Prisma.BookingWhereInput = {
      storeId,
      metadata: {
        path: ['type'],
        equals: 'quote_request',
      },
      ...(status ? { status } : {}),
    };

    const [quotes, total] = await Promise.all([
      this.db.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.booking.count({ where }),
    ]);

    return {
      quotes: quotes.map((q) => this.transformQuote(q)),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single quote by ID
   */
  async findOne(quoteId: string, storeId: string) {
    const quote = await this.db.booking.findFirst({
      where: {
        id: quoteId,
        storeId,
        metadata: {
          path: ['type'],
          equals: 'quote_request',
        },
      },
    });

    if (!quote) {
      throw new Error('Quote not found');
    }

    return this.transformQuote(quote);
  }

  /**
   * Create a new B2B quote
   */
  async create(storeId: string, userId: string, data: any) {
    const {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      items,
      notes,
      validDays,
    } = data;

    if (!companyName || !items?.length) {
      throw new Error('Company name and items are required');
    }

    // Calculate total from items
    let total = 0;
    const quoteItems = [];

    for (const itemRaw of items) {
      const item = typeof itemRaw === 'object' && itemRaw !== null ? itemRaw : {};
      const productId = typeof item.productId === 'string' ? item.productId : undefined;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;

      if (!productId || quantity <= 0) continue;

      const product = await this.db.product.findFirst({
        where: { id: productId, storeId },
      });

      if (product) {
        // Check for tiered pricing
        const pricingTiers = await this.db.pricingTier.findMany({
          where: { productId: product.id },
          orderBy: { minQuantity: 'asc' },
        });

        let unitPrice = Number(product.price);
        for (const tier of pricingTiers) {
          if (quantity >= tier.minQuantity) {
            unitPrice = Number(tier.price);
          }
        }

        const lineTotal = unitPrice * quantity;
        total += lineTotal;

        quoteItems.push({
          productId: product.id,
          name: product.title,
          quantity,
          unitPrice,
          lineTotal,
        });
      }
    }

    const quoteNumber = `QT-${Date.now().toString(36).toUpperCase()}`;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (validDays || 30));

    const quote = await this.db.booking.create({
      data: {
        storeId,
        serviceId: quoteItems[0]?.productId || '',
        startsAt: new Date(),
        endsAt: validUntil,
        status: 'CONFIRMED',
        notes: notes || '',
        metadata: {
          type: 'quote_request',
          quoteNumber,
          companyName,
          contactName: contactName || null,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          items: quoteItems,
          total,
          source: 'dashboard',
        },
      },
    });

    logger.info(`[Quote] Created quote ${quote.id} for store ${storeId}`);
    return this.transformQuote(quote);
  }

  /**
   * Update a quote
   */
  async update(quoteId: string, storeId: string, userId: string, data: any) {
    const existing = await this.db.booking.findFirst({
      where: {
        id: quoteId,
        storeId,
        metadata: {
          path: ['type'],
          equals: 'quote_request',
        },
      },
    });

    if (!existing) {
      throw new Error('Quote not found');
    }

    const { status, notes } = data;
    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const quote = await this.db.booking.update({
      where: { id: quoteId },
      data: updateData,
    });

    logger.info(`[Quote] Updated quote ${quoteId}`);
    return this.transformQuote(quote);
  }

  /**
   * Delete a quote
   */
  async delete(quoteId: string, storeId: string) {
    const existing = await this.db.booking.findFirst({
      where: {
        id: quoteId,
        storeId,
        metadata: {
          path: ['type'],
          equals: 'quote_request',
        },
      },
    });

    if (!existing) {
      throw new Error('Quote not found');
    }

    await this.db.booking.delete({
      where: { id: quoteId },
    });

    logger.info(`[Quote] Deleted quote ${quoteId}`);
  }

  /**
   * Transform booking into quote object
   */
  private transformQuote(booking: Prisma.BookingGetPayload<{}>) {
    const meta = typeof booking.metadata === 'object' && booking.metadata !== null ? booking.metadata : {};
    
    return {
      id: booking.id,
      quoteNumber: (meta as any)?.quoteNumber || booking.id.slice(0, 8).toUpperCase(),
      companyName: (meta as any)?.companyName || 'Unknown',
      contactName: (meta as any)?.contactName || '',
      contactEmail: (meta as any)?.contactEmail || '',
      contactPhone: (meta as any)?.contactPhone || '',
      items: (meta as any)?.items || [],
      total: typeof (meta as any)?.total === 'number' ? (meta as any)?.total : Number((meta as any)?.total ?? 0),
      status: booking.status,
      notes: booking.notes,
      validUntil: booking.endsAt,
      createdAt: booking.createdAt,
    };
  }
}
