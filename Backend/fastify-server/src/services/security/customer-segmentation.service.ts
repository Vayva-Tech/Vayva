import { prisma } from '@vayva/db';
import { logger } from '@vayva/shared';

/**
 * Customer Segmentation Service - RFM analysis and segment management
 * 
 * Provides:
 * - RFM (Recency, Frequency, Monetary) analysis
 * - Dynamic customer segmentation
 * - Segment membership tracking
 * - Predefined segment templates
 */

export interface RFMCustomer {
  customerId: string;
  recency: number;
  frequency: number;
  monetary: number;
  recencyScore: number;
  frequencyScore: number;
  monetaryScore: number;
  rfmScore: number;
  segment?: string;
}

export interface SegmentCriteria {
  minRFMScore?: number;
  maxRFMScore?: number;
  minRecency?: number;
  maxRecency?: number;
  minFrequency?: number;
  maxFrequency?: number;
  minMonetary?: number;
  maxMonetary?: number;
  customRules?: Array<{
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
    value: number | [number, number];
  }>;
}

export class CustomerSegmentationService {
  /**
   * Perform RFM analysis for all customers in a store
   */
  async performRFMAnalysis(storeId: string): Promise<RFMCustomer[]> {
    try {
      // Get all customers with their orders
      const customers = await prisma.customer.findMany({
        where: { storeId },
        include: {
          orders: {
            where: { status: 'COMPLETED' },
            include: {
              items: true,
            },
          },
        },
      });

      const rfmCustomers: RFMCustomer[] = [];
      const now = new Date();

      for (const customer of customers) {
        const orders = customer.orders;
        
        if (orders.length === 0) {
          continue; // Skip customers with no orders
        }

        // Calculate Recency (days since last order)
        const lastOrderDate = orders.reduce((latest, order) => {
          return order.createdAt > latest ? order.createdAt : latest;
        }, orders[0].createdAt);
        const recency = Math.floor(
          (now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Calculate Frequency (total number of orders)
        const frequency = orders.length;

        // Calculate Monetary (average order value)
        const totalRevenue = orders.reduce((sum, order) => {
          return sum + order.totalAmount;
        }, 0);
        const monetary = totalRevenue / frequency;

        // Normalize scores (1-5 scale)
        const recencyScore = this.normalizeRecencyScore(recency, customers);
        const frequencyScore = this.normalizeFrequencyScore(frequency, customers);
        const monetaryScore = this.normalizeMonetaryScore(monetary, customers);

        // Calculate combined RFM score
        const rfmScore = recencyScore * 100 + frequencyScore * 10 + monetaryScore;

        rfmCustomers.push({
          customerId: customer.id,
          recency,
          frequency,
          monetary: parseFloat(monetary.toFixed(2)),
          recencyScore,
          frequencyScore,
          monetaryScore,
          rfmScore,
        });
      }

      return rfmCustomers;
    } catch (error) {
      logger.error('[Segmentation] RFM analysis failed', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Get all segments for a store
   */
  async getSegments(storeId: string): Promise<any[]> {
    try {
      const segments = await prisma.customerSegment.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        include: {
          memberships: {
            include: {
              customer: true,
            },
          },
        },
      });

      return segments.map((segment) => ({
        ...segment,
        criteria: segment.criteria
          ? JSON.parse(segment.criteria as string)
          : {},
        customerCount: segment.memberships.length,
      }));
    } catch (error) {
      logger.error('[Segmentation] Failed to get segments', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Create a new customer segment
   */
  async createSegment(
    storeId: string,
    name: string,
    criteria: SegmentCriteria,
    description?: string,
    color?: string,
    icon?: string
  ): Promise<any> {
    try {
      const segment = await prisma.customerSegment.create({
        data: {
          storeId,
          name,
          description: description || null,
          color: color || null,
          icon: icon || null,
          criteria: JSON.stringify(criteria),
        },
      });

      logger.info('[Segmentation] Segment created', {
        segmentId: segment.id,
        name,
      });

      return segment;
    } catch (error) {
      logger.error('[Segmentation] Failed to create segment', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Update an existing segment
   */
  async updateSegment(
    segmentId: string,
    updates: Partial<{
      name: string;
      description: string;
      criteria: SegmentCriteria;
      color: string;
      icon: string;
    }>
  ): Promise<any> {
    try {
      const data: any = {};
      
      if (updates.name) data.name = updates.name;
      if (updates.description !== undefined)
        data.description = updates.description;
      if (updates.criteria)
        data.criteria = JSON.stringify(updates.criteria);
      if (updates.color !== undefined) data.color = updates.color;
      if (updates.icon !== undefined) data.icon = updates.icon;

      const segment = await prisma.customerSegment.update({
        where: { id: segmentId },
        data,
      });

      logger.info('[Segmentation] Segment updated', {
        segmentId,
      });

      return segment;
    } catch (error) {
      logger.error('[Segmentation] Failed to update segment', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Delete a segment
   */
  async deleteSegment(segmentId: string): Promise<void> {
    try {
      await prisma.customerSegment.delete({
        where: { id: segmentId },
      });

      logger.info('[Segmentation] Segment deleted', {
        segmentId,
      });
    } catch (error) {
      logger.error('[Segmentation] Failed to delete segment', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Assign customer to segment
   */
  async assignCustomerToSegment(
    customerId: string,
    segmentId: string,
    score: number
  ): Promise<any> {
    try {
      const membership = await prisma.customerSegmentMembership.create({
        data: {
          customerId,
          segmentId,
          score,
        },
      });

      logger.info('[Segmentation] Customer assigned to segment', {
        customerId,
        segmentId,
      });

      return membership;
    } catch (error) {
      logger.error('[Segmentation] Failed to assign customer', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Remove customer from segment
   */
  async removeCustomerFromSegment(
    customerId: string,
    segmentId: string
  ): Promise<void> {
    try {
      await prisma.customerSegmentMembership.deleteMany({
        where: {
          customerId,
          segmentId,
        },
      });

      logger.info('[Segmentation] Customer removed from segment', {
        customerId,
        segmentId,
      });
    } catch (error) {
      logger.error('[Segmentation] Failed to remove customer', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get segments for a customer
   */
  async getCustomerSegments(customerId: string): Promise<any[]> {
    try {
      const memberships = await prisma.customerSegmentMembership.findMany({
        where: { customerId },
        include: {
          segment: true,
        },
      });

      return memberships.map((m) => ({
        ...m.segment,
      }));
    } catch (error) {
      logger.error('[Segmentation] Failed to get customer segments', {
        customerId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Get customers in a segment
   */
  async getSegmentCustomers(segmentId: string): Promise<string[]> {
    try {
      const memberships = await prisma.customerSegmentMembership.findMany({
        where: { segmentId },
        select: { customerId: true },
      });

      return memberships.map((m) => m.customerId);
    } catch (error) {
      logger.error('[Segmentation] Failed to get segment customers', {
        segmentId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Create predefined segments (templates)
   */
  async createPredefinedSegments(storeId: string): Promise<any[]> {
    try {
      const predefined = [
        {
          name: 'Champions',
          description: 'Best customers - high recency, frequency, and monetary value',
          color: '#FFD700',
          icon: '🏆',
          criteria: {
            minRFMScore: 800,
          } as SegmentCriteria,
        },
        {
          name: 'Loyal Customers',
          description: 'Regular customers with good frequency',
          color: '#C0C0C0',
          icon: '⭐',
          criteria: {
            minFrequency: 5,
            minRFMScore: 500,
          } as SegmentCriteria,
        },
        {
          name: 'At Risk',
          description: 'Previously good customers who haven\'t ordered recently',
          color: '#FF6B6B',
          icon: '⚠️',
          criteria: {
            minRFMScore: 400,
            maxRecency: 90,
          } as SegmentCriteria,
        },
        {
          name: 'New Customers',
          description: 'Recently acquired customers',
          color: '#4ECDC4',
          icon: '🌱',
          criteria: {
            maxRecency: 30,
            maxFrequency: 2,
          } as SegmentCriteria,
        },
      ];

      const segments = await Promise.all(
        predefined.map(async (seg) =>
          this.createSegment(
            storeId,
            seg.name,
            seg.criteria,
            seg.description,
            seg.color,
            seg.icon
          )
        )
      );

      logger.info('[Segmentation] Predefined segments created', {
        count: segments.length,
      });

      return segments;
    } catch (error) {
      logger.error('[Segmentation] Failed to create predefined segments', {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Get segment overview statistics
   */
  async getSegmentOverview(storeId: string): Promise<any> {
    try {
      const [segments, totalCustomers] = await Promise.all([
        this.getSegments(storeId),
        prisma.customer.count({ where: { storeId } }),
      ]);

      const totalInSegments = segments.reduce(
        (sum, seg) => sum + seg.customerCount,
        0
      );

      return {
        totalSegments: segments.length,
        totalCustomers,
        totalInSegments,
        coverageRate:
          totalCustomers > 0
            ? Math.round((totalInSegments / totalCustomers) * 100)
            : 0,
        segmentsBySize: segments
          .sort((a, b) => b.customerCount - a.customerCount)
          .slice(0, 5)
          .map((s) => ({
            name: s.name,
            count: s.customerCount,
          })),
      };
    } catch (error) {
      logger.error('[Segmentation] Failed to get overview', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        totalSegments: 0,
        totalCustomers: 0,
        totalInSegments: 0,
        coverageRate: 0,
        segmentsBySize: [],
      };
    }
  }

  /**
   * Normalize recency score (1-5)
   */
  private normalizeRecencyScore(
    recency: number,
    customers: any[]
  ): number {
    const minRecency = 0;
    const maxRecency = Math.max(
      ...customers.map((c) =>
        c.orders.length > 0
          ? Math.floor(
              (new Date().getTime() -
                c.orders.reduce(
                  (latest: Date, o: any) =>
                    o.createdAt > latest ? o.createdAt : latest,
                  c.orders[0].createdAt
                ).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0
      )
    );

    const range = maxRecency - minRecency || 1;
    const normalized = 5 - Math.floor(((recency - minRecency) / range) * 5);
    return Math.max(1, Math.min(5, normalized));
  }

  /**
   * Normalize frequency score (1-5)
   */
  private normalizeFrequencyScore(
    frequency: number,
    customers: any[]
  ): number {
    const frequencies = customers
      .filter((c) => c.orders.length > 0)
      .map((c) => c.orders.length);
    const minFreq = Math.min(...frequencies);
    const maxFreq = Math.max(...frequencies);

    const range = maxFreq - minFreq || 1;
    const normalized = Math.floor(((frequency - minFreq) / range) * 5) + 1;
    return Math.max(1, Math.min(5, normalized));
  }

  /**
   * Normalize monetary score (1-5)
   */
  private normalizeMonetaryScore(
    monetary: number,
    customers: any[]
  ): number {
    const monetaries = customers
      .filter((c) => c.orders.length > 0)
      .map((c) => {
        const total = c.orders.reduce(
          (sum: number, o: any) => sum + o.totalAmount,
          0
        );
        return total / c.orders.length;
      });
    const minMonetary = Math.min(...monetaries);
    const maxMonetary = Math.max(...monetaries);

    const range = maxMonetary - minMonetary || 1;
    const normalized = Math.floor(((monetary - minMonetary) / range) * 5) + 1;
    return Math.max(1, Math.min(5, normalized));
  }
}
