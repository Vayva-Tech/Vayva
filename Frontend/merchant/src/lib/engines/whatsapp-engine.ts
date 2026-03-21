// @ts-nocheck
// WhatsApp AI Engine - Core business logic for WhatsApp AI agent management
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";

export interface WhatsAppAgent {
  id: string;
  name: string;
  phoneNumber: string;
  status: 'connected' | 'disconnected' | 'connecting';
  tone: 'friendly' | 'professional' | 'urgent' | 'luxurious';
  language: string;
  autoReply: boolean;
  businessHours: {
    enabled: boolean;
    timezone: string;
    schedule: BusinessHour[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface BusinessHour {
  day: string; // 'monday', 'tuesday', etc.
  open: string; // '09:00'
  close: string; // '17:00'
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  components: TemplateComponent[];
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO';
  text?: string;
  buttons?: TemplateButton[];
}

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phoneNumber?: string;
}

export interface WhatsAppConversation {
  id: string;
  customerPhone: string;
  customerName?: string;
  status: 'pending' | 'assigned' | 'resolved';
  unreadCount: number;
  lastMessage: {
    content: string;
    timestamp: string;
    sender: 'customer' | 'agent';
  };
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export class WhatsAppAIEngine {
  static async getAgent(): Promise<WhatsAppAgent> {
    try {
      return await apiJson<WhatsAppAgent>('/api/whatsapp/agent');
    } catch (error) {
      logger.error('[WHATSAPP_ENGINE_GET_AGENT]', error);
      throw error;
    }
  }

  static async updateAgent(updates: Partial<WhatsAppAgent>): Promise<WhatsAppAgent> {
    try {
      return await apiJson<WhatsAppAgent>('/api/whatsapp/agent', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      logger.error('[WHATSAPP_ENGINE_UPDATE_AGENT]', error);
      throw error;
    }
  }

  static async connectPhoneNumber(phoneNumber: string): Promise<WhatsAppAgent> {
    try {
      return await apiJson<WhatsAppAgent>('/api/whatsapp/connect', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber }),
      });
    } catch (error) {
      logger.error('[WHATSAPP_ENGINE_CONNECT_PHONE]', error);
      throw error;
    }
  }

  static async disconnectPhoneNumber(): Promise<void> {
    try {
      await apiJson('/api/whatsapp/disconnect', {
        method: 'POST',
      });
    } catch (error) {
      logger.error('[WHATSAPP_ENGINE_DISCONNECT_PHONE]', error);
      throw error;
    }
  }

  static async getAllTemplates(): Promise<WhatsAppTemplate[]> {
    try {
      return await apiJson<WhatsAppTemplate[]>('/api/whatsapp/templates');
    } catch (error) {
      logger.error('[WHATSAPP_ENGINE_GET_TEMPLATES]', error);
      throw error;
    }
  }

  static async createTemplate(template: Omit<WhatsAppTemplate, 'id' | 'status' | 'createdAt'>): Promise<WhatsAppTemplate> {
    try {
      return await apiJson<WhatsAppTemplate>('/api/whatsapp/templates', {
        method: 'POST',
        body: JSON.stringify(template),
      });
    } catch (error) {
      logger.error('[WHATSAPP_ENGINE_CREATE_TEMPLATE]', error);
      throw error;
    }
  }

  static async deleteTemplate(templateId: string): Promise<void> {
    try {
      await apiJson(`/api/whatsapp/templates/${templateId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      logger.error('[WHATSAPP_ENGINE_DELETE_TEMPLATE]', error);
      throw error;
    }
  }

  static async getAllConversations(filters?: {
    status?: WhatsAppConversation['status'];
    assignedAgent?: string;
    search?: string;
  }): Promise<WhatsAppConversation[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.assignedAgent) params.append('assignedAgent', filters.assignedAgent);
      if (filters?.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `/api/whatsapp/conversations${queryString ? `?${queryString}` : ''}`;
      
      return await apiJson<WhatsAppConversation[]>(url);
    } catch (error) {
      logger.error('[WHATSAPP_ENGINE_GET_CONVERSATIONS]', error);
      throw error;
    }
  }

  static async getConversationMessages(conversationId: string): Promise<any[]> {
    try {
      return await apiJson<any[]>(`/api/whatsapp/conversations/${conversationId}/messages`);
    } catch (error) {
      logger.error('[WHATSAPP_ENGINE_GET_CONVERSATION_MESSAGES]', error);
      throw error;
    }
  }

  static async sendMessage(conversationId: string, content: string): Promise<any> {
    try {
      return await apiJson('/api/whatsapp/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId,
          content,
          sender: 'agent'
        }),
      });
    } catch (error) {
      logger.error('[WHATSAPP_ENGINE_SEND_MESSAGE]', error);
      throw error;
    }
  }

  static async assignConversation(conversationId: string, agentId: string): Promise<WhatsAppConversation> {
    try {
      return await apiJson<WhatsAppConversation>(`/api/whatsapp/conversations/${conversationId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ agentId }),
      });
    } catch (error) {
      logger.error('[WHATSAPP_ENGINE_ASSIGN_CONVERSATION]', error);
      throw error;
    }
  }

  static async markAsResolved(conversationId: string): Promise<WhatsAppConversation> {
    try {
      return await apiJson<WhatsAppConversation>(`/api/whatsapp/conversations/${conversationId}/resolve`, {
        method: 'POST',
      });
    } catch (error) {
      logger.error('[WHATSAPP_ENGINE_MARK_RESOLVED]', error);
      throw error;
    }
  }

  static async getAnalytics(dateFrom: string, dateTo: string): Promise<{
    totalConversations: number;
    resolvedConversations: number;
    avgResponseTime: number;
    satisfactionRate: number;
    messagesSent: number;
    messagesReceived: number;
  }> {
    try {
      return await apiJson(`/api/whatsapp/analytics?from=${dateFrom}&to=${dateTo}`);
    } catch (error) {
      logger.error('[WHATSAPP_ENGINE_GET_ANALYTICS]', error);
      throw error;
    }
  }
}