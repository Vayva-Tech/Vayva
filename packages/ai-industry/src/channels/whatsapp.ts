/**
 * WhatsApp Channel Integration
 * WhatsApp Business API integration for Vayva AI
 */

import type { ChannelType, LanguageCode, AIConversation, ConversationMessage, Customer } from '../types';

export interface WhatsAppConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  webhookUrl: string;
  businessProfile?: {
    name: string;
    description: string;
    address?: string;
    email?: string;
    website?: string;
  };
}

export interface WhatsAppMessage {
  from: string;
  to: string;
  body: string;
  mediaUrl?: string[];
  timestamp: Date;
  messageId: string;
  profileName?: string;
}

export class WhatsAppChannel {
  readonly type: ChannelType = 'whatsapp';
  private config: WhatsAppConfig;
  private messageHandlers: Array<(message: WhatsAppMessage) => void> = [];

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  /**
   * Initialize WhatsApp webhook
   */
  async initialize(): Promise<void> {
    // In production, this would set up the Twilio webhook
    console.log(`WhatsApp channel initialized for ${this.config.phoneNumber}`);
  }

  /**
   * Send text message via WhatsApp
   */
  async sendMessage(to: string, message: string, options?: {
    quickReplies?: string[];
    mediaUrl?: string;
  }): Promise<void> {
    // In production, this would use Twilio API
    console.log(`Sending WhatsApp to ${to}: ${message}`);
    
    // Mock implementation
    if (options?.quickReplies) {
      console.log(`Quick replies: ${options.quickReplies.join(', ')}`);
    }
  }

  /**
   * Send template message (for notifications)
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    language: LanguageCode,
    parameters: Record<string, string>
  ): Promise<void> {
    const templates: Record<string, Record<LanguageCode, string>> = {
      'order_confirmation': {
        en: 'Your order #{orderId} has been confirmed! Total: ₦{total}. Expected delivery: {deliveryDate}.',
        yo: 'A ti jẹriṣẹ aṣẹ rẹ #{orderId}! Lápapọ̀: ₦{total}. Ìfiránsẹ́ tó ń bọ̀: {deliveryDate}.',
        ha: 'An tabbatar da odar ku #{orderId}! Jimilla: ₦{total}. Iskiya mai zuwa: {deliveryDate}.',
        ig: 'E kwenyere ụtụ gị #{orderId}! Ngụkọta: ₦{total}. Nbubata nke ọma: {deliveryDate}.',
        pcm: 'Your order #{orderId} don confirm! Total: ₦{total}. Delivery go reach: {deliveryDate}.',
      },
      'shipping_update': {
        en: 'Your order #{orderId} is on the way! Track: {trackingUrl}',
        yo: 'Aṣẹ rẹ #{orderId} ń lọ! Tẹ̀lé: {trackingUrl}',
        ha: 'Odar ku #{orderId} yana hanyar zuwa! Bi: {trackingUrl}',
        ig: 'Iwu gị #{orderId} na-aga nke ọma! Sọchie: {trackingUrl}',
        pcm: 'Your order #{orderId} dey on the way! Track: {trackingUrl}',
      },
      'appointment_reminder': {
        en: 'Reminder: You have an appointment on {date} at {time}. Reply CONFIRM or RESCHEDULE.',
        yo: 'Ìránilójú: O ní ààyè lójú {date} ní {time}. Fèsì JẸ́RÍSÍ tàbí YÍPADA.',
        ha: 'Tunawa: Kuna da alƙawari a {date} da {time}. Amsa TABBATAR ko SAKE JERA.',
        ig: 'Icheta: Ị nwere nhazi na {date} na {time}. Zaa NKWENYE ma ọ bụ MGBANWEE.',
        pcm: 'Reminder: You get appointment on {date} at {time}. Reply CONFIRM or RESCHEDULE.',
      },
    };

    let template = templates[templateName]?.[language] || templates[templateName]?.['en'];
    
    if (template) {
      Object.entries(parameters).forEach(([key, value]) => {
        template = template.replace(`{${key}}`, value);
      });
    }

    await this.sendMessage(to, template || 'Notification');
  }

  /**
   * Handle incoming WhatsApp message
   */
  async handleIncomingMessage(message: WhatsAppMessage): Promise<void> {
    // Notify all registered handlers
    this.messageHandlers.forEach(handler => handler(message));
  }

  /**
   * Register message handler
   */
  onMessage(handler: (message: WhatsAppMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  /**
   * Parse customer info from WhatsApp message
   */
  parseCustomer(message: WhatsAppMessage): Customer {
    return {
      id: `wa_${message.from}`,
      phone: message.from,
      name: message.profileName,
      storeId: '', // Set by conversation manager
    };
  }

  /**
   * Format conversation for WhatsApp
   */
  formatForWhatsApp(conversation: AIConversation): string {
    // Format the AI response for WhatsApp (character limits, formatting)
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (!lastMessage) return '';

    let formatted = lastMessage.content;

    // WhatsApp has a 4096 character limit
    if (formatted.length > 4000) {
      formatted = formatted.substring(0, 4000) + '... (message truncated)';
    }

    return formatted;
  }

  /**
   * Send rich media message
   */
  async sendMediaMessage(
    to: string,
    mediaType: 'image' | 'document' | 'video',
    mediaUrl: string,
    caption?: string
  ): Promise<void> {
    console.log(`Sending ${mediaType} to ${to}: ${mediaUrl}`);
    if (caption) {
      console.log(`Caption: ${caption}`);
    }
  }

  /**
   * Send location
   */
  async sendLocation(
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string
  ): Promise<void> {
    console.log(`Sending location to ${to}: ${latitude}, ${longitude}`);
    if (name) console.log(`Name: ${name}`);
    if (address) console.log(`Address: ${address}`);
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    console.log(`Marking message ${messageId} as read`);
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageId: string): Promise<'sent' | 'delivered' | 'read' | 'failed'> {
    // Mock implementation
    return 'delivered';
  }

  /**
   * Opt-out handling
   */
  async handleOptOut(phoneNumber: string): Promise<void> {
    console.log(`Opting out ${phoneNumber} from WhatsApp messages`);
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): boolean {
    // E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
  }

  /**
   * Format phone number to E.164
   */
  formatPhoneNumber(phone: string, countryCode: string = '234'): string {
    // Remove non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if missing
    if (cleaned.startsWith('0')) {
      return `+${countryCode}${cleaned.substring(1)}`;
    }
    
    if (!cleaned.startsWith(countryCode)) {
      return `+${countryCode}${cleaned}`;
    }
    
    return `+${cleaned}`;
  }
}

export default WhatsAppChannel;
