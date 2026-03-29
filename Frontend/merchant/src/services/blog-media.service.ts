import { api } from '@/lib/api-client';
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
    const response = await api.get(`/blog/${storeId}/content-calendar`, {
      ...filters,
      startDate: filters?.startDate?.toISOString(),
      endDate: filters?.endDate?.toISOString(),
    });
    return response.data || [];
  }

  async createContentCalendarItem(data: CreateContentCalendarInput): Promise<ContentCalendar> {
    const response = await api.post('/blog/content-calendar', {
      storeId: data.storeId,
      ...data,
    });
    return response.data || {};
  }

  async updateContentCalendarStatus(
    id: string,
    status: ContentCalendarStatus,
    contentId?: string
  ): Promise<ContentCalendar> {
    const response = await api.patch(`/blog/content-calendar/${id}/status`, {
      status,
      contentId,
    });
    return response.data || {};
  }

  async getUpcomingContent(storeId: string, days: number = 7): Promise<ContentCalendar[]> {
    const response = await api.get(`/blog/${storeId}/content-calendar/upcoming`, { days });
    return response.data || [];
  }

  // ===== NEWSLETTER CAMPAIGNS =====

  async getNewsletterCampaigns(
    storeId: string,
    status?: NewsletterStatus
  ): Promise<NewsletterCampaign[]> {
    const response = await api.get(`/blog/${storeId}/newsletters`, { status });
    return response.data || [];
  }

  async createNewsletterCampaign(data: CreateNewsletterInput): Promise<NewsletterCampaign> {
    const response = await api.post('/blog/newsletters', {
      storeId: data.storeId,
      ...data,
    });
    return response.data || {};
  }

  async sendNewsletter(id: string): Promise<NewsletterCampaign> {
    const response = await api.post(`/blog/newsletters/${id}/send`);
    return response.data || {};
  }

  async completeNewsletter(id: string, stats: {
    recipientCount: number;
    openCount: number;
    clickCount: number;
  }): Promise<NewsletterCampaign> {
    const response = await api.post(`/blog/newsletters/${id}/complete`, stats);
    return response.data || {};
  }

  // ===== EMAIL SUBSCRIBERS =====

  async getSubscribers(
    storeId: string,
    filters?: { status?: SubscriberStatus; tags?: string[] }
  ): Promise<EmailSubscriber[]> {
    const response = await api.get(`/blog/${storeId}/subscribers`, {
      status: filters?.status,
      tags: filters?.tags?.join(','),
    });
    return response.data || [];
  }

  async addSubscriber(data: CreateSubscriberInput): Promise<EmailSubscriber> {
    const response = await api.post('/blog/subscribers', {
      storeId: data.storeId,
      ...data,
    });
    return response.data || {};
  }

  async unsubscribe(email: string, storeId: string): Promise<EmailSubscriber> {
    const response = await api.post('/blog/subscribers/unsubscribe', {
      email,
      storeId,
    });
    return response.data || {};
  }

  async updateSubscriberTags(
    id: string,
    tags: string[]
  ): Promise<EmailSubscriber> {
    const response = await api.patch(`/blog/subscribers/${id}/tags`, { tags });
    return response.data || {};
  }

  async getSubscriberCount(storeId: string): Promise<{
    total: number;
    active: number;
    unsubscribed: number;
  }> {
    const response = await api.get(`/blog/${storeId}/subscribers/count`);
    return response.data || { total: 0, active: 0, unsubscribed: 0 };
  }
}

export const blogMediaService = new BlogMediaService();
