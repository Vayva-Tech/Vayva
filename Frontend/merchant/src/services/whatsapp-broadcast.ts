/**
 * WhatsApp Broadcast Service
 * Implementation Plan 3: Customer Experience & Marketing
 */

import { PrismaClient } from '@vayva/db';
import type {
  WhatsAppBroadcast,
  WhatsAppTemplate,
  WhatsAppBroadcastRecipient,
  BroadcastAnalytics,
  BroadcastStatus,
  TemplateCategory,
  TemplateApprovalStatus,
  CreateBroadcastInput,
  CreateTemplateInput,
  UpdateTemplateInput,
} from '@/types/whatsapp-broadcast';

// Prisma type aliases for database models
type WhatsAppBroadcastDb = {
  id: string;
  storeId: string;
  name: string;
  segmentId: string | null;
  templateId: string | null;
  content: string;
  mediaUrl: string | null;
  status: string;
  scheduledAt: Date | null;
  sentAt: Date | null;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  openCount: number;
  clickCount: number;
  createdAt: Date;
  createdBy: string;
  segment?: { name: string };
  template?: { name: string };
};

type WhatsAppTemplateDb = {
  id: string;
  storeId: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  mediaUrl: string | null;
  isApproved: boolean;
  approvalStatus: string;
  rejectionReason: string | null;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
};

type WhatsAppBroadcastRecipientDb = {
  id: string;
  broadcastId: string;
  customerId: string;
  phoneNumber: string;
  status: string;
  errorCode: string | null;
  errorMessage: string | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  readAt: Date | null;
  customer?: { name: string };
};

export class WhatsAppBroadcastService {
  private db: PrismaClient;

  constructor() {
    this.db = new PrismaClient();
  }

  // ==================== TEMPLATE MANAGEMENT ====================

  async createTemplate(
    storeId: string,
    data: CreateTemplateInput
  ): Promise<WhatsAppTemplate> {
    const template = await this.db?.whatsAppTemplate.create({
      data: {
        storeId,
        name: data.name,
        category: data.category,
        content: data.content,
        variables: data.variables ?? [],
        mediaUrl: data.mediaUrl,
        isApproved: false,
        approvalStatus: 'pending',
        usageCount: 0,
      },
    });

    return this.mapTemplate(template as WhatsAppTemplateDb);
  }

  async updateTemplate(
    templateId: string,
    storeId: string,
    data: UpdateTemplateInput
  ): Promise<WhatsAppTemplate | null> {
    const existing = await this.db?.whatsAppTemplate.findFirst({
      where: { id: templateId, storeId },
    });

    if (!existing) return null;

    const template = await this.db?.whatsAppTemplate.update({
      where: { id: templateId },
      data: {
        name: data.name,
        category: data.category,
        content: data.content,
        variables: data.variables,
        mediaUrl: data.mediaUrl,
        // Reset approval if content changed
        ...(data.content && {
          isApproved: false,
          approvalStatus: 'pending',
        }),
      },
    });

    return this.mapTemplate(template as WhatsAppTemplateDb);
  }

  async deleteTemplate(templateId: string, storeId: string): Promise<boolean> {
    const existing = await this.db?.whatsAppTemplate.findFirst({
      where: { id: templateId, storeId },
    });

    if (!existing) return false;

    await this.db?.whatsAppTemplate.delete({
      where: { id: templateId },
    });

    return true;
  }

  async getTemplate(
    templateId: string,
    storeId: string
  ): Promise<WhatsAppTemplate | null> {
    const template = await this.db?.whatsAppTemplate.findFirst({
      where: { id: templateId, storeId },
    });

    if (!template) return null;
    return this.mapTemplate(template as WhatsAppTemplateDb);
  }

  async listTemplates(
    storeId: string,
    options?: {
      category?: TemplateCategory;
      isApproved?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<WhatsAppTemplate[]> {
    const templates = await this.db?.whatsAppTemplate.findMany({
      where: {
        storeId,
        ...(options?.category && { category: options.category }),
        ...(options?.isApproved !== undefined && {
          isApproved: options.isApproved,
        }),
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });

    return templates.map((t) => this.mapTemplate(t as WhatsAppTemplateDb));
  }

  async approveTemplate(
    templateId: string,
    storeId: string
  ): Promise<WhatsAppTemplate | null> {
    const template = await this.db?.whatsAppTemplate.updateMany({
      where: { id: templateId, storeId },
      data: {
        isApproved: true,
        approvalStatus: 'approved',
        rejectionReason: null,
      },
    });

    if (template.count === 0) return null;

    return this.getTemplate(templateId, storeId);
  }

  async rejectTemplate(
    templateId: string,
    storeId: string,
    reason: string
  ): Promise<WhatsAppTemplate | null> {
    const template = await this.db?.whatsAppTemplate.updateMany({
      where: { id: templateId, storeId },
      data: {
        isApproved: false,
        approvalStatus: 'rejected',
        rejectionReason: reason,
      },
    });

    if (template.count === 0) return null;

    return this.getTemplate(templateId, storeId);
  }

  // ==================== BROADCAST MANAGEMENT ====================

  async createBroadcast(
    storeId: string,
    createdBy: string,
    data: CreateBroadcastInput
  ): Promise<WhatsAppBroadcast> {
    // Calculate total recipients if segment is provided
    let totalRecipients = 0;
    if (data.segmentId) {
      const segment = await (this.db?.customerSegment.findUnique as any)({
        where: { id: data.segmentId },
        include: { _count: { select: { customers: true } } },
      });
      totalRecipients = segment?._count?.customers ?? 0;
    }

    const broadcast = await this.db?.whatsAppBroadcast.create({
      data: {
        storeId,
        name: data.name,
        segmentId: data.segmentId,
        templateId: data.templateId,
        content: data.content,
        mediaUrl: data.mediaUrl,
        status: data.scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: data.scheduledAt,
        totalRecipients,
        sentCount: 0,
        failedCount: 0,
        openCount: 0,
        clickCount: 0,
        createdBy,
      },
    });

    return this.mapBroadcast(broadcast as WhatsAppBroadcastDb);
  }

  async updateBroadcast(
    broadcastId: string,
    storeId: string,
    data: Partial<CreateBroadcastInput>
  ): Promise<WhatsAppBroadcast | null> {
    const existing = await this.db?.whatsAppBroadcast.findFirst({
      where: { id: broadcastId, storeId },
    });

    if (!existing) return null;

    // Don't allow updates if already sent
    if ((existing as any).status === 'sent') {
      throw new Error('Cannot update a sent broadcast');
    }

    const broadcast = await this.db?.whatsAppBroadcast.update({
      where: { id: broadcastId },
      data: {
        name: data.name,
        segmentId: data.segmentId,
        templateId: data.templateId,
        content: data.content,
        mediaUrl: data.mediaUrl,
        scheduledAt: data.scheduledAt,
        status: data.scheduledAt ? 'scheduled' : (existing as any).status,
      },
    });

    return this.mapBroadcast(broadcast as WhatsAppBroadcastDb);
  }

  async deleteBroadcast(broadcastId: string, storeId: string): Promise<boolean> {
    const existing = await this.db?.whatsAppBroadcast.findFirst({
      where: { id: broadcastId, storeId },
    });

    if (!existing) return false;

    if ((existing as any).status === 'sent') {
      throw new Error('Cannot delete a sent broadcast');
    }

    await this.db?.whatsAppBroadcast.delete({
      where: { id: broadcastId },
    });

    return true;
  }

  async getBroadcast(
    broadcastId: string,
    storeId: string
  ): Promise<WhatsAppBroadcast | null> {
    const broadcast = await (this.db?.whatsAppBroadcast.findFirst as any)({
      where: { id: broadcastId, storeId },
      include: {
        segment: { select: { name: true } },
        template: { select: { name: true } },
      },
    });

    if (!broadcast) return null;
    return this.mapBroadcast(broadcast as unknown as WhatsAppBroadcastDb);
  }

  async listBroadcasts(
    storeId: string,
    options?: {
      status?: BroadcastStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<WhatsAppBroadcast[]> {
    const broadcasts = await (this.db?.whatsAppBroadcast.findMany as any)({
      where: {
        storeId,
        ...(options?.status && { status: (options as any).status }),
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
      include: {
        segment: { select: { name: true } },
        template: { select: { name: true } },
      },
    });

    return broadcasts.map((b: any) => this.mapBroadcast(b as WhatsAppBroadcastDb));
  }

  async sendBroadcast(
    broadcastId: string,
    storeId: string
  ): Promise<WhatsAppBroadcast | null> {
    const broadcast = await this.db?.whatsAppBroadcast.findFirst({
      where: { id: broadcastId, storeId },
    });

    if (!broadcast) return null;
    if ((broadcast as any).status === 'sent') {
      throw new Error('Broadcast already sent');
    }
    if ((broadcast as any).status === 'sending') {
      throw new Error('Broadcast already in progress');
    }

    await this.db?.whatsAppBroadcast.update({
      where: { id: broadcastId },
      data: { status: 'sending' },
    });

    let recipientIds: string[] = [];
    if (broadcast.segmentId) {
      const segment = await (this.db?.customerSegment.findUnique as any)({
        where: { id: broadcast.segmentId },
        include: {
          customers: {
            select: { customerId: true },
          },
        },
      });
      recipientIds = (segment as any)?.customers?.map((c: any) => c.customerId) ?? [];
    } else {
      const customers = await this.db?.customer.findMany({
        where: { storeId },
        select: { id: true },
      });
      recipientIds = customers.map((c: any) => c.id);
    }

    const customers = await this.db?.customer.findMany({
      where: { id: { in: recipientIds } },
      select: { id: true, phone: true },
    });

    await this.db?.whatsAppBroadcastRecipient.createMany({
      data: customers.map((c: any) => ({
        broadcastId,
        customerId: c.id,
        phoneNumber: c.phone ?? '',
        status: 'pending',
      })),
    });

    const updated = await this.db?.whatsAppBroadcast.update({
      where: { id: broadcastId },
      data: {
        status: 'sent',
        sentAt: new Date(),
        sentCount: customers.length,
        totalRecipients: customers.length,
      },
    });

    if (broadcast.templateId) {
      await this.db?.whatsAppTemplate.update({
        where: { id: broadcast.templateId },
        data: { usageCount: { increment: 1 } },
      });
    }

    return this.mapBroadcast(updated as WhatsAppBroadcastDb);
  }

  async cancelBroadcast(
    broadcastId: string,
    storeId: string
  ): Promise<WhatsAppBroadcast | null> {
    const broadcast = await this.db?.whatsAppBroadcast.findFirst({
      where: { id: broadcastId, storeId },
    });

    if (!broadcast) return null;

    if ((broadcast as any).status !== 'scheduled' && (broadcast as any).status !== 'draft') {
      throw new Error('Can only cancel scheduled or draft broadcasts');
    }

    const updated = await this.db?.whatsAppBroadcast.update({
      where: { id: broadcastId },
      data: { status: 'draft', scheduledAt: null },
    });

    return this.mapBroadcast(updated as WhatsAppBroadcastDb);
  }

  async getBroadcastAnalytics(storeId: string): Promise<BroadcastAnalytics> {
    const [
      totalBroadcasts,
      totalSent,
      deliveryStats,
      topPerforming,
    ] = await Promise.all([
      this.db?.whatsAppBroadcast.count({ where: { storeId } }),
      this.db?.whatsAppBroadcast.count({
        where: { storeId, status: 'sent' },
      }),
      this.db?.whatsAppBroadcast.aggregate({
        where: { storeId },
        _sum: {
          sentCount: true,
          failedCount: true,
          openCount: true,
          clickCount: true,
        },
      }),
      this.db?.whatsAppBroadcast.findMany({
        where: { storeId, status: 'sent' },
        orderBy: { openCount: 'desc' },
        take: 5,
      }),
    ]);

    const totalSentCount = (deliveryStats._sum?.sentCount as number) ?? 0;
    const totalFailed = (deliveryStats._sum?.failedCount as number) ?? 0;
    const totalOpens = (deliveryStats._sum?.openCount as number) ?? 0;
    const totalClicks = (deliveryStats._sum?.clickCount as number) ?? 0;

    const deliveryRate =
      totalSentCount > 0
        ? (totalSentCount - totalFailed) / totalSentCount
        : 0;
    const openRate = totalSentCount > 0 ? totalOpens / totalSentCount : 0;
    const clickRate = totalSentCount > 0 ? totalClicks / totalSentCount : 0;

    return {
      totalBroadcasts,
      totalSent,
      deliveryRate,
      readRate: openRate,
      clickRate,
      topPerforming: topPerforming.map((b) => this.mapBroadcast(b as WhatsAppBroadcastDb)),
    };
  }

  // ==================== PRIVATE HELPERS ====================

  private mapTemplate(template: WhatsAppTemplateDb): WhatsAppTemplate {
    return {
      ...template,
      category: template.category as TemplateCategory,
      approvalStatus: template.approvalStatus as TemplateApprovalStatus,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  private mapBroadcast(broadcast: WhatsAppBroadcastDb): WhatsAppBroadcast {
    return {
      ...broadcast,
      status: (broadcast as any).status as BroadcastStatus,
      createdAt: broadcast.createdAt,
      scheduledAt: broadcast.scheduledAt,
      sentAt: broadcast.sentAt,
      segmentName: broadcast.segment?.name,
      templateName: broadcast.template?.name,
    };
  }

  private mapRecipient(
    recipient: WhatsAppBroadcastRecipientDb
  ): WhatsAppBroadcastRecipient {
    return {
      ...recipient,
      status: (recipient as any).status as WhatsAppBroadcastRecipient['status'],
      sentAt: recipient.sentAt,
      deliveredAt: recipient.deliveredAt,
      readAt: recipient.readAt,
      customerName: recipient.customer?.name,
    };
  }
}

// Singleton instance
let broadcastService: WhatsAppBroadcastService | null = null;

export function getWhatsAppBroadcastService(): WhatsAppBroadcastService {
  if (!broadcastService) {
    broadcastService = new WhatsAppBroadcastService();
  }
  return broadcastService;
}
