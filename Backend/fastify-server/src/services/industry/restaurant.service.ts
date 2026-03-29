import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class RestaurantService {
  constructor(private readonly db = prisma) {}

  async getKitchenTickets(storeId: string, filters: {
    status?: 'PENDING' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED';
    station?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.station) where.station = filters.station;

    const [tickets, total] = await Promise.all([
      this.db.kitchenTicket.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              customerName: true,
              tableNumber: true,
              status: true,
            },
          },
          items: {
            include: {
              variant: true,
            },
          },
        },
      }),
      this.db.kitchenTicket.count({ where }),
    ]);

    return {
      tickets,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async createKitchenTicket(storeId: string, ticketData: any) {
    const { orderId, items, station, priority = 'NORMAL', notes } = ticketData;

    const order = await this.db.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.storeId !== storeId) {
      throw new Error('Order not found');
    }

    const ticket = await this.db.kitchenTicket.create({
      data: {
        id: `kds-${Date.now()}`,
        storeId,
        orderId,
        station,
        status: 'PENDING',
        priority,
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            productName: item.productName,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions || null,
          })),
        },
      },
      include: { items: true, order: true },
    });

    logger.info(`[Restaurant] Created KDS ticket ${ticket.id}`);
    return ticket;
  }

  async updateTicketStatus(ticketId: string, storeId: string, status: string) {
    const ticket = await this.db.kitchenTicket.findFirst({
      where: { id: ticketId, storeId },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const updated = await this.db.kitchenTicket.update({
      where: { id: ticketId },
      data: {
        status,
        updatedAt: new Date(),
        ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
      },
    });

    logger.info(`[Restaurant] Updated ticket ${ticketId} status to ${status}`);
    return updated;
  }

  async voidTicket(ticketId: string, storeId: string, reason: string) {
    const ticket = await this.db.kitchenTicket.findFirst({
      where: { id: ticketId, storeId },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const updated = await this.db.kitchenTicket.update({
      where: { id: ticketId },
      data: {
        status: 'CANCELLED',
        voidReason: reason,
        voidedAt: new Date(),
      },
    });

    logger.info(`[Restaurant] Voided ticket ${ticketId}: ${reason}`);
    return updated;
  }

  async getKDSStations(storeId: string) {
    const stations = await this.db.kitchenStation.findMany({
      where: { storeId, active: true },
      orderBy: { displayOrder: 'asc' },
    });

    return stations;
  }

  async createKDSStation(storeId: string, stationData: any) {
    const { name, description, displayOrder } = stationData;

    const station = await this.db.kitchenStation.create({
      data: {
        id: `station-${Date.now()}`,
        storeId,
        name,
        description: description || null,
        active: true,
        displayOrder: displayOrder || 0,
      },
    });

    logger.info(`[Restaurant] Created KDS station ${station.id}`);
    return station;
  }

  async updateKDSStation(stationId: string, storeId: string, updates: any) {
    const station = await this.db.kitchenStation.findFirst({
      where: { id: stationId, storeId },
    });

    if (!station) {
      throw new Error('Station not found');
    }

    const updated = await this.db.kitchenStation.update({
      where: { id: stationId },
      data: updates,
    });

    logger.info(`[Restaurant] Updated station ${stationId}`);
    return updated;
  }

  async deleteKDSStation(stationId: string, storeId: string) {
    const station = await this.db.kitchenStation.findFirst({
      where: { id: stationId, storeId },
    });

    if (!station) {
      throw new Error('Station not found');
    }

    await this.db.kitchenStation.update({
      where: { id: stationId },
      data: { active: false },
    });

    logger.info(`[Restaurant] Deactivated station ${stationId}`);
    return { success: true };
  }

  async getTicketStats(storeId: string) {
    const [pending, inProgress, ready, completed, avgPrepTime] = await Promise.all([
      this.db.kitchenTicket.count({ where: { storeId, status: 'PENDING' } }),
      this.db.kitchenTicket.count({ where: { storeId, status: 'IN_PROGRESS' } }),
      this.db.kitchenTicket.count({ where: { storeId, status: 'READY' } }),
      this.db.kitchenTicket.count({ where: { storeId, status: 'COMPLETED' } }),
      this.db.kitchenTicket.aggregate({
        where: {
          storeId,
          status: 'COMPLETED',
          completedAt: { not: null },
        },
        _avg: {
          prepTimeMinutes: true,
        },
      }),
    ]);

    return {
      pending,
      inProgress,
      ready,
      completed,
      averagePrepTime: Math.round(avgPrepTime._avg.prepTimeMinutes || 0),
    };
  }

  /**
   * Menu Items - Create a new menu item
   */
  async createMenuItem(storeId: string, data: any) {
    const { name, description, price, metadata } = data;

    const product = await this.db.product.create({
      data: {
        storeId,
        title: String(name || 'Untitled'),
        handle:
          String(name || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') +
          '-' +
          Date.now(),
        description: typeof description === 'string' ? description : undefined,
        price: typeof price === 'number' ? price : 0,
        productType: 'menu_item',
        status: 'ACTIVE',
        trackInventory: false,
        metadata: (metadata as any) || {},
      },
    });

    logger.info(`[Restaurant] Created menu item ${product.id}`);
    return product;
  }

  /**
   * Get kitchen orders for display
   */
  async getKitchenOrders(storeId: string) {
    const orders = await this.db.order.findMany({
      where: {
        storeId,
        fulfillmentStatus: { in: ['UNFULFILLED', 'PREPARING'] },
        paymentStatus: { in: ['SUCCESS', 'VERIFIED'] },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return orders;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string) {
    const fulfillmentStatus =
      status === 'READY'
        ? 'READY_FOR_PICKUP'
        : 'READY_FOR_PICKUP';

    const order = await this.db.order.update({
      where: { id: orderId },
      data: {
        fulfillmentStatus,
      },
    });

    logger.info(`[Restaurant] Updated order ${orderId} status to ${fulfillmentStatus}`);
    return order;
  }

  /**
   * Get all menu items for a store
   */
  async getMenuItems(storeId: string, filters?: any) {
    const where: any = {
      storeId,
      productType: 'menu_item',
      status: 'ACTIVE',
    };

    if (filters?.category) {
      where.metadata = {
        path: ['category'],
        equals: filters.category,
      };
    }

    if (filters?.available !== undefined) {
      where.metadata = {
        ...(where.metadata || {}),
        path: ['available'],
        equals: filters.available,
      };
    }

    const menuItems = await this.db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return menuItems;
  }

  /**
   * Update menu item
   */
  async updateMenuItem(itemId: string, data: any) {
    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.title = String(data.name);
      updateData.handle =
        String(data.name || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-') +
        '-' +
        Date.now();
    }

    if (data.description !== undefined) {
      updateData.description = String(data.description);
    }

    if (data.price !== undefined && typeof data.price === 'number') {
      updateData.price = data.price;
    }

    if (data.status !== undefined) {
      updateData.status = String(data.status);
    }

    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata;
    }

    const updated = await this.db.product.update({
      where: { id: itemId },
      data: updateData,
    });

    logger.info(`[Restaurant] Updated menu item ${itemId}`);
    return updated;
  }

  /**
   * Delete menu item (soft delete)
   */
  async deleteMenuItem(itemId: string) {
    const updated = await this.db.product.update({
      where: { id: itemId },
      data: {
        status: 'ARCHIVED',
      },
    });

    logger.info(`[Restaurant] Archived menu item ${itemId}`);
    return updated;
  }

  /**
   * Get menu categories for a store
   */
  async getCategories(storeId: string) {
    const menuItems = await this.db.product.findMany({
      where: {
        storeId,
        productType: 'menu_item',
        status: 'ACTIVE',
      },
      select: {
        metadata: true,
      },
    });

    // Extract unique categories from metadata
    const categorySet = new Set<string>();
    menuItems.forEach((item) => {
      const metadata = item.metadata as any;
      if (metadata?.category) {
        categorySet.add(metadata.category);
      }
    });

    return Array.from(categorySet).sort();
  }

  /**
   * Calculate recipe cost based on ingredients
   */
  async calculateRecipeCost(recipeId: string) {
    const recipe = await this.db.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!recipe) {
      throw new Error('Recipe not found');
    }

    let totalCost = 0;
    const costBreakdown = [];

    for (const recipeIngredient of recipe.ingredients) {
      const ingredient = recipeIngredient.ingredient;
      const quantity = Number(recipeIngredient.quantity);
      const unitCost = Number(ingredient.costPerUnit || 0);
      const ingredientCost = quantity * unitCost;

      totalCost += ingredientCost;
      costBreakdown.push({
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        quantity,
        unitCost,
        totalCost: ingredientCost,
      });
    }

    const result = {
      recipeId: recipe.id,
      recipeName: recipe.name,
      totalCost,
      costBreakdown,
      suggestedPrice: totalCost * 3, // Standard 3x food cost multiplier
      foodCostPercentage: 33.33,
    };

    logger.info(`[Restaurant] Calculated recipe cost for ${recipeId}: ₦${totalCost.toFixed(2)}`);
    return result;
  }
}
