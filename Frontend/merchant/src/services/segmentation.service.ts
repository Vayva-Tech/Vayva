import { prisma } from "@/lib/prisma";
import type { Prisma } from "@vayva/db";
import type { CustomerSegment, CustomerSegmentMembership, RFMCustomer, SegmentOverview, RFMScores, SegmentCriteria } from "@/types/intelligence";
type Decimal = Prisma.Decimal;
type InputJsonValue = Prisma.InputJsonValue;

// Helper to convert Decimal to number
const toNumber = (d: Decimal | number): number =>
  typeof d === "number" ? d : Number(d);

// Mapper functions to convert Prisma results to custom types
const mapCustomerSegment = (s: {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  criteria: unknown;
  color: string;
  icon: string;
  customerCount: number;
  totalValue: Decimal | number;
  createdAt: Date;
  updatedAt: Date;
}): CustomerSegment => ({
  ...s,
  totalValue: toNumber(s.totalValue),
  criteria: s.criteria as SegmentCriteria,
});

const mapCustomerSegmentMembership = (m: {
  id: string;
  customerId: string;
  segmentId: string;
  score: Decimal | number;
  joinedAt: Date;
}): CustomerSegmentMembership => ({
  ...m,
  score: toNumber(m.score),
});

export class CustomerSegmentationService {
  // RFM Analysis Methods
  static async performRFMAnalysis(storeId: string): Promise<RFMCustomer[]> {
    const customers = await prisma.customer?.findMany({
      where: { storeId },
      include: {
        orders: {
          where: {
            status: { notIn: ["CANCELLED", "REFUNDED"] }
          },
          orderBy: { createdAt: "desc" },
          select: {
            total: true,
            createdAt: true
          }
        }
      }
    });

    const now = new Date();
    const rfmData: RFMCustomer[] = customers.map((customer) => {
      const orders = customer.orders;
      const totalOrders = orders.length;

      if (totalOrders === 0) {
        return {
          customerId: customer.id,
          recency: 0,
          frequency: 0,
          monetary: 0,
          lastOrderDate: new Date(0),
          totalOrders: 0
        };
      }

      const lastOrder = orders[0];
      const lastOrderDate = new Date(lastOrder.createdAt);
      const daysSinceLastOrder = Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));

      const totalSpent = orders.reduce((sum: number, order) => sum + Number(order.total), 0);
      const avgOrderValue = totalSpent / totalOrders;

      // Normalize scores to 1-5 scale
      const recency = this.normalizeRecencyScore(daysSinceLastOrder);
      const frequency = this.normalizeFrequencyScore(totalOrders);
      const monetary = this.normalizeMonetaryScore(avgOrderValue);

      return {
        customerId: customer.id,
        recency,
        frequency,
        monetary,
        lastOrderDate,
        totalOrders
      };
    });

    return rfmData;
  }

  // Segment Management Methods
  static async getSegments(storeId: string): Promise<CustomerSegment[]> {
    const segments = await prisma.customerSegment?.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" }
    });
    return segments.map(mapCustomerSegment) as CustomerSegment[];
  }
  
  static async createSegment(
    storeId: string,
    name: string,
    criteria: SegmentCriteria,
    description?: string,
    color?: string,
    icon?: string
  ): Promise<CustomerSegment> {
    const segment = await prisma.customerSegment?.create({
      data: {
        storeId,
        name,
        description: description ?? null,
        criteria: criteria as unknown as InputJsonValue,
        color: color ?? "#3b82f6",
        icon: icon ?? "Users",
        customerCount: 0,
        totalValue: 0
      }
    });

    // Auto-assign customers based on criteria
    await this.assignCustomersToSegment(storeId, segment.id, criteria);

    // Update segment stats
    await this.updateSegmentStats(segment.id);

    return mapCustomerSegment(segment);
  }

  static async updateSegment(
    segmentId: string,
    updates: Partial<Omit<CustomerSegment, "id" | "storeId" | "createdAt" | "updatedAt">>
  ): Promise<CustomerSegment> {
    const data: Record<string, unknown> = {};

    if (updates.name !== undefined) data.name = updates.name;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.criteria !== undefined) data.criteria = updates.criteria as unknown as InputJsonValue;
    if (updates.color !== undefined) data.color = updates.color;
    if (updates.icon !== undefined) data.icon = updates.icon;

    const segment = await prisma.customerSegment?.update({
      where: { id: segmentId },
      data
    });

    // If criteria changed, re-assign customers
    if (updates.criteria) {
      await this.reassignSegmentCustomers(segmentId, updates.criteria);
    }

    return mapCustomerSegment(segment);
  }

  static async deleteSegment(segmentId: string): Promise<void> {
    // Delete all memberships first
    await prisma.customerSegmentMembership?.deleteMany({
      where: { segmentId }
    });

    // Delete the segment
    await prisma.customerSegment?.delete({
      where: { id: segmentId }
    });
  }

  // Customer Segment Assignment
  static async assignCustomerToSegment(
    customerId: string,
    segmentId: string,
    score: number
  ): Promise<CustomerSegmentMembership> {
    const membership = await prisma.customerSegmentMembership?.upsert({
      where: {
        customerId_segmentId: {
          customerId,
          segmentId
        }
      },
      update: {
        score
      },
      create: {
        customerId,
        segmentId,
        score
      }
    });

    return mapCustomerSegmentMembership(membership);
  }

  static async removeCustomerFromSegment(
    customerId: string,
    segmentId: string
  ): Promise<void> {
    await prisma.customerSegmentMembership?.deleteMany({
      where: {
        customerId,
        segmentId
      }
    });
  }

  static async getCustomerSegments(customerId: string): Promise<CustomerSegment[]> {
    const memberships = await prisma.customerSegmentMembership?.findMany({
      where: { customerId }
    });

    const segments: CustomerSegment[] = [];
    for (const membership of memberships) {
      const segment = await prisma.customerSegment?.findUnique({
        where: { id: membership.segmentId }
      });
      if (segment) {
        segments.push(mapCustomerSegment(segment));
      }
    }

    return segments;
  }

  static async getSegmentCustomers(segmentId: string): Promise<string[]> {
    const memberships = await prisma.customerSegmentMembership?.findMany({
      where: { segmentId },
      select: { customerId: true }
    });

    return memberships.map((m: { customerId: string }) => m.customerId);
  }

  // Predefined Segments
  static async createPredefinedSegments(storeId: string): Promise<CustomerSegment[]> {
    const predefined = [
      {
        name: "Champions",
        description: "High value, frequent buyers - your best customers",
        criteria: { rfm: { recency: 5, frequency: 5, monetary: 5 }, behaviors: [] },
        color: "#10b981",
        icon: "Crown"
      },
      {
        name: "Loyal Customers",
        description: "Frequent buyers with good spending",
        criteria: { rfm: { recency: 4, frequency: 4, monetary: 4 }, behaviors: [] },
        color: "#3b82f6",
        icon: "Heart"
      },
      {
        name: "Potential Loyalists",
        description: "Recent customers with good frequency",
        criteria: { rfm: { recency: 4, frequency: 3, monetary: 3 }, behaviors: [] },
        color: "#8b5cf6",
        icon: "TrendingUp"
      },
      {
        name: "New Customers",
        description: "Recent first-time buyers",
        criteria: { rfm: { recency: 5, frequency: 1, monetary: 1 }, behaviors: ["first_purchase"] },
        color: "#f59e0b",
        icon: "Sparkles"
      },
      {
        name: "At Risk",
        description: "Previously loyal customers who haven't purchased recently",
        criteria: { rfm: { recency: 2, frequency: 4, monetary: 4 }, behaviors: ["declining_engagement"] },
        color: "#f97316",
        icon: "AlertTriangle"
      },
      {
        name: "Cannot Lose Them",
        description: "High-value customers at risk of churning",
        criteria: { rfm: { recency: 1, frequency: 5, monetary: 5 }, behaviors: ["high_value", "at_risk"] },
        color: "#ef4444",
        icon: "AlertCircle"
      },
      {
        name: "Hibernating",
        description: "Low recency, frequency, and monetary scores",
        criteria: { rfm: { recency: 1, frequency: 1, monetary: 1 }, behaviors: [] },
        color: "#6b7280",
        icon: "Moon"
      }
    ];

    const createdSegments: CustomerSegment[] = [];

    for (const segment of predefined) {
      const existing = await prisma.customerSegment?.findFirst({
        where: { storeId, name: segment.name }
      });

      if (!existing) {
        const created = await this.createSegment(
          storeId,
          segment.name,
          segment.criteria,
          segment.description,
          segment.color,
          segment.icon
        );
        createdSegments.push(created);
      }
    }

    return createdSegments;
  }

  // Overview and Stats
  static async getSegmentOverview(storeId: string): Promise<SegmentOverview> {
    const [segments, totalCustomers] = await Promise.all([
      this.getSegments(storeId),
      prisma.customer?.count({ where: { storeId } })
    ]);

    const segmentDistribution: Record<string, number> = {};
    for (const segment of segments) {
      segmentDistribution[segment.name] = segment.customerCount;
    }

    return {
      segments,
      totalCustomers,
      segmentDistribution
    };
  }

  // Helper Methods
  private static normalizeRecencyScore(daysSinceLastOrder: number): number {
    if (daysSinceLastOrder <= 7) return 5;
    if (daysSinceLastOrder <= 30) return 4;
    if (daysSinceLastOrder <= 90) return 3;
    if (daysSinceLastOrder <= 180) return 2;
    return 1;
  }

  private static normalizeFrequencyScore(totalOrders: number): number {
    if (totalOrders >= 20) return 5;
    if (totalOrders >= 10) return 4;
    if (totalOrders >= 5) return 3;
    if (totalOrders >= 2) return 2;
    return 1;
  }

  private static normalizeMonetaryScore(avgOrderValue: number): number {
    if (avgOrderValue >= 100000) return 5; // N100,000+
    if (avgOrderValue >= 50000) return 4;  // N50,000+
    if (avgOrderValue >= 20000) return 3;  // N20,000+
    if (avgOrderValue >= 10000) return 2;  // N10,000+
    return 1;
  }

  private static async assignCustomersToSegment(
    storeId: string,
    segmentId: string,
    criteria: SegmentCriteria
  ): Promise<void> {
    const rfmData = await this.performRFMAnalysis(storeId);

    for (const customer of rfmData) {
      if (this.matchesCriteria(customer, criteria)) {
        const score = this.calculateRFMScore(customer);
        await this.assignCustomerToSegment(customer.customerId, segmentId, score);
      }
    }
  }

  private static async reassignSegmentCustomers(
    segmentId: string,
    criteria: SegmentCriteria
  ): Promise<void> {
    const segment = await prisma.customerSegment?.findUnique({
      where: { id: segmentId },
      select: { storeId: true }
    });

    if (!segment) return;

    // Remove existing assignments
    await prisma.customerSegmentMembership?.deleteMany({
      where: { segmentId }
    });

    // Re-assign based on new criteria
    await this.assignCustomersToSegment(segment.storeId, segmentId, criteria);
  }

  private static matchesCriteria(customer: RFMCustomer, criteria: SegmentCriteria): boolean {
    const rfmMatch =
      customer.recency >= criteria.rfm?.recency - 1 &&
      customer.frequency >= criteria.rfm?.frequency - 1 &&
      customer.monetary >= criteria.rfm?.monetary - 1;

    // Additional behavior matching could be added here
    return rfmMatch;
  }

  private static calculateRFMScore(customer: RFMCustomer): number {
    return (customer.recency + customer.frequency + customer.monetary) / 3;
  }

  private static async updateSegmentStats(segmentId: string): Promise<void> {
    const memberships = await prisma.customerSegmentMembership?.findMany({
      where: { segmentId },
      select: { customerId: true }
    });

    const customerIds = memberships.map((m: { customerId: string }) => m.customerId);
    const customerCount = customerIds.length;

    // Calculate total value of customers in this segment
    const orders = await prisma.order?.findMany({
      where: {
        customerId: { in: customerIds },
        status: { notIn: ["CANCELLED", "REFUNDED"] }
      },
      select: { total: true }
    });

    const totalValue = orders.reduce((sum: number, order: any) => sum + Number(order.total), 0);

    await prisma.customerSegment?.update({
      where: { id: segmentId },
      data: {
        customerCount,
        totalValue
      }
    });
  }
}
