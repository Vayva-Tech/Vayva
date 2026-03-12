import { prisma } from '@/lib/prisma';
import type {
  ContentCalendar,
  ContentCalendarType,
  ContentCalendarStatus,
  CreateContentCalendarInput,
  NewsletterCampaign,
  NewsletterStatus,
  CreateNewsletterInput,
  EmailSubscriber,
  SubscriberStatus,
  CreateSubscriberInput,
} from '@/types/phase3-industry';

export class BlogMediaService {
  // ===== CONTENT CALENDAR =====

  async getContentCalendar(
    storeId: string,
    filters?: {
      type?: ContentCalendarType;
      status?: ContentCalendarStatus;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ContentCalendar[]> {
    const items = await prisma.contentCalendar?.findMany({
      where: {
        storeId,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.status && { status: (filters as any).status }),
        ...(filters?.startDate && filters?.endDate && {
          scheduledDate: {
            gte: filters.startDate,
            lte: filters.endDate,
          },
        }),
      },
      orderBy: { scheduledDate: 'asc' },
    });

    return items.map((i: any) => ({
      id: i.id,
      storeId: i.storeId,
      title: i.title,
      type: i.type as ContentCalendarType,
      platform: i.platform ?? undefined,
      description: i.description ?? undefined,
      scheduledDate: i.scheduledDate,
      status: (i as any).status as ContentCalendarStatus,
      assigneeId: i.assigneeId ?? undefined,
      contentId: i.contentId ?? undefined,
      notes: i.notes ?? undefined,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    }));
  }

  async createContentCalendarItem(data: CreateContentCalendarInput): Promise<ContentCalendar> {
    const item = await prisma.contentCalendar?.create({
      data: {
        storeId: data.storeId,
        title: data.title,
        type: data.type,
        platform: data.platform,
        description: data.description,
        scheduledDate: data.scheduledDate,
        assigneeId: data.assigneeId,
        notes: data.notes,
        status: 'planned',
      },
    });

    return {
      id: item.id,
      storeId: item.storeId,
      title: item.title,
      type: item.type as ContentCalendarType,
      platform: item.platform ?? undefined,
      description: item.description ?? undefined,
      scheduledDate: item.scheduledDate,
      status: (item as any).status as ContentCalendarStatus,
      assigneeId: item.assigneeId ?? undefined,
      contentId: item.contentId ?? undefined,
      notes: item.notes ?? undefined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  async updateContentCalendarStatus(
    id: string,
    status: ContentCalendarStatus,
    contentId?: string
  ): Promise<ContentCalendar> {
    const item = await prisma.contentCalendar?.update({
      where: { id },
      data: {
        status,
        ...(contentId && { contentId }),
      },
    });

    return {
      id: item.id,
      storeId: item.storeId,
      title: item.title,
      type: item.type as ContentCalendarType,
      platform: item.platform ?? undefined,
      description: item.description ?? undefined,
      scheduledDate: item.scheduledDate,
      status: (item as any).status as ContentCalendarStatus,
      assigneeId: item.assigneeId ?? undefined,
      contentId: item.contentId ?? undefined,
      notes: item.notes ?? undefined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  async getUpcomingContent(storeId: string, days: number = 7): Promise<ContentCalendar[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.getContentCalendar(storeId, {
      startDate,
      endDate,
      status: 'planned',
    });
  }

  // ===== NEWSLETTER CAMPAIGNS =====

  async getNewsletterCampaigns(
    storeId: string,
    status?: NewsletterStatus
  ): Promise<NewsletterCampaign[]> {
    const campaigns = await prisma.newsletterCampaign?.findMany({
      where: {
        storeId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map((c: any) => ({
      id: c.id,
      storeId: c.storeId,
      name: c.name,
      subject: c.subject,
      content: c.content,
      previewText: c.previewText ?? undefined,
      listId: c.listId,
      status: (c as any).status as NewsletterStatus,
      scheduledAt: c.scheduledAt ?? undefined,
      sentAt: c.sentAt ?? undefined,
      recipientCount: c.recipientCount,
      openCount: c.openCount,
      clickCount: c.clickCount,
      bounceCount: c.bounceCount,
      unsubscribeCount: c.unsubscribeCount,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  async createNewsletterCampaign(data: CreateNewsletterInput): Promise<NewsletterCampaign> {
    const campaign = await prisma.newsletterCampaign?.create({
      data: {
        storeId: data.storeId,
        name: data.name,
        subject: data.subject,
        content: data.content,
        previewText: data.previewText,
        listId: data.listId,
        status: data.scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: data.scheduledAt,
      },
    });

    return {
      id: campaign.id,
      storeId: campaign.storeId,
      name: campaign.name,
      subject: campaign.subject,
      content: campaign.content,
      previewText: campaign.previewText ?? undefined,
      listId: campaign.listId,
      status: (campaign as any).status as NewsletterStatus,
      scheduledAt: campaign.scheduledAt ?? undefined,
      sentAt: campaign.sentAt ?? undefined,
      recipientCount: campaign.recipientCount,
      openCount: campaign.openCount,
      clickCount: campaign.clickCount,
      bounceCount: campaign.bounceCount,
      unsubscribeCount: campaign.unsubscribeCount,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    };
  }

  async sendNewsletter(id: string): Promise<NewsletterCampaign> {
    const campaign = await prisma.newsletterCampaign?.update({
      where: { id },
      data: {
        status: 'sending',
        sentAt: new Date(),
      },
    });

    return {
      id: campaign.id,
      storeId: campaign.storeId,
      name: campaign.name,
      subject: campaign.subject,
      content: campaign.content,
      previewText: campaign.previewText ?? undefined,
      listId: campaign.listId,
      status: (campaign as any).status as NewsletterStatus,
      scheduledAt: campaign.scheduledAt ?? undefined,
      sentAt: campaign.sentAt ?? undefined,
      recipientCount: campaign.recipientCount,
      openCount: campaign.openCount,
      clickCount: campaign.clickCount,
      bounceCount: campaign.bounceCount,
      unsubscribeCount: campaign.unsubscribeCount,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    };
  }

  async completeNewsletter(id: string, stats: {
    recipientCount: number;
    openCount: number;
    clickCount: number;
  }): Promise<NewsletterCampaign> {
    const campaign = await prisma.newsletterCampaign?.update({
      where: { id },
      data: {
        status: 'sent',
        recipientCount: stats.recipientCount,
        openCount: stats.openCount,
        clickCount: stats.clickCount,
      },
    });

    return {
      id: campaign.id,
      storeId: campaign.storeId,
      name: campaign.name,
      subject: campaign.subject,
      content: campaign.content,
      previewText: campaign.previewText ?? undefined,
      listId: campaign.listId,
      status: (campaign as any).status as NewsletterStatus,
      scheduledAt: campaign.scheduledAt ?? undefined,
      sentAt: campaign.sentAt ?? undefined,
      recipientCount: campaign.recipientCount,
      openCount: campaign.openCount,
      clickCount: campaign.clickCount,
      bounceCount: campaign.bounceCount,
      unsubscribeCount: campaign.unsubscribeCount,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    };
  }

  // ===== EMAIL SUBSCRIBERS =====

  async getSubscribers(
    storeId: string,
    filters?: { status?: SubscriberStatus; tags?: string[] }
  ): Promise<EmailSubscriber[]> {
    const subscribers = await prisma.emailSubscriber?.findMany({
      where: {
        storeId,
        ...(filters?.status && { status: (filters as any).status }),
        ...(filters?.tags && { tags: { hasEvery: filters.tags } }),
      },
      orderBy: { subscribedAt: 'desc' },
    });

    return subscribers.map((s: any) => ({
      id: s.id,
      storeId: s.storeId,
      email: s.email,
      firstName: s.firstName ?? undefined,
      lastName: s.lastName ?? undefined,
      tags: s.tags,
      status: (s as any).status as SubscriberStatus,
      source: s.source ?? undefined,
      subscribedAt: s.subscribedAt,
      unsubscribedAt: s.unsubscribedAt ?? undefined,
      lastEngagedAt: s.lastEngagedAt ?? undefined,
    }));
  }

  async addSubscriber(data: CreateSubscriberInput): Promise<EmailSubscriber> {
    const subscriber = await prisma.emailSubscriber?.create({
      data: {
        storeId: data.storeId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        tags: data.tags ?? [],
        source: data.source,
        status: 'active',
      },
    });

    return {
      id: subscriber.id,
      storeId: subscriber.storeId,
      email: subscriber.email,
      firstName: subscriber.firstName ?? undefined,
      lastName: subscriber.lastName ?? undefined,
      tags: subscriber.tags,
      status: (subscriber as any).status as SubscriberStatus,
      source: subscriber.source ?? undefined,
      subscribedAt: subscriber.subscribedAt,
      unsubscribedAt: subscriber.unsubscribedAt ?? undefined,
      lastEngagedAt: subscriber.lastEngagedAt ?? undefined,
    };
  }

  async unsubscribe(email: string, storeId: string): Promise<EmailSubscriber> {
    const subscriber = await prisma.emailSubscriber?.updateMany({
      where: { email, storeId },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
      },
    });

    const updated = await prisma.emailSubscriber?.findFirst({
      where: { email, storeId },
    });

    if (!updated) {
      throw new Error('Subscriber not found');
    }

    return {
      id: updated.id,
      storeId: updated.storeId,
      email: updated.email,
      firstName: updated.firstName ?? undefined,
      lastName: updated.lastName ?? undefined,
      tags: updated.tags,
      status: (updated as any).status as SubscriberStatus,
      source: updated.source ?? undefined,
      subscribedAt: updated.subscribedAt,
      unsubscribedAt: updated.unsubscribedAt ?? undefined,
      lastEngagedAt: updated.lastEngagedAt ?? undefined,
    };
  }

  async updateSubscriberTags(
    id: string,
    tags: string[]
  ): Promise<EmailSubscriber> {
    const subscriber = await prisma.emailSubscriber?.update({
      where: { id },
      data: { tags },
    });

    return {
      id: subscriber.id,
      storeId: subscriber.storeId,
      email: subscriber.email,
      firstName: subscriber.firstName ?? undefined,
      lastName: subscriber.lastName ?? undefined,
      tags: subscriber.tags,
      status: (subscriber as any).status as SubscriberStatus,
      source: subscriber.source ?? undefined,
      subscribedAt: subscriber.subscribedAt,
      unsubscribedAt: subscriber.unsubscribedAt ?? undefined,
      lastEngagedAt: subscriber.lastEngagedAt ?? undefined,
    };
  }

  async getSubscriberCount(storeId: string): Promise<{
    total: number;
    active: number;
    unsubscribed: number;
  }> {
    const [total, active, unsubscribed] = await Promise.all([
      prisma.emailSubscriber?.count({ where: { storeId } }),
      prisma.emailSubscriber?.count({ where: { storeId, status: 'active' } }),
      prisma.emailSubscriber?.count({ where: { storeId, status: 'unsubscribed' } }),
    ]);

    return { total, active, unsubscribed };
  }
}

export const blogMediaService = new BlogMediaService();
