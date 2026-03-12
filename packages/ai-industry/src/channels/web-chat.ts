/**
 * Web Chat Channel Integration
 * Web-based chat widget for Vayva AI
 */

import type { ChannelType, AIConversation, Customer } from '../types';

export interface WebChatConfig {
  widgetId: string;
  storeId: string;
  theme?: {
    primaryColor: string;
    position: 'left' | 'right';
    greetingMessage: string;
  };
  features?: {
    fileUpload: boolean;
    emoji: boolean;
    typingIndicator: boolean;
    readReceipts: boolean;
  };
}

export interface WebChatMessage {
  id: string;
  sessionId: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'assistant';
  metadata?: Record<string, unknown>;
}

export class WebChatChannel {
  readonly type: ChannelType = 'web';
  private config: WebChatConfig;
  private sessions: Map<string, WebChatSession> = new Map();

  constructor(config: WebChatConfig) {
    this.config = config;
  }

  /**
   * Initialize web chat widget
   */
  async initialize(): Promise<void> {
    console.log(`Web chat initialized for store ${this.config.storeId}`);
  }

  /**
   * Create new chat session
   */
  createSession(customerInfo?: Partial<Customer>): string {
    const sessionId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.sessions.set(sessionId, {
      id: sessionId,
      customer: customerInfo as Customer,
      messages: [],
      startedAt: new Date(),
      lastActivity: new Date(),
    });

    return sessionId;
  }

  /**
   * Send message to web chat
   */
  async sendMessage(sessionId: string, message: string, options?: {
    quickReplies?: string[];
    cards?: Array<{
      title: string;
      description: string;
      image?: string;
      action?: string;
    }>;
    typingDelay?: number;
  }): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Simulate typing delay
    if (options?.typingDelay) {
      await new Promise(resolve => setTimeout(resolve, options.typingDelay));
    }

    const chatMessage: WebChatMessage = {
      id: `msg_${Date.now()}`,
      sessionId,
      content: message,
      timestamp: new Date(),
      sender: 'assistant',
      metadata: options,
    };

    session.messages.push(chatMessage);
    session.lastActivity = new Date();

    console.log(`Web chat message sent to ${sessionId}: ${message}`);
  }

  /**
   * Handle incoming web chat message
   */
  async handleIncomingMessage(sessionId: string, content: string): Promise<WebChatMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const message: WebChatMessage = {
      id: `msg_${Date.now()}`,
      sessionId,
      content,
      timestamp: new Date(),
      sender: 'user',
    };

    session.messages.push(message);
    session.lastActivity = new Date();

    return message;
  }

  /**
   * Get session history
   */
  getSessionHistory(sessionId: string): WebChatMessage[] {
    const session = this.sessions.get(sessionId);
    return session?.messages || [];
  }

  /**
   * End chat session
   */
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.endedAt = new Date();
      // In production, persist to database
      this.sessions.delete(sessionId);
    }
  }

  /**
   * Get active sessions count
   */
  getActiveSessionsCount(): number {
    return this.sessions.size;
  }

  /**
   * Get widget configuration
   */
  getWidgetConfig(): Record<string, unknown> {
    return {
      widgetId: this.config.widgetId,
      storeId: this.config.storeId,
      theme: this.config.theme || {
        primaryColor: '#000000',
        position: 'right',
        greetingMessage: 'Hello! How can I help you today?',
      },
      features: this.config.features || {
        fileUpload: true,
        emoji: true,
        typingIndicator: true,
        readReceipts: true,
      },
    };
  }

  /**
   * Generate embed code for merchant website
   */
  generateEmbedCode(): string {
    return `
<!-- Vayva AI Chat Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://cdn.vayva.ai/chat-widget.js';
    script.async = true;
    script.onload = function() {
      VayvaChat.init({
        widgetId: '${this.config.widgetId}',
        storeId: '${this.config.storeId}',
        theme: ${JSON.stringify(this.config.theme)},
        features: ${JSON.stringify(this.config.features)}
      });
    };
    document.head.appendChild(script);
  })();
</script>
    `.trim();
  }

  /**
   * Send proactive message (triggered by behavior)
   */
  async sendProactiveMessage(sessionId: string, trigger: string): Promise<void> {
    const messages: Record<string, string> = {
      'cart_abandonment': 'I noticed you have items in your cart. Can I help you complete your purchase?',
      'product_view': 'Have any questions about this product? I am here to help!',
      'checkout_help': 'Need help with checkout? I can assist with payment options or shipping questions.',
      'long_session': 'Still browsing? Let me know if you need help finding anything specific.',
    };

    const message = messages[trigger];
    if (message) {
      await this.sendMessage(sessionId, message, { typingDelay: 1000 });
    }
  }
}

interface WebChatSession {
  id: string;
  customer?: Customer;
  messages: WebChatMessage[];
  startedAt: Date;
  lastActivity: Date;
  endedAt?: Date;
}

export default WebChatChannel;
